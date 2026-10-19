// All sounds are synthesized with WebAudio: no audio files to download on a phone connection.

export interface Sound {
  // Browsers only allow audio after a user gesture; call this from one.
  unlock: () => void;
  kick: (power: number) => void;
  net: () => void;
  thud: () => void;
  cheer: () => void;
  groan: () => void;
}

const crowdLevel = 0.05;

export function createSound(): Sound {
  let context: AudioContext | null = null;
  let crowd: GainNode | null = null;
  let noise: AudioBuffer | null = null;

  const unlock = (): void => {
    if (context) {
      void context.resume();
      return;
    }
    context = new AudioContext();
    noise = makeNoise(context);
    crowd = startCrowd(context, noise);
  };

  const play = (build: (audio: AudioContext, noiseBuffer: AudioBuffer) => void): void => {
    if (context && noise) build(context, noise);
  };

  return {
    unlock,
    kick: (power) => play((audio, buffer) => playKick(audio, buffer, power)),
    net: () =>
      play((audio, buffer) =>
        playBurst(audio, buffer, { frequency: 2600, duration: 0.45, level: 0.35 }),
      ),
    thud: () =>
      play((audio, buffer) =>
        playBurst(audio, buffer, { frequency: 220, duration: 0.18, level: 0.6 }),
      ),
    cheer: () => play((audio) => swell(audio, crowd, 0.5, 2.2)),
    groan: () => play((audio) => swell(audio, crowd, 0.18, 1.2)),
  };
}

function makeNoise(audio: AudioContext): AudioBuffer {
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
  const samples = buffer.getChannelData(0);
  // Brown noise: a running sum of white noise, which sounds like a distant crowd rather than hiss.
  let last = 0;
  for (let i = 0; i < samples.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    samples[i] = last * 3.5;
  }
  return buffer;
}

function startCrowd(audio: AudioContext, noise: AudioBuffer): GainNode {
  const source = audio.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 700;
  filter.Q.value = 0.6;
  const gain = audio.createGain();
  gain.gain.value = crowdLevel;
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start();
  return gain;
}

function swell(audio: AudioContext, crowd: GainNode | null, peak: number, seconds: number): void {
  if (!crowd) return;
  const now = audio.currentTime;
  crowd.gain.cancelScheduledValues(now);
  crowd.gain.setValueAtTime(crowd.gain.value, now);
  crowd.gain.linearRampToValueAtTime(peak, now + 0.15);
  crowd.gain.exponentialRampToValueAtTime(crowdLevel, now + seconds);
}

function playKick(audio: AudioContext, noise: AudioBuffer, power: number): void {
  const now = audio.currentTime;
  const thump = audio.createOscillator();
  thump.frequency.setValueAtTime(160, now);
  thump.frequency.exponentialRampToValueAtTime(45, now + 0.12);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.4 + power * 0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  thump.connect(gain).connect(audio.destination);
  thump.start(now);
  thump.stop(now + 0.2);
  playBurst(audio, noise, { frequency: 1800, duration: 0.05, level: 0.3 });
}

interface Burst {
  frequency: number;
  duration: number;
  level: number;
}

function playBurst(audio: AudioContext, noise: AudioBuffer, burst: Burst): void {
  const now = audio.currentTime;
  const source = audio.createBufferSource();
  source.buffer = noise;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = burst.frequency;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(burst.level, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + burst.duration);
  source.connect(filter).connect(gain).connect(audio.destination);
  source.start(now, Math.random());
  source.stop(now + burst.duration + 0.05);
}
