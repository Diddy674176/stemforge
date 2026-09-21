import type { RemixProposal } from '../audio/types';

interface Props {
  proposals: RemixProposal[];
  onRun: () => void;
  onLoad: (p: RemixProposal) => void;
}

export function SmartRemix({ proposals, onRun, onLoad }: Props) {
  return (
    <div className="smart-remix">
      <h3>Smart Remix</h3>
      <p className="muted">Proposes 2–3 stem combos scored by BPM/key compatibility.</p>
      <button type="button" className="btn" onClick={onRun}>
        Propose combinations
      </button>
      <div>
        {proposals.map((p) => (
          <div key={p.id} className="proposal">
            <div>
              <strong>{p.title}</strong>{' '}
              <span className="score">{p.score}</span>
            </div>
            <ul className="muted">
              {p.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <button type="button" className="btn primary" onClick={() => onLoad(p)}>
              Load on timeline
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
