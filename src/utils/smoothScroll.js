// 🌌 Mood Ring Story - Lenis Ultra-Smooth Momentum Scrolling Engine
import Lenis from 'lenis'

let lenisInstance = null
let rafId = null

export function initSmoothScroll(options = {}) {
  if (typeof window === 'undefined') return null

  // Destroy previous instance if exists
  if (lenisInstance) {
    destroySmoothScroll()
  }

  // Create Lenis instance with silky smooth kinetic physics
  lenisInstance = new Lenis({
    duration: 1.2, // Scroll animation duration in seconds
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-style exponential deceleration
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false, // Keep native touch momentum on mobile for best response
    touchMultiplier: 1.5,
    wheelMultiplier: 1.0,
    infinite: false,
    autoRaf: false,
    ...options
  })

  // High-performance RAF animation loop
  function raf(time) {
    if (lenisInstance) {
      lenisInstance.raf(time)
      rafId = requestAnimationFrame(raf)
    }
  }

  rafId = requestAnimationFrame(raf)

  // Attach to window for global access/debugging if needed
  window.__mr_lenis = lenisInstance

  return lenisInstance
}

export function getLenis() {
  return lenisInstance
}

export function scrollToTop(options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  } else if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

export function scrollToTarget(target, options = {}) {
  if (lenisInstance) {
    lenisInstance.scrollTo(target, {
      duration: 1.2,
      offset: -80,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  } else if (typeof document !== 'undefined') {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
export function scrollToBottom(options = {}) {
  if (typeof window === 'undefined') return
  const maxScroll = typeof document !== 'undefined' ? (document.documentElement.scrollHeight - window.innerHeight) : 999999
  if (lenisInstance) {
    lenisInstance.scrollTo(maxScroll, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  } else {
    window.scrollTo({ top: maxScroll, behavior: 'smooth' })
  }
}

export function scrollByAmount(offsetY = 0, offsetX = 0, options = {}) {
  if (typeof window === 'undefined') return
  if (lenisInstance && offsetY !== 0) {
    const targetY = Math.max(0, (window.scrollY || 0) + offsetY)
    lenisInstance.scrollTo(targetY, {
      duration: 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    })
  } else {
    window.scrollBy({ top: offsetY, left: offsetX, behavior: 'smooth' })
  }
}

export function destroySmoothScroll() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  if (lenisInstance) {
    lenisInstance.destroy()
    lenisInstance = null
    delete window.__mr_lenis
  }
}
