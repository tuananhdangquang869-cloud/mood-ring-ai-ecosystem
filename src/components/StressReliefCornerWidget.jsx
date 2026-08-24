import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gamepad2,
  Sparkles,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  RotateCcw,
  Zap,
  Heart,
  Flame,
  Wind,
  X,
  Keyboard,
  Info
} from 'lucide-react'
import {
  playBubblePopSound,
  playBubbleWrapSound,
  playMagneticBeadsSound,
  playZenWaterDropSound,
  playKeyClick
} from '../utils/audioSynth.js'

export default function StressReliefCornerWidget({
  soundEnabled = true
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeGame, setActiveGame] = useState('bubbles') // 'bubbles' | 'beads' | 'wrap' | 'zen'
  const [widgetSound, setWidgetSound] = useState(true)
  const [popScore, setPopScore] = useState(0)

  // Bubble wrap grid state (60 bubbles = 10 x 6)
  const [wrapCells, setWrapCells] = useState(() => Array(60).fill(false))

  // Canvas ref for 60FPS physics games
  const canvasRef = useRef(null)
  const animFrameId = useRef(null)
  const mousePos = useRef({ x: -100, y: -100, isDown: false })
  const isDragging = useRef(false)

  // Audio helper
  const canPlaySound = soundEnabled && widgetSound

  // Listen for open-stress-relief-modal custom event
  useEffect(() => {
    const handleOpenModal = () => setIsExpanded(true)
    window.addEventListener('open-stress-relief-modal', handleOpenModal)
    return () => window.removeEventListener('open-stress-relief-modal', handleOpenModal)
  }, [])

  // Keyboard shortcut: ESC to close, numbers 1-4 to switch games
  useEffect(() => {
    if (!isExpanded) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsExpanded(false)
      } else if (e.key === '1') {
        setActiveGame('bubbles')
      } else if (e.key === '2') {
        setActiveGame('beads')
      } else if (e.key === '3') {
        setActiveGame('wrap')
      } else if (e.key === '4') {
        setActiveGame('zen')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded])

  // ─────────────────────────────────────────────────────────────────────────────
  // GAME 1: SOAP BUBBLE POPPING & WATER DROPLET SPLASH PHYSICS
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExpanded || activeGame !== 'bubbles') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const updateSize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth || 800
      canvas.height = canvas.offsetHeight || 480
    }
    updateSize()

    let width = canvas.width
    let height = canvas.height

    const handleResize = () => {
      updateSize()
      width = canvas.width
      height = canvas.height
    }
    window.addEventListener('resize', handleResize)

    const bubbles = []
    const particles = []
    const bubbleCount = Math.max(26, Math.floor(width / 32))

    // Initialize bubbles
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 16 + Math.random() * 32,
        speedY: 0.7 + Math.random() * 1.5,
        speedX: (Math.random() - 0.5) * 1.0,
        hue: Math.random() * 360,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
      })
    }

    const popBubbleAt = (bx, by, r, hue) => {
      if (canPlaySound) playBubblePopSound(1 + (35 - r) / 35)
      setPopScore(prev => prev + 1)

      // Spawn droplet splash particles
      const splashCount = Math.floor(12 + r / 3)
      for (let p = 0; p < splashCount; p++) {
        const angle = Math.random() * Math.PI * 2
        const spd = 2.0 + Math.random() * 4.5
        particles.push({
          x: bx,
          y: by,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          radius: 2 + Math.random() * 3,
          color: `hsl(${hue}, 90%, 70%)`,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.03
        })
      }
    }

    let running = true

    const loop = () => {
      if (!running) return
      ctx.clearRect(0, 0, width, height)

      // Update & Draw Bubbles
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i]
        b.wobble += b.wobbleSpeed
        b.y -= b.speedY
        b.x += Math.sin(b.wobble) * 0.8 + b.speedX

        // Bounce horizontally
        if (b.x < b.radius) { b.x = b.radius; b.speedX = Math.abs(b.speedX) }
        if (b.x > width - b.radius) { b.x = width - b.radius; b.speedX = -Math.abs(b.speedX) }

        // Check if clicked or mouse hovered over bubble
        const dx = mousePos.current.x - b.x
        const dy = mousePos.current.y - b.y
        const dist = Math.hypot(dx, dy)

        if (dist < b.radius + 8) {
          popBubbleAt(b.x, b.y, b.radius, b.hue)
          b.y = height + 40 + Math.random() * 60
          b.x = Math.random() * width
          b.radius = 16 + Math.random() * 32
          continue
        }

        // Respawn if floated off top
        if (b.y < -b.radius * 2) {
          b.y = height + 30
          b.x = Math.random() * width
        }

        // Draw iridescent soap bubble with gradient and highlight shine
        ctx.save()
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)

        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.35,
          b.y - b.radius * 0.35,
          b.radius * 0.05,
          b.x,
          b.y,
          b.radius
        )
        grad.addColorStop(0, `hsla(${b.hue}, 90%, 90%, 0.65)`)
        grad.addColorStop(0.5, `hsla(${(b.hue + 50) % 360}, 90%, 65%, 0.3)`)
        grad.addColorStop(1, `hsla(${(b.hue + 130) % 360}, 95%, 60%, 0.85)`)

        ctx.fillStyle = grad
        ctx.fill()
        ctx.lineWidth = 1.8
        ctx.strokeStyle = `hsla(${b.hue}, 100%, 80%, 0.85)`
        ctx.stroke()

        // Highlight shine arc
        ctx.beginPath()
        ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.28, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
        ctx.fill()
        ctx.restore()
      }

      // Update & Draw Splash Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.09 // slight gravity
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      animFrameId.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      running = false
      window.removeEventListener('resize', handleResize)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [isExpanded, activeGame, widgetSound, soundEnabled])

  // ─────────────────────────────────────────────────────────────────────────────
  // GAME 2: MAGNETIC COLOR BEADS / GALAXY VORTEX PHYSICS
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExpanded || activeGame !== 'beads') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const updateSize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth || 800
      canvas.height = canvas.offsetHeight || 480
    }
    updateSize()

    let width = canvas.width
    let height = canvas.height

    const handleResize = () => {
      updateSize()
      width = canvas.width
      height = canvas.height
    }
    window.addEventListener('resize', handleResize)

    const beads = []
    const beadCount = Math.max(120, Math.floor((width * height) / 3200))
    const colors = ['#00f0ff', '#f43f5e', '#a855f7', '#10b981', '#fbbf24', '#38bdf8', '#ec4899']

    for (let i = 0; i < beadCount; i++) {
      beads.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2.0,
        vy: (Math.random() - 0.5) * 2.0,
        radius: 3.5 + Math.random() * 4.5,
        color: colors[i % colors.length],
        mass: 0.8 + Math.random() * 0.6
      })
    }

    let running = true

    const loop = () => {
      if (!running) return
      ctx.fillStyle = 'rgba(6, 12, 28, 0.25)'
      ctx.fillRect(0, 0, width, height)

      const mx = mousePos.current.x
      const my = mousePos.current.y
      const hasMouse = mx > 0 && my > 0 && mx < width && my < height

      for (let i = 0; i < beads.length; i++) {
        const b = beads[i]

        if (hasMouse) {
          const dx = mx - b.x
          const dy = my - b.y
          const dist = Math.hypot(dx, dy) || 1

          // Magnetic attraction or click shockwave repulsion
          const force = mousePos.current.isDown
            ? -2400 / (dist * dist + 120) // Shockwave push
            : 600 / (dist * dist + 120) // Gentle gravity pull

          b.vx += (dx / dist) * force * 0.22
          b.vy += (dy / dist) * force * 0.22

          // Play chime on tight orbital capture
          if (dist < 26 && Math.random() < 0.05) {
            if (canPlaySound) playMagneticBeadsSound(Math.hypot(b.vx, b.vy))
          }
        }

        // Friction damping
        b.vx *= 0.97
        b.vy *= 0.97

        b.x += b.vx
        b.y += b.vy

        // Bounce walls
        if (b.x < b.radius) { b.x = b.radius; b.vx *= -0.75 }
        if (b.x > width - b.radius) { b.x = width - b.radius; b.vx *= -0.75 }
        if (b.y < b.radius) { b.y = b.radius; b.vy *= -0.75 }
        if (b.y > height - b.radius) { b.y = height - b.radius; b.vy *= -0.75 }

        // Draw bead
        ctx.save()
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
        ctx.fillStyle = b.color
        ctx.shadowColor = b.color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.restore()
      }

      animFrameId.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      running = false
      window.removeEventListener('resize', handleResize)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [isExpanded, activeGame, widgetSound, soundEnabled])

  // ─────────────────────────────────────────────────────────────────────────────
  // GAME 4: ZEN SAND & NEON WATER RIPPLE GARDEN
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isExpanded || activeGame !== 'zen') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const updateSize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth || 800
      canvas.height = canvas.offsetHeight || 480
    }
    updateSize()

    let width = canvas.width
    let height = canvas.height

    const handleResize = () => {
      updateSize()
      width = canvas.width
      height = canvas.height
    }
    window.addEventListener('resize', handleResize)

    const ripples = []
    const fireflies = []
    const fireflyCount = Math.max(25, Math.floor(width / 35))

    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        hue: 130 + Math.random() * 80,
        phase: Math.random() * Math.PI * 2
      })
    }

    let running = true

    const loop = () => {
      if (!running) return
      ctx.fillStyle = 'rgba(4, 10, 24, 0.2)'
      ctx.fillRect(0, 0, width, height)

      // Add ripple on mouse drag or movement
      if (mousePos.current.isDown || (mousePos.current.x > 0 && Math.random() < 0.12)) {
        ripples.push({
          x: mousePos.current.x > 0 ? mousePos.current.x : width / 2,
          y: mousePos.current.y > 0 ? mousePos.current.y : height / 2,
          radius: 3,
          maxRadius: 60 + Math.random() * 50,
          alpha: 0.9,
          color: `hsl(${150 + Math.random() * 70}, 95%, 65%)`
        })
        if (canPlaySound && Math.random() < 0.2) {
          playZenWaterDropSound()
        }
      }

      // Draw Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += 1.6
        r.alpha -= 0.016

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = r.color
        ctx.globalAlpha = r.alpha
        ctx.lineWidth = 2.0
        ctx.stroke()
        ctx.restore()
      }

      // Draw Fireflies
      for (let f of fireflies) {
        f.phase += 0.045
        f.x += f.vx
        f.y += f.vy
        if (f.x < 0) f.x = width
        if (f.x > width) f.x = 0
        if (f.y < 0) f.y = height
        if (f.y > height) f.y = 0

        const glow = (Math.sin(f.phase) + 1) * 0.5
        ctx.save()
        ctx.beginPath()
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${f.hue}, 100%, 75%, ${0.4 + glow * 0.6})`
        ctx.shadowColor = `hsl(${f.hue}, 100%, 65%)`
        ctx.shadowBlur = 14 * glow
        ctx.fill()
        ctx.restore()
      }

      animFrameId.current = requestAnimationFrame(loop)
    }

    loop()

    return () => {
      running = false
      window.removeEventListener('resize', handleResize)
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    }
  }, [isExpanded, activeGame, widgetSound, soundEnabled])

  // Mouse & Touch move handlers for canvas
  const updatePointer = (clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mousePos.current.x = clientX - rect.left
    mousePos.current.y = clientY - rect.top
  }

  const handleCanvasMouseMove = (e) => {
    updatePointer(e.clientX, e.clientY)
  }

  const handleCanvasMouseDown = (e) => {
    mousePos.current.isDown = true
    updatePointer(e.clientX, e.clientY)
  }

  const handleCanvasMouseUp = () => {
    mousePos.current.isDown = false
  }

  const handleCanvasTouchMove = (e) => {
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleCanvasTouchStart = (e) => {
    mousePos.current.isDown = true
    if (e.touches.length > 0) {
      updatePointer(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const handleCanvasTouchEnd = () => {
    mousePos.current.isDown = false
  }

  // Handle Bubble Wrap Cell Click
  const handlePopCell = (index) => {
    if (wrapCells[index]) return // already popped

    const newCells = [...wrapCells]
    newCells[index] = true
    setWrapCells(newCells)
    setPopScore(prev => prev + 1)

    if (canPlaySound) playBubbleWrapSound()

    // If all popped, auto-regenerate after brief celebration
    if (newCells.every(c => c === true)) {
      setTimeout(() => {
        setWrapCells(Array(60).fill(false))
      }, 700)
    }
  }

  return (
    <>
      {/* FULL-PAGE EXPANDED GAME ARENA MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="stress-fullscreen-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsExpanded(false)
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`stress-game-modal ${isFullscreen ? 'is-fullscreen' : ''}`}
            >
              {/* Modal Top Bar */}
              <div className="stress-modal-header">
                <div className="stress-header-left">
                  <div className="stress-header-badge">
                    <Gamepad2 size={20} className="text-cyan-400" />
                    <span>PHÒNG XẢ STRESS // MINIGAMES STUDIO</span>
                  </div>
                  <span className="stress-score-pill">✨ {popScore} POPS</span>
                </div>

                <div className="stress-header-actions">
                  <button
                    type="button"
                    className="stress-tool-btn"
                    onClick={() => setWidgetSound(!widgetSound)}
                    title={widgetSound ? 'Tắt âm thanh hiệu ứng' : 'Bật âm thanh'}
                  >
                    {widgetSound ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} />}
                    <span>{widgetSound ? 'ÂM THANH: BẬT' : 'ÂM THANH: TẮT'}</span>
                  </button>

                  <button
                    type="button"
                    className="stress-tool-btn"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={isFullscreen ? 'Thu nhỏ giao diện' : 'Mở rộng toàn màn hình'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    <span>{isFullscreen ? 'THU NHỎ' : 'TOÀN MÀN HÌNH'}</span>
                  </button>

                  <button
                    type="button"
                    className="stress-tool-btn close-btn"
                    onClick={() => setIsExpanded(false)}
                    title="Đóng phòng xả stress (ESC)"
                  >
                    <X size={16} />
                    <span>ĐÓNG [ESC]</span>
                  </button>
                </div>
              </div>

              {/* Game Selector Tabs */}
              <div className="stress-tab-bar">
                <button
                  type="button"
                  className={`stress-tab-btn ${activeGame === 'bubbles' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGame('bubbles')
                    if (canPlaySound) playKeyClick()
                  }}
                >
                  <span>🫧 1. Bong Bóng Xà Phòng</span>
                </button>

                <button
                  type="button"
                  className={`stress-tab-btn ${activeGame === 'beads' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGame('beads')
                    if (canPlaySound) playKeyClick()
                  }}
                >
                  <span>🌌 2. Hạt Thiên Hà Từ Tính</span>
                </button>

                <button
                  type="button"
                  className={`stress-tab-btn ${activeGame === 'wrap' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGame('wrap')
                    if (canPlaySound) playKeyClick()
                  }}
                >
                  <span>🔘 3. Bóp Nổ Bubble Wrap</span>
                </button>

                <button
                  type="button"
                  className={`stress-tab-btn ${activeGame === 'zen' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveGame('zen')
                    if (canPlaySound) playKeyClick()
                  }}
                >
                  <span>🌸 4. Cát & Sóng Nước Thiền</span>
                </button>
              </div>

              {/* Game Arena Body */}
              <div className="stress-arena-body">
                {activeGame !== 'wrap' ? (
                  <canvas
                    ref={canvasRef}
                    className="stress-physics-canvas"
                    onMouseMove={handleCanvasMouseMove}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseUp={handleCanvasMouseUp}
                    onTouchMove={handleCanvasTouchMove}
                    onTouchStart={handleCanvasTouchStart}
                    onTouchEnd={handleCanvasTouchEnd}
                    onMouseLeave={() => {
                      mousePos.current.x = -100
                      mousePos.current.y = -100
                      mousePos.current.isDown = false
                    }}
                  />
                ) : (
                  /* Bubble Wrap Grid */
                  <div className="bubble-wrap-container">
                    <div className="bubble-wrap-matrix">
                      {wrapCells.map((isPopped, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`bubble-wrap-cell ${isPopped ? 'popped' : ''}`}
                          onClick={() => handlePopCell(idx)}
                          onMouseEnter={(e) => {
                            if (e.buttons === 1) handlePopCell(idx) // drag to pop
                          }}
                          onTouchStart={() => handlePopCell(idx)}
                        >
                          <span className="bubble-shine"></span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Arena Footer Info & Quick Reset */}
              <div className="stress-modal-footer">
                <div className="stress-footer-hint">
                  <Info size={14} className="text-cyan-400" />
                  <span>
                    {activeGame === 'bubbles' && <><strong>Mẹo:</strong> Rê chuột / lướt ngón tay qua các quả bóng để nổ bọt nước 7 màu sống động.</>}
                    {activeGame === 'beads' && <><strong>Mẹo:</strong> Rê chuột để hút các hạt từ tính, bấm giữ chuột để kích hoạt sóng xung kích đẩy ra ngoài.</>}
                    {activeGame === 'wrap' && <><strong>Mẹo:</strong> Bấm hoặc nhấn giữ kéo chuột qua các túi khí để bóp nổ hàng loạt cực đã tai.</>}
                    {activeGame === 'zen' && <><strong>Mẹo:</strong> Lướt nhẹ chuột / ngón tay để tạo sóng nước gợn êm dịu và thu hút đom đóm phát sáng.</>}
                  </span>
                </div>

                <div className="stress-footer-actions">
                  {activeGame === 'wrap' && (
                    <button
                      type="button"
                      className="reset-mini-btn"
                      onClick={() => {
                        setWrapCells(Array(60).fill(false))
                        if (canPlaySound) playBubbleWrapSound()
                      }}
                    >
                      <RotateCcw size={14} />
                      <span>BƠM LẠI TÚI KHÍ</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
