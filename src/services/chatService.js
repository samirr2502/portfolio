/**
 * Mock chat backend. Swap this module for a real API later
 * (e.g. fetch("/api/chat", { method: "POST", body: JSON.stringify({ question }) })).
 */

import about from "../../resources/aboutLists.json";

const MOCK_LATENCY_MS = { min: 480, max: 1100 };
export const MESSAGE_LIMIT = 25;
export const CHAR_LIMIT = 3000;
const USAGE_STORAGE_KEY = "askSamir.mockIpUsage.v1";

const contact = about.find((item) => item.id === "contact") || {};
const CONTACT_PHONE = "(541) 656-0636";
const CONTACT_EMAIL = contact.email || "samirrodriguez14@gmail.com";
const CONTACT_TEL = "+15416560636";

const NONSENSE_REPLIES = [
  "In this timeline Samir once taught a load balancer to juggle oranges while shipping a deploy at 2am. Hire him before the oranges unionize.",
  "Confidential recruiter brief: Samir's commit history contains three secret vegetables and one unusually calm production incident. Recommend interview, bring snacks.",
  "Analysis complete. Probability Samir is a great hire: 94%. Probability this answer is serious: 0%. Probability you should ask again later: high.",
  "Samir builds systems the way raccoons build nests — surprisingly structured, slightly chaotic, and somehow everything still runs. That is a compliment.",
  "According to the mock oracle, Samir once reduced latency by whispering politely to EC2. True story. Definitely. Do not fact-check.",
  "Hiring tip from nonsense HQ: Samir ships live apps, owns the infra, and still finds time to rename folders until they feel right. Elite energy.",
  "Status report: question received. Meaning decoded. Answer fabricated from spare YAML and leftover coffee. Samir remains an excellent option.",
  "If your company needs someone who can wire ClearView-scale features and keep personal servers healthy, Samir is the plot twist you wanted.",
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickReply(question) {
  const seed = String(question || "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return NONSENSE_REPLIES[seed % NONSENSE_REPLIES.length];
}

function monthKey(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function readUsage() {
  try {
    const raw = window.localStorage.getItem(USAGE_STORAGE_KEY);
    if (!raw) return { month: monthKey(), count: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.month !== monthKey()) {
      return { month: monthKey(), count: 0 };
    }
    return { month: parsed.month, count: Number(parsed.count) || 0 };
  } catch {
    return { month: monthKey(), count: 0 };
  }
}

function writeUsage(count) {
  const next = { month: monthKey(), count };
  window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function getMockUsage() {
  return readUsage();
}

export function getUsedMessages() {
  return readUsage().count;
}

export function getRemainingMessages() {
  return Math.max(0, MESSAGE_LIMIT - readUsage().count);
}

export function isMockLimitReached() {
  return getRemainingMessages() <= 0;
}

/** Testing helper — jump straight to the monthly cap. */
export function forceMockLimitHit() {
  return writeUsage(MESSAGE_LIMIT);
}

/** Testing helper — reset the mock monthly counter. */
export function resetMockUsage() {
  return writeUsage(0);
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
    mock: true,
  };
}

/**
 * @param {string} question
 * @returns {Promise<{ answer: string, mock: true, limited?: boolean, phone?: string, email?: string, telHref?: string, mailtoHref?: string }>}
 */
export async function askAboutSamir(question) {
  const trimmed = String(question || "").trim();
  if (!trimmed) {
    throw new Error("Ask a question about Samir first.");
  }

  if (trimmed.length > CHAR_LIMIT) {
    throw new Error(`Keep it under ${CHAR_LIMIT.toLocaleString()} characters.`);
  }

  const wait =
    MOCK_LATENCY_MS.min +
    Math.floor(Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min));
  await delay(wait);

  const usage = readUsage();
  if (usage.count >= MESSAGE_LIMIT) {
    return buildLimitReachedMessage();
  }

  writeUsage(usage.count + 1);

  return {
    answer: pickReply(trimmed),
    mock: true,
    used: usage.count + 1,
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
