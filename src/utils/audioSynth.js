// ─── Web Audio Synth + Analyser ──────────────────────────────────────────────
let audioCtx = null
let masterGain = null
export let analyser = null
const activeSources = []

export function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = audioCtx.createGain()
    masterGain.gain.value = 1
    analyser = audioCtx.createAnalyser()
    analyser.fftSize = 64
    masterGain.connect(analyser)
    analyser.connect(audioCtx.destination)
  }
  return audioCtx
}

export function stopAll() {
  activeSources.forEach((node) => {
    try {
      if (typeof node.stop === 'function') node.stop()
    } catch { /* empty */ }
    try { node.disconnect() } catch { /* empty */ }
  })
  activeSources.length = 0
}

export function playMood(mood) {
  const ctx = getCtx()
  if (ctx.state === 'suspended') ctx.resume()
  stopAll()

  const normalizedMood = 
    mood === 'joy' || mood === 'relaxed' ? 'calm' :
    mood === 'melancholy' ? 'friction' :
    mood === 'anger' ? 'breach' : (mood || 'calm')

  if (normalizedMood === 'calm') {
    ;[110, 220, 330].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(i === 0 ? 0.06 : 0.025, ctx.currentTime + 1.5)
      osc.connect(g)
      g.connect(masterGain)
      osc.start()
      activeSources.push(osc, g)
    })
  } else if (mood === 'friction') {
    const bufLen = ctx.sampleRate * 3
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800
    filter.Q.value = 0.5
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1)
    src.connect(filter)
    filter.connect(g)
    g.connect(masterGain)
    src.start()
    activeSources.push(src, g)

    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = 220
    og.gain.value = 0.015
    osc.connect(og)
    og.connect(masterGain)
    osc.start()
    activeSources.push(osc, og)
  } else if (mood === 'breach') {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = 55

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 6

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.03

    const g = ctx.createGain()
    g.gain.setValueAtTime(0, ctx.currentTime)
    g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.6)

    lfo.connect(lfoGain)
    lfoGain.connect(g.gain)
    osc.connect(g)
    g.connect(masterGain)
    lfo.start()
    osc.start()
    activeSources.push(osc, lfo, lfoGain, g)

    const osc2 = ctx.createOscillator()
    osc2.type = 'sawtooth'
    osc2.frequency.value = 233
    const g2 = ctx.createGain()
    g2.gain.value = 0.02
    osc2.connect(g2)
    g2.connect(masterGain)
    osc2.start()
    activeSources.push(osc2, g2)
  }
}

export function fadeOutAll() {
  if (!masterGain || !audioCtx) return
  masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.3)
  setTimeout(() => { stopAll(); if (masterGain) masterGain.gain.value = 1 }, 1200)
}

// Mechanical keyboard click SFX synthesis
export function playKeyClick() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    // Randomized high-frequency spike for mechanical click sound
    osc.frequency.setValueAtTime(800 + Math.random() * 1200, now)
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04)

    filter.type = 'bandpass'
    filter.frequency.value = 1000
    filter.Q.value = 2.0

    gain.gain.setValueAtTime(0.015 + Math.random() * 0.01, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {
    // Ignore audio failures
  }
}

// Physics button impact haptic sound synthesis
export function playPhysicsImpact(level = 'medium') {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    if (level === 'subtle') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.06)
      gain.gain.setValueAtTime(0.025, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
    } else if (level === 'heavy' || level === 'critical') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.16)
      gain.gain.setValueAtTime(0.08, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)
      filter.type = 'lowpass'
      filter.frequency.value = 400
    } else {
      // medium default
      osc.type = 'sine'
      osc.frequency.setValueAtTime(560, now)
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.09)
      gain.gain.setValueAtTime(0.045, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09)
    }

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {
    // Ignore audio failures
  }
}

// Spring elastic pop/release sound
export function playSpringRelease() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05)
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.1)

    gain.gain.setValueAtTime(0.02, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.12)
  } catch (e) {
    // Ignore audio failures
  }
}

// Soap bubble burst / pop SFX
export function playBubblePop() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(900 + Math.random() * 400, now)
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04)

    gain.gain.setValueAtTime(0.025, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {
    // Ignore audio failures
  }
}

