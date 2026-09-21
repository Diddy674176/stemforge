/** Shared StemForge domain types */

export type StemKind =
  | 'vocals'
  | 'drums'
  | 'bass'
  | 'other'
  | 'instrumental'
  | 'melody';

export type StructureLabel =
  | 'intro'
  | 'verse'
  | 'pre-chorus'
  | 'chorus'
  | 'drop'
  | 'breakdown'
  | 'outro';

export type MasterPresetId =
  | 'none'
  | 'balanced'
  | 'loud'
  | 'warm'
  | 'clean'
  | 'bass-heavy'
  | 'bright'
  | 'streaming';

export interface EqBand {
  freq: number;
  gain: number;
  q: number;
  type: BiquadFilterType;
}

export interface StemFx {
  eq: EqBand[];
  highPass: number;
  lowPass: number;
  filter: number;
  reverb: number;
  delay: number;
  delayFeedback: number;
  lofi: number;
  compressor: {
    enabled: boolean;
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
  };
  halfTime: boolean;
}

export interface StemTrack {
  id: string;
  sourceId: string;
  kind: StemKind;
  name: string;
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
  buffer: AudioBuffer | null;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  gainDb: number;
  pitchSemitones: number;
  tempoRatio: number;
  fx: StemFx;
  color: string;
}

export interface StructureMarker {
  id: string;
  label: StructureLabel;
  startSec: number;
  endSec: number;
}

export interface AudioSource {
  id: string;
  name: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  bpm: number | null;
  key: string | null;
  structure: StructureMarker[];
  peaks: Float32Array;
  buffer: AudioBuffer | null;
  stems: StemTrack[];
  separating: boolean;
  analyzeProgress: number;
  status: string;
}

export interface TimelineClip {
  id: string;
  stemId: string;
  sourceId: string;
  trackIndex: number;
  startSec: number;
  offsetSec: number;
  durationSec: number;
  fadeInSec: number;
  fadeOutSec: number;
  muted: boolean;
  gain: number;
  pitchSemitones: number;
  rate: number;
}

export interface MasterSettings {
  preset: MasterPresetId;
  gainDb: number;
  compressor: boolean;
  limiter: boolean;
  warmth: number;
  brightness: number;
  stereoWidth: number;
}

export interface ProjectState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  bpm: number;
  key: string;
  autoHarmonicMatch: boolean;
  snap: 'off' | 'beat' | 'bar';
  zoom: number;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  metronome: boolean;
  beginnerMode: boolean;
  master: MasterSettings;
  sources: AudioSource[];
  clips: TimelineClip[];
  selectedStemId: string | null;
  selectedClipId: string | null;
  playheadSec: number;
}

export interface RemixProposal {
  id: string;
  title: string;
  score: number;
  notes: string[];
  assignments: { role: StemKind; sourceId: string; stemId: string }[];
}

export const STEM_COLORS: Record<StemKind, string> = {
  vocals: '#ff6b8a',
  drums: '#fbbf24',
  bass: '#7c9cff',
  other: '#5eead4',
  instrumental: '#a78bfa',
  melody: '#34d399',
};

export function defaultStemFx(): StemFx {
  return {
    eq: [
      { freq: 80, gain: 0, q: 0.7, type: 'lowshelf' },
      { freq: 250, gain: 0, q: 1, type: 'peaking' },
      { freq: 1000, gain: 0, q: 1, type: 'peaking' },
      { freq: 4000, gain: 0, q: 1, type: 'peaking' },
      { freq: 10000, gain: 0, q: 0.7, type: 'highshelf' },
    ],
    highPass: 20,
    lowPass: 20000,
    filter: 20000,
    reverb: 0,
    delay: 0,
    delayFeedback: 0.25,
    lofi: 0,
    compressor: { enabled: false, threshold: -18, ratio: 3, attack: 0.01, release: 0.15 },
    halfTime: false,
  };
}

export function defaultMaster(): MasterSettings {
  return {
    preset: 'none',
    gainDb: 0,
    compressor: false,
    limiter: true,
    warmth: 0,
    brightness: 0,
    stereoWidth: 1,
  };
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
