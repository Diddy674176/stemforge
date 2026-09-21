/**
 * In-browser 4-stem separator (HPSS + mid/side center mask).
 * Not Demucs — best-effort spectral split for Pages.
 */

const FFT = 2048;
const HOP = 512;

function hann(n: number): Float32Array {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
}

function fft(re: Float32Array, im: Float32Array) {
  const n = re.length;
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr0 = Math.cos(ang), wi0 = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wr = 1, wi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * wr - im[i + k + len / 2] * wi;
        const vi = re[i + k + len / 2] * wi + im[i + k + len / 2] * wr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const nr = wr * wr0 - wi * wi0; wi = wr * wi0 + wi * wr0; wr = nr;
      }
    }
  }
}

function ifft(re: Float32Array, im: Float32Array) {
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  const inv = 1 / re.length;
  for (let i = 0; i < re.length; i++) { re[i] *= inv; im[i] *= inv; }
}

function stft(x: Float32Array) {
  const win = hann(FFT);
  const nFrames = Math.max(1, Math.floor((x.length - FFT) / HOP) + 1);
  const bins = FFT / 2 + 1;
  const mag = new Float32Array(nFrames * bins);
  const phase = new Float32Array(nFrames * bins);
  const re = new Float32Array(FFT);
  const im = new Float32Array(FFT);
  for (let f = 0; f < nFrames; f++) {
    const off = f * HOP;
    re.fill(0); im.fill(0);
    for (let i = 0; i < FFT; i++) re[i] = (x[off + i] ?? 0) * win[i];
    fft(re, im);
    for (let k = 0; k < bins; k++) {
      const idx = f * bins + k;
      mag[idx] = Math.hypot(re[k], im[k]);
      phase[idx] = Math.atan2(im[k], re[k]);
    }
  }
  return { mag, phase, nFrames, bins };
}

function istft(mag: Float32Array, phase: Float32Array, nFrames: number, bins: number, outLen: number) {
  const win = hann(FFT);
  const out = new Float32Array(outLen);
  const norm = new Float32Array(outLen);
  const re = new Float32Array(FFT);
  const im = new Float32Array(FFT);
  for (let f = 0; f < nFrames; f++) {
    re.fill(0); im.fill(0);
    for (let k = 0; k < bins; k++) {
      const idx = f * bins + k;
      const m = mag[idx], p = phase[idx];
      re[k] = m * Math.cos(p); im[k] = m * Math.sin(p);
      if (k > 0 && k < bins - 1) {
        re[FFT - k] = re[k]; im[FFT - k] = -im[k];
      }
    }
    ifft(re, im);
    const off = f * HOP;
    for (let i = 0; i < FFT; i++) {
      const t = off + i;
      if (t >= outLen) break;
      out[t] += re[i] * win[i];
      norm[t] += win[i] * win[i];
    }
  }
  for (let i = 0; i < outLen; i++) if (norm[i] > 1e-8) out[i] /= norm[i];
  return out;
}

function median3(a: number, b: number, c: number) {
  return a > b ? (b > c ? b : a > c ? c : a) : a > c ? a : b > c ? c : b;
}

function hpss(mag: Float32Array, nFrames: number, bins: number) {
  const h = new Float32Array(mag.length);
  const p = new Float32Array(mag.length);
  for (let f = 0; f < nFrames; f++) {
    for (let k = 0; k < bins; k++) {
      const idx = f * bins + k;
      const m = mag[idx];
      const hm = median3(
        mag[Math.max(0, f - 1) * bins + k],
        m,
        mag[Math.min(nFrames - 1, f + 1) * bins + k],
      );
      const pm = median3(
        mag[f * bins + Math.max(0, k - 1)],
        m,
        mag[f * bins + Math.min(bins - 1, k + 1)],
      );
      const hs = hm * hm, ps = pm * pm, s = hs + ps + 1e-12;
      h[idx] = m * (hs / s);
      p[idx] = m * (ps / s);
    }
  }
  return { h, p };
}

function applyMask(
  magL: Float32Array, magR: Float32Array,
  phaseL: Float32Array, phaseR: Float32Array,
  mask: Float32Array, n: number,
) {
  const oL = new Float32Array(magL.length);
  const oR = new Float32Array(magR.length);
  for (let i = 0; i < magL.length; i++) {
    const m = mask[i];
    oL[i] = magL[i] * m; oR[i] = magR[i] * m;
  }
  return {
    L: istft(oL, phaseL, Math.floor(magL.length / (FFT / 2 + 1)), FFT / 2 + 1, n),
    R: istft(oR, phaseR, Math.floor(magR.length / (FFT / 2 + 1)), FFT / 2 + 1, n),
  };
}

