export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function mixdownMono(L: Float32Array, R: Float32Array | null): Float32Array {
  if (!R) return new Float32Array(L);
  const out = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++) out[i] = 0.5 * (L[i] + R[i]);
  return out;
}

export function computePeaks(mono: Float32Array, buckets = 256): Float32Array {
  const peaks = new Float32Array(buckets);
  const step = Math.max(1, Math.floor(mono.length / buckets));
  for (let b = 0; b < buckets; b++) {
    let mx = 0;
    const start = b * step;
    const end = Math.min(mono.length, start + step);
    for (let i = start; i < end; i++) {
      const a = Math.abs(mono[i]);
      if (a > mx) mx = a;
    }
    peaks[b] = mx;
  }
  return peaks;
}

/** In-place radix-2 FFT (Cooley–Tukey). */
export function fft(re: Float32Array, im: Float32Array): void {
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
    const wlenRe = Math.cos(ang);
    const wlenIm = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wRe = 1;
      let wIm = 0;
      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];
        const vRe = re[i + k + len / 2] * wRe - im[i + k + len / 2] * wIm;
        const vIm = re[i + k + len / 2] * wIm + im[i + k + len / 2] * wRe;
        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;
        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;
        const nextWRe = wRe * wlenRe - wIm * wlenIm;
        wIm = wRe * wlenIm + wIm * wlenRe;
        wRe = nextWRe;
      }
    }
  }
}

export function ifft(re: Float32Array, im: Float32Array): void {
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  fft(re, im);
  for (let i = 0; i < im.length; i++) im[i] = -im[i];
  const inv = 1 / re.length;
  for (let i = 0; i < re.length; i++) {
    re[i] *= inv;
    im[i] *= inv;
  }
}
