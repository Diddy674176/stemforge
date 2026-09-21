import { useCallback, useRef, useState, type DragEvent } from 'react';
import type { AudioSource, RemixProposal, StemTrack } from '../audio/types';
import { formatTime } from '../utils/format';

interface Props {
  sources: AudioSource[];
  selectedStem: StemTrack | null;
  clipsCount: number;
  status: string;
  busy: boolean;
  playing: boolean;
  playhead: number;
  duration: number;
  vocalsId: string;
  beatId: string;
  melodyId: string;
  proposals: RemixProposal[];
  onImport: (files: FileList | File[]) => void;
  onVocals: (id: string) => void;
  onBeat: (id: string) => void;
  onMelody: (id: string) => void;
  onAutoSync: () => void;
  onSmartRemix: () => void;
  onLoadProposal: (p: RemixProposal) => void;
  onSelectStem: (id: string | null) => void;
  onVolume: (id: string, volume: number) => void;
  onMute: (id: string, muted: boolean) => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

const STEPS = [
  { n: 1, label: 'Import' },
  { n: 2, label: 'Pick voice & beat' },
  { n: 3, label: 'Auto Sync' },
  { n: 4, label: 'Play' },
  { n: 5, label: 'Export' },
] as const;

export function SimpleStudio(props: Props) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const readySources = props.sources.filter((s) => s.stems.length > 0);
  const hasSources = props.sources.length > 0;
  const canSync = Boolean(props.vocalsId && props.beatId) && !props.busy;
  const hasMix = props.clipsCount > 0;

  let activeStep = 1;
  if (hasSources) activeStep = 2;
  if (props.vocalsId && props.beatId) activeStep = 3;
  if (hasMix) activeStep = 4;
  if (hasMix && !props.busy && !props.playing) activeStep = 5;

  const takeFiles = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || list.length === 0) return;
      props.onImport(list);
    },
    [props],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    takeFiles(e.dataTransfer.files);
  };

  return (
    <div className="simple-studio">
      <ol className="step-strip" aria-label="Workflow">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className={s.n === activeStep ? 'active' : s.n < activeStep ? 'done' : ''}
          >
            <span className="step-num">{s.n}</span>
            <span className="step-label">{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="status-banner" role="status">
        {props.busy ? (
          <span className="status-busy">{props.status}</span>
        ) : (
          <span>{props.status || 'Ready'}</span>
        )}
      </div>

      {!hasSources ? (
        <div
          className={`dropzone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="dropzone-icon" aria-hidden>
            ♫
          </div>
          <h2>Drop songs here</h2>
          <p className="muted">mp3, wav, flac, aac, m4a, ogg — files you have rights to remix</p>
          <button
            type="button"
            className="btn primary btn-xl"
            disabled={props.busy}
            onClick={() => fileRef.current?.click()}
          >
            Import audio
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
            multiple
            hidden
            disabled={props.busy}
            onChange={(e) => takeFiles(e.target.files)}
          />
        </div>
      ) : (
        <>
          <section className="source-grid" aria-label="Imported sources">
            {props.sources.map((src) => (
              <div
                key={src.id}
                className={`source-card-simple ${
                  props.selectedStem?.sourceId === src.id ? 'selected' : ''
                }`}
              >
                <strong>{src.name}</strong>
                <div className="mono">
                  {src.bpm ? `${Math.round(src.bpm)} BPM` : '… BPM'} · {src.key ?? '…'}
                </div>
                <div className="muted">
                  {src.separating
                    ? `Separating… ${Math.round(src.analyzeProgress * 100)}%`
                    : src.status}
                </div>
                {src.stems.length > 0 && (
                  <div className="stem-chips">
                    {src.stems.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`stem-chip ${props.selectedStem?.id === st.id ? 'on' : ''}`}
                        style={{ borderColor: st.color }}
                        onClick={() => props.onSelectStem(st.id)}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <label className="source-card-simple add-more">
              + Add more
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
                multiple
                hidden
                disabled={props.busy}
                onChange={(e) => takeFiles(e.target.files)}
              />
            </label>
          </section>

          <section className="sync-panel">
            <div className="sync-fields">
              <label>
                Voice song (vocals only)
                <select
                  value={props.vocalsId}
                  onChange={(e) => props.onVocals(e.target.value)}
                  disabled={props.busy || readySources.length === 0}
                >
                  <option value="">Choose source…</option>
                  {readySources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Beat song (instrumental / ad-libs)
                <select
                  value={props.beatId}
                  onChange={(e) => props.onBeat(e.target.value)}
                  disabled={props.busy || readySources.length === 0}
                >
                  <option value="">Choose source…</option>
                  {readySources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Melody (optional)
                <select
                  value={props.melodyId}
                  onChange={(e) => props.onMelody(e.target.value)}
                  disabled={props.busy || readySources.length === 0}
                >
                  <option value="">None</option>
                  {readySources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="sync-actions">
              <button
                type="button"
                className={`btn btn-xl ${hasMix ? '' : 'primary'}`}
                disabled={!canSync}
                onClick={props.onAutoSync}
              >
                {hasMix ? 'Re-sync' : 'Auto Sync'}
              </button>
              <button
                type="button"
                className="btn btn-lg"
                disabled={props.busy || readySources.length < 2}
                onClick={props.onSmartRemix}
              >
                Smart Remix
              </button>
            </div>
            {props.proposals.length > 0 && (
              <div className="proposal-list">
                {props.proposals.map((p) => (
                  <div key={p.id} className="proposal">
                    <div>
                      <strong>{p.title}</strong> <span className="score">{p.score}</span>
                    </div>
                    <button
                      type="button"
                      className="btn primary btn-tap"
                      onClick={() => props.onLoadProposal(p)}
                    >
                      Load mix
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {props.selectedStem && (
            <section className="quick-stem" aria-label="Selected stem">
              <div className="quick-stem-head">
                <span className="stem-dot" style={{ background: props.selectedStem.color }} />
                <strong>{props.selectedStem.name}</strong>
              </div>
              <label className="quick-vol">
                Volume
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={props.selectedStem.volume}
                  onChange={(e) =>
                    props.onVolume(props.selectedStem!.id, Number(e.target.value))
                  }
                />
              </label>
              <button
                type="button"
                className={`btn btn-tap ${props.selectedStem.muted ? 'danger' : ''}`}
                onClick={() =>
                  props.onMute(props.selectedStem!.id, !props.selectedStem!.muted)
                }
              >
                {props.selectedStem.muted ? 'Unmute' : 'Mute'}
              </button>
            </section>
          )}
        </>
      )}

      <footer className="simple-transport">
        <div className="time mono">
          {formatTime(props.playhead)} / {formatTime(props.duration)}
        </div>
        <div className="transport-btns">
          <button type="button" className="btn btn-xl transport-btn" onClick={props.onStop}>
            Stop
          </button>
          {props.playing ? (
            <button
              type="button"
              className="btn primary btn-xl transport-btn"
              onClick={props.onPause}
            >
              Pause
            </button>
          ) : (
            <button
              type="button"
              className="btn primary btn-xl transport-btn"
              onClick={props.onPlay}
              disabled={!hasMix}
            >
              Play
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
