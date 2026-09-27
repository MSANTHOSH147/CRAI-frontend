export const DEMO_STEPS = [
  {
    id: "observe", short: "Observe", kicker: "01 · OBSERVE", title: "A crop observation arrives",
    description: "CRAI receives a crop observation from Zone A1 and starts the evidence pipeline.",
    details: [{label:"Source",value:"Crop image"}, {label:"Field",value:"Zone A1"}, {label:"State",value:"Initial observation"}],
    quote: "The first observation is a signal — not a conclusion."
  },
  {
    id: "uncertainty", short: "Uncertainty", kicker: "02 · IDENTIFY UNCERTAINTY", title: "CRAI refuses to guess",
    description: "The visual evidence is uncertain, so CRAI identifies what additional evidence is required.",
    details: [{label:"Visual state",value:"UNCERTAIN"}, {label:"Next need",value:"Environmental evidence"}, {label:"Decision",value:"Wait for evidence"}],
    quote: "I don't guess. I ask for the evidence I need."
  },
  {
    id: "request", short: "Evidence", kicker: "03 · REQUEST EVIDENCE", title: "CRAI requests fresh telemetry",
    description: "The intelligence layer requests fresh environmental evidence from the field device.",
    details: [{label:"Request",value:"Fresh telemetry"}, {label:"Device",value:"ESP32"}, {label:"Mode",value:"SIMULATED HARDWARE"}],
    quote: "A missing measurement becomes a request — not a zero."
  },
  {
    id: "response", short: "Sensor", kicker: "04 · SENSOR RESPONSE", title: "Environmental evidence arrives",
    description: "The field device returns the measurements available to the current scenario.",
    details: [{label:"Temperature",value:"Scenario value"}, {label:"Humidity",value:"Scenario value"}, {label:"Soil moisture",value:"Scenario value"}],
    quote: "Evidence is useful only when its freshness and source are understood."
  },
  {
    id: "fusion", short: "Fusion", kicker: "05 · MULTIMODAL FUSION", title: "Evidence vectors meet",
    description: "Visual, environmental, temporal and spatial context are brought together before a risk decision.",
    details: [{label:"Visual",value:"Available"}, {label:"Environment",value:"Available"}, {label:"Temporal / spatial",value:"Evaluated"}],
    quote: "CRAI combines evidence before it commits to a decision."
  },
  {
    id: "decision", short: "Decision", kicker: "06 · DETERMINISTIC DECISION", title: "The risk engine decides",
    description: "The deterministic backend evaluates the fused evidence and produces the authoritative risk state.",
    details: [{label:"Owner",value:"Deterministic risk engine"}, {label:"Output",value:"Risk + action"}, {label:"LLM",value:"Explanation only"}],
    quote: "The explanation can describe the decision. It cannot rewrite it."
  },
  {
    id: "action", short: "Action", kicker: "07 · FARMER ACTION", title: "The farmer gets meaning",
    description: "CRAI turns the technical decision into a clear next step for the farmer.",
    details: [{label:"Focus",value:"What to do next"}, {label:"Style",value:"Simple language"}, {label:"Safety",value:"Evidence-gated"}],
    quote: "Don't just alert. Tell the farmer what to do."
  },
  {
    id: "recovery", short: "Recovery", kicker: "08 · RECOVERY", title: "CRAI keeps observing",
    description: "A falling risk score does not instantly erase an event. CRAI continues through recovery evidence.",
    details: [{label:"Lifecycle",value:"RECOVERY"}, {label:"Monitoring",value:"Continues"}, {label:"Goal",value:"Sufficient recovery evidence"}],
    quote: "Recovery is a phase — not a single lucky measurement."
  },
  {
    id: "resolved", short: "Resolved", kicker: "09 · RESOLUTION", title: "The event is resolved",
    description: "The lifecycle reaches RESOLVED after the recovery path is satisfied and the record is finalized.",
    details: [{label:"Lifecycle",value:"BEFORE → DURING → RECOVERY → AFTER"}, {label:"Status",value:"RESOLVED"}, {label:"Record",value:"Integrity preserved"}],
    quote: "CRAI doesn't guess. It asks for the evidence it needs."
  }
];
