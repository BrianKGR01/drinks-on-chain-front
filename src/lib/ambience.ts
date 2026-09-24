/**
 * Synthesised ambience for the valley: a slow wind of filtered brown noise,
 * a warm three-note drone, and two tiny UI cues. No audio files are needed,
 * so nothing loads until the visitor turns sound on after a gesture.
 */
export class Ambience {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private live: Array<AudioScheduledSourceNode> = [];
  private running = false;

  get isRunning() {
    return this.running;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  async start() {
    const ctx = this.ensureContext();
    if (!ctx || this.running) return;
    this.running = true;
    try {
      await ctx.resume();
    } catch {
      /* autoplay policy: will resume on the next gesture */
    }
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.55, now + 4);
    master.connect(ctx.destination);
    this.master = master;

    // Wind: looping brown noise through a breathing low-pass filter.
    const seconds = 4;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 320;
    lowpass.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.28;
    const breath = ctx.createOscillator();
    breath.frequency.value = 0.06;
    const breathDepth = ctx.createGain();
    breathDepth.gain.value = 180;
    breath.connect(breathDepth).connect(lowpass.frequency);
    noise.connect(lowpass).connect(windGain).connect(master);
    noise.start();
    breath.start();
    this.live.push(noise, breath);

    // Drone: D2 · A2 · D3 with slight detune, tucked under a low-pass.
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 520;
    droneFilter.connect(master);
    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 0.11;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.012;
    tremolo.start();
    this.live.push(tremolo);
    for (const [freq, level, detune] of [
      [73.42, 0.05, -4],
      [110.0, 0.035, 3],
      [146.83, 0.028, -2],
    ] as const) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.detune.value = detune;
      const g = ctx.createGain();
      g.gain.value = level;
      tremolo.connect(tremoloDepth).connect(g.gain);
      osc.connect(g).connect(droneFilter);
      osc.start();
      this.live.push(osc);
    }
  }

  stop() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || !this.running) return;
    this.running = false;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    const nodes = this.live;
    this.live = [];
    this.master = null;
    window.setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
        n.disconnect();
      }
      master.disconnect();
    }, 1400);
  }

  /** Short bell-like cue when a parcel is framed. */
  pluck(freq = 880) {
    this.cue(freq, 0.07, 0.9);
  }

  /** Barely audible tick when the pointer enters a parcel. */
  tick() {
    this.cue(1320, 0.018, 0.09);
  }

  private cue(freq: number, level: number, decay: number) {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || !this.running) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.985, now + decay);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(level, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
    osc.connect(g).connect(master);
    osc.start(now);
    osc.stop(now + decay + 0.05);
  }
}

export const ambience = new Ambience();
