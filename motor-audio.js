export default class MotorAudio {
  
  constructor(context) {
    this.context = context;
    this.resetVals();
  }

  fill_phasor_power(t, env, state) {
    const phase = (t * env.freq) % 1.0;
    return Math.pow(phase, env.power);
  }

  make_buffer(fill, env) {
    const count = this.context.sampleRate * 2;
    const buffer = this.context.createBuffer(1, count, this.context.sampleRate);

    const data = buffer.getChannelData(0 /* channel */);
    const state = {};
    const prev_random = 0.0;
    for (let i = 0; i < count; i++) {
      const t = i / this.context.sampleRate;
      data[i] = fill(t, env, state);
    }

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    return source;
  }

  fill_hihat(t, env, state) {
    let prev_random = state.prev_random || 0;
    let next_random = Math.random() * 2 - 1;
    let curr = (3 * next_random - prev_random) / 2;
    prev_random = next_random;
    return curr;
  }

  fill_one(t, env, state) {
    return 1.0;
  }

  rotor() {
    this.noise = this.make_buffer(this.fill_hihat, {});
    this.noise.loop = true;

    const filter1 = this.context.createBiquadFilter();

    filter1.type = "bandpass";
    filter1.frequency.value = 4000;
    filter1.Q.value = 1;
    this.noise.connect(filter1);

    this.gain1 = this.context.createGain();
    this.gain1.gain.value = this.brush_level;
    filter1.connect(this.gain1);

    this.constant = this.make_buffer(this.fill_one, {});
    this.constant.loop = true;
    this.gain2 = this.context.createGain();
    this.gain2.gain.value = this.rotor_level;
    this.constant.connect(this.gain2);

    this.gain3 = this.context.createGain();
    this.gain3.gain.value = 0;
    this.gain1.connect(this.gain3);
    this.gain2.connect(this.gain3);

    const freq = this.motor_drive;
    this.drive = this.make_buffer(this.fill_phasor_power, {
      power: 4,
      freq: freq,
    });
    this.drive.loop = true;
    this.drive.connect(this.gain3.gain);

    this.gain3.connect(this.context.destination);
  }

  restart() {
    this.reset();
    this.rotor();
    this.noise.start();
    this.drive.start();
    this.constant.start();
  }

  rate() {
    if (this.noise) 
      this.noise.playbackRate.value = this.rate_level;
    if (this.drive) 
      this.drive.playbackRate.value = this.rate_level;
    if (this.constant) 
      this.drive.playbackRate.value = this.rate_level;
  }

  gain() {
    if (this.gain1) this.gain1.gain.value = this.gain_level * 0.5;
    if (this.gain2) this.gain2.gain.value = this.gain_level * 0.2;
  }

  stop() {
    this.isStopped = true;
    if (this.noise) this.noise.stop();
    if (this.drive) this.drive.stop();
    if (this.constant) this.constant.stop();
  }

  reset() {
    this.stop();
    this.resetVals();
  }

  resetVals() {
    this.motor_drive = 20;
    this.brush_level = 0.05;
    this.rotor_level = 0.02;
    this.rate_level = 1;
    this.gain_level = 0.01;
    this.isStopped = false;
  }
}