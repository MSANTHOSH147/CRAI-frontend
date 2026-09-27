import { useState } from "react";
import Card from "../components/common/Card.jsx";
import SectionHeader from "../components/common/SectionHeader.jsx";
import { isSupabaseConfigured } from "../services/supabase.js";
import { API_BASE } from "../services/craiData.js";

function Switch({ on, onToggle }) {
  return (
    <button className={`crai-switch${on ? " on" : ""}`} onClick={onToggle} type="button" aria-pressed={on}>
      <span className="crai-switch__knob" />
    </button>
  );
}

export default function SettingsPage() {
  const [expertMode, setExpertMode] = useState(false);
  const [tamil, setTamil] = useState(false);

  return (
    <div className="crai-fade-in">
      <h1 className="crai-title-xl">Settings</h1>

      <div className="crai-section">
        <SectionHeader eyebrow="Preferences" title="App mode &amp; language" />
        <Card>
          <div className="crai-setting-row">
            <div>
              <div className="crai-title-md">Expert mode</div>
              <div className="crai-muted">Show technical evidence fusion and decision trace details</div>
            </div>
            <Switch on={expertMode} onToggle={() => setExpertMode((v) => !v)} />
          </div>
          <div className="crai-setting-row">
            <div>
              <div className="crai-title-md">தமிழ் (Tamil)</div>
              <div className="crai-muted">Use Tamil labels for farmer-facing screens</div>
            </div>
            <Switch on={tamil} onToggle={() => setTamil((v) => !v)} />
          </div>
        </Card>
      </div>

      <div className="crai-section">
        <SectionHeader eyebrow="System" title="Connection status" />
        <Card>
          <div className="crai-kv"><span className="crai-kv__k">API base URL</span><span className="crai-kv__v mono">{API_BASE}</span></div>
          <div className="crai-kv"><span className="crai-kv__k">Supabase configured</span><span className="crai-kv__v">{isSupabaseConfigured() ? "Yes" : "No"}</span></div>
        </Card>
      </div>
    </div>
  );
}
