import {
  Brain,
  Loader2,
  MessageCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useFieldSelection,
} from "../../app/FieldContext.jsx";

import {
  askCrai,
} from "../../services/craiData.js";


export default function QwenAdvisory({
  event,
}) {

  const {
    selected,
    language,
  } = useFieldSelection();

  const [
    answer,
    setAnswer,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  async function generate() {

    setLoading(true);
    setError(null);

    try {

      const result =
        await askCrai(
          language === "ta"
            ? "இந்த வயலின் தற்போதைய நிலையை விளக்குங்கள்."
            : "Explain the current condition of my crop.",
          {
            farmId:
              selected?.farmId ?? 1,

            zoneId:
              selected?.zoneId ?? "A1",

            crop:
              selected?.crop ||
              event?.crop ||
              "Tomato",

            growthStage:
              event?.cropStage ||
              "Vegetative",

            language,

            context:
              event || {},
          }
        );

      if(!result?.answer) {
        throw new Error(
          "No advisory text returned."
        );
      }

      setAnswer(
        result.answer
      );

    } catch(err) {

      setError(
        err?.message ||
        "Unable to generate advisory."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="qwen-card">

      <div className="qwen-head">

        <div className="qwen-icon">
          <Brain size={18}/>
        </div>

        <div>
          <div className="eyebrow">
            CRAI ADVISORY
          </div>

          <h3>
            AI explanation from Qwen3
          </h3>

          <p>
            Explanation only ·
            deterministic CRAI decision remains authoritative
          </p>
        </div>

      </div>


      {answer && (
        <div className="qwen-answer">
          <MessageCircle size={16}/>
          <p>{answer}</p>
        </div>
      )}


      {error && (
        <div className="empty-inline">
          {error}
        </div>
      )}


      <button
        className="soft-button primary"
        onClick={generate}
        disabled={loading}
      >
        {loading
          ? <Loader2
              size={16}
              className="spin"
            />
          : <Brain size={16}/>
        }

        {loading
          ? "Generating…"
          : language === "ta"
            ? "Qwen விளக்கத்தைப் பெறுக"
            : "Get Qwen advisory"}
      </button>

    </div>
  );
}
