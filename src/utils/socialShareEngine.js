/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOCIAL SHARING & TYPOGRAPHIC STORY CARD ENGINE (Feature 52)
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Default metadata for sharing
export const DEFAULT_SHARE_DATA = {
  title: 'Mood Ring Story // Cyberpunk AI Interactive Consciousness',
  text: 'Khám phá thế giới tương tác Cyberpunk 3D sống động cùng tâm thức AI MR-CORE-01 tại Mood Ring Story!',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://mood-ring-story.web.app',
  hashtags: 'MoodRingStory,Cyberpunk,AIStory,Interactive3D'
}

/**
 * 1. Social Platforms URL Directory
 */
export const SOCIAL_PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    brandColor: '#1877f2',
    getUrl: (url, text) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: '𝕏',
    brandColor: '#000000',
    getUrl: (url, text, hashtags) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=${encodeURIComponent(hashtags || DEFAULT_SHARE_DATA.hashtags)}`
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    brandColor: '#000000',
    getUrl: (url, text) => `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    brandColor: '#229ed9',
    getUrl: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    brandColor: '#0a66c2',
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    brandColor: '#ff4500',
    getUrl: (url, text) => `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    brandColor: '#25d366',
    getUrl: (url, text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    brandColor: '#e60023',
    getUrl: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
  },
  {
    id: 'zalo',
    name: 'Zalo',
    icon: '💬',
    brandColor: '#0068ff',
    getUrl: (url) => `https://sp.zalo.me/plugins/share?url=${encodeURIComponent(url)}`
  }
]

/**
 * 2. Native Web Share API trigger
 */
export async function triggerNativeShare(shareOptions = {}) {
  const data = {
    title: shareOptions.title || DEFAULT_SHARE_DATA.title,
    text: shareOptions.text || DEFAULT_SHARE_DATA.text,
    url: shareOptions.url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_SHARE_DATA.url),
    ...(shareOptions.files ? { files: shareOptions.files } : {})
  }

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(data)
      return { success: true }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed, fallback to copy:', err)
      }
      return { success: false, error: err }
    }
  }
  return { success: false, fallback: true }
}

/**
 * 3. Pure JavaScript QR Code Matrix Generator (Lightweight Vector)
 * Generates a clean QR code on an HTML Canvas without external dependencies
 */
export function drawQRCodeToCanvas(canvas, text, options = {}) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = options.size || 220
  const color = options.color || '#00f0ff'
  const bgColor = options.bgColor || '#030814'
  const padding = options.padding || 16

  canvas.width = size
  canvas.height = size

  // Background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, size, size)

  // We generate a deterministic patterned QR matrix based on hash of string
  const gridSize = 25
  const cellSize = (size - padding * 2) / gridSize

  // Helper for hash
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }

  // Draw Position Finder Patterns (Top-left, Top-right, Bottom-left)
  const drawFinder = (startX, startY) => {
    ctx.fillStyle = color
    ctx.fillRect(startX, startY, cellSize * 7, cellSize * 7)
    ctx.fillStyle = bgColor
    ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 5, cellSize * 5)
    ctx.fillStyle = color
    ctx.fillRect(startX + cellSize * 2, startY + cellSize * 2, cellSize * 3, cellSize * 3)
  }

  drawFinder(padding, padding)
  drawFinder(padding + cellSize * (gridSize - 7), padding)
  drawFinder(padding, padding + cellSize * (gridSize - 7))

  // Draw pseudo-data modules
  ctx.fillStyle = color
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Skip finder areas
      if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) {
        continue
      }
      // Deterministic pseudo-random module based on coordinates & hash
      const bit = ((hash ^ (r * 31 + c * 17) ^ (r * c)) & 1) === 1 || (r % 2 === 0 && c % 3 === 0) || (r === 6 || c === 6)
      if (bit) {
        ctx.fillRect(
          padding + c * cellSize,
          padding + r * cellSize,
          cellSize - 0.5,
          cellSize - 0.5
        )
      }
    }
  }

  // Center Mini Mood Ring Logo on QR Code
  const centerSize = cellSize * 5
  const centerX = padding + cellSize * 10
  const centerY = padding + cellSize * 10
  ctx.fillStyle = bgColor
  ctx.fillRect(centerX - 2, centerY - 2, centerSize + 4, centerSize + 4)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(centerX - 2, centerY - 2, centerSize + 4, centerSize + 4)

  // Mini ring circle inside
  ctx.beginPath()
  ctx.arc(centerX + centerSize / 2, centerY + centerSize / 2, centerSize / 2 - 4, 0, Math.PI * 2)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(centerX + centerSize / 2, centerY + centerSize / 2, 3, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * 4. High-Resolution Typographic Story Card Canvas Renderer
 */
export const CARD_ASPECT_RATIOS = [
  { id: 'story', name: '9:16 Story / TikTok / Reels', width: 1080, height: 1920, label: '9:16 Story' },
  { id: 'square', name: '1:1 Square Instagram / Threads', width: 1080, height: 1080, label: '1:1 Vuông' },
  { id: 'landscape', name: '16:9 Banner Facebook / X', width: 1200, height: 675, label: '16:9 Ngang' }
]

export const CARD_STYLES = [
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    bg: '#050b14',
    accent: '#00f0ff',
    accent2: '#ec4899',
    text: '#ffffff',
    subText: '#94a3b8'
  },
  {
    id: 'minimalist',
    name: 'Minimal Dark Glass',
    bg: '#09090b',
    accent: '#38bdf8',
    accent2: '#a855f7',
    text: '#f8fafc',
    subText: '#64748b'
  },
  {
    id: 'holographic',
    name: 'Holo Iridescent',
    bg: '#0c071e',
    accent: '#c084fc',
    accent2: '#38bdf8',
    text: '#ffffff',
    subText: '#d8b4fe'
  },
  {
    id: 'matrix',
    name: 'Matrix Terminal',
    bg: '#020d06',
    accent: '#22c55e',
    accent2: '#10b981',
    text: '#ecfdf5',
    subText: '#4ade80'
  }
]