// Water droplet plop / ripple SFX
export function playWaterDrop() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600 + Math.random() * 300, now)
    osc.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 200, now + 0.06)

    gain.gain.setValueAtTime(0.03, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.09)
  } catch (e) {
    // Ignore audio failures
  }
}

// Play custom synthesizer musical tone / UI acoustic feedback
export function playSynthTone(freq = 440, type = 'sine', duration = 0.2, volume = 0.03) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, now)

    gain.gain.setValueAtTime(volume, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + duration + 0.02)
  } catch (e) {
    // Ignore audio failures
  }
}

// ─── Burn Mode Synthesized Sound Effects ──────────────────────────────────────

// Fire ignition whoosh SFX
export function playFireIgniteSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // White noise whoosh
    const bufferSize = Math.floor(ctx.sampleRate * 1.2)
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const output = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1
    }

    const whiteNoise = ctx.createBufferSource()
    whiteNoise.buffer = noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, now)
    filter.frequency.exponentialRampToValueAtTime(1400, now + 0.3)
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.1)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.08, now + 0.25)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    whiteNoise.connect(filter)
    filter.connect(noiseGain)
    noiseGain.connect(masterGain)

    whiteNoise.start(now)
    whiteNoise.stop(now + 1.2)

    // Sub rumble bass
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'triangle'
    subOsc.frequency.setValueAtTime(80, now)
    subOsc.frequency.exponentialRampToValueAtTime(40, now + 0.8)

    subGain.gain.setValueAtTime(0.06, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)

    subOsc.connect(subGain)
    subGain.connect(masterGain)

    subOsc.start(now)
    subOsc.stop(now + 0.9)
  } catch (e) {
    // Ignore audio failures
  }
}

// Crackling fire embers SFX (continuous or burst)
export function playFireCrackleSound(burstCount = 6) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    for (let i = 0; i < burstCount; i++) {
      const delay = Math.random() * 0.5
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(600 + Math.random() * 1800, now + delay)

      gain.gain.setValueAtTime(0.03 + Math.random() * 0.03, now + delay)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.02 + Math.random() * 0.03)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + delay)
      osc.stop(now + delay + 0.05)
    }
  } catch (e) {
    // Ignore audio failures
  }
}

// Ash wind dissolve & Catharsis healing bell SFX
export function playCatharsisChime() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Solfeggio 528 Hz Love/Healing Harmonic Frequency Chord
    const freqs = [264, 528, 792, 1056]
    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.08)

      gain.gain.setValueAtTime(0.001, now + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.04 / (index + 1), now + index * 0.08 + 0.1)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + index * 0.08)
      osc.stop(now + 3.5)
    })
  } catch (e) {
    // Ignore audio failures
  }
}

// ─── Time Capsule Synthesized Sound Effects ────────────────────────────────────

// Chrono Stasis Lock Sound (Temporal freeze & laser seal)
export function playChronoLockSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Descending stasis sweep
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.45)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2400, now)
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.45)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.52)

    // Crystal lock chime
    const crystal = ctx.createOscillator()
    const crystalGain = ctx.createGain()
    crystal.type = 'sine'
    crystal.frequency.setValueAtTime(1760, now + 0.15)
    crystalGain.gain.setValueAtTime(0.03, now + 0.15)
    crystalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)

    crystal.connect(crystalGain)
    crystalGain.connect(masterGain)

    crystal.start(now + 0.15)
    crystal.stop(now + 0.82)
  } catch (e) {
    // Ignore audio failures
  }
}

// Chrono Unlock Sound (Luminous temporal revelation arpeggio)
export function playChronoUnlockSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Futuristic uplifting arpeggio: C5, E5, G5, B5, D6
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.07)

      gain.gain.setValueAtTime(0.001, now + idx * 0.07)
      gain.gain.exponentialRampToValueAtTime(0.035, now + idx * 0.07 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.9)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + idx * 0.07)
      osc.stop(now + idx * 0.07 + 0.95)
    })
  } catch (e) {
    // Ignore audio failures
  }
}

// Story Jump Sound (Quantum temporal transit pulse & resonant bass drop)
export function playStoryJumpSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Quantum phase sweep: rapid pitch rise then sub-bass resonance
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.45)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(4000, now)
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.45)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.65)

    // Sparkle harmonic bell
    const bell = ctx.createOscillator()
    const bellGain = ctx.createGain()
    bell.type = 'sine'
    bell.frequency.setValueAtTime(1760, now + 0.1)
    bellGain.gain.setValueAtTime(0.03, now + 0.1)
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)

    bell.connect(bellGain)
    bellGain.connect(masterGain)
    bell.start(now + 0.1)
    bell.stop(now + 0.72)
  } catch (e) {
    // Ignore audio failures
  }
}

