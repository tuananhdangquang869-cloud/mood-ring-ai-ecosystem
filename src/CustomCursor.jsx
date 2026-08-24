import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { playBubblePop, playWaterDrop } from './utils/audioSynth.js'

/**
 * Enhanced Custom Cursor Engine with 5 Visual Styles
 * Modes:
 * 1. 'classic': Cyberpunk Dual Glowing Rings with Mood Aura
 * 2. 'comet': Stardust Starbursts & Shimmering Comet Tail
 * 3. 'water': Liquid Droplet with Aquatic Surface Ripples
 * 4. 'neon': Fluid Laser Ribbon with Chromatic Neon Trail
 * 5. 'bubbles': Iridescent Floating Soap Bubbles with Pop Bursts
 */
export default function CustomCursor({
  mood = 'calm',
  nativeCursor = false,
  cursorStyle = 'classic', // 'classic' | 'comet' | 'water' | 'neon' | 'bubbles'
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)
  const [isOnCanvas, setIsOnCanvas] = useState(false)

  const canvasRef = useRef(null)
  const mousePosRef = useRef({ x: -100, y: -100, prevX: -100, prevY: -100, speed: 0 })
  const particlesRef = useRef([])
  const ripplesRef = useRef([])
  const trailPointsRef = useRef([])
  const bubblesRef = useRef([])

  // Touch & Mobile check: never render custom cursor on mobile or touch devices
  const isTouchDevice = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.innerWidth < 768
  )

  if (nativeCursor || isTouchDevice) return null

  // Motion values for smooth animation
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  // Spring settings for the outer ring trailing effect
  const springConfig = { damping: 24, stiffness: 240, mass: 0.4 }
  const ringX = useSpring(mouseX, springConfig)
  const ringY = useSpring(mouseY, springConfig)

  // Mood color helper
  const getMoodColor = () => {
    switch (mood) {
      case 'electric':
      case 'friction':
      case 'joy':
        return { hex: '#ffb703', rgb: '255, 183, 3' }
      case 'rage':
      case 'breach':
        return { hex: '#ef4444', rgb: '239, 68, 68' }
      case 'melancholy':
        return { hex: '#a855f7', rgb: '168, 85, 247' }
      case 'euphoria':
      case 'relaxed':
        return { hex: '#10b981', rgb: '16, 185, 129' }
      case 'void':
        return { hex: '#94a3b8', rgb: '148, 163, 184' }
      case 'calm':
      default:
        return { hex: '#00f0ff', rgb: '0, 240, 255' }
    }
  }

  const [isKeyMouseActive, setIsKeyMouseActive] = useState(false)
  const keyStateRef = useRef({ up: false, down: false, left: false, right: false, shift: false, ctrl: false })

  // 1. Unified Mouse, Touch & Virtual Keyboard Tracking
  useEffect(() => {
    let lastTime = performance.now()

    const updatePosition = (clientX, clientY) => {
      const now = performance.now()
      const dt = Math.max(1, now - lastTime)
      lastTime = now

      const dx = clientX - mousePosRef.current.x
      const dy = clientY - mousePosRef.current.y
      const speed = Math.sqrt(dx * dx + dy * dy) / dt

      mousePosRef.current.prevX = mousePosRef.current.x
      mousePosRef.current.prevY = mousePosRef.current.y
      mousePosRef.current.x = clientX
      mousePosRef.current.y = clientY
      mousePosRef.current.speed = speed

      mouseX.set(clientX)
      mouseY.set(clientY)

      if (!isVisible) setIsVisible(true)

      // Emit particles based on active cursor style
      if (cursorStyle === 'comet') {
        const count = Math.min(4, Math.floor(speed * 3) + 1)
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x: clientX + (Math.random() - 0.5) * 8,
            y: clientY + (Math.random() - 0.5) * 8,
            vx: -dx * 0.15 + (Math.random() - 0.5) * 1.5,
            vy: -dy * 0.15 + (Math.random() - 0.5) * 1.5,
            size: 2 + Math.random() * 3.5,
            alpha: 1,
            decay: 0.02 + Math.random() * 0.03,
            color: Math.random() > 0.4 ? '#fef08a' : getMoodColor().hex,
            sparkle: Math.random() * Math.PI * 2,
          })
        }
      } else if (cursorStyle === 'water') {
        if (Math.random() > 0.65 || speed > 1.2) {
          ripplesRef.current.push({
            x: clientX,
            y: clientY,
            radius: 4,
            maxRadius: 28 + speed * 12,
            alpha: 0.6,
            decay: 0.025,
          })
        }
      } else if (cursorStyle === 'neon') {
        trailPointsRef.current.push({
          x: clientX,
          y: clientY,
          time: now,
          width: Math.max(3, 8 - speed * 1.5),
        })
        if (trailPointsRef.current.length > 24) {
          trailPointsRef.current.shift()
        }
      } else if (cursorStyle === 'bubbles') {
        if (Math.random() > 0.75 || speed > 1.5) {
          bubblesRef.current.push({
            x: clientX + (Math.random() - 0.5) * 16,
            y: clientY + (Math.random() - 0.5) * 16,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.8 - Math.random() * 1.2,
            size: 6 + Math.random() * 14,
            alpha: 0.85,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.08 + Math.random() * 0.06,
            hueShift: Math.random() * 360,
          })
        }
      }
    }

    const handleMouseMove = (e) => {
      updatePosition(e.clientX, e.clientY)
    }

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const triggerClickAt = (cx, cy) => {
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 200)

      if (cursorStyle === 'water') {
        playWaterDrop()
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            ripplesRef.current.push({
              x: cx,
              y: cy,
              radius: 6 + i * 8,
              maxRadius: 55 + i * 18,
              alpha: 0.85 - i * 0.2,
              decay: 0.02,
            })
          }, i * 70)
        }
      } else if (cursorStyle === 'bubbles') {
        playBubblePop()
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3
          const spd = 2 + Math.random() * 4
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: 2 + Math.random() * 3,
            alpha: 1,
            decay: 0.04,
            color: '#a7f3d0',
          })
        }
      } else if (cursorStyle === 'comet') {
        for (let i = 0; i < 20; i++) {
          const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.4
          const spd = 3 + Math.random() * 6
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            size: 2.5 + Math.random() * 4,
            alpha: 1,
            decay: 0.03,
            color: Math.random() > 0.3 ? '#fbbf24' : getMoodColor().hex,
            sparkle: Math.random() * Math.PI * 2,
          })
        }
      }
    }

    const handleMouseDown = (e) => {
      triggerClickAt(e.clientX, e.clientY)
    }

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY)
        triggerClickAt(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleMouseUp = () => setIsClicked(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    // Dynamic interactive element hover detection
    const handleMouseOver = (e) => {
      const target = e.target
      if (!target) return

      if (target.closest && (target.closest('.emotion-canvas-board') || target.closest('.canvas-board-viewport'))) {
        setIsOnCanvas(true)
        setIsHovered(false)
        return
      } else {
        setIsOnCanvas(false)
      }

      const isInteractive = Boolean(
        (target.matches &&
          target.matches(
            'button, a, input, textarea, select, [role="button"], .interactive, .dock-btn, .node-card, .gallery-card, .tab-btn, .theme-dot, .hub-action-btn, .settings-nav-btn, .cursor-preview-card'
          )) ||
          (target.closest &&
            target.closest(
              'button, a, .interactive, .dock-btn, .node-card, .gallery-card, .tab-btn, .theme-dot, .hub-action-btn, .settings-nav-btn, .cursor-preview-card'
            ))
      )

      setIsHovered(isInteractive)
    }

    const handleMouseOut = () => {
      setIsHovered(false)
      setIsOnCanvas(false)
    }

    // ─── Virtual Keyboard Mouse Animation Loop ─────────────────────────────
    let keyMouseRaf = null
    const runKeyMouseLoop = () => {
      if (isKeyMouseActive) {
        let vx = 0
        let vy = 0
        const baseSpeed = keyStateRef.current.shift ? 16 : keyStateRef.current.ctrl ? 2.5 : 8

        if (keyStateRef.current.up) vy -= baseSpeed
        if (keyStateRef.current.down) vy += baseSpeed
        if (keyStateRef.current.left) vx -= baseSpeed
        if (keyStateRef.current.right) vx += baseSpeed

        if (vx !== 0 || vy !== 0) {
          const curX = mousePosRef.current.x < 0 ? window.innerWidth / 2 : mousePosRef.current.x
          const curY = mousePosRef.current.y < 0 ? window.innerHeight / 2 : mousePosRef.current.y
          const nextX = Math.max(10, Math.min(window.innerWidth - 10, curX + vx))
          const nextY = Math.max(10, Math.min(window.innerHeight - 10, curY + vy))
          updatePosition(nextX, nextY)

          const underEl = document.elementFromPoint(nextX, nextY)
          if (underEl) {
            const isInteractive = Boolean(
              underEl.matches?.('button, a, input, textarea, select, [role="button"], .interactive, .dock-btn, .node-card, .gallery-card, .tab-btn') ||
              underEl.closest?.('button, a, .interactive, .dock-btn, .node-card, .gallery-card, .tab-btn')
            )
            setIsHovered(isInteractive)
          }
        }
      }
      keyMouseRaf = requestAnimationFrame(runKeyMouseLoop)
    }
    keyMouseRaf = requestAnimationFrame(runKeyMouseLoop)

    // Keyboard Mouse Event Handlers
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault()
        setIsKeyMouseActive(prev => {
          const next = !prev
          if (next && mousePosRef.current.x < 0) {
            updatePosition(window.innerWidth / 2, window.innerHeight / 2)
          }
          return next
        })
        return
      }

      if (!isKeyMouseActive) return

      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (isInput && !e.altKey) return

      let handled = false
      if (e.key === 'ArrowUp' || e.key === 'i' || e.key === 'I') { keyStateRef.current.up = true; handled = true; }
      if (e.key === 'ArrowDown' || e.key === 'k' || e.key === 'K') { keyStateRef.current.down = true; handled = true; }
      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') { keyStateRef.current.left = true; handled = true; }
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') { keyStateRef.current.right = true; handled = true; }
      if (e.key === 'Shift') keyStateRef.current.shift = true
      if (e.key === 'Control') keyStateRef.current.ctrl = true

      if (e.key === 'Enter' || e.key === 'f' || e.key === 'F' || e.code === 'Numpad5') {
        const cx = mousePosRef.current.x
        const cy = mousePosRef.current.y
        triggerClickAt(cx, cy)
        const targetEl = document.elementFromPoint(cx, cy)
        if (targetEl) {
          targetEl.click?.()
          targetEl.focus?.()
        }
        handled = true
      }

      if (handled) e.preventDefault()
    }

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'i' || e.key === 'I') keyStateRef.current.up = false
      if (e.key === 'ArrowDown' || e.key === 'k' || e.key === 'K') keyStateRef.current.down = false
      if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') keyStateRef.current.left = false
      if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') keyStateRef.current.right = false
      if (e.key === 'Shift') keyStateRef.current.shift = false
      if (e.key === 'Control') keyStateRef.current.ctrl = false
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mousedown', handleMouseDown, { passive: true })
    window.addEventListener('mouseup', handleMouseUp, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    window.addEventListener('mouseout', handleMouseOut, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      cancelAnimationFrame(keyMouseRaf)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseover', handleMouseOver)
      window.removeEventListener('mouseout', handleMouseOut)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [cursorStyle, mood, isKeyMouseActive])

  // 2. High-Performance Canvas Particle / Trail Render Loop (60-120fps)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animFrameId
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { hex, rgb } = getMoodColor()

      // A. Render Comet / Click Sparks
      if (particlesRef.current.length > 0) {
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i]
          p.x += p.vx
          p.y += p.vy
          p.alpha -= p.decay
          if (p.sparkle !== undefined) p.sparkle += 0.2

          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 8

          // Draw 4-point star sparkle for comet particles
          const scale = p.sparkle ? (Math.sin(p.sparkle) * 0.3 + 0.8) * p.size : p.size
          ctx.beginPath()
          ctx.arc(p.x, p.y, scale, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // B. Render Water Ripples
      if (ripplesRef.current.length > 0) {
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i]
          r.radius += (r.maxRadius - r.radius) * 0.08 + 0.6
          r.alpha -= r.decay

          if (r.alpha <= 0 || r.radius >= r.maxRadius) {
            ripplesRef.current.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.globalAlpha = Math.max(0, r.alpha)
          ctx.strokeStyle = `rgba(${rgb}, 0.7)`
          ctx.lineWidth = 1.6
          ctx.shadowColor = hex
          ctx.shadowBlur = 6
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }
      }

      // C. Render Neon Laser Ribbon Trail
      if (cursorStyle === 'neon' && trailPointsRef.current.length > 2) {
        ctx.save()
        const pts = trailPointsRef.current
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Multi-pass neon glow
        for (let pass = 0; pass < 2; pass++) {
          ctx.beginPath()
          ctx.moveTo(pts[0].x, pts[0].y)
          for (let i = 1; i < pts.length - 1; i++) {
            const xc = (pts[i].x + pts[i + 1].x) / 2
            const yc = (pts[i].y + pts[i + 1].y) / 2
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc)
          }
          if (pass === 0) {
            // Ambient outer bloom
            ctx.strokeStyle = `rgba(${rgb}, 0.45)`
            ctx.lineWidth = 10
            ctx.shadowColor = hex
            ctx.shadowBlur = 18
            ctx.stroke()
          } else {
            // Bright core laser
            ctx.strokeStyle = '#ffffff'
            ctx.lineWidth = 3
            ctx.shadowColor = hex
            ctx.shadowBlur = 6
            ctx.stroke()
          }
        }
        ctx.restore()
      }

      // D. Render Floating Soap Bubbles
      if (bubblesRef.current.length > 0) {
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
          const b = bubblesRef.current[i]
          b.wobble += b.wobbleSpeed
          b.x += b.vx + Math.sin(b.wobble) * 0.6
          b.y += b.vy
          b.alpha -= 0.008

          if (b.alpha <= 0 || b.y < -50) {
            bubblesRef.current.splice(i, 1)
            continue
          }

          ctx.save()
          ctx.globalAlpha = Math.max(0, b.alpha)

          // Iridescent soap bubble gradient
          const grad = ctx.createRadialGradient(
            b.x - b.size * 0.3,
            b.y - b.size * 0.3,
            b.size * 0.1,
            b.x,
            b.y,
            b.size
          )
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
          grad.addColorStop(0.3, 'rgba(230, 245, 255, 0.4)')
          grad.addColorStop(0.7, 'rgba(255, 192, 203, 0.35)')
          grad.addColorStop(0.9, `rgba(${rgb}, 0.5)`)
          grad.addColorStop(1, 'rgba(168, 85, 247, 0.3)')

          ctx.fillStyle = grad
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
          ctx.lineWidth = 1

          ctx.beginPath()
          ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()

          // Specular light reflection on bubble top-left
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
          ctx.beginPath()
          ctx.arc(b.x - b.size * 0.35, b.y - b.size * 0.35, b.size * 0.22, 0, Math.PI * 2)
          ctx.fill()

          ctx.restore()
        }
      }

      animFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [cursorStyle, mood])

  const { hex, rgb } = getMoodColor()

  // Return DOM container with canvas always mounted so render loop never breaks
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999999,
        opacity: isVisible || isKeyMouseActive ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      {/* High-Performance Canvas for Particle Trails, Ripples, Bubbles & Stars */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* ─── 1. CLASSIC CYBERPUNK RING CURSOR ─────────────────────────── */}
      {cursorStyle === 'classic' && (
        <>
          {/* Ambient Glow Aura */}
          <motion.div
            style={{
              position: 'absolute',
              top: -24,
              left: -24,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${rgb}, 0.38) 0%, rgba(0,0,0,0) 70%)`,
              x: ringX,
              y: ringY,
              pointerEvents: 'none',
            }}
            animate={{
              scale: isOnCanvas ? 0.7 : isHovered ? 2.1 : isClicked ? 0.8 : 1.2,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          />

          {/* Outer Ring */}
          <motion.div
            style={{
              position: 'absolute',
              top: -16,
              left: -16,
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: `1.8px solid ${hex}`,
              boxShadow: `0 0 12px rgba(${rgb}, 0.45)`,
              pointerEvents: 'none',
              boxSizing: 'border-box',
              x: ringX,
              y: ringY,
            }}
            animate={{
              scale: isOnCanvas ? 0.75 : isHovered ? 1.6 : isClicked ? 0.75 : 1,
              opacity: 1,
              rotate: isHovered ? 90 : 0,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
              rotate: { duration: 0.35 },
            }}
          />

          {/* Inner Dot */}
          <motion.div
            style={{
              position: 'absolute',
              top: -3.5,
              left: -3.5,
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: hex,
              boxShadow: `0 0 8px ${hex}`,
              pointerEvents: 'none',
              x: mouseX,
              y: mouseY,
            }}
            animate={{
              scale: isOnCanvas ? 1.4 : isHovered ? 0.4 : isClicked ? 1.8 : 1,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 450, damping: 18 }}
          />
        </>
      )}

      {/* ─── 2. COMET & STARRY CURSOR ──────────────────────────────────── */}
      {cursorStyle === 'comet' && (
        <motion.div
          style={{
            position: 'absolute',
            top: -10,
            left: -10,
            width: 20,
            height: 20,
            pointerEvents: 'none',
            x: mouseX,
            y: mouseY,
          }}
          animate={{
            scale: isHovered ? 1.5 : isClicked ? 0.8 : 1,
            rotate: isHovered ? 45 : 0,
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              filter: `drop-shadow(0 0 8px ${hex})`,
            }}
          >
            ✦
          </div>
        </motion.div>
      )}

      {/* ─── 3. WATER DROPLET CURSOR ──────────────────────────────────── */}
      {cursorStyle === 'water' && (
        <motion.div
          style={{
            position: 'absolute',
            top: -11,
            left: -11,
            width: 22,
            height: 22,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: `radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.95), rgba(${rgb}, 0.6) 60%, rgba(14, 165, 233, 0.8) 100%)`,
            border: '1px solid rgba(255, 255, 255, 0.7)',
            boxShadow: `0 4px 14px rgba(${rgb}, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.8)`,
            pointerEvents: 'none',
            x: mouseX,
            y: mouseY,
          }}
          animate={{
            scale: isHovered ? 1.45 : isClicked ? 0.7 : 1,
            borderRadius: isHovered
              ? '50%'
              : '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 16 }}
        />
      )}

      {/* ─── 4. NEON LASER RIBBON POINTER ─────────────────────────────── */}
      {cursorStyle === 'neon' && (
        <motion.div
          style={{
            position: 'absolute',
            top: -6,
            left: -6,
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: `2px solid ${hex}`,
            boxShadow: `0 0 16px ${hex}, 0 0 30px ${hex}`,
            pointerEvents: 'none',
            x: mouseX,
            y: mouseY,
          }}
          animate={{
            scale: isHovered ? 1.6 : isClicked ? 2.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
        />
      )}

      {/* ─── 5. SOAP BUBBLE POINTER ───────────────────────────────────── */}
      {cursorStyle === 'bubbles' && (
        <motion.div
          style={{
            position: 'absolute',
            top: -14,
            left: -14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85) 0%, rgba(240,249,255,0.4) 40%, rgba(244,114,182,0.3) 70%, rgba(${rgb},0.45) 100%)`,
            border: '1px solid rgba(255, 255, 255, 0.65)',
            boxShadow: `0 0 14px rgba(${rgb}, 0.35), inset 0 2px 5px rgba(255,255,255,0.8)`,
            backdropFilter: 'blur(2px)',
            pointerEvents: 'none',
            x: ringX,
            y: ringY,
          }}
          animate={{
            scale: isHovered ? 1.35 : isClicked ? 0.65 : [1, 1.08, 0.96, 1],
          }}
          transition={{
            scale: {
              duration: isClicked || isHovered ? 0.2 : 2.5,
              repeat: isHovered || isClicked ? 0 : Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Specular Glint */}
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: 6,
              width: 6,
              height: 4,
              borderRadius: '50%',
              background: '#ffffff',
              transform: 'rotate(-30deg)',
              opacity: 0.9,
            }}
          />
        </motion.div>
      )}
      {isKeyMouseActive && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            pointerEvents: 'none',
            background: 'rgba(5, 12, 24, 0.92)',
            border: '1px solid rgba(0, 240, 255, 0.6)',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
            borderRadius: '12px',
            padding: '8px 16px',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>⌨️ CHUỘT PHÍM ĐANG BẬT:</span>
          <span>Di: [I/K/J/L hoặc Mũi Tên]</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
          <span style={{ color: '#fbbf24' }}>Click: [F / Enter]</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>Tắt: [Alt + M]</span>
        </motion.div>
      )}
    </div>
  )
}
