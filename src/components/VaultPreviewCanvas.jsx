import { useEffect, useRef, useState } from 'react'

export default function VaultPreviewCanvas({ 
  previewType = 'hologram', 
  color = '#00f0ff', 
  status = 'UNLOCKED',
  interactiveTilt = true
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Mouse move tilt effect
  const handleMouseMove = (e) => {
    if (!interactiveTilt || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: x * 14, y: -y * 14 })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    let animId = null
    let t = 0

    // Auto-resize canvas to match container's exact bounding box
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      const w = Math.floor(rect.width) || 300
      const h = Math.floor(rect.height) || 160
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }

    updateCanvasSize()

    // ResizeObserver for dynamic reactive resizing
    let resizeObserver = null
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize()
      })
      resizeObserver.observe(container)
    } else {
      window.addEventListener('resize', updateCanvasSize)
    }

    // Particle system inside thumbnail canvas
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: Math.random() * (canvas.height || 200),
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.3
    }))

    const render = () => {
      t += 0.04
      const w = canvas.width || container.clientWidth || 400
      const h = canvas.height || container.clientHeight || 200
      ctx.clearRect(0, 0, w, h)

      // Cyber Grid Background filling full container
      ctx.fillStyle = '#040814'
      ctx.fillRect(0, 0, w, h)

      // Subtle Radial Vignette Gradient
      const radial = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.7)
      radial.addColorStop(0, 'rgba(0, 240, 255, 0.06)')
      radial.addColorStop(0.6, 'rgba(4, 8, 20, 0.4)')
      radial.addColorStop(1, '#020409')
      ctx.fillStyle = radial
      ctx.fillRect(0, 0, w, h)

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 1
      const gridSize = 24
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }

      // Floating Glow Dust Particles across entire full canvas
      particles.forEach((p) => {
        p.x = (p.x + p.vx + w) % w
        p.y = (p.y + p.vy + h) % h
        ctx.fillStyle = color
        ctx.globalAlpha = p.alpha * 0.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1.0

      if (status !== 'UNLOCKED') {
        // Darkened Encrypted Grid
        ctx.fillStyle = 'rgba(2, 6, 15, 0.82)'
        ctx.fillRect(0, 0, w, h)

        // Lock Icon Pulse
        const lockPulse = Math.sin(t * 2) * 3
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(w / 2, h / 2 - 12, 20 + lockPulse * 0.5, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = color
        ctx.font = 'bold 13px "Space Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('🔒 ENCRYPTED DOSSIER', w / 2, h / 2 - 6)

        ctx.font = '10px "Space Mono", monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
        ctx.fillText('CLICK TO DECRYPT / BẺ KHÓA HỒ SƠ', w / 2, h / 2 + 14)

        // Scanline bar animation
        const scanY = (t * 40) % h
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.fillRect(0, scanY, w, 3)

        animId = requestAnimationFrame(render)
        return
      }

      ctx.strokeStyle = color
      ctx.lineWidth = 2

      if (previewType === 'waveform') {
        // Full Width Audio Frequency Waveforms
        ctx.beginPath()
        for (let x = 0; x <= w; x += 4) {
          const y = h / 2 + Math.sin(x * 0.03 + t * 1.5) * (h * 0.28) * Math.cos(t * 0.4 + x * 0.005)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let x = 0; x <= w; x += 5) {
          const y = h / 2 + Math.sin(x * 0.05 - t) * (h * 0.16)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      } else if (previewType === 'matrix') {
        ctx.fillStyle = color
        ctx.font = '11px "Space Mono", monospace'
        ctx.textAlign = 'left'
        const cols = Math.floor(w / 45) + 1
        const rows = Math.floor(h / 26) + 1
        for (let col = 0; col < cols; col++) {
          const x = 16 + col * 45
          for (let row = 0; row < rows; row++) {
            const y = 24 + row * 26
            const alphaVal = 0.2 + (Math.sin(col * 2 + row + t * 2) + 1) * 0.35
            ctx.globalAlpha = Math.max(0.1, Math.min(0.9, alphaVal))
            const hexCode = `0x${Math.floor(Math.abs(Math.sin(t + col + row)) * 255).toString(16).padStart(2, '0').toUpperCase()}`
            ctx.fillText(hexCode, x, y)
          }
        }
        ctx.globalAlpha = 1.0
      } else if (previewType === 'quantum') {
        // Quantum Atomic Center Rings (Scaled to canvas)
        const coreR = Math.min(w, h) * 0.2
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, coreR + Math.sin(t) * 4, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.ellipse(w / 2, h / 2, coreR * 1.8, coreR * 0.65, t * 0.8, 0, Math.PI * 2)
        ctx.stroke()

        ctx.beginPath()
        ctx.ellipse(w / 2, h / 2, coreR * 1.8, coreR * 0.65, -t * 0.8, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Holographic Concentric Pulse expanding to edges
        const maxR = Math.min(w, h) * 0.42
        for (let r = 10; r <= maxR; r += 14) {
          ctx.strokeStyle = color
          ctx.globalAlpha = 0.2 + (r / maxR) * 0.7
          ctx.beginPath()
          ctx.arc(w / 2, h / 2, (r + (t * 10) % 20), 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.globalAlpha = 1.0

        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, 6, 0, Math.PI * 2)
        ctx.fill()
      }

      // Animated Holographic Scanline across entire width
      const scanY = (t * 35) % h
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
      ctx.fillRect(0, scanY, w, 2)

      // Outer Corner Target Reticles on all 4 corners
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      const cornerLen = 12
      // Top-Left
      ctx.beginPath()
      ctx.moveTo(6, 6 + cornerLen); ctx.lineTo(6, 6); ctx.lineTo(6 + cornerLen, 6)
      ctx.stroke()
      // Top-Right
      ctx.beginPath()
      ctx.moveTo(w - 6 - cornerLen, 6); ctx.lineTo(w - 6, 6); ctx.lineTo(w - 6, 6 + cornerLen)
      ctx.stroke()
      // Bottom-Left
      ctx.beginPath()
      ctx.moveTo(6, h - 6 - cornerLen); ctx.lineTo(6, h - 6); ctx.lineTo(6 + cornerLen, h - 6)
      ctx.stroke()
      // Bottom-Right
      ctx.beginPath()
      ctx.moveTo(w - 6 - cornerLen, h - 6); ctx.lineTo(w - 6, h - 6); ctx.lineTo(w - 6, h - 6 - cornerLen)
      ctx.stroke()

      animId = requestAnimationFrame(render)
    }

    render()
    return () => {
      if (animId) cancelAnimationFrame(animId)
      if (resizeObserver) resizeObserver.disconnect()
      else window.removeEventListener('resize', updateCanvasSize)
    }
  }, [previewType, color, status])

  return (
    <div
      ref={containerRef}
      className="vault-preview-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        transform: interactiveTilt ? `perspective(600px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` : 'none',
        transition: isHovered ? 'transform 0.08s ease-out' : 'transform 0.4s ease-out'
      }}
    >
      <canvas
        ref={canvasRef}
        className="vault-preview-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
