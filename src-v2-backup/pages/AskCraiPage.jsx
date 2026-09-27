import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { askCrai } from "../services/craiData.js";
import { useFieldSelection } from "../app/FieldContext.jsx";

const SUGGESTIONS = [
  "Why is my field at risk?",
  "What should I do today?",
  "Show recent field changes",
  "Why does CRAI need more evidence?",
];

function Message({ msg }) {
  if (msg.role === "user") {
    return <div className="crai-msg crai-msg--user">{msg.text}</div>;
  }
  return (
    <div className="crai-msg crai-msg--ai">
      {msg.tag && (
        <span className={`crai-msg__tag crai-msg__tag--${msg.tag}`}>
          {msg.tag === "evidence" ? "Observed evidence" : msg.tag === "action" ? "Recommendation" : "Unknown / missing evidence"}
        </span>
      )}
      <div>{msg.text}</div>
    </div>
  );
}

export default function AskCraiPage() {
  const { selected } = useFieldSelection();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setSending(true);
    try {
      const res = await askCrai(trimmed, { farmId: selected.farmId, zoneId: selected.zoneId });
      setMessages((m) => [...m, { role: "ai", text: res?.answer || "CRAI couldn't generate a response.", tag: res?.tag || null }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "CRAI's assistant is temporarily unavailable. Your field data hasn't changed.", tag: "unknown" },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="crai-fade-in">
      <h1 className="crai-title-xl">Ask CRAI</h1>
      <p className="crai-body crai-mt-4">What would you like to know about your field?</p>

      <div className="crai-chat crai-mt-16">
        <div className="crai-chat__scroll" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="crai-suggest-row">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="crai-suggest-chip" onClick={() => send(s)} type="button">{s}</button>
              ))}
            </div>
          )}
          {messages.length === 0 && (
            <div className="crai-empty">
              <div className="crai-empty__icon"><Sparkles size={22} /></div>
              <div className="crai-empty__title">Ask about risk, evidence, or what to do next</div>
              <div className="crai-empty__body">
                CRAI's assistant explains the evidence behind a decision — it never guesses the risk score itself.
              </div>
            </div>
          )}
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {sending && <div className="crai-msg crai-msg--ai crai-muted">CRAI is thinking…</div>}
        </div>

        <div className="crai-chat__input">
          <input
            placeholder="Ask CRAI about your field…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
          />
          <button className="crai-chat__send" disabled={!input.trim() || sending} onClick={() => send(input)} type="button">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