// Quest Complete Sound (Celestial triumphant chord fanfare)
export function playQuestCompleteSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Radiant C Major 9th Arpeggio: C5, E5, G5, B5, D6, G6
    const chord = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98]
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const delay = i * 0.055

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + delay)

      gain.gain.setValueAtTime(0.001, now + delay)
      gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + delay)
      osc.stop(now + delay + 1.25)
    })
  } catch (e) {
    // Ignore audio failures
  }
}

// Badge Unlock Sound (Holographic resonance chord burst)
export function playBadgeUnlockSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Holographic harmonic cascade
    const frequencies = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const offset = idx * 0.065

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + offset)
      osc.frequency.linearRampToValueAtTime(freq * 1.01, now + offset + 0.4)

      gain.gain.setValueAtTime(0.001, now + offset)
      gain.gain.linearRampToValueAtTime(0.035, now + offset + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.5)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + offset)
      osc.stop(now + offset + 1.55)
    })
  } catch (e) {
    // Ignore audio failures
  }
}

// Whisper Send Sound (Ascending starlight whoosh chime)
export function playWhisperSendSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Gentle ascending harmonic sweep
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.42)

    // Sparkle harmonic bell
    const bell = ctx.createOscillator()
    const bellGain = ctx.createGain()
    bell.type = 'triangle'
    bell.frequency.setValueAtTime(1318.5, now + 0.15)
    bellGain.gain.setValueAtTime(0.025, now + 0.15)
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)

    bell.connect(bellGain)
    bellGain.connect(masterGain)
    bell.start(now + 0.15)
    bell.stop(now + 0.72)
  } catch (e) {
    // Ignore audio failures
  }
}

// Whisper Reaction Sound (Warm gentle chime based on reaction type)
export function playWhisperReactionSound(reactionType = 'hug') {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const freqMap = {
      hug: [440, 554.37, 659.25], // Warm A major
      heart: [523.25, 659.25, 783.99], // Radiant C major
      sparkle: [783.99, 987.77, 1318.51], // High twinkling chime
      empathy: [349.23, 440, 523.25], // Deep soothing F major
      candle: [261.63, 392, 523.25] // Serene low fifth
    }

    const notes = freqMap[reactionType] || freqMap.hug
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const delay = idx * 0.04

      osc.type = reactionType === 'sparkle' ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, now + delay)

      gain.gain.setValueAtTime(0.001, now + delay)
      gain.gain.linearRampToValueAtTime(0.035, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.6)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + delay)
      osc.stop(now + delay + 0.65)
    })
  } catch (e) {
    // Ignore audio failures
  }
}

// Re-export page transition sound helpers
export {
  playPageFlipSound,
  playWaterRippleSound,
  playGlassShatterSound,
  playWarpSound,
  playCyberGlitchSound,
  playTransitionSound
} from './pageTransitions.js'

// ─── Collaborative Writing Sound Synthesizer (Feature 29) ───────────────────
export function playCollabSendSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Harmonious dual chime (F#5 -> A#5 -> C#6)
    ;[739.99, 932.33, 1108.73].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const offset = idx * 0.05

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + offset)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + offset + 0.3)

      gain.gain.setValueAtTime(0.001, now + offset)
      gain.gain.linearRampToValueAtTime(0.035, now + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.5)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + offset)
      osc.stop(now + offset + 0.55)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

export function playCollabTurnSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Friendly prompt bell (C5 -> E5 -> G5)
    ;[523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const offset = idx * 0.07

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + offset)

      gain.gain.setValueAtTime(0.001, now + offset)
      gain.gain.linearRampToValueAtTime(0.03, now + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.6)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + offset)
      osc.stop(now + offset + 0.65)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

export function playCollabJoinSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.42)
  } catch (e) {
    // Ignore audio errors
  }
}

export function playCollabFinishSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Radiant celebration arpeggio
    ;[440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const offset = idx * 0.06

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + offset)
      gain.gain.setValueAtTime(0.001, now + offset)
      gain.gain.linearRampToValueAtTime(0.035, now + offset + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.2)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + offset)
      osc.stop(now + offset + 1.25)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

