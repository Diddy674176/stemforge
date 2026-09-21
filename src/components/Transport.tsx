import { formatTime } from '../utils/format';

interface Props {
  playing: boolean;
  playhead: number;
  duration: number;
  bpm: number;
  metronome: boolean;
  snap: 'off' | 'beat' | 'bar';
  autoHarmonic: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (s: number) => void;
  onMetronome: (on: boolean) => void;
  onSnap: (s: 'off' | 'beat' | 'bar') => void;
  onAutoHarmonic: (on: boolean) => void;
}

export function Transport(props: Props) {
  return (
    <footer className="transport">
      <div className="row gap">
        <span className="mono">{formatTime(props.playhead)} / {formatTime(props.duration)}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, props.duration)}
          step={0.01}
          value={props.playhead}
          onChange={(e) => props.onSeek(Number(e.target.value))}
          style={{ width: 180 }}
        />
      </div>
      <div className="center">
        <button type="button" className="btn" onClick={props.onStop}>■</button>
        {props.playing ? (
          <button type="button" className="btn primary" onClick={props.onPause}>❚❚</button>
        ) : (
          <button type="button" className="btn primary" onClick={props.onPlay}>▶</button>
        )}
      </div>
      <div className="row gap" style={{ justifyContent: 'flex-end' }}>
        <label className="chk muted">
          <input
            type="checkbox"
            checked={props.metronome}
            onChange={(e) => props.onMetronome(e.target.checked)}
          />
          Metronome ({props.bpm})
        </label>
        <label className="muted">
          Snap{" "}
          <select value={props.snap} onChange={(e) => props.onSnap(e.target.value as Props['snap'])}>
            <option value="off">off</option>
            <option value="beat">beat</option>
            <option value="bar">bar</option>
          </select>
        </label>
        <label className="chk muted">
          <input
            type="checkbox"
            checked={props.autoHarmonic}
            onChange={(e) => props.onAutoHarmonic(e.target.checked)}
          />
          Auto Harmonic Match
        </label>
      </div>
    </footer>
  );
}
