import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  Leaf,
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  VolumeX,
  Wifi,
  User,
} from "lucide-react";
import "../styles/crai.css";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const DEFAULT_CONTEXT = {
  risk_score: 6.04,
  risk_level: "LOW",
  decision_action: "CONTINUE_MONITORING",
  priority: "LOW",
  temperature: 27.52,
  humidity: 61.65,
  soil_moisture: 53.19,
  source: "SIMULATED",
  evidence: {
    visual: "AVAILABLE",
    environmental: "AVAILABLE",
    temporal: "AVAILABLE",
    spatial: "MISSING",
  },
};

const quickQuestions = {
  en: [
    "How is my crop doing?",
    "What should I do now?",
    "Why is my field at this risk?",
    "Should I check my field again?",
  ],
  ta: [
    "என் பயிரின் நிலை எப்படி உள்ளது?",
    "இப்போது நான் என்ன செய்ய வேண்டும்?",
    "என் வயலுக்கு ஏன் இந்த அபாய நிலை?",
    "மீண்டும் வயலை எப்போது பரிசோதிக்க வேண்டும்?",
  ],
};

function getInitialMessages(language) {
  if (language === "ta") {
    return [
      {
        id: "welcome",
        role: "assistant",
        text:
          "வணக்கம்! 🌱 உங்கள் பயிரின் தற்போதைய நிலையை CRAI மூலம் புரிந்துகொள்ள நான் உதவுகிறேன். உங்கள் பயிரைப் பற்றி ஏதேனும் கேளுங்கள்.",
      },
    ];
  }

  return [
    {
      id: "welcome",
      role: "assistant",
      text:
        "Hello! 🌱 I can help you understand your crop's current condition using CRAI. Ask me anything about your field.",
    },
  ];
}

