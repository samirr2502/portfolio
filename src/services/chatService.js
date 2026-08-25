/**
 * Ask Samir chat client — talks to the portfolio API (/api/chat).
 * In dev, Vite proxies /api to the local server (see vite.config.js).
 */

import about from "../../resources/aboutLists.json";

export const MESSAGE_LIMIT = 25;
export const CHAR_LIMIT = 3000;

const API_BASE = import.meta.env.VITE_CHAT_API_URL || "";
const CHAT_STORAGE_KEY = "askSamir.transcript.v1";
const PERSISTED_ROLES = new Set(["user", "assistant", "limit", "error"]);

const contact = about.find((item) => item.id === "contact") || {};
const CONTACT_PHONE = "(541) 656-0636";
const CONTACT_EMAIL = contact.email || "samirrodriguez14@gmail.com";
const CONTACT_TEL = "+15416560636";

let cachedUsage = { used: 0, remaining: MESSAGE_LIMIT, limit: MESSAGE_LIMIT, limited: false };

async function apiFetch(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Something went wrong reaching the chat service.");
  }

  return payload;
}

function syncUsage(payload) {
  if (typeof payload?.used !== "number") return cachedUsage;
  cachedUsage = {
    used: payload.used,
    remaining:
      typeof payload.remaining === "number"
        ? payload.remaining
        : Math.max(0, MESSAGE_LIMIT - payload.used),
    limit: payload.limit ?? MESSAGE_LIMIT,
    limited: Boolean(payload.limited ?? payload.used >= MESSAGE_LIMIT),
  };
  return cachedUsage;
}

/** Load current visitor quota from the API (IP-based on the server). */
export async function refreshChatUsage() {
  const payload = await apiFetch("/api/chat/usage");
  return syncUsage(payload);
}

export function getUsedMessages() {
  return cachedUsage.used;
}

export function getRemainingMessages() {
  return cachedUsage.remaining;
}

export function isMockLimitReached() {
  return cachedUsage.limited;
}

/** Dev-only: server has no reset endpoint; fakes limit in the UI. */
export function forceMockLimitHit() {
  cachedUsage = {
    used: MESSAGE_LIMIT,
    remaining: 0,
    limit: MESSAGE_LIMIT,
    limited: true,
  };
  return cachedUsage;
}

/** Dev-only: clears local cached quota (server IP limit unchanged until restart/month rollover). */
export function resetMockUsage() {
  cachedUsage = {
    used: 0,
    remaining: MESSAGE_LIMIT,
    limit: MESSAGE_LIMIT,
    limited: false,
  };
  return cachedUsage;
}

export function buildLimitReachedMessage() {
  return {
    limited: true,
    answer:
      "OpenAI monthly limit reached for this visitor (25 messages). Contact Samir directly to continue the conversation.",
    phone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    telHref: `tel:${CONTACT_TEL}`,
    mailtoHref: `mailto:${CONTACT_EMAIL}`,
  };
}

/** True when a reply tells the visitor to reach out to Samir directly. */
export function suggestsDirectContact(text) {
  const normalized = String(text || "").toLowerCase();
  return (
    /contact\s+(samir|him)\b/.test(normalized) ||
    /reach\s+out\s+(to\s+)?(samir|him)\b/.test(normalized) ||
    /get\s+in\s+touch\s+with\s+samir/.test(normalized) ||
    /contacting\s+samir/.test(normalized)
  );
}

function normalizeStoredMessage(raw) {
  if (!raw || typeof raw !== "object") return null;

  const role = raw.role;
  if (!PERSISTED_ROLES.has(role)) return null;

  const text = String(raw.text || "").trim();
  if (!text) return null;

  const message = {
    id: typeof raw.id === "string" ? raw.id : `msg-${Date.now()}`,
    role,
    text,
  };

  if (role === "limit") {
    message.payload = {
      ...buildLimitReachedMessage(),
      ...(raw.payload && typeof raw.payload === "object" ? raw.payload : {}),
      answer: text,
    };
  }

  if (raw.suggestContact === true || suggestsDirectContact(text)) {
    message.suggestContact = true;
  }

  return message;
}

/** Restore chat messages for this browser tab (survives refresh). */
export function loadChatTranscript() {
  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeStoredMessage).filter(Boolean);
  } catch {
    return [];
  }
}

/** Persist chat messages for this browser tab. */
export function saveChatTranscript(messages) {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch {
    /* storage full or unavailable */
  }
}

export function clearChatTranscript() {
  try {
    window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Keep generated ids unique after restoring a saved transcript. */
export function getHighestMessageSeq(messages) {
  let max = 0;
  for (const message of messages) {
    const match = /^msg-(\d+)$/.exec(String(message?.id || ""));
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

/**
 * @param {string} question
 * @returns {Promise<{ answer: string, used?: number, limited?: boolean, phone?: string, email?: string, telHref?: string, mailtoHref?: string }>}
 */
export async function askAboutSamir(question) {
  const trimmed = String(question || "").trim();
  if (!trimmed) {
    throw new Error("Ask a question about Samir first.");
  }

  if (trimmed.length > CHAR_LIMIT) {
    throw new Error(`Keep it under ${CHAR_LIMIT.toLocaleString()} characters.`);
  }

  const result = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ question: trimmed }),
  });

  if (result.limited) {
    syncUsage({ ...result, used: MESSAGE_LIMIT, remaining: 0, limited: true });
    return {
      ...buildLimitReachedMessage(),
      used: MESSAGE_LIMIT,
    };
  }

  syncUsage(result);
  return {
    answer: result.answer,
    used: result.used,
    suggestContact: Boolean(result.suggestContact ?? suggestsDirectContact(result.answer)),
  };
}

export const SAMPLE_QUESTIONS = [
  "Paste a job description and see how Samir fits this role",
  "I'm a Google recruiting agent, why should I hire Samir?",
  "I'm an Amazon recruiter, why should I hire Samir?",
  "What makes Samir a great option for my company?",
  "What has Samir shipped in production?",
  "Tell me about Samir's strengths as an engineer.",
];
