import type { ProjectState } from '../audio/types';
import type { SavedProjectMeta } from '../db/indexedDb';

interface Props {
  project: ProjectState;
  status: string;
  busy: boolean;
  savedList: SavedProjectMeta[];
  onName: (n: string) => void;
  onBpm: (n: number) => void;
  onKey: (k: string) => void;
  onSave: () => void;
  onLoad: (id: string) => void;
  onDeleteSaved: (id: string) => void;
  onExportWav: () => void;
  onExportMp3: () => void;
  onImport: (files: FileList | null) => void;
}

export function ProjectBar(props: Props) {
  return (
    <header className="project-bar">
      <strong>StemForge</strong>
      <input
        type="text"
        value={props.project.name}
        onChange={(e) => props.onName(e.target.value)}
        aria-label="Project name"
      />
      <label className="mono">
        BPM{" "}
        <input
          type="number"
          min={60}
          max={200}
          value={props.project.bpm}
          onChange={(e) => props.onBpm(Number(e.target.value))}
          style={{ width: 64 }}
        />
      </label>
      <label className="mono">
        Key{" "}
        <input
          type="text"
          value={props.project.key}
          onChange={(e) => props.onKey(e.target.value)}
          style={{ width: 100 }}
        />
      </label>
      <label className="btn primary" style={{ cursor: 'pointer' }}>
        Import
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.flac,.aac,.m4a,.ogg"
          multiple
          hidden
          disabled={props.busy}
          onChange={(e) => props.onImport(e.target.files)}
        />
      </label>
      <button type="button" className="btn" disabled={props.busy} onClick={props.onSave}>
        Save
      </button>
      <button type="button" className="btn" disabled={props.busy} onClick={props.onExportWav}>
        Export WAV
      </button>
      <button type="button" className="btn" disabled={props.busy} onClick={props.onExportMp3}>
        Export MP3
      </button>
      {props.savedList.length > 0 && (
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) props.onLoad(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="">Load saved…</option>
          {props.savedList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
      <div className="status-line">{props.status}</div>
    </header>
  );
}