export default function AskCraiPage() {
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState(() =>
    getInitialMessages("en")
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    setVoiceSupported(Boolean(SpeechRecognition));

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

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
        setInput(transcript.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore stop errors during cleanup.
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.lang =
      language === "ta" ? "ta-IN" : "en-IN";

    try {
      recognition.start();
    } catch {
      // Browser may already be listening.
    }
  };

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // Ignore stop errors.
    }
  };

  const speak = (text, id) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.lang =
      language === "ta" ? "ta-IN" : "en-IN";

    utterance.rate = 0.92;
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
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);
  };

  const sendMessage = async (question = input) => {
    const message = question.trim();

    if (!message || loading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const recentConversation = messages
        .filter((item) => item.id !== "welcome")
        .slice(-6)
        .map((item) => ({
          role: item.role,
          content: item.text,
        }));

      const response = await fetch(
        `${API_BASE}/api/advisory/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            farm_id: 1,
            zone_id: "A1",
            crop: "Tomato",
            growth_stage: "Vegetative",
            language,
            message,
            context: {
              ...DEFAULT_CONTEXT,
              conversation: recentConversation,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to get CRAI advisory."
        );
      }

      const answer =
        data?.answer ||
        (language === "ta"
          ? "மன்னிக்கவும். தற்போது பதிலை பெற முடியவில்லை."
          : "Sorry. I could not get an advisory right now.");

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: answer,
        provider: data?.provider,
        simulated:
          DEFAULT_CONTEXT.source === "SIMULATED",
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      const fallback =
        language === "ta"
          ? "மன்னிக்கவும். CRAI சேவையுடன் தற்போது தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
          : "Sorry. CRAI could not be reached right now. Please try again.";

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: fallback,
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (nextLanguage) => {
    if (nextLanguage === language) return;

    stopSpeaking();

    setLanguage(nextLanguage);

    setMessages(getInitialMessages(nextLanguage));
    setInput("");
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages(getInitialMessages(language));
    setInput("");
  };

  const activeQuestions =
    quickQuestions[language];

  return (
    <div className="crai-chat-page">
      <div className="crai-chat-shell">
        <header className="crai-chat-header">
          <div className="crai-chat-brand">
            <div className="crai-chat-brand-icon">
              <Leaf size={21} strokeWidth={2.4} />
            </div>

            <div>
              <div className="crai-chat-title">
                CRAI Farmer Assistant
              </div>

              <div className="crai-chat-status">
                <span className="crai-online-dot" />
                CRAI intelligence connected
              </div>
            </div>
          </div>

          <div className="crai-chat-header-actions">
            <div className="crai-source-badge">
              <Wifi size={14} />
              SIMULATED HARDWARE
            </div>

            <button
              className="crai-icon-button"
              onClick={clearChat}
              title="Clear conversation"
              type="button"
            >
              <RotateCcw size={17} />
            </button>
          </div>
        </header>

        <div className="crai-chat-language">
          <button
            type="button"
            className={
              language === "en"
                ? "crai-language active"
                : "crai-language"
            }
            onClick={() => changeLanguage("en")}
          >
            English
          </button>

          <button
            type="button"
            className={
              language === "ta"
                ? "crai-language active"
                : "crai-language"
            }
            onClick={() => changeLanguage("ta")}
          >
            தமிழ்
          </button>
        </div>

        <section className="crai-chat-context">
          <div className="crai-context-icon">
            <CheckCircle2 size={19} />
          </div>

          <div className="crai-context-content">
            <strong>
              {language === "ta"
                ? "தற்போதைய பயிர் மதிப்பீடு"
                : "Current crop assessment"}
            </strong>

            <span>
              Tomato · Zone A1 ·{" "}
              {language === "ta"
                ? "குறைந்த அபாயம்"
                : "Low risk"}{" "}
              · 6.04/100
            </span>
          </div>

          <div className="crai-context-source">
            {language === "ta"
              ? "CRAI முடிவு"
              : "CRAI decision"}
          </div>
        </section>

        <main className="crai-chat-messages">
          <div className="crai-chat-intro">
            <div className="crai-intro-orb">
              <Bot size={27} />
            </div>

            <h2>
              {language === "ta"
                ? "உங்கள் பயிரைப் பற்றி கேளுங்கள்"
                : "Ask about your crop"}
            </h2>

            <p>
              {language === "ta"
                ? "CRAI கண்டறிந்த தகவல்களை எளிய முறையில் விளக்குகிறேன்."
                : "I'll explain what CRAI found in simple, practical language."}
            </p>
          </div>

          <div className="crai-quick-questions">
            {activeQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => sendMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "crai-message-row user"
                  : "crai-message-row assistant"
              }
            >
              <div className="crai-avatar">
                {message.role === "user" ? (
                  <User size={16} />
                ) : (
                  <Bot size={17} />
                )}
              </div>

              <div className="crai-message-column">
                <div className="crai-message-bubble">
                  {message.text}
                </div>

                {message.role === "assistant" &&
                  !message.error &&
                  message.id !== "welcome" && (
                    <div className="crai-message-tools">
                      {speakingId === message.id ? (
                        <button
                          type="button"
                          onClick={stopSpeaking}
                        >
                          <VolumeX size={14} />
                          Stop
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            speak(
                              message.text,
                              message.id
                            )
                          }
                        >
                          <Volume2 size={14} />
                          {language === "ta"
                            ? "கேட்க"
                            : "Listen"}
                        </button>
                      )}

                      <span>
                        CRAI · Explanation only
                      </span>
                    </div>
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="crai-message-row assistant">
              <div className="crai-avatar">
                <Bot size={17} />
              </div>

              <div className="crai-message-column">
                <div className="crai-message-bubble crai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </main>

        <footer className="crai-chat-composer">
          {!voiceSupported && (
            <div className="crai-voice-note">
              Voice input is not supported by this browser.
            </div>
          )}

          <div className="crai-composer-row">
            <button
              type="button"
              className={
                listening
                  ? "crai-mic-button listening"
                  : "crai-mic-button"
              }
              onClick={
                listening
                  ? stopListening
                  : startListening
              }
              disabled={!voiceSupported}
              title={
                language === "ta"
                  ? "குரலில் கேட்க"
                  : "Speak"
              }
            >
              {listening ? (
                <MicOff size={20} />
              ) : (
                <Mic size={20} />
              )}
            </button>

            <input
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={
                language === "ta"
                  ? "உங்கள் பயிரைப் பற்றி கேளுங்கள்..."
                  : "Ask CRAI about your crop..."
              }
              disabled={loading}
            />

            <button
              type="button"
              className="crai-send-button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <ArrowUp size={20} />
            </button>
          </div>

          <div className="crai-composer-footer">
            <span>
              <ShieldIcon />
              {language === "ta"
                ? "CRAI முடிவை மாற்றாது"
                : "CRAI does not override its deterministic decision"}
            </span>

            <span>
              {language === "ta"
                ? "குரல்: தமிழ் / ஆங்கிலம்"
                : "Voice: Tamil / English"}
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
