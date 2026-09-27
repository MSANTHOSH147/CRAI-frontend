import React from "react";
import { Settings, ShieldCheck } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="page narrow-page">
      <div className="page-intro"><div><span className="eyebrow">SETTINGS</span><h1>CRAI preferences</h1><p>Farmer-facing preferences can be configured here.</p></div></div>
      <section className="card settings-card">
        <div className="settings-row"><Settings size={19} /><div><strong>Language</strong><span>Switch English / தமிழ் from the header.</span></div></div>
        <div className="settings-row"><ShieldCheck size={19} /><div><strong>Evidence principle</strong><span>CRAI does not treat missing evidence as zero risk.</span></div></div>
      </section>
    </div>
  );
}
