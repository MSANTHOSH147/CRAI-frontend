export const translations = {
 en: {
  home:'Home', fields:'My Fields', alerts:'Alerts', ask:'Ask CRAI', expert:'Expert', demo:'SIH Demo', settings:'Settings',
  farmerHome:'FARMER HOME', greeting:'Good morning, Farmer', subtitle:'Here’s what CRAI knows about your field — and what it still needs.',
  refresh:'Refresh', checkCrop:'Check my crop', currentField:'CURRENT FIELD', live:'Live', systemStatus:'System status',
  qwen:'CRAI Advisory', qwenTitle:'AI advisory from Qwen3', qwenExplain:'Explanation only — it does not calculate or override risk.',
  qwenReady:'Qwen3 1.7B available', qwenUnavailable:'Advisory service unavailable', model:'Model', provider:'Provider', role:'Role',
  evidenceGrounded:'Evidence-grounded', unknown:'UNKNOWN', language:'Language', tamil:'தமிழ்', english:'English',
  risk:'FIELD RISK', environment:'Environment', evidence:'Evidence at a glance', activity:'What changed', intelligence:'Open intelligence',
  alertsEvents:'Alerts & events', askTitle:'Understand your field in simple language.', expertTitle:'CRAI intelligence workspace',
  backend:'CRAI backend', supabase:'Supabase', dataMode:'Data mode', evidenceGated:'Evidence-gated',
  why:'Why CRAI decided', lifecycle:'Evidence progression', audit:'Decision trace',
 },
 ta: {
  home:'முகப்பு', fields:'என் வயல்கள்', alerts:'எச்சரிக்கைகள்', ask:'CRAI-யிடம் கேள்', expert:'நிபுணர்', demo:'SIH டெமோ', settings:'அமைப்புகள்',
  farmerHome:'விவசாயி முகப்பு', greeting:'வணக்கம், விவசாயி', subtitle:'உங்கள் வயலைப் பற்றி CRAI அறிந்ததையும் இன்னும் தேவைப்படுவதையும் பார்க்கலாம்.',
  refresh:'புதுப்பி', checkCrop:'பயிரைச் சரிபார்', currentField:'தற்போதைய வயல்', live:'நேரலை', systemStatus:'அமைப்பு நிலை',
  qwen:'CRAI ஆலோசனை', qwenTitle:'Qwen3 AI ஆலோசனை', qwenExplain:'விளக்கத்திற்காக மட்டும் — இது அபாய மதிப்பை கணக்கிடவோ மாற்றவோாது.',
  qwenReady:'Qwen3 1.7B கிடைக்கிறது', qwenUnavailable:'ஆலோசனை சேவை கிடைக்கவில்லை', model:'மாதிரி', provider:'வழங்குநர்', role:'பங்கு',
  evidenceGrounded:'ஆதார அடிப்படையிலானது', unknown:'தெரியவில்லை', language:'மொழி', tamil:'தமிழ்', english:'English',
  risk:'வயல் அபாயம்', environment:'சுற்றுச்சூழல்', evidence:'ஆதார சுருக்கம்', activity:'மாற்றங்கள்', intelligence:'நுண்ணறிவைத் திற',
  alertsEvents:'எச்சரிக்கைகள் & நிகழ்வுகள்', askTitle:'உங்கள் வயலை எளிய மொழியில் புரிந்துகொள்ளுங்கள்.', expertTitle:'CRAI நுண்ணறிவு பணியகம்',
  backend:'CRAI பின்புற சேவை', supabase:'Supabase', dataMode:'தரவு முறை', evidenceGated:'ஆதாரக் கட்டுப்பாடு',
  why:'CRAI ஏன் முடிவு செய்தது', lifecycle:'ஆதார முன்னேற்றம்', audit:'முடிவு தடம்',
 }
};
export function t(language,key){ return translations[language]?.[key] ?? translations.en[key] ?? key; }
