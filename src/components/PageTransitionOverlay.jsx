import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { playTransitionSound } from '../utils/pageTransitions.js'

export default function PageTransitionOverlay({ soundEnabled = true, activeTransition = 'book-flip' }) {
  const [transitionState, setTransitionState] = useState({
    active: false,
    type: 'book-flip',
    phase: 'enter' // 'enter' -> 'peak' -> 'exit'
  })
  
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const handleTrigger = (e) => {
      const type = e.detail?.type || activeTransition || 'fade-fast'
      const duration = e.detail?.duration ?? (type === 'instant' ? 0 : type === 'fade-fast' ? 180 : 320)

      if (type === 'instant' || type === 'none') {
        if (typeof e.detail?.onPeak === 'function') {
          e.detail.onPeak()
        }
        if (typeof e.detail?.onComplete === 'function') {
          e.detail.onComplete()
        }
        return
      }

      if (soundEnabled) {
        playTransitionSound(type)
      }

      setTransitionState({ active: true, type, phase: 'enter' })

      const peakTimer = setTimeout(() => {
        setTransitionState(prev => ({ ...prev, phase: 'peak' }))
        if (typeof e.detail?.onPeak === 'function') {
          e.detail.onPeak()
        }
      }, Math.max(10, duration * 0.35))

      const exitTimer = setTimeout(() => {
        setTransitionState(prev => ({ ...prev, phase: 'exit' }))
      }, Math.max(20, duration * 0.65))

      const endTimer = setTimeout(() => {
        setTransitionState({ active: false, type, phase: 'enter' })
        if (typeof e.detail?.onComplete === 'function') {
          e.detail.onComplete()
        }
      }, duration)

      return () => {
        clearTimeout(peakTimer)
        clearTimeout(exitTimer)
        clearTimeout(endTimer)
      }
    }

    window.addEventListener('trigger-page-transition', handleTrigger)
    return () => window.removeEventListener('trigger-page-transition', handleTrigger)
  }, [soundEnabled, activeTransition])

  // High-Performance Canvas liquid ripple generator for water-ripple transition (Zero CPU ShadowBlur)
  useEffect(() => {
    if (!transitionState.active || transitionState.type !== 'water-ripple') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = (canvas.width = window.innerWidth)
    let h = (canvas.height = window.innerHeight)
    const centerX = w / 2
    const centerY = h / 2

    const ripples = [
      { r: 10, maxR: Math.max(w, h) * 0.8, speed: 28, alpha: 0.8, color: '#38bdf8' },
      { r: 0, maxR: Math.max(w, h) * 0.7, speed: 24, alpha: 0.6, color: '#00f0ff' },
      { r: 0, maxR: Math.max(w, h) * 0.9, speed: 32, alpha: 0.7, color: '#10b981' }
    ]

    let startTime = performance.now()
    const render = (time) => {
      const elapsed = time - startTime
      ctx.clearRect(0, 0, w, h)

      ripples.forEach((rip, idx) => {
        if (elapsed > idx * 90) {
          rip.r += rip.speed
          const progress = rip.r / rip.maxR
          const currentAlpha = Math.max(0, (1 - progress) * rip.alpha)

          // Draw concentric water wavefront ring (Fast stroke without software shadowBlur)
          ctx.save()
          ctx.beginPath()
          ctx.arc(centerX, centerY, rip.r, 0, Math.PI * 2)
          ctx.strokeStyle = rip.color
          ctx.lineWidth = 6 * (1 - progress * 0.5)
          ctx.globalAlpha = currentAlpha
          ctx.stroke()

          // Secondary ambient glow ring
          ctx.beginPath()
          ctx.arc(centerX, centerY, Math.max(0, rip.r - 8), 0, Math.PI * 2)
          ctx.lineWidth = 14 * (1 - progress * 0.5)
          ctx.globalAlpha = currentAlpha * 0.3
          ctx.stroke()
          ctx.restore()
        }
      })

      if (transitionState.active) {
        animRef.current = requestAnimationFrame(render)
      }
    }

    animRef.current = requestAnimationFrame(render)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [transitionState.active, transitionState.type])

  if (!transitionState.active) return null

  return (
    <div className="page-transition-overlay-root">
      {/* 0. FAST GPU FADE (ULTRA SMOOTH 60FPS) */}
      {transitionState.type === 'fade-fast' && (
        <motion.div
          className="transition-fast-fade-stage"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'radial-gradient(circle at center, rgba(2,6,18,0.75) 0%, rgba(2,6,18,0.92) 100%)',
            pointerEvents: 'none',
            zIndex: 99999,
            willChange: 'opacity',
            transform: 'translateZ(0)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
        />
      )}

      {/* 1. BOOK PAGE FLIP 3D */}
      {transitionState.type === 'book-flip' && (
        <div className="transition-book-stage">
          <div className="book-spine-line" />
          <motion.div
            className="book-page-leaf book-page-left"
            initial={{ rotateY: 0, skewY: 0 }}
            animate={{ rotateY: -75, skewY: -3, opacity: [1, 0.9, 0.4] }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="page-paper-texture">
              <div className="page-hologram-seal">✦ MR-CORE ARCHIVE ✦</div>
              <div className="page-glow-spine-shadow right-shadow" />
            </div>
          </motion.div>

          <motion.div
            className="book-page-leaf book-page-right"
            initial={{ rotateY: 75, skewY: 3, opacity: 0.4 }}
            animate={{ rotateY: 0, skewY: 0, opacity: 1 }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="page-paper-texture">
              <div className="page-hologram-seal">✦ TURNING TIMELINE ✦</div>
              <div className="page-glow-spine-shadow left-shadow" />
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. WATER RIPPLE LIQUID DISTORTION */}
      {transitionState.type === 'water-ripple' && (
        <div className="transition-water-stage">
          <canvas ref={canvasRef} className="water-ripple-canvas" />
          <motion.div
            className="water-wave-wash"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 0.5, 0.7, 0], scale: [0.6, 1.1, 1.5, 1.9] }}
            transition={{ duration: 0.52, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* 3. QUANTUM GLASS SHATTER */}
      {transitionState.type === 'glass-shatter' && (
        <div className="transition-glass-stage">
          {/* 14 GPU-accelerated lightweight shards */}
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2
            const distance = 160 + (i % 4) * 60
            const xOffset = Math.cos(angle) * distance
            const yOffset = Math.sin(angle) * distance
            const rotZ = (i * 45) % 360

            return (
              <motion.div
                key={i}
                className="glass-fracture-shard"
                style={{
                  clipPath: `polygon(${20 + (i * 7) % 50}% 0%, 100% ${30 + (i * 11) % 40}%, ${50 + (i * 13) % 35}% 100%, 0% ${70 - (i * 5) % 35}%)`,
                  left: `calc(50% + ${(i % 5 - 2) * 14}%)`,
                  top: `calc(50% + ${(Math.floor(i / 5) - 1) * 16}%)`
                }}
                initial={{ x: 0, y: 0, rotateZ: 0, scale: 1, opacity: 0.95 }}
                animate={{
                  x: xOffset,
                  y: yOffset,
                  rotateZ: rotZ,
                  scale: [1, 1.1, 0.3],
                  opacity: [0.95, 0.7, 0]
                }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              />
            )
          })}
          <motion.div 
            className="glass-shockwave-pulse"
            initial={{ scale: 0.2, opacity: 0.9 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        </div>
      )}

      {/* 4. QUANTUM WARP VORTEX */}
      {transitionState.type === 'quantum-warp' && (
        <div className="transition-warp-stage">
          <motion.div
            className="warp-tunnel-vortex"
            initial={{ scale: 0.2, rotate: 0, opacity: 0.3 }}
            animate={{ scale: [0.2, 1.6, 3.2], rotate: 180, opacity: [0.3, 0.85, 0] }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          />
          <div className="warp-starburst">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="warp-streak-line"
                style={{ transform: `rotate(${i * 30}deg)` }}
                initial={{ scaleY: 0.1, opacity: 0 }}
                animate={{ scaleY: [0.1, 1.4, 0.2], opacity: [0, 0.9, 0] }}
                transition={{ duration: 0.42, delay: i * 0.01 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. CYBER SHUTTER & GLITCH BLINDS */}
      {transitionState.type === 'cyber-glitch' && (
        <div className="transition-cyber-stage">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="cyber-shutter-blade"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: [0, 1, 1, 0] }}
              transition={{
                duration: 0.46,
                times: [0, 0.35, 0.65, 1],
                delay: (i % 2 === 0 ? i * 0.015 : (8 - i) * 0.015),
                ease: 'easeInOut'
              }}
            >
              <div className="cyber-blade-laser" />
            </motion.div>
          ))}
          <div className="cyber-chromatic-flash" />
        </div>
      )}
    </div>
  )
}
