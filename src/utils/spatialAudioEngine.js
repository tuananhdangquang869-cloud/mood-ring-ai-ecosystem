// ─── BINAURAL 3D SPATIAL AUDIO ENGINE (HRTF) ─────────────────────────────────
import { getCtx } from './audioSynth.js'

export const SPATIAL_PRESETS = [
  {
    id: 'rain',
    name: 'Mưa Rơi Cyberpunk',
    englishName: 'Cyberpunk Neon Rain',
    icon: '🌧️',
    color: '#00f0ff',
    badge: 'BINAURAL RAIN',
    desc: 'Mưa số rơi tí tách trên mái tôn kim loại kết hợp sấm rền từ xa xoay quanh 3D.'
  },
  {
    id: 'campfire',
    name: 'Lửa Trại Ký Ức',
    englishName: 'Ember Campfire',
    icon: '🔥',
    color: '#f59e0b',
    badge: 'WARM EMBERS',
    desc: 'Tiếng củi nổ lách tách, than hồng ấm áp và luồng khí nhiệt bồng bềnh.'
  },
  {
    id: 'ocean',
    name: 'Sóng Biển Lượng Tử',
    englishName: 'Zen Ocean Waves',
    icon: '🌊',
    color: '#38bdf8',
    badge: 'DEEP SWELLS',
    desc: 'Từng đợt sóng biển triều dâng nhịp nhàng uốn lượn 360° từ trái sang phải qua tai.'
  },
  {
    id: 'wind',
    name: 'Gió Vũ Trụ Vô Tận',
    englishName: 'Deep Cosmic Winds',
    icon: '🌌',
    color: '#a855f7',
    badge: 'VOID DRONE',
    desc: 'Tiếng rền hạ âm không gian sâu kết hợp những luồng gió quang phổ huyền ảo.'
  },
  {
    id: 'chimes',
    name: 'Rừng Đom Đóm & Chuông',
    englishName: 'Forest Night Chimes',
    icon: '🎐',
    color: '#10b981',
    badge: 'SANCTUARY',
    desc: 'Tiếng ve đêm xào xạc và chuông gió ngũ cung ngân vang chuyển động trong không gian.'
  }
]

class SpatialAudioEngine {
  constructor() {
    this.ctx = null
    this.masterSpatialGain = null
    this.pannerNode = null
    this.secondaryPanner = null
    
    // Position state: radius, angle (radians), elevation (Y)
    this.coords = { x: 3, y: 0, z: -2 }
    this.angle = 0
    this.radius = 4 // Distance from listener in meters
    this.elevation = 0 // Height (-5 to 5)
    
    // Playback state
    this.isPlaying = false
    this.currentPreset = 'rain'
    this.orbitSpeed = 1.0 // Multiplier (0 = static, 1.0 = ~0.02 rad/frame)
    this.autoOrbit = true
    this.volume = 0.7
    this.multiSource = false
    this.activeNodes = []
    this.animFrameId = null
    this.listeners = new Set()
  }

  init() {
    if (this.ctx && this.pannerNode) return
    this.ctx = getCtx()
    if (!this.ctx) return

    // Master spatial output gain
    this.masterSpatialGain = this.ctx.createGain()
    this.masterSpatialGain.gain.value = this.volume

    // Create 3D HRTF Panner
    this.pannerNode = this.createHRTFPanner()
    this.secondaryPanner = this.createHRTFPanner()

    this.pannerNode.connect(this.masterSpatialGain)
    this.secondaryPanner.connect(this.masterSpatialGain)
    this.masterSpatialGain.connect(this.ctx.destination)

    this.updatePannerPosition()
  }

