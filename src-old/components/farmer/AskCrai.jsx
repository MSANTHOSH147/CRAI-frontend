import React from "react";
import { Bot, Send, UserRound } from "lucide-react";

export default function AskCrai({ event }) {
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      text: event?.riskLevel
        ? `Your field is currently ${event.riskLevel} risk. I can explain the evidence behind the current decision.`
        : "I need a current field event before I can explain a risk decision.",
    },
  ]);

  function send() {
    const q = question.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }, {
      role: "assistant",
      text: "CRAI can explain the available evidence and current deterministic decision. It will not invent missing evidence or change the risk score through chat.",
    }]);
    setQuestion("");
  }

  return (
    <div className="ask-crai">
      <div className="chat-window">
        {messages.map((m, i) => (
          <div className={`chat-row ${m.role}`} key={i}>
            <div className="chat-avatar">{m.role === "assistant" ? <Bot size={17} /> : <UserRound size={17} />}</div>
            <div className="chat-bubble">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask: Why is my field at risk?" aria-label="Ask CRAI" />
        <button onClick={send} aria-label="Send question"><Send size={18} /></button>
      </div>
      <small className="helper-text">CRAI explanations are grounded in available evidence. Missing evidence remains unknown.</small>
    </div>
  );
}
