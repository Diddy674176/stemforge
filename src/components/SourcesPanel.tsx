import type { AudioSource, StemTrack } from '../audio/types';
import { BeginnerMode } from './BeginnerMode';
import { SmartRemix } from './SmartRemix';
import type { RemixProposal } from '../audio/types';

interface Props {
  sources: AudioSource[];
  selectedStemId: string | null;
  beginnerMode: boolean;
  vocalsId: string;
  beatId: string;
  melodyId: string;
  proposals: RemixProposal[];
  busy: boolean;
  onSelectStem: (id: string | null) => void;
  onAddStem: (stem: StemTrack) => void;
  onMute: (id: string, muted: boolean) => void;
  onSolo: (id: string, solo: boolean) => void;
  onExportStem: (stem: StemTrack) => void;
  onPreview: (stem: StemTrack) => void;
  onVocals: (id: string) => void;
  onBeat: (id: string) => void;
  onMelody: (id: string) => void;
  onAutoSync: () => void;
  onSmartRemix: () => void;
  onLoadProposal: (p: RemixProposal) => void;
}

export function SourcesPanel(props: Props) {
  return (
    <aside className="panel sources-panel">
      <header className="panel-head">
        <h2>Sources / Stems</h2>
      </header>
      {props.beginnerMode && (
        <BeginnerMode
          sources={props.sources}
          vocalsId={props.vocalsId}
          beatId={props.beatId}
          melodyId={props.melodyId}
          onVocals={props.onVocals}
          onBeat={props.onBeat}
          onMelody={props.onMelody}
          onAutoSync={props.onAutoSync}
          busy={props.busy}
        />
      )}
      <SmartRemix
        proposals={props.proposals}
        onRun={props.onSmartRemix}
        onLoad={props.onLoadProposal}
      />
      <div>
        {props.sources.map((src) => (
          <div key={src.id} className="source-card">
            <div>
              <strong>{src.name}</strong>
              <div className="muted mono">
                {src.bpm ? `${src.bpm} BPM` : '…'} · {src.key ?? '…'} · {src.status}
                {src.separating ? ` (${Math.round(src.analyzeProgress * 100)}%)` : ''}
              </div>
            </div>
            {src.stems.map((stem) => (
              <div key={stem.id} className="stem-row">
                <span className="stem-dot" style={{ background: stem.color }} />
                <button
                  type="button"
                  className="btn"
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    borderColor: props.selectedStemId === stem.id ? stem.color : undefined,
                  }}
                  onClick={() => props.onSelectStem(stem.id)}
                >
                  {stem.name}
                </button>
                <button type="button" className="btn" title="Solo" onClick={() => props.onSolo(stem.id, !stem.solo)}>
                  {stem.solo ? 'S*' : 'S'}
                </button>
                <button type="button" className="btn" title="Mute" onClick={() => props.onMute(stem.id, !stem.muted)}>
                  {stem.muted ? 'M*' : 'M'}
                </button>
                <button type="button" className="btn" title="Add to timeline" onClick={() => props.onAddStem(stem)}>
                  +
                </button>
                <button type="button" className="btn" title="Preview" onClick={() => props.onPreview(stem)}>
                  ▶
                </button>
                <button type="button" className="btn" title="Export stem" onClick={() => props.onExportStem(stem)}>
                  ⤓
                </button>
              </div>
            ))}
          </div>
        ))}
        {props.sources.length === 0 && (
          <p className="muted" style={{ padding: 12 }}>
            Import local mp3/wav/flac/aac/m4a/ogg you have rights to remix.
          </p>
        )}
      </div>
    </aside>
  );
}
