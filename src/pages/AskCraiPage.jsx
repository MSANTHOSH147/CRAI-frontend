import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { askCrai } from "../services/craiData";
import { useLanguage } from "../app/LanguageContext";

const STARTERS = {
  en: [
    "What is happening in my field?",
    "Should I check my crop now?",
    "Why is my field risk changing?",
    "What should I do today?",
  ],
  ta: [
    "என் வயலில் என்ன நடக்கிறது?",
    "இப்போது பயிரைச் சரிபார்க்க வேண்டுமா?",
    "என் வயல் அபாயம் ஏன் மாறுகிறது?",
    "இன்று நான் என்ன செய்ய வேண்டும்?",
  ],
};

function getLanguageCode(language) {
  return language === "ta" ? "ta-IN" : "en-IN";
}

function getFallbackReply(language) {
  if (language === "ta") {
    return "உங்கள் கேள்வியை CRAI-க்கு அனுப்பலாம். தற்போதைய வயல் தரவு கிடைக்கும் போது அதைப் பயன்படுத்தி விளக்கம் மற்றும் அடுத்த நடவடிக்கையை வழங்கும்.";
  }

  return "Ask CRAI about your field. When current field evidence is available, CRAI uses it to explain the situation and suggest the next action.";
}

function getWelcomeMessage(language) {
  if (language === "ta") {
    return "வணக்கம்! உங்கள் வயலில் என்ன நடக்கிறது என்பதைப் புரிந்துகொள்ள நான் உதவுகிறேன். என்ன வேண்டுமானாலும் கேளுங்கள்.";
  }

  return "Hello! I can help you understand what is happening in your field. Ask me anything.";
}

