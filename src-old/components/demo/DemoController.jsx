import React from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

export default function DemoController({ playing, setPlaying, step, setStep, total }) {
  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => s >= total - 1 ? (setPlaying(false), s) : s + 1);
    }, 5000);
    return () => clearInterval(id);
  }, [playing, total, setPlaying, setStep]);

  return (
    <div className="demo-controls">
      <button className="secondary-action" onClick={() => setStep((s) => Math.max(0, s - 1))}><SkipBack size={16} /> Back</button>
      <button className="primary-action demo-play" onClick={() => setPlaying((p) => !p)}>{playing ? <><Pause size={17} /> Pause</> : <><Play size={17} /> Play Demo</>}</button>
      <button className="secondary-action" onClick={() => setStep((s) => Math.min(total - 1, s + 1))}>Next <SkipForward size={16} /></button>
      <button className="icon-button" onClick={() => { setStep(0); setPlaying(false); }} aria-label="Reset demo"><RotateCcw size={17} /></button>
    </div>
  );
}
