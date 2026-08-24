import { useRef, useState } from 'react'
import { playPhysicsImpact, playSpringRelease } from '../utils/audioSynth.js'

/**
 * Enhanced Physics-based Interactive Tilt Button
 * Features:
 * - 3D Parallax Tilt with physics damping
 * - Elastic spring compression on press & bounce on release
 * - Localized shockwave ripple emission & micro-spark particle burst
 * - Force feedback screen-shake & haptic simulation
 * - Integrated mechanical audio synthesizer SFX
 */
export default function TiltButton({
  children,
  onClick,
  impact = 'medium', // 'subtle' | 'medium' | 'heavy' | 'critical'
  withShake = true,
  withHaptics = true,
  withSound = true,
  variant = 'default', // 'default' | 'primary' | 'amber' | 'danger' | 'emerald' | 'violet'
  className = '',
  style = {},
  disabled = false,
  type = 'button',
  glowColor,
  ...rest
}) {
  const btnRef = useRef(null)
  const [isRebounding, setIsRebounding] = useState(false)
  const [ripples, setRipples] = useState([])
  const [sparks, setSparks] = useState([])

  const handleMouseMove = (e) => {
    if (disabled) return
    const el = btnRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const xc = x / rect.width - 0.5
    const yc = y / rect.height - 0.5

    // Dynamic tilt angle based on distance from center
    const rx = -yc * 16
    const ry = xc * 16

    el.style.setProperty('--rx', `${rx}deg`)
    el.style.setProperty('--ry', `${ry}deg`)
    el.style.setProperty('--mouse-x', `${x}px`)
    el.style.setProperty('--mouse-y', `${y}px`)
  }

  const handleMouseLeave = () => {
    const el = btnRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const handleMouseDown = () => {
    if (disabled) return
    setIsRebounding(false)
  }

  const handleClick = (e) => {
    if (disabled) return

    const el = btnRef.current
    const rect = el ? el.getBoundingClientRect() : { left: e.clientX, top: e.clientY }
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // 1. Trigger Spring Rebound animation
    setIsRebounding(true)
    setTimeout(() => setIsRebounding(false), 380)

    // 2. Spawn Expanding Shockwave Ripple
    const rippleId = Date.now() + Math.random()
    setRipples((prev) => [...prev.slice(-3), { id: rippleId, x: clickX, y: clickY }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId))
    }, 550)

    // 3. Spawn Micro Particle Sparks
    const newSparks = Array.from({ length: 6 }).map((_, i) => {
      const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
      const distance = 25 + Math.random() * 35
      return {
        id: rippleId + i,
        x: clickX,
        y: clickY,
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
      }
    })
    setSparks((prev) => [...prev.slice(-12), ...newSparks])
    setTimeout(() => {
      setSparks((prev) => prev.filter((s) => !newSparks.find((ns) => ns.id === s.id)))
    }, 480)

    // 4. Play Physical Audio Synthesizer Feedback
    if (withSound) {
      try {
        playPhysicsImpact(impact)
        playSpringRelease()
      } catch (err) {
        // Ignore audio errors
      }
    }

    // 5. Trigger Physical Screen Shake Simulation Event
    if (withShake && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('trigger-screen-shake', {
          detail: { impact },
        })
      )
    }

    // 6. Hardware Haptic Feedback (navigator.vibrate)
    if (withHaptics && typeof navigator !== 'undefined' && navigator.vibrate) {
      if (impact === 'subtle') navigator.vibrate(20)
      else if (impact === 'heavy') navigator.vibrate([40, 30, 50])
      else if (impact === 'critical') navigator.vibrate([60, 40, 90, 40, 120])
      else navigator.vibrate(35) // medium
    }

    // 7. Invoke parent onClick handler
    if (typeof onClick === 'function') {
      onClick(e)
    }
  }

  // Variant class mapping
  const variantClass =
    variant === 'primary'
      ? 'btn-cyber-primary'
      : variant === 'amber'
      ? 'btn-cyber-amber'
      : variant === 'danger'
      ? 'btn-cyber-danger'
      : variant === 'emerald'
      ? 'btn-cyber-emerald'
      : variant === 'violet'
      ? 'btn-cyber-violet'
      : ''

  const customStyles = {
    ...style,
    ...(glowColor ? { '--accent': glowColor } : {}),
  }

  return (
    <div className="physics-btn-wrapper">
      <button
        ref={btnRef}
        type={type}
        disabled={disabled}
        className={`physics-tilt-btn choices-btn-tilt interactive ${variantClass} ${
          isRebounding ? 'is-rebounding' : ''
        } ${className}`}
        style={customStyles}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        {/* Parallax Content Layer */}
        <span className="physics-btn-content choices-btn-content">{children}</span>

        {/* Conic Sweep Glow Hover Effect */}
        <div className="conic-sweep-glow" />

        {/* Dynamic Expanding Shockwave Rings */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="click-shockwave-ring"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
          />
        ))}

        {/* Micro-spark particle bursts */}
        {sparks.map((spark) => (
          <span
            key={spark.id}
            className="physics-btn-spark"
            style={{
              left: spark.x,
              top: spark.y,
              '--spark-tx': `${spark.tx}px`,
              '--spark-ty': `${spark.ty}px`,
            }}
          />
        ))}
      </button>
    </div>
  )
}
