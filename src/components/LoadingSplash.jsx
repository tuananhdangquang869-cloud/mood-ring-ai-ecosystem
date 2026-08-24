import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoadingSplash({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stepText, setStepText] = useState('INITIALIZING NEURAL CORE...')
  const [isDone, setIsDone] = useState(false)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  const finishLoading = () => {
    setIsDone(true)
    if (onCompleteRef.current) onCompleteRef.current()
  }

  useEffect(() => {
    const steps = [
      { p: 25, label: 'COMPUTING MATRIX SHADERS...' },
      { p: 55, label: 'LOADING THREE.JS CANVAS SHIELD...' },
      { p: 80, label: 'SYNCING QUANTUM MEMORY VAULT...' },
      { p: 100, label: 'ALL SYSTEMS NOMINAL // BOOT COMPLETE' }
    ]

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].p)
        setStepText(steps[currentStep].label)
        currentStep++
      } else {
        clearInterval(interval)
        setTimeout(finishLoading, 250)
      }
    }, 150)

    // Hard fallback timer - guarantee dismissal in 1.2s max
    const fallbackTimer = setTimeout(() => {
      clearInterval(interval)
      finishLoading()
    }, 1200)

    // Allow user to click or press any key to skip immediately
    const handleSkip = () => {
      clearInterval(interval)
      clearTimeout(fallbackTimer)
      finishLoading()
    }

    window.addEventListener('keydown', handleSkip, { once: true })

    return () => {
      clearInterval(interval)
      clearTimeout(fallbackTimer)
      window.removeEventListener('keydown', handleSkip)
    }
  }, [])

  if (isDone) return null

  return (
    <AnimatePresence>
      <motion.div
        className="loading-splash-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeOut' } }}
        onClick={finishLoading}
        role="region"
        aria-label="System Boot Sequence Loading"
        style={{ cursor: 'pointer' }}
      >
        <div className="loading-splash-content">
          <div className="loading-logo-ring">
            <div className="loading-inner-orb" />
          </div>
          <h1 className="loading-title">MOOD RING STORY</h1>
          <p className="loading-subtitle">MAINFRAME OS v2.1 // BOOT SEQUENCE</p>

          <div className="loading-bar-wrapper" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" role="progressbar">
            <motion.div
              className="loading-bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.15 }}
            />
          </div>

          <div className="loading-step-info">
            <span className="loading-percentage">{progress}%</span>
            <span className="loading-step-text">{stepText}</span>
          </div>

          <div className="mt-4 text-[11px] font-mono text-cyan-400/80 animate-pulse tracking-wider">
            [ NHẤN VÀO MÀN HÌNH ĐỂ BỎ QUA ]
          </div>

          <div className="loading-hud-corner top-left">SYS: ACTIVE</div>
          <div className="loading-hud-corner top-right">PORT: 9600</div>
          <div className="loading-hud-corner bottom-left">BAUD: 115200</div>
          <div className="loading-hud-corner bottom-right">STATUS: OK</div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
