# StemForge

**AI multi-track remix & stem studio** in the browser. Import local audio you own, separate stems, detect BPM/key/structure, auto-sync, arrange on a timeline, mix/FX, master, and export — all privacy-local (IndexedDB).

**Live:** https://diddy674176.github.io/stemforge/

## Legal / safety

- Only process files **you** import and have rights to remix.
- No DRM bypass, no music scraping/downloads, no unauthorized artist voice cloning.
- Audio stays in your browser.

## Features (MVP)

1. Multi-file import (mp3/wav/flac/aac/m4a/ogg via Web Audio)
2. In-browser **4-stem separation** (vocals / drums / bass / other + instrumental & melody alias) via HPSS + stereo center masking in a Web Worker
3. Per-stem solo/mute/volume/pan/EQ/FX/export
4. BPM detection + project BPM + SoundTouch time-stretch
5. Key detection + Auto Harmonic Match pitch shift
6. Multitrack timeline (drag, split, fades, snap, waveforms, zoom)
7. Structure markers (heuristic)
8. Beginner Auto Sync
9. Smart Remix proposals with compatibility scores
10. Mixer + FX (EQ, compressor, reverb, delay, filter, lo-fi, half-time)
11. Mastering presets (balanced/loud/warm/streaming/…)
12. Export mix WAV/MP3 + stem export; project save in IndexedDB
13. Live preview; rights disclaimer banner

## Stem separation approach

Best-effort **spectral** separator (not full Demucs):

- STFT → HPSS (harmonic/percussive median masks)
- Stereo mid/side center mask for vocals
- Low-band harmonic energy for bass
- Residual → other; drums+bass+other → instrumental

Quality limits: bleed/artifacts possible vs offline Demucs; long files truncated to ~6 min for Pages performance. Still real audio processing, not fake UI.

## Develop

```bash
npm install
npm run dev
npm run build
```

`base` is `/stemforge/` for GitHub Pages.

## How to test

1. Open the live URL (or `npm run preview` after build).
2. Accept the rights banner.
3. Import 1–2 songs you own.
4. Wait for analyze + stem separation.
5. Use **Beginner → AUTO SYNC** or add stems with **+**, or **Smart Remix**.
6. Press Play, tweak mixer/FX/master, Export WAV/MP3, Save project.
