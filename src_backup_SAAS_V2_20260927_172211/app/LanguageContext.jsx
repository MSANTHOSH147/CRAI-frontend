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
    // Navigation
    home: "Home",
    fields: "My Fields",
    checkCrop: "Check Crop",
    alerts: "Alerts",
    askCrai: "Ask CRAI",
    expert: "Expert Console",
    evidence: "Evidence",
    settings: "Settings",

    // Sections
    farmer: "Farmer",
    intelligence: "Intelligence",

    // Common
    online: "Online",
    offline: "Offline",
    checking: "Checking",
    available: "Available",
    unavailable: "Unavailable",
    missing: "Missing",
    uncertain: "Uncertain",
    stale: "Stale",
    unknown: "Unknown",
    ready: "Ready",
    loading: "Loading",
    error: "Error",
    retry: "Retry",
    refresh: "Refresh",
    details: "Details",
    back: "Back",
    send: "Send",
    cancel: "Cancel",
    save: "Save",
    close: "Close",

    // Field
    field: "Field",
    fieldsTitle: "My Fields",
    crop: "Crop",
    zone: "Zone",
    growthStage: "Growth Stage",
    source: "Source",
    temperature: "Temperature",
    humidity: "Humidity",
    soilMoisture: "Soil Moisture",
    soilTemperature: "Soil Temperature",
    soilPH: "Soil pH",
    soilEC: "Soil EC",
    leafWetness: "Leaf Wetness",
    battery: "Battery",
    sensor: "Sensor",
    sensorState: "Sensor State",
    conditions: "Field Conditions",

    // Risk
    risk: "Risk",
    riskScore: "Risk Score",
    riskLevel: "Risk Level",
    low: "Low",
    moderate: "Moderate",
    high: "High",
    critical: "Critical",

    // Decision
    decision: "Decision",
    recommendation: "Recommendation",
    action: "Action",
    continueMonitoring: "Continue Monitoring",
    investigate: "Investigate",
    protect: "Protect",
    alert: "Alert",
    collectEvidence: "Collect Additional Evidence",

    // Evidence
    visual: "Visual",
    environmental: "Environmental",
    temporal: "Temporal",
    spatial: "Spatial",
    evidencePackage: "Evidence Package",
    evidenceFusion: "Evidence Fusion",
    integrity: "Integrity",
    integrityHash: "Integrity Hash",
    verifyEvidence: "Verify Evidence Package",
    verified: "Verified",
    verificationFailed: "Verification Failed",

    // Event
    event: "Event",
    events: "Events",
    status: "Status",
    lifecycle: "Lifecycle",
    timeline: "Timeline",
    before: "Before",
    during: "During",
    recovery: "Recovery",
    after: "After",
    resolved: "Resolved",

    // Alerts
    noAlerts: "No active alerts",
    activeAlerts: "Active Alerts",
    riskAlerts: "Risk Alerts",
    connectionIssue: "Connection issue",

    // Farmer actions
    checkMyCrop: "Check My Crop",
    viewEvidence: "View Evidence",
    viewDetails: "View Details",
    currentField: "Current Field",
    currentRisk: "Current Risk",
    whatToDo: "What should I do?",
    monitorField: "Monitor the field",
    inspectCrop: "Inspect the crop",
    uploadImage: "Upload Crop Image",
    takePhoto: "Take Photo",
    analyzeCrop: "Analyze Crop",

    // Home
    fieldStatus: "Field Status",
    fieldOverview: "Field Overview",
    today: "Today",
    latestUpdate: "Latest Update",
    noCurrentRisk: "No current risk decision",
    noCurrentEvent: "No active field event",
    moreEvidenceNeeded: "More evidence is needed",
    fieldHealthy: "No significant risk detected",

    // Ask CRAI
    askAnything: "Ask anything about your field",
    tryAsking: "Try asking",
    listen: "Listen",
    stop: "Stop",
    listening: "Listening...",
    speakNow: "Speak now",
    microphoneUnavailable: "Microphone is not supported in this browser",

    // Check crop
    selectCrop: "Select Crop",
    selectGrowthStage: "Select Growth Stage",
    chooseImage: "Choose an image",
    camera: "Camera",
    imagePreview: "Image Preview",
    analyzing: "Analyzing...",
    analysisComplete: "Analysis Complete",
    analysisPending: "Analysis Pending",

    // Settings
    language: "Language",
    appLanguage: "App Language",
    systemStatus: "System Status",
    services: "Services",
    technicalTransparency: "Technical Transparency",
    backendAuthoritative: "Backend Authoritative",
    evidenceFirst: "Evidence First",

    // Trust
    authoritative: "Authoritative",
    backend: "Backend",
    deterministicEngine: "Deterministic Engine",
    explanationOnly: "Explanation Only",
    riskNotCalculatedFrontend:
      "Risk is not calculated in the frontend",

    // Sources
    liveHardware: "LIVE HARDWARE",
    simulatedHardware: "SIMULATED HARDWARE",
    live: "Live",
    simulated: "Simulated",

    // Empty / errors
    noData: "No data available",
    unableToLoad: "Unable to load data",
    somethingWentWrong: "Something went wrong",
    backendUnavailable: "Backend unavailable",

    // Persistence
    persistence: "Persistence",
    persistenceReady: "Ready",
    persistenceUnavailable: "Unavailable",

    // Misc
    farmerApp: "Farmer Application",
    cropRiskAdaptiveIntelligence:
      "Crop Risk & Adaptive Intelligence",
  },

  ta: {
    // Navigation
    home: "முகப்பு",
    fields: "என் வயல்கள்",
    checkCrop: "பயிரைச் சரிபார்க்கவும்",
    alerts: "எச்சரிக்கைகள்",
    askCrai: "CRAI-யிடம் கேளுங்கள்",
    expert: "நிபுணர் கன்சோல்",
    evidence: "ஆதாரம்",
    settings: "அமைப்புகள்",

    // Sections
    farmer: "விவசாயி",
    intelligence: "நுண்ணறிவு",

    // Common
    online: "இணைக்கப்பட்டுள்ளது",
    offline: "இணைப்பு இல்லை",
    checking: "சரிபார்க்கிறது",
    available: "கிடைக்கிறது",
    unavailable: "கிடைக்கவில்லை",
    missing: "இல்லை",
    uncertain: "தெளிவற்றது",
    stale: "பழைய தரவு",
    unknown: "தெரியவில்லை",
    ready: "தயார்",
    loading: "ஏற்றுகிறது",
    error: "பிழை",
    retry: "மீண்டும் முயற்சி",
    refresh: "புதுப்பி",
    details: "விவரங்கள்",
    back: "பின்",
    send: "அனுப்பு",
    cancel: "ரத்து",
    save: "சேமி",
    close: "மூடு",

    // Field
    field: "வயல்",
    fieldsTitle: "என் வயல்கள்",
    crop: "பயிர்",
    zone: "பகுதி",
    growthStage: "வளர்ச்சி நிலை",
    source: "ஆதாரம்",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    soilMoisture: "மண் ஈரப்பதம்",
    soilTemperature: "மண் வெப்பநிலை",
    soilPH: "மண் pH",
    soilEC: "மண் EC",
    leafWetness: "இலை ஈரப்பதம்",
    battery: "பேட்டரி",
    sensor: "சென்சார்",
    sensorState: "சென்சார் நிலை",
    conditions: "வயல் நிலை",

    // Risk
    risk: "அபாயம்",
    riskScore: "அபாய மதிப்பெண்",
    riskLevel: "அபாய நிலை",
    low: "குறைந்த",
    moderate: "மிதமான",
    high: "அதிக",
    critical: "மிகவும் அதிக",

    // Decision
    decision: "முடிவு",
    recommendation: "பரிந்துரை",
    action: "நடவடிக்கை",
    continueMonitoring: "தொடர்ந்து கண்காணிக்கவும்",
    investigate: "சரிபார்க்கவும்",
    protect: "பாதுகாக்கவும்",
    alert: "எச்சரிக்கை",
    collectEvidence: "மேலும் ஆதாரம் சேகரிக்கவும்",

    // Evidence
    visual: "காட்சி",
    environmental: "சுற்றுச்சூழல்",
    temporal: "காலவரிசை",
    spatial: "இடவியல்",
    evidencePackage: "ஆதார தொகுப்பு",
    evidenceFusion: "ஆதார இணைப்பு",
    integrity: "ஒருமைப்பாடு",
    integrityHash: "ஒருமைப்பாடு Hash",
    verifyEvidence: "ஆதார தொகுப்பை சரிபார்",
    verified: "சரிபார்க்கப்பட்டது",
    verificationFailed: "சரிபார்ப்பு தோல்வியடைந்தது",

    // Event
    event: "நிகழ்வு",
    events: "நிகழ்வுகள்",
    status: "நிலை",
    lifecycle: "வாழ்க்கைச் சுழற்சி",
    timeline: "காலவரிசை",
    before: "முன்",
    during: "நடைபெறும் போது",
    recovery: "மீட்பு",
    after: "பிறகு",
    resolved: "தீர்க்கப்பட்டது",

    // Alerts
    noAlerts: "செயலில் உள்ள எச்சரிக்கைகள் இல்லை",
    activeAlerts: "செயலில் உள்ள எச்சரிக்கைகள்",
    riskAlerts: "அபாய எச்சரிக்கைகள்",
    connectionIssue: "இணைப்பு சிக்கல்",

    // Farmer actions
    checkMyCrop: "என் பயிரைச் சரிபார்க்கவும்",
    viewEvidence: "ஆதாரத்தைப் பார்க்கவும்",
    viewDetails: "விவரங்களைப் பார்க்கவும்",
    currentField: "தற்போதைய வயல்",
    currentRisk: "தற்போதைய அபாயம்",
    whatToDo: "நான் என்ன செய்ய வேண்டும்?",
    monitorField: "வயலைக் கண்காணிக்கவும்",
    inspectCrop: "பயிரைச் சரிபார்க்கவும்",
    uploadImage: "பயிர் படத்தைப் பதிவேற்றவும்",
    takePhoto: "புகைப்படம் எடுக்கவும்",
    analyzeCrop: "பயிரை பகுப்பாய்வு செய்யவும்",

    // Home
    fieldStatus: "வயல் நிலை",
    fieldOverview: "வயல் மேலோட்டம்",
    today: "இன்று",
    latestUpdate: "சமீபத்திய புதுப்பிப்பு",
    noCurrentRisk: "தற்போதைய அபாய முடிவு இல்லை",
    noCurrentEvent: "செயலில் உள்ள வயல் நிகழ்வு இல்லை",
    moreEvidenceNeeded: "மேலும் ஆதாரம் தேவை",
    fieldHealthy: "குறிப்பிடத்தக்க அபாயம் கண்டறியப்படவில்லை",

    // Ask CRAI
    askAnything:
      "உங்கள் வயலைப் பற்றி எதையும் கேளுங்கள்",
    tryAsking: "இதைக் கேட்கலாம்",
    listen: "கேள்",
    stop: "நிறுத்து",
    listening: "கேட்கிறது...",
    speakNow: "இப்போது பேசுங்கள்",
    microphoneUnavailable:
      "இந்த browser-ல் microphone ஆதரவு இல்லை",

    // Check crop
    selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
    selectGrowthStage:
      "வளர்ச்சி நிலையைத் தேர்ந்தெடுக்கவும்",
    chooseImage: "படத்தைத் தேர்ந்தெடுக்கவும்",
    camera: "கேமரா",
    imagePreview: "பட முன்னோட்டம்",
    analyzing: "பகுப்பாய்வு செய்கிறது...",
    analysisComplete: "பகுப்பாய்வு முடிந்தது",
    analysisPending:
      "பகுப்பாய்வு நிலுவையில் உள்ளது",

    // Settings
    language: "மொழி",
    appLanguage: "பயன்பாட்டு மொழி",
    systemStatus: "கணினி நிலை",
    services: "சேவைகள்",
    technicalTransparency:
      "தொழில்நுட்ப வெளிப்படைத்தன்மை",
    backendAuthoritative:
      "Backend அதிகாரப்பூர்வம்",
    evidenceFirst: "ஆதாரம் முதலில்",

    // Trust
    authoritative: "அதிகாரப்பூர்வம்",
    backend: "Backend",
    deterministicEngine:
      "Deterministic Engine",
    explanationOnly:
      "விளக்கத்திற்காக மட்டும்",
    riskNotCalculatedFrontend:
      "Risk frontend-ல் கணக்கிடப்படாது",

    // Sources
    liveHardware: "LIVE HARDWARE",
    simulatedHardware: "SIMULATED HARDWARE",
    live: "நேரடி",
    simulated: "Simulation",

    // Empty / errors
    noData: "தரவு இல்லை",
    unableToLoad:
      "தரவை ஏற்ற முடியவில்லை",
    somethingWentWrong:
      "ஏதோ தவறு ஏற்பட்டது",
    backendUnavailable:
      "Backend கிடைக்கவில்லை",

    // Persistence
    persistence: "தரவு சேமிப்பு",
    persistenceReady: "தயார்",
    persistenceUnavailable:
      "கிடைக்கவில்லை",

    // Misc
    farmerApp: "விவசாயி பயன்பாடு",
    cropRiskAdaptiveIntelligence:
      "பயிர் அபாயம் மற்றும் தகவமைப்பு நுண்ணறிவு",
  },
};

