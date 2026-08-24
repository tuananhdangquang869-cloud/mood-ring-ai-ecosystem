/**
 * Dynamic Typing Effects Engine
 * Renders high-performance 60 FPS particle systems (Floating Soap Bubbles, Sparks, Glowing Stardust, Misty Smoke)
 * synchronized with character typing and mood states.
 */

class TypingParticle {
  constructor(x, y, type, color, speedMultiplier = 1) {
    this.x = x
    this.y = y
    this.type = type // 'bubble' | 'dust' | 'spark' | 'smoke' | 'prismatic'
    this.color = color
    this.life = 1.0
    
    if (type === 'bubble') {
      // Delicate Iridescent Micro-Bubble with gentle upward float and quick pop
      this.vx = (Math.random() - 0.5) * 0.6 * speedMultiplier
      this.vy = -(Math.random() * 1.6 + 1.0) * speedMultiplier // floats UPWARDS cleanly
      this.gravity = -0.025 // Buoyancy floating up
      this.wobble = Math.random() * Math.PI * 2
      this.wobbleSpeed = 0.08 + Math.random() * 0.06
      this.wobbleAmount = 0.35 + Math.random() * 0.35
      this.size = Math.random() * 2.2 + 2.0 // Delicate 2.0px to 4.2px micro-bubble
      this.decay = Math.random() * 0.035 + 0.022 // Crisp 0.5s lifespan so it never piles up
    } else if (type === 'spark') {
      const angle = (Math.random() * Math.PI * 2)
      const speed = (Math.random() * 3.5 + 1.5) * speedMultiplier
      this.vx = Math.cos(angle) * speed
      this.vy = Math.sin(angle) * speed - 1.2
      this.gravity = 0.12
      this.size = Math.random() * 2.8 + 1.2
      this.decay = Math.random() * 0.035 + 0.025
    } else if (type === 'smoke') {
      this.vx = (Math.random() - 0.5) * 1.0 * speedMultiplier
      this.vy = -(Math.random() * 1.6 + 0.7) * speedMultiplier
      this.gravity = -0.02 // floats upward
      this.size = Math.random() * 5 + 3
      this.maxSize = this.size * 3.2
      this.decay = Math.random() * 0.018 + 0.012
    } else if (type === 'prismatic') {
      const angle = (Math.random() * Math.PI * 2)
      const speed = (Math.random() * 2.2 + 0.8) * speedMultiplier
      this.vx = Math.cos(angle) * speed
      this.vy = Math.sin(angle) * speed - 0.8
      this.gravity = -0.01
      this.size = Math.random() * 4 + 2
      this.decay = Math.random() * 0.022 + 0.015
      this.rotation = Math.random() * Math.PI * 2
      this.vRot = (Math.random() - 0.5) * 0.2
    } else {
      // 'dust' / 'stardust' (Golden Sparkles)
      this.vx = (Math.random() - 0.5) * 1.6 * speedMultiplier
      this.vy = -(Math.random() * 1.5 + 0.5) * speedMultiplier
      this.gravity = -0.03 // gently floats up
      this.size = Math.random() * 3.5 + 1.5
      this.decay = Math.random() * 0.02 + 0.015
    }
  }

  update() {
    if (this.type === 'bubble') {
      this.wobble += this.wobbleSpeed
      this.x += this.vx + Math.sin(this.wobble) * this.wobbleAmount
      this.y += this.vy
      this.vy += this.gravity
      this.life -= this.decay
    } else {
      this.x += this.vx
      this.y += this.vy
      this.vy += this.gravity
      this.life -= this.decay

      if (this.type === 'smoke') {
        this.size += 0.25
      } else if (this.type === 'spark') {
        this.vx *= 0.95
        this.vy *= 0.95
      } else if (this.type === 'prismatic') {
        this.rotation += this.vRot
      }
    }
  }

  draw(ctx) {
    if (this.life <= 0) return
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, this.life))

    if (this.type === 'bubble') {
      // ─── LUMINOUS TRANSLUCENT MICRO-BUBBLE ───
      const grad = ctx.createRadialGradient(
        this.x - this.size * 0.3,
        this.y - this.size * 0.3,
        this.size * 0.1,
        this.x,
        this.y,
        this.size
      )
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
      grad.addColorStop(0.3, 'rgba(230, 245, 255, 0.55)')
      grad.addColorStop(0.8, this.color)
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()

      // Delicate crisp white rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth = 0.75
      ctx.shadowColor = this.color
      ctx.shadowBlur = 3
      ctx.stroke()

      // Specular highlight dot
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x - this.size * 0.32, this.y - this.size * 0.32, this.size * 0.28, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.type === 'spark') {
      // Sharp glowing electrical/fire spark
      ctx.fillStyle = this.color
      ctx.shadowColor = this.color
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      
      // Spark core
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.type === 'smoke') {
      // Soft mystical puff of smoke
      ctx.fillStyle = this.color
      ctx.shadowColor = this.color
      ctx.shadowBlur = 12
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (this.type === 'prismatic') {
      // Shimmering 4-point star
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation)
      ctx.fillStyle = this.color
      ctx.shadowColor = this.color
      ctx.shadowBlur = 10
      ctx.beginPath()
      const s = this.size * 1.5
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.3, -s * 0.3)
      ctx.lineTo(s, 0)
      ctx.lineTo(s * 0.3, s * 0.3)
      ctx.lineTo(0, s)
      ctx.lineTo(-s * 0.3, s * 0.3)
      ctx.lineTo(-s, 0)
      ctx.lineTo(-s * 0.3, -s * 0.3)
      ctx.closePath()
      ctx.fill()
    } else {
      // Glowing stardust orb with halo
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2)
      grad.addColorStop(0, '#ffffff')
      grad.addColorStop(0.4, this.color)
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

