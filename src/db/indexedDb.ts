import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface SavedProjectMeta {
  id: string;
  name: string;
  updatedAt: number;
  createdAt: number;
  bpm: number;
  key: string;
  sourceCount: number;
  clipCount: number;
}

export interface SavedProjectRecord {
  meta: SavedProjectMeta;
  stateJson: string;
}

export interface SavedAudioBlob {
  id: string;
  projectId: string;
  refId: string;
  kind: 'source' | 'stem';
  sampleRate: number;
  channels: number;
  pcm: ArrayBuffer;
  name: string;
  meta: Record<string, unknown>;
}

interface StemForgeDB extends DBSchema {
  projects: { key: string; value: SavedProjectRecord };
  audio: { key: string; value: SavedAudioBlob; indexes: { byProject: string } };
}

let dbp: Promise<IDBPDatabase<StemForgeDB>> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB<StemForgeDB>('stemforge-v1', 1, {
      upgrade(database) {
        database.createObjectStore('projects', { keyPath: 'meta.id' });
        const audio = database.createObjectStore('audio', { keyPath: 'id' });
        audio.createIndex('byProject', 'projectId');
      },
    });
  }
  return dbp;
}

export async function listProjects(): Promise<SavedProjectMeta[]> {
  const database = await db();
  const all = await database.getAll('projects');
  return all.map((r) => r.meta).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveProjectRecord(
  record: SavedProjectRecord,
  audio: SavedAudioBlob[],
): Promise<void> {
  const database = await db();
  const tx = database.transaction(['projects', 'audio'], 'readwrite');
  await tx.objectStore('projects').put(record);
  const existing = await tx.objectStore('audio').index('byProject').getAllKeys(record.meta.id);
  for (const k of existing) await tx.objectStore('audio').delete(k);
  for (const a of audio) await tx.objectStore('audio').put(a);
  await tx.done;
}

export async function loadProject(id: string): Promise<{ record: SavedProjectRecord; audio: SavedAudioBlob[] } | null> {
  const database = await db();
  const record = await database.get('projects', id);
  if (!record) return null;
  const audio = await database.getAllFromIndex('audio', 'byProject', id);
  return { record, audio };
}

export async function deleteProject(id: string): Promise<void> {
  const database = await db();
  const tx = database.transaction(['projects', 'audio'], 'readwrite');
  await tx.objectStore('projects').delete(id);
  const keys = await tx.objectStore('audio').index('byProject').getAllKeys(id);
  for (const k of keys) await tx.objectStore('audio').delete(k);
  await tx.done;
}

export function audioBufferToPcm(buffer: AudioBuffer): ArrayBuffer {
  const ch = buffer.numberOfChannels;
  const len = buffer.length;
  const out = new Float32Array(len * ch);
  for (let c = 0; c < ch; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i * ch + c] = data[i];
  }
  return out.buffer;
}

export function pcmToAudioBuffer(
  ctx: BaseAudioContext,
  pcm: ArrayBuffer,
  sampleRate: number,
  channels: number,
): AudioBuffer {
  const interleaved = new Float32Array(pcm);
  const frames = Math.floor(interleaved.length / channels);
  const buf = ctx.createBuffer(channels, frames, sampleRate);
  for (let c = 0; c < channels; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < frames; i++) ch[i] = interleaved[i * channels + c];
  }
  return buf;
}
