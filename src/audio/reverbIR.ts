/** Simple noise-burst impulse response for convolver reverb. */
export function createReverbIR(
  ctx: BaseAudioContext,
  duration = 1.8,
  decay = 2.2,
): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}