// ─── Stress-Relief Physics Minigames Sounds (Feature 30) ────────────────────

// Soap Bubble Popping Sound (Crisp high-speed pitch plunge + tiny water splash)
export function playBubblePopSound(pitchMultiplier = 1) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const baseFreq = (600 + Math.random() * 400) * pitchMultiplier
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.035)
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.09)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.11)

    // Micro splash noise burst
    const bufLen = Math.floor(ctx.sampleRate * 0.03)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3))
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.015, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)
    noise.connect(noiseGain)
    noiseGain.connect(masterGain)
    noise.start(now)
  } catch (e) {
    // Ignore audio errors
  }
}

// Bubble Wrap Snappy Pop Sound (Satisfying plastic snap)
export function playBubbleWrapSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const freq = 180 + Math.random() * 80

    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.05)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.065)
  } catch (e) {
    // Ignore audio errors
  }
}

// Magnetic Color Beads Chime (Gentle crystal glass chime)
export function playMagneticBeadsSound(velocity = 1) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51]
    const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)]

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    const vol = Math.min(0.035, 0.015 * velocity)
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(vol, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.38)
  } catch (e) {
    // Ignore audio errors
  }
}

// Zen Water Droplet Plop Sound
export function playZenWaterDropSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const startFreq = 400 + Math.random() * 300

    osc.type = 'sine'
    osc.frequency.setValueAtTime(startFreq, now)
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.8, now + 0.07)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.28)
  } catch (e) {
    // Ignore audio errors
  }
}

// ─── Feature 31 & 32: Spotify Wrapped & Emotional Dashboard Sound Effects ─────

// Wrapped Slide Transition Harmony
export function playWrappedSlideSound(slideIndex = 0) {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const chordPitches = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [293.66, 369.99, 440.00, 587.33], // D major
      [329.63, 415.30, 493.88, 659.25], // E major
      [349.23, 440.00, 523.25, 698.46], // F major
      [392.00, 493.88, 587.33, 783.99], // G major
      [440.00, 554.37, 659.25, 880.00], // A major
      [493.88, 622.25, 739.99, 987.77], // B major
      [523.25, 659.25, 783.99, 1046.50] // High C major
    ]

    const chord = chordPitches[slideIndex % chordPitches.length]
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.04)

      gain.gain.setValueAtTime(0.0001, now + idx * 0.04)
      gain.gain.linearRampToValueAtTime(0.025, now + idx * 0.04 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.8)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + idx * 0.04)
      osc.stop(now + idx * 0.04 + 0.85)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

// Wrapped Final Grand Fanfare / Card Reveal Chime
export function playWrappedFanfareSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]
    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + i * 0.07)

      gain.gain.setValueAtTime(0.0001, now + i * 0.07)
      gain.gain.linearRampToValueAtTime(0.035, now + i * 0.07 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 1.2)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + i * 0.07)
      osc.stop(now + i * 0.07 + 1.3)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

// Chart Hover Tick (Micro Particle Feedback)
export function playChartHoverSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800 + Math.random() * 200, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.015, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.05)
  } catch (e) {
    // Ignore audio errors
  }
}

// AI Insight Chime
export function playInsightChimeSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const notes = [659.25, 880.00, 1046.50]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.09)

      gain.gain.setValueAtTime(0.0001, now + idx * 0.09)
      gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.09 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.7)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + idx * 0.09)
      osc.stop(now + idx * 0.09 + 0.75)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

// 🕊️ Healing Chime Sound (432Hz Solfeggio / Tibetan Singing Bowl) for Mental Health Alerts
export function playHealingChimeSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // 432Hz Harmonic Serenity Chord (A=432Hz, E=648Hz, A=864Hz)
    const pitches = [432.0, 540.0, 648.0, 864.0]
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)

      gain.gain.setValueAtTime(0.0001, now + idx * 0.08)
      gain.gain.linearRampToValueAtTime(0.035 / (idx + 1), now + idx * 0.08 + 0.12)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 2.4)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 2.5)
    })
  } catch (e) {
    // Ignore audio errors
  }
}