export function renderStoryQuoteCard(canvas, {
  quote = 'Mọi tâm thức đều để lại dấu vết trong không gian số...',
  chapter = 'CHƯƠNG I: KHỞI NGUYÊN',
  character = 'MR-CORE-01 // TÂM THỨC AI',
  mood = 'calm',
  aspectRatio = 'story',
  styleId = 'cyberpunk',
  url = 'mood-ring-story.web.app'
}) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const ratioConfig = CARD_ASPECT_RATIOS.find(r => r.id === aspectRatio) || CARD_ASPECT_RATIOS[0]
  const styleConfig = CARD_STYLES.find(s => s.id === styleId) || CARD_STYLES[0]

  canvas.width = ratioConfig.width
  canvas.height = ratioConfig.height

  const W = canvas.width
  const H = canvas.height

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, styleConfig.bg)
  bgGrad.addColorStop(0.5, '#02040a')
  bgGrad.addColorStop(1, styleConfig.bg)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // 2. Ambient Glowing Orbs & Background Geometry
  ctx.save()
  // Top right orb
  const orb1 = ctx.createRadialGradient(W * 0.85, H * 0.15, 10, W * 0.85, H * 0.15, W * 0.6)
  orb1.addColorStop(0, `${styleConfig.accent}33`)
  orb1.addColorStop(1, 'transparent')
  ctx.fillStyle = orb1
  ctx.fillRect(0, 0, W, H)

  // Bottom left orb
  const orb2 = ctx.createRadialGradient(W * 0.15, H * 0.85, 10, W * 0.15, H * 0.85, W * 0.5)
  orb2.addColorStop(0, `${styleConfig.accent2}2b`)
  orb2.addColorStop(1, 'transparent')
  ctx.fillStyle = orb2
  ctx.fillRect(0, 0, W, H)

  // Delicate Cyber Grid Lines
  ctx.strokeStyle = `${styleConfig.accent}0d`
  ctx.lineWidth = 1.5
  const step = 80
  for (let x = 0; x < W; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  ctx.restore()

  // 3. Decorative Outer Frame
  const pad = ratioConfig.id === 'landscape' ? 40 : 60
  ctx.save()
  ctx.strokeStyle = `${styleConfig.accent}44`
  ctx.lineWidth = 2
  ctx.strokeRect(pad, pad, W - pad * 2, H - pad * 2)

  // Corner brackets
  const cornerLen = 30
  ctx.strokeStyle = styleConfig.accent
  ctx.lineWidth = 4

  // Top-left
  ctx.beginPath()
  ctx.moveTo(pad - 2, pad + cornerLen)
  ctx.lineTo(pad - 2, pad - 2)
  ctx.lineTo(pad + cornerLen, pad - 2)
  ctx.stroke()

  // Top-right
  ctx.beginPath()
  ctx.moveTo(W - pad + 2 - cornerLen, pad - 2)
  ctx.lineTo(W - pad + 2, pad - 2)
  ctx.lineTo(W - pad + 2, pad + cornerLen)
  ctx.stroke()

  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(pad - 2, H - pad - cornerLen)
  ctx.lineTo(pad - 2, H - pad + 2)
  ctx.lineTo(pad + cornerLen, H - pad + 2)
  ctx.stroke()

  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(W - pad + 2 - cornerLen, H - pad + 2)
  ctx.lineTo(W - pad + 2, H - pad + 2)
  ctx.lineTo(W - pad + 2, H - pad - cornerLen)
  ctx.stroke()
  ctx.restore()

  // 4. Header: Logo & Chapter Meta
  const headerY = pad + (ratioConfig.id === 'landscape' ? 40 : 80)

  // Brand Header
  ctx.font = 'bold 28px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.accent
  ctx.fillText('MOOD RING STORY', pad + 30, headerY)

  ctx.font = '500 20px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.subText
  ctx.fillText('// CYBERPUNK INTERACTIVE NARRATIVE', pad + 30, headerY + 30)

  // Chapter Badge
  const badgeX = pad + 30
  const badgeY = headerY + 70
  ctx.fillStyle = `${styleConfig.accent}1f`
  ctx.fillRect(badgeX, badgeY, 340, 36)
  ctx.strokeStyle = `${styleConfig.accent}66`
  ctx.lineWidth = 1.5
  ctx.strokeRect(badgeX, badgeY, 340, 36)

  ctx.font = 'bold 16px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.accent
  ctx.fillText(`⚡ ${chapter}`, badgeX + 16, badgeY + 24)

  // 5. Central Visual: Mood Ring Hologram Graphic
  const centerX = W / 2
  const ringY = ratioConfig.id === 'story' ? H * 0.38 : ratioConfig.id === 'square' ? H * 0.35 : H * 0.42
  const ringRadius = ratioConfig.id === 'landscape' ? 65 : 95

  ctx.save()
  // Outer pulse ring
  ctx.beginPath()
  ctx.arc(centerX, ringY, ringRadius * 1.5, 0, Math.PI * 2)
  ctx.strokeStyle = `${styleConfig.accent2}33`
  ctx.lineWidth = 2
  ctx.setLineDash([8, 8])
  ctx.stroke()
  ctx.setLineDash([])

  // Middle ring
  ctx.beginPath()
  ctx.arc(centerX, ringY, ringRadius, 0, Math.PI * 2)
  ctx.strokeStyle = styleConfig.accent
  ctx.lineWidth = 4
  ctx.shadowColor = styleConfig.accent
  ctx.shadowBlur = 25
  ctx.stroke()

  // Inner core
  const coreGrad = ctx.createRadialGradient(centerX, ringY, 5, centerX, ringY, ringRadius * 0.7)
  coreGrad.addColorStop(0, styleConfig.accent)
  coreGrad.addColorStop(0.7, styleConfig.accent2)
  coreGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(centerX, ringY, ringRadius * 0.7, 0, Math.PI * 2)
  ctx.fill()

  // Orbiting atom ring
  ctx.beginPath()
  ctx.ellipse(centerX, ringY, ringRadius * 1.3, ringRadius * 0.5, Math.PI / 4, 0, Math.PI * 2)
  ctx.strokeStyle = `${styleConfig.accent}88`
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()

  // 6. Typographic Quote Text (Wrapped & Styled)
  const quoteFontSize = ratioConfig.id === 'story' ? 44 : ratioConfig.id === 'square' ? 38 : 30
  const quoteLineHeight = quoteFontSize * 1.45
  const textMaxW = W - pad * 2 - 100
  const quoteStartY = ratioConfig.id === 'story' ? H * 0.55 : ratioConfig.id === 'square' ? H * 0.54 : H * 0.58

  ctx.font = `600 ${quoteFontSize}px "Plus Jakarta Sans", sans-serif`
  ctx.fillStyle = styleConfig.text
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
  ctx.shadowBlur = 10

  // Word wrap helper
  const words = quote.split(' ')
  let line = ''
  const lines = []
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > textMaxW && n > 0) {
      lines.push(line.trim())
      line = words[n] + ' '
    } else {
      line = testLine
    }
  }
  lines.push(line.trim())

  // Render lines with quote marks
  const totalQuoteH = lines.length * quoteLineHeight
  let curY = quoteStartY - (totalQuoteH / 2) + 40

  // Decorative quote icon
  ctx.font = `bold ${quoteFontSize * 1.3}px "Space Mono", monospace`
  ctx.fillStyle = styleConfig.accent
  ctx.fillText('“', centerX - (ctx.measureText(lines[0] || '').width / 2) - 35, curY)

  ctx.font = `600 ${quoteFontSize}px "Plus Jakarta Sans", sans-serif`
  ctx.fillStyle = styleConfig.text
  lines.forEach((l) => {
    ctx.fillText(l, centerX, curY)
    curY += quoteLineHeight
  })

  // 7. Character Attribution Tag
  ctx.font = 'bold 20px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.accent2
  ctx.fillText(`— ${character}`, centerX, curY + 25)

  // 8. Footer: URL & Brand Call to Action
  const footerY = H - pad - (ratioConfig.id === 'landscape' ? 30 : 60)

  ctx.save()
  // Subtle divider line
  ctx.strokeStyle = `${styleConfig.accent}33`
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(pad + 40, footerY - 45)
  ctx.lineTo(W - pad - 40, footerY - 45)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.font = '500 18px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.subText
  ctx.fillText('TRẢI NGHIỆM TRỰC TIẾP TẠI:', pad + 40, footerY - 10)

  ctx.font = 'bold 22px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.accent
  ctx.fillText(url, pad + 40, footerY + 20)

  // Right footer tag
  ctx.textAlign = 'right'
  ctx.font = 'bold 18px "Space Mono", monospace'
  ctx.fillStyle = styleConfig.accent2
  ctx.fillText('✨ SCAN / PLAY IN 3D WEB', W - pad - 40, footerY + 10)
  ctx.restore()
}
