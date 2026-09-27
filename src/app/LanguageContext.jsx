import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LANGUAGE_KEY = "crai-language";

const translations = {
  en: {
    crai: "CRAI",
    farmer: "Farmer",
    home: "Home",
    fields: "My Fields",
    checkCrop: "Check Crop",
    checkMyCrop: "Check My Crop",
    alerts: "Alerts",
    askCrai: "Ask CRAI",
    expert: "Expert Console",
    settings: "Settings",

    overview: "Overview",
    intelligence: "Intelligence",
    system: "System",

    field: "Field",
    crop: "Crop",
    zone: "Zone",
    growthStage: "Growth Stage",
    source: "Source",
    status: "Status",

    risk: "Risk",
    riskScore: "Risk score",
    decision: "Decision",
    action: "Action",
    recommendation: "Recommendation",
    nextAction: "Next action",

    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",
    unknown: "Unknown",

    available: "Available",
    unavailable: "Unavailable",
    uncertain: "Uncertain",
    stale: "Stale",
    moreEvidence: "More evidence needed",

    visual: "Visual",
    environmental: "Environmental",
    temporal: "Temporal",
    spatial: "Spatial",
    evidence: "Evidence",
    evidenceTitle: "Evidence",
    availableEvidence: "Evidence status",

    fieldConditions: "Field conditions",
    temperature: "Temperature",
    humidity: "Humidity",
    soilMoisture: "Soil moisture",

    online: "Online",
    offline: "Offline",
    checking: "Checking",
    connectionIssue: "Connection issue",
    retry: "Retry",

    details: "Details",
    viewEvidence: "View evidence",
    viewField: "View field",
    verifyEvidence: "Verify evidence",
    evidencePackage: "Evidence package",

    liveHardware: "LIVE HARDWARE",
    simulatedHardware: "SIMULATED HARDWARE",

    homeIntro: "Understand what is happening in your field.",
    assessmentIntro: "CRAI combines crop evidence with field context before making a decision.",
    cropDetails: "Crop context",
    selectCropImage: "Add crop image",
    chooseClearCropImage: "Choose a clear crop image",
    cropImageHint: "Use good lighting and keep the affected crop area visible.",
    evidenceNotSufficient: "CRAI needs additional evidence before making a deterministic risk decision.",
    authoritativeRiskNote: "Risk and decisions come from the authoritative CRAI engine.",
    selectedCrop: "Selected crop",

    uploadImage: "Upload image",
    useCamera: "Use camera",
    analyzeWithCrai: "Analyze with CRAI",
    analyzing: "Analyzing...",
    imageRequired: "Please select a crop image first.",

    askCraiIntro: "Ask naturally about what is happening in your field.",
    fieldExplanationAssistant: "Field explanation assistant",
    tryAsking: "Try asking",
    askAboutField: "Ask about your field...",
    listening: "Listening... speak now",
    send: "Send",
    stop: "Stop",
    listen: "Listen",

    whatHappening: "What is happening in my field?",
    whyRisk: "Why is my field at risk?",
    missingEvidence: "What evidence is missing?",
    whatNext: "What should I check next?",

    lifecycle: "Lifecycle",
    before: "Before",
    during: "During",
    recovery: "Recovery",
    after: "After",
    resolved: "Resolved",

    observation: "Observation",
    evidenceFusion: "Evidence fusion",
    decisionTrace: "Decision trace",
    integrity: "Integrity",
    verifiedRecord: "Verified record",
    recordIntegrity: "Record integrity",

    backend: "Backend",
    advisory: "Advisory",
    persistence: "Persistence",
    authoritativeEngine: "Authoritative engine",
    explanationOnly: "Explanation only",

    noEvents: "No field events available.",
    noEvidence: "No evidence is available yet.",
    loading: "Loading...",
    loadingField: "Loading field intelligence...",
    error: "Unable to load field information.",

    today: "Today",
    goodMorning: "Good morning",
    monitor: "Continue monitoring",
    investigate: "Investigate",
    protect: "Protect",
    alert: "Alert",

    farmerMode: "Farmer",
    intelligenceMode: "Intelligence",
    connected: "Connected",
    disconnected: "Disconnected",

    askForGuidance: "Get a grounded explanation from CRAI.",
  },

  ta: {
    crai: "CRAI",
    farmer: "விவசாயி",
    home: "முகப்பு",
    fields: "என் வயல்கள்",
    checkCrop: "பயிரைச் சரிபார்",
    checkMyCrop: "என் பயிரைச் சரிபார்",
    alerts: "எச்சரிக்கைகள்",
    askCrai: "CRAI-யிடம் கேள்",
    expert: "நிபுணர் பார்வை",
    settings: "அமைப்புகள்",

    overview: "மேலோட்டம்",
    intelligence: "நுண்ணறிவு",
    system: "அமைப்பு",

    field: "வயல்",
    crop: "பயிர்",
    zone: "பகுதி",
    growthStage: "வளர்ச்சி நிலை",
    source: "மூலம்",
    status: "நிலை",

    risk: "அபாயம்",
    riskScore: "அபாய மதிப்பெண்",
    decision: "முடிவு",
    action: "நடவடிக்கை",
    recommendation: "பரிந்துரை",
    nextAction: "அடுத்த நடவடிக்கை",

    low: "குறைவு",
    moderate: "மிதமான",
    high: "அதிகம்",
    critical: "மிக அதிகம்",
    unknown: "தெரியவில்லை",

    available: "கிடைக்கிறது",
    unavailable: "கிடைக்கவில்லை",
    uncertain: "தெளிவில்லை",
    stale: "பழைய தரவு",
    moreEvidence: "மேலும் ஆதாரம் தேவை",

    visual: "காட்சி",
    environmental: "சுற்றுச்சூழல்",
    temporal: "காலவரிசை",
    spatial: "இடவியல்",
    evidence: "ஆதாரம்",
    evidenceTitle: "ஆதாரம்",
    availableEvidence: "ஆதார நிலை",

    fieldConditions: "வயல் நிலை",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    soilMoisture: "மண் ஈரப்பதம்",

    online: "இணைக்கப்பட்டுள்ளது",
    offline: "இணைப்பு இல்லை",
    checking: "சரிபார்க்கிறது",
    connectionIssue: "இணைப்பு சிக்கல்",
    retry: "மீண்டும் முயற்சி",

    details: "விவரங்கள்",
    viewEvidence: "ஆதாரத்தைப் பார்க்க",
    viewField: "வயலைப் பார்க்க",
    verifyEvidence: "ஆதாரத்தைச் சரிபார்",
    evidencePackage: "ஆதாரத் தொகுப்பு",

    liveHardware: "நேரடி HARDWARE",
    simulatedHardware: "SIMULATED HARDWARE",

    homeIntro: "உங்கள் வயலில் என்ன நடக்கிறது என்பதை எளிதாகப் புரிந்துகொள்ளுங்கள்.",
    assessmentIntro: "முடிவு எடுப்பதற்கு முன் CRAI பயிர் ஆதாரத்தையும் வயல் தகவலையும் இணைக்கிறது.",
    cropDetails: "பயிர் சூழல்",
    selectCropImage: "பயிர் படத்தைச் சேர்க்கவும்",
    chooseClearCropImage: "தெளிவான பயிர் படத்தைத் தேர்வு செய்யவும்",
    cropImageHint: "நல்ல வெளிச்சத்தில் படமெடுத்து பாதிக்கப்பட்ட பகுதி தெளிவாகத் தெரியுமாறு வைக்கவும்.",
    evidenceNotSufficient: "உறுதியான அபாய முடிவுக்கு CRAI-க்கு கூடுதல் ஆதாரம் தேவை.",
    authoritativeRiskNote: "அபாயமும் முடிவும் CRAI-யின் அதிகாரப்பூர்வ இயந்திரத்திலிருந்து வருகிறது.",
    selectedCrop: "தேர்ந்தெடுக்கப்பட்ட பயிர்",

    uploadImage: "படத்தைப் பதிவேற்றவும்",
    useCamera: "கேமரா பயன்படுத்தவும்",
    analyzeWithCrai: "CRAI மூலம் பகுப்பாய்வு",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    imageRequired: "முதலில் பயிர் படத்தைத் தேர்வு செய்யவும்.",

    askCraiIntro: "உங்கள் வயலில் என்ன நடக்கிறது என்பதை இயல்பாகக் கேளுங்கள்.",
    fieldExplanationAssistant: "வயல் விளக்க உதவியாளர்",
    tryAsking: "இவ்வாறு கேட்கலாம்",
    askAboutField: "உங்கள் வயலைப் பற்றி கேளுங்கள்...",
    listening: "கேட்கிறது... பேசுங்கள்",
    send: "அனுப்பு",
    stop: "நிறுத்து",
    listen: "கேள்",

    whatHappening: "என் வயலில் என்ன நடக்கிறது?",
    whyRisk: "என் வயலுக்கு ஏன் அபாயம்?",
    missingEvidence: "என்ன ஆதாரம் தேவை?",
    whatNext: "அடுத்து என்ன பார்க்க வேண்டும்?",

    lifecycle: "நிகழ்வு நிலை",
    before: "முன்",
    during: "நிகழும் போது",
    recovery: "மீட்பு",
    after: "பிறகு",
    resolved: "தீர்வு",

    observation: "கவனிப்பு",
    evidenceFusion: "ஆதார இணைப்பு",
    decisionTrace: "முடிவு தடம்",
    integrity: "ஒருமைப்பாடு",
    verifiedRecord: "சரிபார்க்கப்பட்ட பதிவு",
    recordIntegrity: "பதிவு ஒருமைப்பாடு",

    backend: "Backend",
    advisory: "ஆலோசனை",
    persistence: "தரவு சேமிப்பு",
    authoritativeEngine: "அதிகாரப்பூர்வ இயந்திரம்",
    explanationOnly: "விளக்கம் மட்டும்",

    noEvents: "வயல் நிகழ்வுகள் எதுவும் இல்லை.",
    noEvidence: "ஆதாரம் இன்னும் கிடைக்கவில்லை.",
    loading: "ஏற்றுகிறது...",
    loadingField: "வயல் நுண்ணறிவை ஏற்றுகிறது...",
    error: "வயல் தகவலை ஏற்ற முடியவில்லை.",

    today: "இன்று",
    goodMorning: "வணக்கம்",
    monitor: "தொடர்ந்து கண்காணிக்கவும்",
    investigate: "ஆய்வு செய்யவும்",
    protect: "பாதுகாக்கவும்",
    alert: "எச்சரிக்கை",

    farmerMode: "விவசாயி",
    intelligenceMode: "நுண்ணறிவு",
    connected: "இணைக்கப்பட்டுள்ளது",
    disconnected: "இணைப்பு இல்லை",

    askForGuidance: "CRAI-யிடமிருந்து ஆதார அடிப்படையிலான விளக்கத்தைப் பெறுங்கள்.",
  },
};

function humanizeKey(key) {
  return String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, c => c.toUpperCase())
    .trim();
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  });

  function setLanguage(next) {
    const value = next === "ta" ? "ta" : "en";
    setLanguageState(value);

    if (typeof window !== "undefined") {
      localStorage.setItem(LANGUAGE_KEY, value);
      document.documentElement.lang = value === "ta" ? "ta" : "en";
      window.dispatchEvent(
        new CustomEvent("crai-language-change", {
          detail: value,
        })
      );
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    document.documentElement.lang =
      language === "ta" ? "ta" : "en";

    function handleLanguageChange(event) {
      const next =
        event?.detail ||
        localStorage.getItem(LANGUAGE_KEY) ||
        "en";

      setLanguageState(next === "ta" ? "ta" : "en");
    }

    window.addEventListener(
      "crai-language-change",
      handleLanguageChange
    );

    return () =>
      window.removeEventListener(
        "crai-language-change",
        handleLanguageChange
      );
  }, [language]);

  const value = useMemo(() => {
    function t(key) {
      return (
        translations?.[language]?.[key] ??
        translations?.en?.[key] ??
        humanizeKey(key)
      );
    }

    return {
      language,
      setLanguage,
      t,
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