export default function AskCraiPage() {
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState(() => [
    {
      id: "welcome",
      role: "assistant",
      text: getWelcomeMessage(language),
    },
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  /*
   * Speech recognition support
   */
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setVoiceSupported(Boolean(SpeechRecognition));

    if (!SpeechRecognition) {
      return undefined;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = getLanguageCode(language);

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results?.[0]?.[0]?.transcript || "";

      if (transcript.trim()) {
        setInput((current) =>
          current
            ? `${current} ${transcript.trim()}`
            : transcript.trim()
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Browser may already have stopped recognition.
      }

      recognitionRef.current = null;
    };
  }, [language]);

  /*
   * Scroll to newest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, sending]);

  /*
   * When global language changes, update only the
   * welcome message if the conversation is still new.
   */
  useEffect(() => {
    setMessages((current) => {
      if (
        current.length === 1 &&
        current[0]?.id === "welcome"
      ) {
        return [
          {
            id: "welcome",
            role: "assistant",
            text: getWelcomeMessage(language),
          },
        ];
      }

      return current;
    });
  }, [language]);

  async function handleSend(customMessage = null) {
    const message = String(
      customMessage ?? input
    ).trim();

    if (!message || sending) {
      return;
    }

    setInput("");

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setSending(true);

    try {
      const result = await askCrai(
        message,
        language === "ta" ? "ta" : "en"
      );

      const answer =
        result?.answer ||
        result?.analysis?.advisory?.advisory ||
        getFallbackReply(language);

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: answer,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      const errorMessage =
        language === "ta"
          ? "CRAI-யுடன் தற்போது இணைக்க முடியவில்லை. Backend இயங்குகிறதா என்பதைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்."
          : "CRAI could not be reached right now. Check that the backend is running and try again.";

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          text: errorMessage,
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function startListening() {
    if (!recognitionRef.current || listening) {
      return;
    }

    try {
      recognitionRef.current.lang =
        getLanguageCode(language);

      recognitionRef.current.start();
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Already stopped.
    }
  }

  function speak(text, id) {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingId(id);
    };

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeakingId(null);
  }

  const starters = STARTERS[language] || STARTERS.en;

  return (
    <div className="cr-ask-page">
      <section className="cr-ask-header">
        <div>
          <span className="cr-ask-eyebrow">
            CRAI · {t("farmer")}
          </span>

          <h1>{t("askCrai")}</h1>

          <p>
            {t("askCraiIntro")}
          </p>
        </div>

        <div className="cr-ask-language">
          {language === "ta"
            ? "தமிழ்"
            : "English"}
        </div>
      </section>

      <section className="cr-ask-shell">
        <div className="cr-ask-intro">
          <div className="cr-ask-avatar">
            C
          </div>

          <div>
            <strong>CRAI</strong>

            <span>
              {t("fieldExplanationAssistant")}
            </span>
          </div>
        </div>

        {messages.length === 1 && (
          <div className="cr-ask-starters">
            <span className="cr-ask-starters-label">
              {t("tryAsking")}
            </span>

            <div className="cr-ask-starter-list">
              {starters.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() =>
                    handleSend(question)
                  }
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="cr-ask-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`cr-ask-message-row ${
                message.role === "user"
                  ? "user"
                  : "assistant"
              }`}
            >
              {message.role === "assistant" && (
                <div className="cr-ask-small-avatar">
                  C
                </div>
              )}

              <div
                className={`cr-ask-bubble ${
                  message.error
                    ? "error"
                    : ""
                }`}
              >
                <div>{message.text}</div>

                {message.role ===
                  "assistant" && (
                  <div className="cr-ask-message-tools">
                    <button
                      type="button"
                      onClick={() =>
                        speakingId ===
                        message.id
                          ? stopSpeaking()
                          : speak(
                              message.text,
                              message.id
                            )
                      }
                    >
                      {speakingId ===
                      message.id
                        ? "■"
                        : "🔊"}{" "}
                      {speakingId ===
                      message.id
                        ? t("stop")
                        : t("listen")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="cr-ask-message-row assistant">
              <div className="cr-ask-small-avatar">
                C
              </div>

              <div className="cr-ask-bubble cr-ask-thinking">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="cr-ask-composer">
          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              language === "ta"
                ? "உங்கள் வயலைப் பற்றி கேளுங்கள்..."
                : "Ask about your field..."
            }
            rows={1}
            disabled={sending}
          />

          {voiceSupported && (
            <button
              type="button"
              className={`cr-ask-icon-button ${
                listening ? "active" : ""
              }`}
              onClick={
                listening
                  ? stopListening
                  : startListening
              }
              aria-label={
                listening
                  ? "Stop microphone"
                  : "Start microphone"
              }
              title={
                listening
                  ? "Stop microphone"
                  : "Use microphone"
              }
            >
              {listening ? "■" : "🎙"}
            </button>
          )}

          <button
            type="button"
            className="cr-ask-send"
            onClick={() => handleSend()}
            disabled={
              sending || !input.trim()
            }
          >
            {sending ? "..." : t("send")}
          </button>
        </div>

        {listening && (
          <div className="cr-ask-listening">
            <span />
            {t("listening")}
          </div>
        )}

        <div className="cr-ask-trust">
          <span>✓</span>

          <p>
            {language === "ta"
              ? "CRAI அபாய மதிப்பெண்ணை கணக்கிட AI உரையாடலைப் பயன்படுத்தாது. அபாய முடிவு backend-இன் அதிகாரப்பூர்வ deterministic engine மூலம் வருகிறது."
              : "CRAI does not use chat AI to calculate risk. Risk decisions come from the authoritative deterministic backend engine."}
          </p>
        </div>
      </section>

      <div className="cr-ask-links">
        <Link to="/fields">
          ← {t("fields")}
        </Link>

        <Link to="/expert">
          {t("expert")} →
        </Link>
      </div>

      <style>{`
        .cr-ask-page {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 22px 20px 42px;
          color: #17201c;
        }

        .cr-ask-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .cr-ask-eyebrow {
          display: block;
          color: #78847e;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: .12em;
        }

        .cr-ask-header h1 {
          margin: 4px 0 0;
          font-size: 27px;
          line-height: 1.1;
          letter-spacing: -.025em;
        }

        .cr-ask-header p {
          margin: 7px 0 0;
          color: #68746e;
          font-size: 13px;
        }

        .cr-ask-language {
          padding: 6px 9px;
          border: 1px solid #dce6df;
          border-radius: 999px;
          background: #fff;
          color: #145a45;
          font-size: 9px;
          font-weight: 850;
          white-space: nowrap;
        }

        .cr-ask-shell {
          overflow: hidden;
          border: 1px solid #dce5df;
          border-radius: 14px;
          background: #fff;
        }

        .cr-ask-intro {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 15px;
          border-bottom: 1px solid #edf1ee;
          background: #fbfcfb;
        }

        .cr-ask-avatar,
        .cr-ask-small-avatar {
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #145a45;
          color: #fff;
          font-weight: 850;
        }

        .cr-ask-avatar {
          width: 34px;
          height: 34px;
          font-size: 13px;
        }

        .cr-ask-intro strong {
          display: block;
          font-size: 12px;
        }

        .cr-ask-intro span {
          display: block;
          margin-top: 2px;
          color: #78847e;
          font-size: 9px;
        }

        .cr-ask-starters {
          padding: 12px 15px 4px;
        }

        .cr-ask-starters-label {
          display: block;
          margin-bottom: 7px;
          color: #7a8680;
          font-size: 9px;
          font-weight: 800;
        }

        .cr-ask-starter-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cr-ask-starter-list button {
          min-height: 32px;
          padding: 6px 9px;
          border: 1px solid #dce6df;
          border-radius: 8px;
          background: #f8faf8;
          color: #315c4b;
          font-size: 9px;
          line-height: 1.35;
          cursor: pointer;
        }

        .cr-ask-starter-list button:hover {
          border-color: #a9c8b8;
          background: #f1f7f3;
        }

        .cr-ask-messages {
          min-height: 330px;
          max-height: 480px;
          overflow-y: auto;
          padding: 13px 15px;
        }

        .cr-ask-message-row {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          margin-bottom: 11px;
        }

        .cr-ask-message-row.user {
          justify-content: flex-end;
        }

        .cr-ask-small-avatar {
          width: 23px;
          height: 23px;
          font-size: 8px;
        }

        .cr-ask-bubble {
          max-width: min(680px, 84%);
          padding: 9px 11px;
          border-radius: 11px;
          background: #f2f6f3;
          color: #35423b;
          font-size: 11px;
          line-height: 1.55;
        }

        .cr-ask-message-row.user .cr-ask-bubble {
          background: #145a45;
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .cr-ask-message-row.assistant .cr-ask-bubble {
          border-bottom-left-radius: 4px;
        }

        .cr-ask-bubble.error {
          background: #fff5f3;
          color: #91483d;
          border: 1px solid #f0d5cf;
        }

        .cr-ask-message-tools {
          margin-top: 7px;
          padding-top: 6px;
          border-top: 1px solid rgba(120, 140, 130, .16);
        }

        .cr-ask-message-tools button {
          border: 0;
          padding: 0;
          background: transparent;
          color: #567568;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
        }

        .cr-ask-message-row.user
          .cr-ask-message-tools button {
          color: rgba(255,255,255,.8);
        }

        .cr-ask-thinking {
          display: flex;
          align-items: center;
          gap: 4px;
          min-width: 45px;
        }

        .cr-ask-thinking span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #729586;
          animation: crAskDot 1.2s infinite ease-in-out;
        }

        .cr-ask-thinking span:nth-child(2) {
          animation-delay: .15s;
        }

        .cr-ask-thinking span:nth-child(3) {
          animation-delay: .3s;
        }

        @keyframes crAskDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: .45;
          }
          30% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        .cr-ask-composer {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          padding: 10px;
          border-top: 1px solid #e9efeb;
          background: #fbfcfb;
        }

        .cr-ask-composer textarea {
          flex: 1;
          min-width: 0;
          min-height: 38px;
          max-height: 100px;
          resize: none;
          padding: 10px 11px;
          border: 1px solid #d8e2dc;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #17201c;
          font: inherit;
          font-size: 11px;
          line-height: 1.4;
        }

        .cr-ask-composer textarea:focus {
          border-color: #8eb5a2;
          box-shadow: 0 0 0 2px rgba(20,90,69,.06);
        }

        .cr-ask-icon-button,
        .cr-ask-send {
          min-width: 42px;
          min-height: 38px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .cr-ask-icon-button {
          padding: 0 9px;
          border: 1px solid #d8e2dc;
          background: #fff;
          color: #456b5b;
        }

        .cr-ask-icon-button.active {
          border-color: #c99393;
          background: #fff2f2;
          color: #a24343;
        }

        .cr-ask-send {
          padding: 0 13px;
          border: 0;
          background: #145a45;
          color: #fff;
        }

        .cr-ask-send:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .cr-ask-listening {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px 8px;
          color: #8d4747;
          font-size: 9px;
          font-weight: 750;
        }

        .cr-ask-listening span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #b64b4b;
          animation: crAskPulse 1s infinite;
        }

        @keyframes crAskPulse {
          50% {
            opacity: .3;
            transform: scale(.75);
          }
        }

        .cr-ask-trust {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 9px 13px;
          border-top: 1px solid #edf1ee;
          background: #fafcfb;
        }

        .cr-ask-trust span {
          display: grid;
          place-items: center;
          width: 17px;
          height: 17px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #edf6f1;
          color: #145a45;
          font-size: 8px;
          font-weight: 850;
        }

        .cr-ask-trust p {
          margin: 0;
          color: #7b8781;
          font-size: 8px;
          line-height: 1.45;
        }

        .cr-ask-links {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
        }

        .cr-ask-links a {
          color: #145a45;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
        }

        @media (max-width: 650px) {
          .cr-ask-page {
            padding: 17px 13px 95px;
          }

          .cr-ask-header h1 {
            font-size: 23px;
          }

          .cr-ask-messages {
            min-height: 330px;
            max-height: none;
          }

          .cr-ask-bubble {
            max-width: 88%;
          }

          .cr-ask-starter-list {
            display: grid;
            grid-template-columns: 1fr;
          }

          .cr-ask-starter-list button {
            text-align: left;
            min-height: 38px;
          }

          .cr-ask-composer {
            position: sticky;
            bottom: 0;
            z-index: 5;
          }
        }

        @media (max-width: 430px) {
          .cr-ask-header {
            gap: 8px;
          }

          .cr-ask-header p {
            font-size: 11px;
          }

          .cr-ask-language {
            font-size: 8px;
          }

          .cr-ask-send {
            padding: 0 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cr-ask-thinking span,
          .cr-ask-listening span {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
