// Web Audio API helper to generate soothing sounds without relying on external static MP3s (preventing resource 404s)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a resonant Tibetan Singing Bowl / Temple Chime sound
 * Uses low frequency FM synthesis + long decay for serene depth.
 */
export function playSingingBowl(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Carrier Oscillator - Deep fundamental tone
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(220, now); // E3 or A3-ish warm note

    // Sub oscillator for deep grounding resonance
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(110, now); // Sub-bass octave

    // Overtone oscillator for metal sheen shimmer
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(440, now); // First overtone
    const osc4 = ctx.createOscillator();
    osc4.type = "sine";
    osc4.frequency.setValueAtTime(659.25, now); // E5 major third/fifth sheen

    // Gain nodes for volume/damping envelopes
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.4, now + 0.1); // Attack
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5); // 4.5 seconds serene decay

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.15, now);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5); // Overtone decays faster

    // Lowpass filter for smooth warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(1, now);

    // Connections
    osc1.connect(masterGain);
    osc2.connect(masterGain);
    
    osc3.connect(overtoneGain);
    osc4.connect(overtoneGain);
    overtoneGain.connect(masterGain);

    masterGain.connect(filter);
    filter.connect(ctx.destination);

    // Start & Stop
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc4.start(now);

    osc1.stop(now + 5);
    osc2.stop(now + 5);
    osc3.stop(now + 5);
    osc4.stop(now + 5);
  } catch (err) {
    console.warn("AudioContext block or not supported yet:", err);
  }
}

/**
 * Play a professional acoustical Wooden Fish (木鱼) hollow block knock
 */
export function playWoodenFish(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Fast-pitch-swept sine to simulate wood block knock
    const osc = ctx.createOscillator();
    osc.type = "triangle"; // Triangle gives a woodier, warmer response than sine
    
    // Quick pitch sweep starting high and falling down
    osc.frequency.setValueAtTime(850, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.04);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25); // Crisp fast decay

    // Bandpass filter to isolates woody mid frequencies (around 450Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(440, now);
    bandpass.Q.setValueAtTime(2, now); // Gentle resonance peak

    osc.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (err) {
    console.warn("AudioContext block or not supported yet:", err);
  }
}
