// Web Audio API Synthesizer for Offline Ambient Soundscapes
// No network requests or audio assets needed!

class AmbientSynth {
  constructor() {
    this.audioCtx = null;
    this.activeTracks = {}; // stores active sources/nodes per track key
    this.globalVolumeNode = null;
    this.trackVolumes = {
      rain: 0.5,
      binaural: 0.5,
      fireplace: 0.5,
      drone: 0.4
    };
  }

  init() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Setup global volume
      this.globalVolumeNode = this.audioCtx.createGain();
      this.globalVolumeNode.gain.value = 1.0;
      this.globalVolumeNode.connect(this.audioCtx.destination);
    } catch (e) {
      console.error("Failed to initialize Web Audio Context", e);
    }
  }

  // Helper to generate Brown Noise Buffer (Deep rumble for rain/thunder)
  createBrownNoiseBuffer() {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate volume loss
    }
    return buffer;
  }

  // Helper to generate Pink Noise Buffer (Softer static for crackles/fire)
  createPinkNoiseBuffer() {
    const bufferSize = 2 * this.audioCtx.sampleRate;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // Compensate gain
      b6 = white * 0.115926;
    }
    return buffer;
  }

  startRain() {
    this.init();
    if (this.activeTracks.rain) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.createBrownNoiseBuffer();
    source.loop = true;

    // Filter to make it sound like rain (lowpass filter out high harsh frequencies)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

    // Gain node for rain volume control
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(this.trackVolumes.rain, this.audioCtx.currentTime);

    // Connect
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.globalVolumeNode);

    source.start(0);

    // Periodically simulate thunder rumbles
    const thunderTimer = setInterval(() => {
      if (!this.activeTracks.rain) return;
      // Random chance for thunder
      if (Math.random() > 0.7) {
        this.triggerThunder(filter);
      }
    }, 8000);

    this.activeTracks.rain = { source, gainNode, filter, thunderTimer };
  }

  triggerThunder(rainFilter) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime;
    
    // Create heavy sub rumble
    const rumble = this.audioCtx.createOscillator();
    const rumbleGain = this.audioCtx.createGain();
    const rumbleFilter = this.audioCtx.createBiquadFilter();

    rumble.type = 'sawtooth';
    rumble.frequency.setValueAtTime(40, now);
    rumble.frequency.exponentialRampToValueAtTime(10, now + 3);

    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(80, now);

    rumbleGain.gain.setValueAtTime(0, now);
    rumbleGain.gain.linearRampToValueAtTime(0.3, now + 0.5);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 3);

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.globalVolumeNode);

    rumble.start(now);
    rumble.stop(now + 3.1);

    // Modulate the rain filter slightly to make it sound like a downpour increase
    const currentFreq = rainFilter.frequency.value;
    rainFilter.frequency.exponentialRampToValueAtTime(900, now + 0.3);
    rainFilter.frequency.exponentialRampToValueAtTime(currentFreq, now + 2.5);
  }

  startBinaural() {
    this.init();
    if (this.activeTracks.binaural) return;

    // Binaural beats require headphones: Left ear receives 200Hz, Right ear 210Hz
    // Creating a 10Hz differential (Alpha waves for deep focus)
    const leftOsc = this.audioCtx.createOscillator();
    const rightOsc = this.audioCtx.createOscillator();
    
    const leftPanner = this.audioCtx.createStereoPanner();
    const rightPanner = this.audioCtx.createStereoPanner();

    leftPanner.pan.setValueAtTime(-1, this.audioCtx.currentTime); // Hard left
    rightPanner.pan.setValueAtTime(1, this.audioCtx.currentTime); // Hard right

    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(200, this.audioCtx.currentTime); // 200 Hz

    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(210, this.audioCtx.currentTime); // 210 Hz

    // Add a low-frequency hum (carrier frequency)
    const carrierOsc = this.audioCtx.createOscillator();
    carrierOsc.type = 'triangle';
    carrierOsc.frequency.setValueAtTime(100, this.audioCtx.currentTime);
    const carrierGain = this.audioCtx.createGain();
    carrierGain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(this.trackVolumes.binaural * 0.8, this.audioCtx.currentTime);

    // Connections
    leftOsc.connect(leftPanner);
    leftPanner.connect(gainNode);

    rightOsc.connect(rightPanner);
    rightPanner.connect(gainNode);

    carrierOsc.connect(carrierGain);
    carrierGain.connect(gainNode);

    gainNode.connect(this.globalVolumeNode);

    leftOsc.start(0);
    rightOsc.start(0);
    carrierOsc.start(0);

    this.activeTracks.binaural = { 
      source: [leftOsc, rightOsc, carrierOsc], 
      gainNode 
    };
  }

  startFireplace() {
    this.init();
    if (this.activeTracks.fireplace) return;

    // 1. Fire rumble (filtered low brown noise)
    const rumbleSource = this.audioCtx.createBufferSource();
    rumbleSource.buffer = this.createBrownNoiseBuffer();
    rumbleSource.loop = true;
    
    const rumbleFilter = this.audioCtx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(120, this.audioCtx.currentTime);

    const rumbleGain = this.audioCtx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);

    // 2. Crackling sparks (pink noise crackles)
    const sparkSource = this.audioCtx.createBufferSource();
    sparkSource.buffer = this.createPinkNoiseBuffer();
    sparkSource.loop = true;

    const sparkFilter = this.audioCtx.createBiquadFilter();
    sparkFilter.type = 'bandpass';
    sparkFilter.frequency.setValueAtTime(1500, this.audioCtx.currentTime);
    sparkFilter.Q.setValueAtTime(4.0, this.audioCtx.currentTime);

    // Create crackle impulses by modulating spark gain dynamically via a LFO/custom intervals
    const sparkGainNode = this.audioCtx.createGain();
    sparkGainNode.gain.setValueAtTime(0.02, this.audioCtx.currentTime);

    // Dynamic scheduling of random click sound impulses
    const crackleInterval = setInterval(() => {
      if (!this.activeTracks.fireplace) return;
      const now = this.audioCtx.currentTime;
      // Random crackle
      if (Math.random() > 0.3) {
        const clickOsc = this.audioCtx.createOscillator();
        const clickGain = this.audioCtx.createGain();

        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(800 + Math.random() * 1200, now);
        
        clickGain.gain.setValueAtTime(0, now);
        clickGain.gain.linearRampToValueAtTime(0.06 * this.trackVolumes.fireplace, now + 0.002);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        clickOsc.connect(clickGain);
        clickGain.connect(this.globalVolumeNode);
        
        clickOsc.start(now);
        clickOsc.stop(now + 0.04);
      }
    }, 180);

    const masterGainNode = this.audioCtx.createGain();
    masterGainNode.gain.setValueAtTime(this.trackVolumes.fireplace, this.audioCtx.currentTime);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(masterGainNode);

    sparkSource.connect(sparkFilter);
    sparkFilter.connect(sparkGainNode);
    sparkGainNode.connect(masterGainNode);

    masterGainNode.connect(this.globalVolumeNode);

    rumbleSource.start(0);
    sparkSource.start(0);

    this.activeTracks.fireplace = {
      source: [rumbleSource, sparkSource],
      gainNode: masterGainNode,
      crackleInterval
    };
  }

  startDrone() {
    this.init();
    if (this.activeTracks.drone) return;

    // Cosmic Space Drone using detuned sawtooths and low pass sweeps
    const now = this.audioCtx.currentTime;
    const osc1 = this.audioCtx.createOscillator();
    const osc2 = this.audioCtx.createOscillator();
    const osc3 = this.audioCtx.createOscillator();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, now); // A1

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.5, now); // Detuned A2

    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(165.2, now); // E3 fifth

    // Filter sweep (slow LFO modulating lowpass filter cutoff)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);

    // LFO for filter sweep
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.08, now); // Very slow sweep (12 seconds)
    lfoGain.gain.setValueAtTime(80, now); // Modulate frequency by +/- 80Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(this.trackVolumes.drone * 0.7, now);

    // Connections
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.globalVolumeNode);

    lfo.start(now);
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    this.activeTracks.drone = {
      source: [osc1, osc2, osc3, lfo],
      gainNode,
      filter
    };
  }

  // Toggle track playback
  toggleTrack(trackKey) {
    if (this.activeTracks[trackKey]) {
      this.stopTrack(trackKey);
      return false;
    } else {
      if (trackKey === 'rain') this.startRain();
      if (trackKey === 'binaural') this.startBinaural();
      if (trackKey === 'fireplace') this.startFireplace();
      if (trackKey === 'drone') this.startDrone();
      return true;
    }
  }

  stopTrack(trackKey) {
    const track = this.activeTracks[trackKey];
    if (!track) return;

    // Clear timers
    if (track.thunderTimer) clearInterval(track.thunderTimer);
    if (track.crackleInterval) clearInterval(track.crackleInterval);

    // Stop sources
    if (Array.isArray(track.source)) {
      track.source.forEach(src => {
        try { src.stop(); } catch (e) {}
      });
    } else if (track.source) {
      try { track.source.stop(); } catch (e) {}
    }

    delete this.activeTracks[trackKey];
  }

  setVolume(trackKey, volumeValue) {
    this.trackVolumes[trackKey] = parseFloat(volumeValue);
    const track = this.activeTracks[trackKey];
    if (track && track.gainNode) {
      const now = this.audioCtx ? this.audioCtx.currentTime : 0;
      // Adjust factor for binaural/drone volume compensation
      let targetVol = this.trackVolumes[trackKey];
      if (trackKey === 'binaural') targetVol *= 0.8;
      if (trackKey === 'drone') targetVol *= 0.7;
      
      track.gainNode.gain.setTargetAtTime(targetVol, now, 0.1);
    }
  }

  stopAll() {
    Object.keys(this.activeTracks).forEach(key => this.stopTrack(key));
  }
}

const ambientSynthInstance = new AmbientSynth();
export default ambientSynthInstance;
