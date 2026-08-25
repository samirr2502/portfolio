require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const { buildSystemPrompt } = require("./context");

const app = express();

const PORT = Number(process.env.PORT) || 3020;
const MESSAGE_LIMIT = Number(process.env.MESSAGE_LIMIT) || 25;
const CHAR_LIMIT = 3000;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const CONTACT = {
  phone: "(541) 656-0636",
  email: "samirrodriguez14@gmail.com",
  telHref: "tel:+15416560636",
  mailtoHref: "mailto:samirrodriguez14@gmail.com",
};

const usageByIp = new Map();

app.use(cors());
app.use(express.json({ limit: "32kb" }));

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function readUsage(ip) {
  const currentMonth = monthKey();
  const existing = usageByIp.get(ip);
  if (!existing || existing.month !== currentMonth) {
    return { month: currentMonth, count: 0 };
  }
  return existing;
}

function writeUsage(ip, count) {
  const next = { month: monthKey(), count };
  usageByIp.set(ip, next);
  return next;
}

function usagePayload(ip) {
  const usage = readUsage(ip);
  const used = usage.count;
  return {
    used,
    remaining: Math.max(0, MESSAGE_LIMIT - used),
    limit: MESSAGE_LIMIT,
    limited: used >= MESSAGE_LIMIT,
  };
}

function buildLimitReachedMessage() {
  return {
    limited: true,
    answer:
      "OpenAI monthly limit reached for this visitor (25 messages). Contact Samir directly to continue the conversation.",
    phone: CONTACT.phone,
    email: CONTACT.email,
    telHref: CONTACT.telHref,
    mailtoHref: CONTACT.mailtoHref,
  };
}

function suggestsDirectContact(text) {
  const normalized = String(text || "").toLowerCase();
  return (
    /contact\s+(samir|him)\b/.test(normalized) ||
    /reach\s+out\s+(to\s+)?(samir|him)\b/.test(normalized) ||
    /get\s+in\s+touch\s+with\s+samir/.test(normalized) ||
    /contacting\s+samir/.test(normalized)
  );
}

function validateChatRequest(req) {
  const ip = clientIp(req);
  const question = String(req.body?.question || "").trim();

  if (!question) {
    return { error: { status: 400, body: { error: "Ask a question about Samir first." } } };
  }

  if (question.length > CHAR_LIMIT) {
    return {
      error: {
        status: 400,
        body: { error: `Keep it under ${CHAR_LIMIT.toLocaleString()} characters.` },
      },
    };
  }

  const usage = readUsage(ip);
  if (usage.count >= MESSAGE_LIMIT) {
    return {
      limited: { ...buildLimitReachedMessage(), ...usagePayload(ip) },
    };
  }

  return { ip, question, usage };
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

let openaiClient = null;

function getOpenAI() {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured on the server.");
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
}

const systemPrompt = buildSystemPrompt();

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "portfolio-api",
    hasKey: Boolean(process.env.OPENAI_API_KEY),
    model: OPENAI_MODEL,
    port: PORT,
  });
});

app.get("/api/chat/usage", (req, res) => {
  res.json(usagePayload(clientIp(req)));
});

app.post("/api/chat/stream", async (req, res) => {
  const parsed = validateChatRequest(req);
  if (parsed.error) {
    return res.status(parsed.error.status).json(parsed.error.body);
  }
  if (parsed.limited) {
    return res.json(parsed.limited);
  }

  const { ip, question, usage } = parsed;

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") {
    res.flushHeaders();
  }

  let answer = "";

  try {
    const openai = getOpenAI();
    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.6,
      max_tokens: 900,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (!delta) continue;
      answer += delta;
      writeSse(res, "token", { delta });
    }

    const trimmed = answer.trim();
    if (!trimmed) {
      throw new Error("Empty response from OpenAI.");
    }

    const nextUsage = writeUsage(ip, usage.count + 1);
    writeSse(res, "done", {
      answer: trimmed,
      suggestContact: suggestsDirectContact(trimmed),
      used: nextUsage.count,
      remaining: Math.max(0, MESSAGE_LIMIT - nextUsage.count),
      limit: MESSAGE_LIMIT,
    });
    res.end();
  } catch (err) {
    console.error("[chat/stream]", err);
    const message =
      err?.message?.includes("OPENAI_API_KEY")
        ? "Chat is not configured yet. Contact Samir directly."
        : "Something went wrong reaching the AI service. Try again in a moment.";
    if (!res.headersSent) {
      return res.status(503).json({ error: message });
    }
    writeSse(res, "error", { error: message });
    res.end();
  }
});

app.post("/api/chat", async (req, res) => {
  const parsed = validateChatRequest(req);
  if (parsed.error) {
    return res.status(parsed.error.status).json(parsed.error.body);
  }
  if (parsed.limited) {
    return res.json(parsed.limited);
  }

  const { ip, question, usage } = parsed;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.6,
      max_tokens: 900,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();
    if (!answer) {
      throw new Error("Empty response from OpenAI.");
    }

    const nextUsage = writeUsage(ip, usage.count + 1);
    return res.json({
      answer,
      suggestContact: suggestsDirectContact(answer),
      used: nextUsage.count,
      remaining: Math.max(0, MESSAGE_LIMIT - nextUsage.count),
      limit: MESSAGE_LIMIT,
    });
  } catch (err) {
    console.error("[chat]", err);
    const message =
      err?.message?.includes("OPENAI_API_KEY")
        ? "Chat is not configured yet. Contact Samir directly."
        : "Something went wrong reaching the AI service. Try again in a moment.";
    return res.status(503).json({ error: message });
  }
});

module.exports = app;
