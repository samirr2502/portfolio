import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaCompressAlt, FaExpandAlt, FaTrash } from "react-icons/fa";
import ContactIconLinks from "./ContactIconLinks";
import {
  askAboutSamir,
  buildLimitReachedMessage,
  CHAR_LIMIT,
  getUsedMessages,
  forceMockLimitHit,
  isMockLimitReached,
  MESSAGE_LIMIT,
  resetMockUsage,
  SAMPLE_QUESTIONS,
} from "../services/chatService";

const PLACEHOLDER_CYCLE_MS = 3800;
const MAX_HERO_LIFT_PX = 72;
const HERO_LIFT_FACTOR = 0.28;
const MAX_INPUT_LINES = 4;

let messageSeq = 0;
function nextMessageId() {
  messageSeq += 1;
  return `msg-${messageSeq}`;
}

function syncInputHeight(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight) || 20;
  const padding =
    Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
  const maxHeight = lineHeight * MAX_INPUT_LINES + padding;
  const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
}

function setHeroChatLift(pixels) {
  const section = document.getElementById("home");
  if (!section) return;
  const scaled = pixels * HERO_LIFT_FACTOR;
  const lift = Math.max(0, Math.min(scaled, MAX_HERO_LIFT_PX));
  section.style.setProperty("--hero-chat-lift", `${lift}px`);
}

function LimitMessage({ payload }) {
  return (
    <div className="askSamirMessage is-limit">
      <p className="askSamirLimitText">{payload.answer}</p>
      <div className="askSamirLimitContact">
        <span className="askSamirLimitContactLabel">Contact Samir</span>
        <ContactIconLinks variant="compact" showSocial={false} />
      </div>
    </div>
  );
}

