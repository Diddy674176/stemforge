import type { ProjectState } from '../audio/types';
import type { SavedProjectMeta } from '../db/indexedDb';

interface Props {
  project: ProjectState;
  busy: boolean;
  advanced: boolean;
  savedList: SavedProjectMeta[];
  onName: (n: string) => void;
  onSave: () => void;
  onLoad: (id: string) => void;
  onExportWav: () => void;
  onExportMp3: () => void;
  onImport: (files: FileList | null) => void;
  onToggleAdvanced: () => void;
}

export function ProjectBar(props: Props) {
  return (
    <header className="project-bar">
      <div className="project-bar-brand">
        <strong>StemForge</strong>
        <input
          type="text"
          className="project-name"
          value={props.project.name}
          onChange={(e) => props.onName(e.target.value)}
          aria-label="Project name"
        />
      </div>
      <div className="project-bar-actions">
        <label className="btn primary btn-tap" style={{ cursor: props.busy ? 'wait' : 'pointer' }}>
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
        <button type="button" className="btn btn-tap" disabled={props.busy} onClick={props.onExportWav}>
          Export WAV
        </button>
        <button type="button" className="btn btn-tap" disabled={props.busy} onClick={props.onExportMp3}>
          Export MP3
        </button>
        <button type="button" className="btn btn-tap" disabled={props.busy} onClick={props.onSave}>
          Save
        </button>
        {props.savedList.length > 0 && (
          <select
            className="btn-tap"
            defaultValue=""
            aria-label="Load saved project"
            onChange={(e) => {
              if (e.target.value) props.onLoad(e.target.value);
              e.target.value = '';
            }}
          >
            <option value="">Load…</option>
            {props.savedList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          className={`btn btn-tap${props.advanced ? ' primary' : ''}`}
          onClick={props.onToggleAdvanced}
          aria-pressed={props.advanced}
        >
          {props.advanced ? 'Simple' : 'Advanced'}
        </button>
      </div>
    </header>
  );
}