// 🌿 Breathing Guidance Cue Sound (Inhale / Hold / Exhale)
export function playBreathingChime(phase = 'inhale') {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    if (phase === 'inhale') {
      osc.frequency.setValueAtTime(324, now)
      osc.frequency.exponentialRampToValueAtTime(540, now + 1.2)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.025, now + 0.3)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
    } else if (phase === 'hold') {
      osc.frequency.setValueAtTime(648, now)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.02, now + 0.08)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
    } else {
      // exhale
      osc.frequency.setValueAtTime(540, now)
      osc.frequency.exponentialRampToValueAtTime(288, now + 1.5)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.022, now + 0.2)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6)
    }

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 1.8)
  } catch (e) {
    // Ignore audio errors
  }
}

// ─── Feature 36 & 37: PWA Cloud Sync & Version History Audio FX ──────────────────

/**
 * Âm thanh tick vi mạch êm dịu khi tự động lưu (Auto-save)
 */
export function playAutoSaveTickSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.015, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(now)
    osc.stop(now + 0.09)
  } catch {
    // ignore
  }
}

/**
 * Âm thanh truyền tải dữ liệu hợp âm không gian khi đồng bộ đám mây (Cloud Sync)
 */
export function playCloudSyncSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // 3 arpeggiated quantum chimes
    const freqs = [587.33, 739.99, 880.0, 1174.66] // D5, F#5, A5, D6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.07)

      gain.gain.setValueAtTime(0.0001, now + idx * 0.07)
      gain.gain.linearRampToValueAtTime(0.025, now + idx * 0.07 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.35)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start(now + idx * 0.07)
      osc.stop(now + idx * 0.07 + 0.4)
    })
  } catch {
    // ignore
  }
}

/**
 * Hiệu ứng âm thanh tua ngược thời gian lượng tử khi Rollback phiên bản cũ
 */
export function playTimeTravelRollbackSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Reverse sweep with filter resonance
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(960, now)
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.45)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2800, now)
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.45)
    filter.Q.value = 4

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.035, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.52)
  } catch {
    // ignore
  }
}

/**
 * Hiệu ứng âm thanh Đóng Chốt Két Lượng Tử E2EE (Vault Lock)
 */
export function playVaultLockSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // 1. Heavy mechanical latch tone
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.22)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1200, now)
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.22)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.045, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.3)

    // 2. Metallic click latch snap
    const snapOsc = ctx.createOscillator()
    const snapGain = ctx.createGain()
    snapOsc.type = 'square'
    snapOsc.frequency.setValueAtTime(1400, now + 0.12)
    snapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.18)

    snapGain.gain.setValueAtTime(0.0001, now + 0.12)
    snapGain.gain.linearRampToValueAtTime(0.02, now + 0.13)
    snapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

    snapOsc.connect(snapGain)
    snapGain.connect(masterGain)

    snapOsc.start(now + 0.12)
    snapOsc.stop(now + 0.24)
  } catch {
    // ignore
  }
}

/**
 * Hiệu ứng âm thanh Mở Khóa Két Lượng Tử E2EE (Vault Unlock)
 */
export function playVaultUnlockSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Cyber Harmonic Chimes (Ascending crystal tones)
    const notes = [440, 554.37, 659.25, 880]
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.055)

      gain.gain.setValueAtTime(0.0001, now + idx * 0.055)
      gain.gain.linearRampToValueAtTime(0.03, now + idx * 0.055 + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.055 + 0.38)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + idx * 0.055)
      osc.stop(now + idx * 0.055 + 0.42)
    })
  } catch {
    // ignore
  }
}

/**
 * Hiệu ứng âm thanh Quét Dẫn Xuất Khóa Bảo Mật (Key Derivation Surge)
 */
export function playKeyDerivationSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(500 + i * 220, now + i * 0.04)

      gain.gain.setValueAtTime(0.0001, now + i * 0.04)
      gain.gain.linearRampToValueAtTime(0.018, now + i * 0.04 + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.08)

      osc.connect(gain)
      gain.connect(masterGain)

      osc.start(now + i * 0.04)
      osc.stop(now + i * 0.04 + 0.1)
    }
  } catch {
    // ignore
  }
}

/**
 * Hiệu ứng âm thanh Mã Hóa Dòng Dữ Liệu (Encryption Pulse)
 */
export function playEncryptionPulseSound() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.2)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(800, now)
    filter.Q.value = 3

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.025, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + 0.28)
  } catch {
    // ignore
  }
}


