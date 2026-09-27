import React from "react";
import AskCrai from "../components/farmer/AskCrai";
import { fetchLatestEvent } from "../services/craiData";

export default function AskCraiPage() {
  const [event, setEvent] = React.useState(null);
  React.useEffect(() => { fetchLatestEvent().then(setEvent).catch(() => setEvent(null)); }, []);
  return (
    <div className="page ask-page">
      <div className="page-intro"><div><span className="eyebrow">FARMER COMPANION</span><h1>Ask CRAI</h1><p>Understand the evidence behind your field's current state.</p></div></div>
      <div className="ask-layout">
        <section className="ask-intro-card"><div className="big-bot">CR</div><h2>Evidence, not guesses.</h2><p>Ask why a field needs attention, what evidence is available, or why CRAI is waiting for more information.</p><div className="ask-suggestions"><button>Why is my field at risk?</button><button>What evidence is missing?</button><button>Why is CRAI monitoring recovery?</button></div></section>
        <section className="card chat-card"><AskCrai event={event} /></section>
      </div>
    </div>
  );
}