function AskSamirChat() {
  const [question, setQuestion] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading
  const [used, setUsed] = useState(() => getUsedMessages());
  const [limited, setLimited] = useState(() => isMockLimitReached());
  const [expanded, setExpanded] = useState(false);
  const answerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (question.trim() || focused || limited) return undefined;

    const timer = setInterval(() => {
      setPlaceholderVisible(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
        setPlaceholderVisible(true);
      }, 280);
    }, PLACEHOLDER_CYCLE_MS);

    return () => clearInterval(timer);
  }, [question, focused, limited]);

  useEffect(() => {
    if (!answerRef.current) return;
    answerRef.current.scrollTop = answerRef.current.scrollHeight;
  }, [messages, status, expanded]);

  useLayoutEffect(() => {
    syncInputHeight(inputRef.current);
  }, [question, expanded, limited]);

  useLayoutEffect(() => {
    if (expanded) {
      setHeroChatLift(0);
      return undefined;
    }

    const showTranscript = messages.length > 0 || status === "loading";
    if (!showTranscript) {
      setHeroChatLift(0);
      return undefined;
    }

    const syncLift = () => {
      const answer = answerRef.current;
      if (!answer) {
        setHeroChatLift(0);
        return;
      }
      setHeroChatLift(answer.offsetHeight);
    };

    syncLift();
    const frame = requestAnimationFrame(syncLift);

    const answer = answerRef.current;
    let observer;
    if (answer && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(syncLift);
      observer.observe(answer);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [messages, status, expanded]);

  useEffect(() => {
    return () => setHeroChatLift(0);
  }, []);

  useEffect(() => {
    const section = document.getElementById("home");
    section?.classList.toggle("is-chat-expanded", expanded);
    return () => section?.classList.remove("is-chat-expanded");
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const clearChat = () => {
    if (status === "loading") return;
    setMessages([]);
    setStatus("idle");
    setHeroChatLift(0);
  };

  const previewLimitHit = () => {
    if (status === "loading") return;
    forceMockLimitHit();
    const payload = buildLimitReachedMessage();
    setUsed(MESSAGE_LIMIT);
    setLimited(true);
    setMessages((prev) => [
      ...prev,
      {
        id: nextMessageId(),
        role: "user",
        text: "One more question about Samir?",
      },
      {
        id: nextMessageId(),
        role: "limit",
        text: payload.answer,
        payload,
      },
    ]);
  };

  const resetLimitForTesting = () => {
    if (status === "loading") return;
    resetMockUsage();
    setUsed(0);
    setLimited(false);
    setMessages((prev) => prev.filter((message) => message.role !== "limit"));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (limited || status === "loading") return;

    const nextQuestion = question.trim() || SAMPLE_QUESTIONS[placeholderIndex];
    if (!nextQuestion) return;

    setQuestion("");
    setStatus("loading");
    requestAnimationFrame(() => syncInputHeight(inputRef.current));
    setMessages((prev) => [
      ...prev,
      { id: nextMessageId(), role: "user", text: nextQuestion },
    ]);

    try {
      const result = await askAboutSamir(nextQuestion);
      if (result.limited) {
        setLimited(true);
        setUsed(MESSAGE_LIMIT);
        setMessages((prev) => [
          ...prev,
          {
            id: nextMessageId(),
            role: "limit",
            text: result.answer,
            payload: result,
          },
        ]);
      } else {
        setUsed(typeof result.used === "number" ? result.used : getUsedMessages());
        setMessages((prev) => [
          ...prev,
          { id: nextMessageId(), role: "assistant", text: result.answer },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextMessageId(),
          role: "error",
          text: err?.message || "Something went wrong.",
        },
      ]);
    } finally {
      setStatus("idle");
    }
  };

  const showTranscript = messages.length > 0 || status === "loading";
  const charCount = question.length;
  const nearCharLimit = charCount >= CHAR_LIMIT * 0.85;
  const activePlaceholder = limited
    ? "Monthly AI limit reached — contact Samir directly"
    : SAMPLE_QUESTIONS[placeholderIndex];

  return (
    <>
      {expanded && (
        <div
          className="askSamirExpandBackdrop"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`askSamirChat${showTranscript ? " has-transcript" : ""}${limited ? " is-limited" : ""}${expanded ? " is-expanded" : ""}`}
        aria-label="Ask about Samir"
        aria-expanded={expanded}
      >
      {showTranscript && (
        <div
          ref={answerRef}
          className="askSamirAnswer"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="askSamirAnswerInner">
            {messages.map((message) =>
              message.role === "limit" ? (
                <LimitMessage key={message.id} payload={message.payload} />
              ) : (
                <p key={message.id} className={`askSamirMessage is-${message.role}`}>
                  {message.text}
                </p>
              )
            )}
            {status === "loading" && <p className="askSamirThinking">Thinking…</p>}
          </div>
        </div>
      )}

      <form className="askSamirForm" onSubmit={submit}>
        <div className="askSamirField">
          <textarea
            ref={inputRef}
            className="askSamirInput"
            value={question}
            onChange={(event) => setQuestion(event.target.value.slice(0, CHAR_LIMIT))}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            aria-label="Question or job description about Samir"
            rows={1}
            maxLength={CHAR_LIMIT}
            disabled={status === "loading" || limited}
          />
          {!question && (
            <span
              className={`askSamirPlaceholder ${placeholderVisible || limited ? "is-visible" : ""}`}
              aria-hidden="true"
            >
              {activePlaceholder}
            </span>
          )}
        </div>
        <button
          type="submit"
          className={`askSamirSend${status === "loading" ? " is-loading" : ""}${limited ? " is-blocked" : ""}`}
          disabled={status === "loading" || limited}
          aria-label={limited ? "Monthly limit reached" : "Send question"}
          title={limited ? "Monthly AI limit reached" : undefined}
        >
          {limited ? "Limit" : "Ask"}
        </button>
      </form>

      <div className="askSamirLabelRow">
        <p className="askSamirLabel">
          {limited
            ? `Monthly limit reached · ${used}/${MESSAGE_LIMIT}`
            : `Ask me anything about Samir · ${used}/${MESSAGE_LIMIT}`}
        </p>
        {nearCharLimit && !limited && (
          <span
            className={`askSamirCharCount${charCount >= CHAR_LIMIT ? " is-max" : ""}`}
            aria-live="polite"
          >
            {charCount}/{CHAR_LIMIT}
          </span>
        )}
        <button
          type="button"
          className="askSamirExpand"
          onClick={() => setExpanded((open) => !open)}
          aria-label={expanded ? "Collapse chat" : "Expand chat"}
          title={expanded ? "Collapse chat" : "Expand chat"}
        >
          {expanded ? (
            <FaCompressAlt size={11} aria-hidden="true" />
          ) : (
            <FaExpandAlt size={11} aria-hidden="true" />
          )}
        </button>
        {import.meta.env.DEV && (
          <button
            type="button"
            className="askSamirTestLimit"
            onClick={limited ? resetLimitForTesting : previewLimitHit}
            disabled={status === "loading"}
            title={limited ? "Reset mock quota" : "Preview 25-message limit"}
          >
            {limited ? "Reset" : "Hit limit"}
          </button>
        )}
        {messages.length > 0 && (
          <button
            type="button"
            className="askSamirClear"
            onClick={clearChat}
            disabled={status === "loading"}
            aria-label="Clear chat history"
            title="Clear chat"
          >
            <FaTrash size={11} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
    </>
  );
}

export default AskSamirChat;