export const MOOD_TYPING_PALETTES = {
  calm: {
    type: 'bubble',
    name: 'Bong Bóng Xanh Ngọc (Cyan Soap Bubbles)',
    colors: ['#00f0ff', '#38bdf8', '#7dd3fc', '#a7f3d0', '#c084fc', '#ffffff']
  },
  joy: {
    type: 'bubble',
    name: 'Bong Bóng Hoàng Kim (Golden Sun Bubbles)',
    colors: ['#fbbf24', '#f59e0b', '#fef08a', '#34d399', '#f472b6', '#ffffff']
  },
  serenity: {
    type: 'bubble',
    name: 'Bong Bóng Ngọc Bích (Emerald Bubbles)',
    colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#67e8f9', '#ffffff']
  },
  transcendence: {
    type: 'bubble',
    name: 'Bong Bóng Siêu Việt (Prismatic Bubbles)',
    colors: ['#ff00ff', '#00f0ff', '#39ff14', '#ffff00', '#f472b6', '#ffffff']
  },
  discovery: {
    type: 'bubble',
    name: 'Bong Bóng Tinh Vân (Nova Bubbles)',
    colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#ffffff']
  },
  anger: {
    type: 'spark',
    name: 'Tia Lửa Rực Cháy (Fiery Embers)',
    colors: ['#ef4444', '#f97316', '#ffb000', '#dc2626', '#ffffff']
  },
  breach: {
    type: 'spark',
    name: 'Sét Điện Quá Tải (Electric Arc Sparks)',
    colors: ['#ff003c', '#ff2a5f', '#f43f5e', '#ffb000', '#ffffff']
  },
  friction: {
    type: 'spark',
    name: 'Tia Nổ Ma Sát (Amber Friction)',
    colors: ['#ff9900', '#fbbf24', '#f97316', '#ef4444', '#fff7ed']
  },
  sorrow: {
    type: 'smoke',
    name: 'Khói Tan U Buồn (Melancholy Mist)',
    colors: ['rgba(96, 165, 250, 0.5)', 'rgba(148, 163, 184, 0.45)', 'rgba(56, 189, 248, 0.4)', 'rgba(226, 232, 240, 0.35)']
  },
  frozen: {
    type: 'smoke',
    name: 'Sương Giá Băng Hà (Glacial Vapor)',
    colors: ['rgba(186, 230, 253, 0.55)', 'rgba(147, 197, 253, 0.45)', 'rgba(255, 255, 255, 0.45)']
  },
  echo: {
    type: 'smoke',
    name: 'Ảo Ảnh Tàn Dư (Corrupted Phantom Fog)',
    colors: ['rgba(168, 85, 247, 0.45)', 'rgba(192, 132, 252, 0.4)', 'rgba(244, 63, 94, 0.35)']
  }
}

export class TypingEffectsManager {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas?.getContext('2d') || null
    this.particles = []
    this.animationFrameId = null
    this.isRunning = false
    this.intensity = 'vivid' // 'subtle' | 'vivid' | 'intense'
    this.styleOverride = null // 'auto' | 'bubble' | 'spark' | 'dust' | 'smoke' | 'prismatic'
  }

  setCanvas(canvas) {
    this.canvas = canvas
    this.ctx = canvas?.getContext('2d') || null
  }

  spawnAt(x, y, mood = 'calm', count = null) {
    if (!this.canvas || !this.ctx) return

    const moodConfig = MOOD_TYPING_PALETTES[mood] || MOOD_TYPING_PALETTES.calm
    const particleType = (this.styleOverride && this.styleOverride !== 'auto') 
      ? this.styleOverride 
      : moodConfig.type

    let particleCount = count
    if (particleCount === null) {
      if (this.intensity === 'subtle') particleCount = 1
      else if (this.intensity === 'intense') particleCount = Math.floor(Math.random() * 3) + 2
      else particleCount = Math.floor(Math.random() * 2) + 1
    }

    const speedMultiplier = this.intensity === 'intense' ? 1.2 : this.intensity === 'subtle' ? 0.75 : 1.0

    for (let i = 0; i < particleCount; i++) {
      const color = moodConfig.colors[Math.floor(Math.random() * moodConfig.colors.length)]
      const p = new TypingParticle(
        x + (Math.random() - 0.5) * 8,
        y + (Math.random() - 0.5) * 4,
        particleType,
        color,
        speedMultiplier
      )
      this.particles.push(p)
    }

    if (!this.isRunning) {
      this.start()
    }
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true

    const loop = () => {
      if (!this.canvas || !this.ctx) {
        this.isRunning = false
        return
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]
        p.update()
        p.draw(this.ctx)

        if (p.life <= 0) {
          this.particles.splice(i, 1)
        }
      }

      if (this.particles.length > 0) {
        this.animationFrameId = requestAnimationFrame(loop)
      } else {
        this.isRunning = false
        this.animationFrameId = null
      }
    }

    this.animationFrameId = requestAnimationFrame(loop)
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
    this.particles = []
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }
}
