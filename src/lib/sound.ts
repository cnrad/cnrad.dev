// Low-latency one-shot sound playback via the Web Audio API.
// Decodes the source once and replays the buffer on demand, which avoids the
// latency and overlap limitations of a plain <audio> element.

let ctx: AudioContext | null = null;
const buffers = new Map<string, AudioBuffer | Promise<AudioBuffer>>();

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

async function load(context: AudioContext, src: string): Promise<AudioBuffer> {
  const res = await fetch(src);
  const data = await res.arrayBuffer();
  const buffer = await context.decodeAudioData(data);
  buffers.set(src, buffer);
  return buffer;
}

/** Warm the cache so the first play is instant. Safe to call eagerly. */
export function preloadSound(src: string) {
  const context = getContext();
  if (!context || buffers.has(src)) return;
  buffers.set(src, load(context, src));
}

/** Play a sound. Must run inside a user gesture the first time to unlock audio. */
export function playSound(src: string, volume = 0.1) {
  const context = getContext();
  if (!context) return;
  if (context.state === "suspended") context.resume();

  const play = (buffer: AudioBuffer) => {
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(context.destination);
    source.start();
  };

  const cached = buffers.get(src);
  if (cached instanceof AudioBuffer) {
    play(cached);
  } else if (cached) {
    cached.then(play).catch(() => {});
  } else {
    load(context, src)
      .then(play)
      .catch(() => {});
  }
}
