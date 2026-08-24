import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, Sparkles, Eye, Zap, Wind, X } from 'lucide-react'

export default function DynamicEnvironment({ mood = 'calm', onManualMoodSelect = null }) {
  const canvasRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [vignetteEnabled, setVignetteEnabled] = useState(() => localStorage.getItem('mr-env-vignette') !== 'false')
  const [particlesEnabled, setParticlesEnabled] = useState(() => localStorage.getItem('mr-env-particles') !== 'false')
  const [noiseEnabled, setNoiseEnabled] = useState(() => localStorage.getItem('mr-env-noise') !== 'false')
  const [intensity, setIntensity] = useState(() => {
    const saved = localStorage.getItem('mr-env-intensity')
    return saved ? parseInt(saved, 10) : 80
  })

  // Normalize mood to 4 core archetypes
  const normalizedMood = (() => {
    if (mood === 'joy') return 'joy'
    if (mood === 'melancholy') return 'melancholy'
    if (mood === 'anger' || mood === 'breach') return 'anger'
    if (mood === 'relaxed' || mood === 'calm') return 'relaxed'
    if (mood === 'friction') return 'melancholy'
    return 'relaxed'
  })()

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('mr-env-vignette', vignetteEnabled)
    localStorage.setItem('mr-env-particles', particlesEnabled)
    localStorage.setItem('mr-env-noise', noiseEnabled)
    localStorage.setItem('mr-env-intensity', intensity)
  }, [vignetteEnabled, particlesEnabled, noiseEnabled, intensity])

  // Canvas particle / atmospheric animation loop
  useEffect(() => {
    if (!particlesEnabled) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Optimized particle pool setup based on mood
    const particleCount = Math.round((normalizedMood === 'anger' ? 32 : normalizedMood === 'joy' ? 36 : 24) * (intensity / 100))
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(width, height, normalizedMood))
    }

    function createParticle(w, h, currentMood) {
      if (currentMood === 'joy') {
        // Sparkling rising dust motes & starlets
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2.5 + 0.8,
          speedY: -(Math.random() * 0.6 + 0.2),
          speedX: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * 0.04 + 0.02,
          color: Math.random() > 0.4 ? '#00f0ff' : '#fbbf24'
        }
      } else if (currentMood === 'melancholy') {
        // Falling gentle digital rain lines
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          length: Math.random() * 14 + 6,
          speedY: Math.random() * 3 + 1.5,
          speedX: (Math.random() - 0.5) * 0.2,
          alpha: Math.random() * 0.35 + 0.1,
          color: Math.random() > 0.5 ? '#60a5fa' : '#818cf8'
        }
      } else if (currentMood === 'anger') {
        // Fast electric spark embers & micro glitches
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2.5 + 1.2,
          speedX: (Math.random() - 0.5) * 2,
          speedY: -(Math.random() * 1.8 + 0.6),
          alpha: Math.random() * 0.75 + 0.2,
          life: Math.random() * 40 + 20,
          color: Math.random() > 0.4 ? '#ef4444' : '#f97316'
        }
      } else {
        // Relaxed - floating zen mist orbs
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2.2 + 0.6,
          speedX: (Math.random() - 0.5) * 0.25,
          speedY: (Math.random() - 0.5) * 0.25,
          alpha: Math.random() * 0.4 + 0.1,
          color: Math.random() > 0.5 ? '#10b981' : '#06b6d4'
        }
      }
    }

    let lastRenderTime = 0
    const targetFpsInterval = 1000 / 30 // 30 FPS cap for background ambient particles

    const render = (currentTime = 0) => {
      animationFrameId = requestAnimationFrame(render)
      if (document.hidden) return

      const elapsed = currentTime - lastRenderTime
      if (elapsed < targetFpsInterval) return
      lastRenderTime = currentTime - (elapsed % targetFpsInterval)

      ctx.clearRect(0, 0, width, height)

      // Draw particles (Optimized without shadowBlur / save-restore overhead)
      const currentIntensity = intensity / 100

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.globalAlpha = p.alpha * currentIntensity

        if (normalizedMood === 'melancholy') {
          // Digital rain streak
          ctx.strokeStyle = p.color
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.speedX * 2, p.y + p.length)
          ctx.stroke()

          p.y += p.speedY
          p.x += p.speedX
          if (p.y > height) {
            p.y = -20
            p.x = Math.random() * width
          }
        } else if (normalizedMood === 'anger') {
          // Fiery electric sparks
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()

          p.x += p.speedX + (Math.random() - 0.5) * 1.5
          p.y += p.speedY
          p.life--
          if (p.life <= 0 || p.y < -10) {
            particles[i] = createParticle(width, height, 'anger')
          }
        } else {
          // Joy & Relaxed orbs
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()

          p.x += p.speedX
          p.y += p.speedY

          if (p.x < 0) p.x = width
          if (p.x > width) p.x = 0
          if (p.y < 0) p.y = height
          if (p.y > height) p.y = 0
        }
      }
    }

    render(performance.now())

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [normalizedMood, particlesEnabled, intensity])

  // Perimeter vignette glow style computation
  const vignetteConfig = {
    joy: {
      shadow: `inset 0 0 ${Math.round(90 * (intensity / 100))}px rgba(0, 240, 255, 0.22), inset 0 0 ${Math.round(180 * (intensity / 100))}px rgba(251, 191, 36, 0.12)`,
      border: '1px solid rgba(0, 240, 255, 0.25)'
    },
    melancholy: {
      shadow: `inset 0 0 ${Math.round(110 * (intensity / 100))}px rgba(15, 23, 42, 0.85), inset 0 0 ${Math.round(170 * (intensity / 100))}px rgba(96, 165, 250, 0.2)`,
      border: '1px solid rgba(96, 165, 250, 0.2)'
    },
    anger: {
      shadow: `inset 0 0 ${Math.round(100 * (intensity / 100))}px rgba(239, 68, 68, 0.35), inset 0 0 ${Math.round(190 * (intensity / 100))}px rgba(185, 28, 28, 0.25)`,
      border: '1px solid rgba(239, 68, 68, 0.4)'
    },
    relaxed: {
      shadow: `inset 0 0 ${Math.round(80 * (intensity / 100))}px rgba(16, 185, 129, 0.2), inset 0 0 ${Math.round(160 * (intensity / 100))}px rgba(6, 182, 212, 0.12)`,
      border: '1px solid rgba(16, 185, 129, 0.2)'
    }
  }

  const currentVignette = vignetteConfig[normalizedMood] || vignetteConfig.relaxed

  useEffect(() => {
    const handleOpenFx = () => setIsOpen(true)
    window.addEventListener('open-dynamic-fx', handleOpenFx)
    return () => window.removeEventListener('open-dynamic-fx', handleOpenFx)
  }, [])

  return (
    <>
      {/* 1. Fullscreen Ambient Perimeter Glow Vignette */}
      {vignetteEnabled && (
        <div 
          className={`ambient-screen-vignette mood-${normalizedMood}`}
          style={{
            boxShadow: currentVignette.shadow,
            border: currentVignette.border,
            opacity: intensity / 100
          }}
        />
      )}

      {/* 2. Fullscreen Atmospheric Particle Canvas */}
      {particlesEnabled && (
        <canvas
          ref={canvasRef}
          className="atmospheric-fx-canvas"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        />
      )}

      {/* 3. CRT Scanline & Grain Noise Overlay if enabled */}
      {noiseEnabled && (
        <div 
          className={`atmospheric-noise-overlay ${normalizedMood === 'anger' ? 'glitch-flicker' : ''}`}
          style={{ opacity: normalizedMood === 'anger' ? 0.3 : 0.15 }}
        />
      )}

      {/* 4. Floating Dynamic Environment Quick Settings Widget */}
      <div className={`env-floating-control-container ${isOpen ? 'is-open' : ''}`}>
        <button
          type="button"
          className={`env-hud-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title="Môi Trường Động & Hiệu Ứng Khí Quyển (Dynamic FX)"
        >
          <Sparkles size={16} className="text-cyan-400" />
          <span className="env-btn-label">DYNAMIC FX</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2 }}
              className="env-settings-popup"
            >
              <div className="env-popup-header">
                <div className="flex items-center gap-2">
                  <Sliders size={16} className="text-cyan-400" />
                  <span className="font-mono text-xs font-bold tracking-wider">CÀI ĐẶT MÔI TRƯỜNG ĐỘNG</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="close-popup-btn"
                  title="Đóng"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Mood Preview Selector */}
              <div className="env-mood-selector-row">
                <span className="text-[11px] font-mono text-gray-400 block mb-1.5">Xem trước môi trường tâm trạng:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'joy', label: '✨ Vui', color: '#00f0ff' },
                    { id: 'melancholy', label: '💧 Buồn', color: '#60a5fa' },
                    { id: 'anger', label: '🔥 Giận', color: '#ef4444' },
                    { id: 'relaxed', label: '🌿 Thư giãn', color: '#10b981' }
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onManualMoodSelect && onManualMoodSelect(m.id)}
                      className={`mood-preview-pill ${normalizedMood === m.id ? 'active' : ''}`}
                      style={{ borderColor: normalizedMood === m.id ? m.color : 'rgba(255,255,255,0.1)' }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FX Toggles */}
              <div className="env-toggles-list">
                {/* Vignette Glow Toggle */}
                <div className="env-toggle-item">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-cyan-400" />
                    <div>
                      <span className="toggle-title">Viền Sáng Màn Hình (Vignette)</span>
                      <span className="toggle-desc">Tỏa hào quang màu sắc 4 góc màn hình</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={vignetteEnabled}
                    onChange={(e) => setVignetteEnabled(e.target.checked)}
                    className="env-checkbox"
                  />
                </div>

                {/* Atmospheric Particles Toggle */}
                <div className="env-toggle-item">
                  <div className="flex items-center gap-2">
                    <Wind size={14} className="text-emerald-400" />
                    <div>
                      <span className="toggle-title">Hạt Khí Quyển (Atmospheric FX)</span>
                      <span className="toggle-desc">Bụi sao, mưa kỹ thuật số, tàn lửa</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={particlesEnabled}
                    onChange={(e) => setParticlesEnabled(e.target.checked)}
                    className="env-checkbox"
                  />
                </div>

                {/* Scanline / Grain Noise Toggle */}
                <div className="env-toggle-item">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <div>
                      <span className="toggle-title">Nhiễu Quét CRT & Glitch</span>
                      <span className="toggle-desc">Hiệu ứng quét vi xử lý cyberpunk</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={noiseEnabled}
                    onChange={(e) => setNoiseEnabled(e.target.checked)}
                    className="env-checkbox"
                  />
                </div>
              </div>

              {/* Intensity Slider */}
              <div className="env-intensity-slider-box">
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-gray-300">CƯỜNG ĐỘ HIỆU ỨNG:</span>
                  <span className="text-cyan-400 font-bold">{intensity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                  className="env-range-slider"
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