function peaks(x: Float32Array, buckets = 256) {
  const p = new Float32Array(buckets);
  const step = Math.max(1, Math.floor(x.length / buckets));
  for (let b = 0; b < buckets; b++) {
    let mx = 0;
    for (let i = b * step; i < Math.min(x.length, (b + 1) * step); i++) {
      const a = Math.abs(x[i]); if (a > mx) mx = a;
    }
    p[b] = mx;
  }
  return p;
}

function pack(L: Float32Array, R: Float32Array) {
  const mono = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++) mono[i] = 0.5 * (L[i] + R[i]);
  return { left: L, right: R, peaks: peaks(mono) };
}

function peakNorm(chs: Float32Array[], target = 0.92) {
  let mx = 1e-9;
  for (const c of chs) for (let i = 0; i < c.length; i++) mx = Math.max(mx, Math.abs(c[i]));
  const g = target / mx;
  for (const c of chs) for (let i = 0; i < c.length; i++) c[i] *= g;
}

const post = (msg: unknown, transfer?: Transferable[]) => {
  (self as unknown as Worker).postMessage(msg, transfer as Transferable[]);
};

self.onmessage = (ev: MessageEvent) => {
  const { type, jobId, sampleRate, left, right } = ev.data;
  if (type !== 'separate') return;
  try {
    const n = left.length as number;
    post({ type: 'progress', jobId, progress: 0.05, message: 'STFT…' });
    const stL = stft(left as Float32Array);
    const stR = stft(right as Float32Array);
    post({ type: 'progress', jobId, progress: 0.35, message: 'HPSS…' });
    const hpL = hpss(stL.mag, stL.nFrames, stL.bins);
    const hpR = hpss(stR.mag, stR.nFrames, stR.bins);

    const bins = stL.bins, frames = stL.nFrames;
    const vMask = new Float32Array(frames * bins);
    const dMask = new Float32Array(frames * bins);
    const bMask = new Float32Array(frames * bins);
    const oMask = new Float32Array(frames * bins);
    const bassBin = Math.floor((180 * FFT) / sampleRate);

    for (let f = 0; f < frames; f++) {
      for (let k = 0; k < bins; k++) {
        const i = f * bins + k;
        const mid = 0.5 * (stL.mag[i] + stR.mag[i]);
        const side = 0.5 * Math.abs(stL.mag[i] - stR.mag[i]);
        const center = mid / (mid + side + 1e-9);
        const harm = 0.5 * (hpL.h[i] + hpR.h[i]);
        const perc = 0.5 * (hpL.p[i] + hpR.p[i]);
        const tot = harm + perc + 1e-9;
        // Emphasize center for vocals; reduce center bleed into drums/other
        let v = Math.min(1, center * 1.45) * (harm / tot);
        let d = perc / tot * (1 - center * 0.55);
        let b = k < bassBin ? (harm / tot) * 0.85 : 0;
        let o = Math.max(0, 1 - v - d - b);
        const s = v + d + b + o + 1e-12;
        vMask[i] = v / s; dMask[i] = d / s; bMask[i] = b / s; oMask[i] = o / s;
      }
    }

    post({ type: 'progress', jobId, progress: 0.7, message: 'Reconstructing…' });
    const vocals = applyMask(stL.mag, stR.mag, stL.phase, stR.phase, vMask, n);
    const drums = applyMask(stL.mag, stR.mag, stL.phase, stR.phase, dMask, n);
    const bass = applyMask(stL.mag, stR.mag, stL.phase, stR.phase, bMask, n);
    const other = applyMask(stL.mag, stR.mag, stL.phase, stR.phase, oMask, n);
    const instL = new Float32Array(n), instR = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      // Soft duck residual center vocals from the instrumental bed
      instL[i] = drums.L[i] + bass.L[i] + other.L[i] - vocals.L[i] * 0.25;
      instR[i] = drums.R[i] + bass.R[i] + other.R[i] - vocals.R[i] * 0.25;
    }
    peakNorm([vocals.L, vocals.R]); peakNorm([drums.L, drums.R]);
    peakNorm([bass.L, bass.R]); peakNorm([other.L, other.R]); peakNorm([instL, instR]);

    const v = pack(vocals.L, vocals.R);
    const d = pack(drums.L, drums.R);
    const b = pack(bass.L, bass.R);
    const o = pack(other.L, other.R);
    const ins = pack(instL, instR);
    const transfer: Transferable[] = [
      v.left.buffer, v.right.buffer, v.peaks.buffer,
      d.left.buffer, d.right.buffer, d.peaks.buffer,
      b.left.buffer, b.right.buffer, b.peaks.buffer,
      o.left.buffer, o.right.buffer, o.peaks.buffer,
      ins.left.buffer, ins.right.buffer, ins.peaks.buffer,
    ];
    post({ type: 'done', jobId, progress: 1, vocals: v, drums: d, bass: b, other: o, instrumental: ins }, transfer);
  } catch (err) {
    post({ type: 'error', jobId, message: err instanceof Error ? err.message : String(err) });
  }
};