const LanguageContext =
  createContext(null);

export function LanguageProvider({
  children,
}) {
  const [language, setLanguageState] =
    useState(() => {
      const saved =
        localStorage.getItem(
          LANGUAGE_KEY
        );

      return saved === "ta"
        ? "ta"
        : "en";
    });

  const setLanguage = (nextLanguage) => {
    const next =
      nextLanguage === "ta"
        ? "ta"
        : "en";

    setLanguageState(next);

    localStorage.setItem(
      LANGUAGE_KEY,
      next
    );

    window.dispatchEvent(
      new CustomEvent(
        "crai-language-change",
        {
          detail: next,
        }
      )
    );
  };

  useEffect(() => {
    document.documentElement.lang =
      language === "ta"
        ? "ta-IN"
        : "en-IN";
  }, [language]);

  useEffect(() => {
    function handleExternalChange(
      event
    ) {
      const next =
        event?.detail === "ta"
          ? "ta"
          : "en";

      setLanguageState(next);
    }

    window.addEventListener(
      "crai-language-change",
      handleExternalChange
    );

    return () => {
      window.removeEventListener(
        "crai-language-change",
        handleExternalChange
      );
    };
  }, []);

  const value = useMemo(() => {
    const dictionary =
      translations[language] ||
      translations.en;

    function t(key) {
      return (
        dictionary[key] ??
        translations.en[key] ??
        key
      );
    }

    return {
      language,
      setLanguage,
      t,
      translations,
    };
  }, [language]);

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}

export default LanguageContext;