  createHRTFPanner() {
    const panner = this.ctx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 1.5
    panner.maxDistance = 100
    panner.rolloffFactor = 1.2
    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0
    return panner
  }

  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb({
          isPlaying: this.isPlaying,
          currentPreset: this.currentPreset,
          coords: { ...this.coords },
          angle: this.angle,
          radius: this.radius,
          elevation: this.elevation,
          orbitSpeed: this.orbitSpeed,
          autoOrbit: this.autoOrbit,
          volume: this.volume,
          multiSource: this.multiSource
        })
      } catch { /* empty */ }
    })
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val))
    if (this.masterSpatialGain && this.ctx) {
      this.masterSpatialGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05)
    }
    this.notify()
  }

  setOrbitSpeed(speed) {
    this.orbitSpeed = Math.max(0, Math.min(5, speed))
    this.notify()
  }

  setAutoOrbit(enabled) {
    this.autoOrbit = !!enabled
    this.notify()
  }

  setElevation(y) {
    this.elevation = Math.max(-5, Math.min(5, y))
    this.coords.y = this.elevation
    this.updatePannerPosition()
    this.notify()
  }

  setRadius(r) {
    this.radius = Math.max(1, Math.min(10, r))
    this.coords.x = Math.cos(this.angle) * this.radius
    this.coords.z = Math.sin(this.angle) * this.radius
    this.updatePannerPosition()
    this.notify()
  }

  setManualPosition(x, z, y = null) {
    this.coords.x = Math.max(-10, Math.min(10, x))
    this.coords.z = Math.max(-10, Math.min(10, z))
    if (y !== null) this.coords.y = Math.max(-5, Math.min(5, y))
    
    // Calculate polar coordinates
    this.radius = Math.hypot(this.coords.x, this.coords.z)
    this.angle = Math.atan2(this.coords.z, this.coords.x)
    this.updatePannerPosition()
    this.notify()
  }

  updatePannerPosition() {
    if (!this.pannerNode || !this.ctx) return
    const now = this.ctx.currentTime

    // Main 3D Panner
    if (this.pannerNode.positionX) {
      this.pannerNode.positionX.setTargetAtTime(this.coords.x, now, 0.04)
      this.pannerNode.positionY.setTargetAtTime(this.coords.y, now, 0.04)
      this.pannerNode.positionZ.setTargetAtTime(this.coords.z, now, 0.04)
    } else {
      this.pannerNode.setPosition(this.coords.x, this.coords.y, this.coords.z)
    }

    // Secondary Panner (placed opposite on 3D circle if multi-source is active)
    if (this.secondaryPanner && this.multiSource) {
      const oppX = -this.coords.x
      const oppZ = -this.coords.z
      const oppY = -this.coords.y * 0.5
      if (this.secondaryPanner.positionX) {
        this.secondaryPanner.positionX.setTargetAtTime(oppX, now, 0.04)
        this.secondaryPanner.positionY.setTargetAtTime(oppY, now, 0.04)
        this.secondaryPanner.positionZ.setTargetAtTime(oppZ, now, 0.04)
      } else {
        this.secondaryPanner.setPosition(oppX, oppY, oppZ)
      }
    }
  }

  // Continuous animation loop for 3D orbit
  startOrbitLoop() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId)

    let lastTime = performance.now()
    const loop = (time) => {
      const delta = (time - lastTime) / 1000
      lastTime = time

      if (this.isPlaying && this.autoOrbit && this.orbitSpeed > 0) {
        // Orbit speed: 1.0 = ~0.6 radians / sec (full 360 rotation in ~10.5s)
        this.angle = (this.angle + this.orbitSpeed * 0.6 * delta) % (Math.PI * 2)
        this.coords.x = Math.cos(this.angle) * this.radius
        this.coords.z = Math.sin(this.angle) * this.radius
        this.coords.y = this.elevation + Math.sin(this.angle * 2) * 0.4 // gentle vertical bobbing
        this.updatePannerPosition()
        this.notify()
      }

      this.animFrameId = requestAnimationFrame(loop)
    }

    this.animFrameId = requestAnimationFrame(loop)
  }

  stopOrbitLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  // ─── PROCEDURAL SOUND SYNTHESIS ENGINES ──────────────────────────────────────

  stopAllNodes() {
    this.activeNodes.forEach((node) => {
      try { if (typeof node.stop === 'function') node.stop() } catch { /* empty */ }
      try { node.disconnect() } catch { /* empty */ }
    })
    this.activeNodes = []
  }

  playPreset(presetId) {
    this.init()
    if (this.ctx.state === 'suspended') this.ctx.resume()

    this.stopAllNodes()
    this.currentPreset = presetId || this.currentPreset
    this.isPlaying = true

    const ctx = this.ctx
    const targetPanner = this.pannerNode

    switch (this.currentPreset) {
      case 'rain':
        this.synthesizeRain(ctx, targetPanner)
        break
      case 'campfire':
        this.synthesizeCampfire(ctx, targetPanner)
        break
      case 'ocean':
        this.synthesizeOcean(ctx, targetPanner)
        break
      case 'wind':
        this.synthesizeWind(ctx, targetPanner)
        break
      case 'chimes':
        this.synthesizeChimes(ctx, targetPanner)
        break
      default:
        this.synthesizeRain(ctx, targetPanner)
        break
    }

    this.startOrbitLoop()
    this.notify()
  }

  togglePlay() {
    if (this.isPlaying) {
      this.stop()
    } else {
      this.playPreset(this.currentPreset)
    }
  }

  stop() {
    this.isPlaying = false
    this.stopAllNodes()
    this.stopOrbitLoop()
    this.notify()
  }

  // 1. Procedural Cyber Rain
  synthesizeRain(ctx, panner) {
    // Continuous pink/white noise buffer for rain hiss
    const bufLen = ctx.sampleRate * 4
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < bufLen; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.997 * b0 + white * 0.05
      b1 = 0.963 * b1 + white * 0.11
      b2 = 0.860 * b2 + white * 0.25
      data[i] = (b0 + b1 + b2 + white * 0.3) * 0.35
    }

    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 1800
    filter.Q.value = 0.6

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 1)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(panner)

    src.start()
    this.activeNodes.push(src, filter, gain)

    // Periodic distant thunder bass boom
    const thunderInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'rain') {
        clearInterval(thunderInterval)
        return
      }
      try {
        const tOsc = ctx.createOscillator()
        const tGain = ctx.createGain()
        const tFilter = ctx.createBiquadFilter()
        const tNow = ctx.currentTime
        tOsc.type = 'sawtooth'
        tOsc.frequency.setValueAtTime(65, tNow)
        tOsc.frequency.exponentialRampToValueAtTime(25, tNow + 1.8)
        tFilter.type = 'lowpass'
        tFilter.frequency.value = 120
        tGain.gain.setValueAtTime(0.001, tNow)
        tGain.gain.linearRampToValueAtTime(0.12, tNow + 0.3)
        tGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 2.2)
        tOsc.connect(tFilter)
        tFilter.connect(tGain)
        tGain.connect(panner)
        tOsc.start(tNow)
        tOsc.stop(tNow + 2.4)
      } catch { /* empty */ }
    }, 7000 + Math.random() * 5000)
  }

  // 2. Procedural Campfire Ember
  synthesizeCampfire(ctx, panner) {
    // Warm thermal low drone
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 85
    oscGain.gain.setValueAtTime(0, ctx.currentTime)
    oscGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.8)
    osc.connect(oscGain)
    oscGain.connect(panner)
    osc.start()
    this.activeNodes.push(osc, oscGain)

    // Crackle noise generator loop
    const crackleInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'campfire') {
        clearInterval(crackleInterval)
        return
      }
      try {
        const count = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < count; i++) {
          const delay = Math.random() * 0.15
          const now = ctx.currentTime + delay
          const pop = ctx.createOscillator()
          const popGain = ctx.createGain()
          const popFilter = ctx.createBiquadFilter()

          pop.type = 'square'
          pop.frequency.setValueAtTime(900 + Math.random() * 1800, now)
          pop.frequency.exponentialRampToValueAtTime(120, now + 0.04)

          popFilter.type = 'bandpass'
          popFilter.frequency.value = 2400
          popFilter.Q.value = 3.5

          popGain.gain.setValueAtTime(0.04 + Math.random() * 0.05, now)
          popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04)

          pop.connect(popFilter)
          popFilter.connect(popGain)
          popGain.connect(panner)

          pop.start(now)
          pop.stop(now + 0.06)
        }
      } catch { /* empty */ }
    }, 180)
  }

  // 3. Procedural Zen Ocean Waves
  synthesizeOcean(ctx, panner) {
    const bufLen = ctx.sampleRate * 6
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buf
    src.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 450

    // Modulate filter frequency with LFO to simulate rolling ocean waves
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.12 // 8 second wave cycle
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 350
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 1.2)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(panner)

    src.start()
    lfo.start()
    this.activeNodes.push(src, lfo, lfoGain, filter, gain)
  }

  // 4. Procedural Deep Cosmic Void Wind
  synthesizeWind(ctx, panner) {
    const freqs = [55, 110, 165, 330]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq

      // Subtle slow frequency vibrato for cosmic resonance
      const vibrato = ctx.createOscillator()
      vibrato.frequency.value = 0.2 + idx * 0.08
      const vGain = ctx.createGain()
      vGain.gain.value = 3 + idx * 2
      vibrato.connect(vGain)
      vGain.connect(osc.frequency)

      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.04 / (idx + 1), ctx.currentTime + 1.5)

      osc.connect(g)
      g.connect(panner)

      osc.start()
      vibrato.start()
      this.activeNodes.push(osc, vibrato, vGain, g)
    })
  }

  // 5. Procedural Forest Night Chimes
  synthesizeChimes(ctx, panner) {
    // Night crickets gentle atmospheric bed
    const cricketsOsc = ctx.createOscillator()
    const cricketsMod = ctx.createOscillator()
    const modGain = ctx.createGain()
    const cGain = ctx.createGain()

    cricketsOsc.type = 'sine'
    cricketsOsc.frequency.value = 4600

    cricketsMod.type = 'square'
    cricketsMod.frequency.value = 16 // cricket chirp pulsation
    modGain.gain.value = 1200
    cricketsMod.connect(modGain)
    modGain.connect(cricketsOsc.frequency)

    cGain.gain.setValueAtTime(0, ctx.currentTime)
    cGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 1)

    cricketsOsc.connect(cGain)
    cGain.connect(panner)

    cricketsOsc.start()
    cricketsMod.start()
    this.activeNodes.push(cricketsOsc, cricketsMod, modGain, cGain)

    // Random pentatonic wind chimes ringing in 3D
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
    const chimeInterval = setInterval(() => {
      if (!this.isPlaying || this.currentPreset !== 'chimes') {
        clearInterval(chimeInterval)
        return
      }
      try {
        const now = ctx.currentTime
        const note = pentatonic[Math.floor(Math.random() * pentatonic.length)]
        const chime = ctx.createOscillator()
        const chimeGain = ctx.createGain()

        chime.type = 'sine'
        chime.frequency.setValueAtTime(note, now)

        chimeGain.gain.setValueAtTime(0.035, now)
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)

        chime.connect(chimeGain)
        chimeGain.connect(panner)

        chime.start(now)
        chime.stop(now + 2.0)
      } catch { /* empty */ }
    }, 1600 + Math.random() * 1200)
  }

  // ─── BINAURAL 360° SWEEP TEST ───────────────────────────────────────────────
  runBinauralTest() {
    this.init()
    if (this.ctx.state === 'suspended') this.ctx.resume()

    const ctx = this.ctx
    const panner = this.pannerNode
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(440, now)

    gain.gain.setValueAtTime(0.05, now)
    gain.gain.linearRampToValueAtTime(0.05, now + 3.8)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.2)

    osc.connect(gain)
    gain.connect(panner)
    osc.start(now)
    osc.stop(now + 4.3)

    // Sweep around 360 degrees smoothly in 4 seconds
    let startTime = performance.now()
    const sweep = (time) => {
      const elapsed = (time - startTime) / 1000
      if (elapsed > 4.2) return
      const sweepAngle = (elapsed / 4.0) * Math.PI * 2
      this.coords.x = Math.cos(sweepAngle) * 4
      this.coords.z = Math.sin(sweepAngle) * 4
      this.coords.y = Math.sin(sweepAngle * 2) * 1.5
      this.updatePannerPosition()
      this.notify()
      requestAnimationFrame(sweep)
    }
    requestAnimationFrame(sweep)
  }
}

// Global Singleton Spatial Engine Instance
export const globalSpatialAudio = new SpatialAudioEngine()
