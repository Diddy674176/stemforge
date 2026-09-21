import type { AudioSource } from '../audio/types';

interface Props {
  sources: AudioSource[];
  vocalsId: string;
  beatId: string;
  melodyId: string;
  onVocals: (id: string) => void;
  onBeat: (id: string) => void;
  onMelody: (id: string) => void;
  onAutoSync: () => void;
  busy: boolean;
}

export function BeginnerMode(props: Props) {
  const opts = props.sources.filter((s) => s.stems.length > 0);
  return (
    <div className="beginner">
      <h3>Beginner · AUTO SYNC</h3>
      <p className="muted">Pick vocals + beat (+ optional melody). We match tempo &amp; key.</p>
      <label>
        Vocals source
        <select value={props.vocalsId} onChange={(e) => props.onVocals(e.target.value)}>
          <option value="">—</option>
          {opts.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <label>
        Beat / instrumental source
        <select value={props.beatId} onChange={(e) => props.onBeat(e.target.value)}>
          <option value="">—</option>
          {opts.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <label>
        Melody (optional)
        <select value={props.melodyId} onChange={(e) => props.onMelody(e.target.value)}>
          <option value="">—</option>
          {opts.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn primary"
        disabled={props.busy || !props.vocalsId || !props.beatId}
        onClick={props.onAutoSync}
      >
        AUTO SYNC preview
      </button>
    </div>
  );
}
