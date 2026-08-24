// ─── PAGE TRANSITIONS LIBRARY & SFX SYNTHESIZER ─────────────────────────────
import { getCtx } from './audioSynth.js'

export const TRANSITION_STYLES = [
  {
    id: 'instant',
    name: 'Tức Thì (Siêu Tốc 60 FPS)',
    englishName: 'Instant Turbo (Zero Latency)',
    icon: '⚡',
    badge: 'ZERO LAG 60FPS',
    color: '#10b981',
    duration: 0,
    desc: 'Chuyển cảnh tức thì 0ms, loại bỏ hoàn toàn độ trễ, tối ưu hiệu năng tối đa cho trải nghiệm mượt mà nhất.'
  },
  {
    id: 'fade-fast',
    name: 'Lướt Mờ Siêu Tốc',
    englishName: 'Fast GPU Fade',
    icon: '✨',
    badge: 'HARDWARE GPU',
    color: '#06b6d4',
    duration: 180,
    desc: 'Hiệu ứng lướt mờ 180ms siêu mượt được GPU tăng tốc phần cứng, loại bỏ hiện tượng giật khung hình.'
  },
  {
    id: 'book-flip',
    name: 'Lật Trang Sách 3D',
    englishName: '3D Book Page Flip',
    icon: '📖',
    badge: '3D REALISTIC',
    color: '#f59e0b',
    duration: 320,
    desc: 'Hiệu ứng lật trang sách chân thực với độ cong 3D, bóng đổ gáy sách và âm thanh sột soạt giấy mềm mại.'
  },
  {
    id: 'water-ripple',
    name: 'Mặt Nước Gợn Sóng',
    englishName: 'Liquid Ripple Waves',
    icon: '💧',
    badge: 'ORGANIC',
    color: '#38bdf8',
    duration: 350,
    desc: 'Sóng nước đồng tâm lan tỏa làm biến dạng quang học không gian, kèm âm thanh giọt nước thanh khiết.'
  },
  {
    id: 'glass-shatter',
    name: 'Kính Vỡ Lượng Tử',
    englishName: 'Quantum Glass Fracture',
    icon: '💎',
    badge: 'FRACTURE 3D',
    color: '#a855f7',
    duration: 340,
    desc: 'Mặt gương vỡ vụn thành hàng chục mảnh đa giác phát sáng phân tán trong không gian 3D rồi tự tái hợp.'
  },
  {
    id: 'quantum-warp',
    name: 'Cổng Không Gian Warp',
    englishName: 'Dimensional Warp Vortex',
    icon: '🌀',
    badge: 'VORTEX GLOW',
    color: '#00f0ff',
    duration: 300,
    desc: 'Hút xoáy lượng tử cực quang với quang sai sắc (Chromatic Aberration) và sóng hạ âm vũ trụ.'
  },
  {
    id: 'cyber-glitch',
    name: 'Màn Trập Cyberpunk',
    englishName: 'Cyber Shutter & Glitch',
    icon: '⚡',
    badge: 'CYBERPUNK',
    color: '#ec4899',
    duration: 280,
    desc: 'Các lá chắn laser neon ngang chia cắt quét màn hình kết hợp nhiễu ma trận và xung điện từ.'
  }
]

// ─── Web Audio SFX for Transitions ──────────────────────────────────────────

/** 1. Sound of a crisp book page flipping in 3D */
export function playPageFlipSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime

    // White noise filtered for paper friction
    const bufLen = Math.floor(ctx.sampleRate * 0.35)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3))
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buf

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(1400, now)
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12)
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.3)
    filter.Q.value = 1.8

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(now)
    noise.stop(now + 0.35)
  } catch (e) {
    // audio failure fallback
  }
}

/** 2. Sound of water ripple / droplet splash */
export function playWaterRippleSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime

    // Main drop tone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(450 + Math.random() * 100, now)
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.08)
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.22)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.26)

    // Secondary ripple echo
    setTimeout(() => {
      try {
        const subOsc = ctx.createOscillator()
        const subGain = ctx.createGain()
        const subNow = ctx.currentTime
        subOsc.type = 'sine'
        subOsc.frequency.setValueAtTime(920, subNow)
        subOsc.frequency.exponentialRampToValueAtTime(1400, subNow + 0.06)
        subGain.gain.setValueAtTime(0.035, subNow)
        subGain.gain.exponentialRampToValueAtTime(0.0001, subNow + 0.18)
        subOsc.connect(subGain)
        subGain.connect(ctx.destination)
        subOsc.start(subNow)
        subOsc.stop(subNow + 0.2)
      } catch { /* empty */ }
    }, 110)
  } catch (e) {
    // audio failure fallback
  }
}

/** 3. Sound of glass shatter / crystalline fracture */
export function playGlassShatterSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime

    // High harmonic crystal chime burst
    const frequencies = [1200, 1850, 2400, 3100, 4600]
    frequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq + Math.random() * 200, now)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.18 + idx * 0.04)

      gain.gain.setValueAtTime(0.045 / (idx + 1), now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22 + idx * 0.05)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.015)
      osc.stop(now + 0.35)
    })

    // Noise crack
    const bufLen = Math.floor(ctx.sampleRate * 0.12)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.1))
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 3500
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.08, now)
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    noise.connect(f)
    f.connect(g)
    g.connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.12)
  } catch (e) {
    // audio failure fallback
  }
}

/** 4. Sound of quantum warp / dimensional whoosh */
export function playWarpSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime

    // Low sub swell to high warp laser
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(70, now)
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.32)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.5)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(300, now)
    filter.frequency.exponentialRampToValueAtTime(4500, now + 0.3)
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.5)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.25)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.58)
  } catch (e) {
    // audio failure fallback
  }
}

/** 5. Sound of cyberpunk shutter & glitch slice */
export function playCyberGlitchSound() {
  try {
    const ctx = getCtx()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime

    // Square wave laser pulse
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.setValueAtTime(220, now + 0.05)
    osc.frequency.setValueAtTime(1760, now + 0.1)
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22)

    gain.gain.setValueAtTime(0.04, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  } catch (e) {
    // audio failure fallback
  }
}

/** Trigger sound according to transition type */
export function playTransitionSound(type = 'fade-fast') {
  switch (type) {
    case 'instant':
      // Instant mode stays silent or subtle click
      break
    case 'fade-fast':
      playPageFlipSound()
      break
    case 'book-flip':
      playPageFlipSound()
      break
    case 'water-ripple':
      playWaterRippleSound()
      break
    case 'glass-shatter':
      playGlassShatterSound()
      break
    case 'quantum-warp':
      playWarpSound()
      break
    case 'cyber-glitch':
      playCyberGlitchSound()
      break
    default:
      break
  }
}
