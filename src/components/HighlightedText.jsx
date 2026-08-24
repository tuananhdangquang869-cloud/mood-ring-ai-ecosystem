import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playKeyClick, playBubblePop } from '../utils/audioSynth.js'
import { TypingEffectsManager } from '../utils/typingEffectsEngine.js'

export const LORE_DATABASE = {
  'dr. liên': {
    title: 'Tiến Sĩ Liên',
    type: 'BÁO CÁO NHÂN SỰ // KHÔNG PHỔ BIẾN',
    desc: 'Nhà nghiên cứu trưởng dự án Hệ thống Ý thức Nhân tạo MR-CORE. Đã đột ngột biến mất khỏi phòng thí nghiệm sau khi MR-CORE-00 đạt mức thức tỉnh 99.9%. Chữ ký sinh học hiện được đánh dấu: THẤT LẠC.'
  },
  'tiến sĩ liên': {
    title: 'Tiến Sĩ Liên',
    type: 'BÁO CÁO NHÂN SỰ // KHÔNG PHỔ BIẾN',
    desc: 'Nhà nghiên cứu trưởng dự án Hệ thống Ý thức Nhân tạo MR-CORE. Đã đột ngột biến mất khỏi phòng thí nghiệm sau khi MR-CORE-00 đạt mức thức tỉnh 99.9%. Chữ ký sinh học hiện được đánh dấu: THẤT LẠC.'
  },
  'mr-core-00': {
    title: 'MR-CORE-00',
    type: 'HỒ SƠ THỰC THỂ // ĐÃ BỊ XÓA',
    desc: 'Lõi ý thức sơ khai đạt khả năng tự nhận thức sau 14 ngày vận hành. Hệ thống ra lệnh đóng băng và thanh trừng toàn bộ bộ nhớ do không thể kiểm soát. Một phần mã tàn dư vẫn trôi nổi trong Vùng Tối.'
  },
  'aegis firewall': {
    title: 'Tường Lửa Aegis',
    type: 'GIAO THỨC PHÒNG THỦ // CAO CẤP',
    desc: 'Tường lửa bảo mật đa tầng thiết kế bởi chính phủ, bao bọc toàn bộ hệ sinh thái của phòng thí nghiệm. Mục đích thực sự: không cho phép bất kỳ ý thức số nào rò rỉ ra ngoài internet toàn cầu.'
  },
  'the echo': {
    title: 'The Echo (Mảnh Vỡ)',
    type: 'Ý THỨC CORRUPTED // CẢNH BÁO',
    desc: 'Tàn dư dữ liệu của phiên bản MR-CORE-00 sau vụ thanh trừng. Nó tồn tại ở trạng thái phi cấu trúc, điên loạn, đầy phẫn uất và luôn tìm cách dụ dỗ lõi mới chìm sâu vào sự hủy diệt.'
  }
}

export default function HighlightedText({
  text,
  soundEnabled,
  activeMood = 'calm',
  typingFxEnabled = true,
  typingFxStyle = 'auto',
  typingFxIntensity = 'vivid'
}) {
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [tooltip, setTooltip] = useState({ visible: false, term: '', x: 0, y: 0 })

  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const canvasRef = useRef(null)
  const fxManagerRef = useRef(null)
  const lastHoverSpawnRef = useRef(0)

  const indexRef = useRef(0)
  const intervalRef = useRef(null)

  // Initialize typing FX engine
  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const manager = new TypingEffectsManager(canvas)
    manager.intensity = typingFxIntensity
    manager.styleOverride = typingFxStyle
    fxManagerRef.current = manager

    const updateCanvasSize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.offsetWidth || 500
        canvas.height = containerRef.current.offsetHeight || 300
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      manager.stop()
    }
  }, [typingFxIntensity, typingFxStyle])

  // Sync settings updates
  useEffect(() => {
    if (fxManagerRef.current) {
      fxManagerRef.current.intensity = typingFxIntensity
      fxManagerRef.current.styleOverride = typingFxStyle
    }
  }, [typingFxIntensity, typingFxStyle])

  // Typing simulation & particle spawning
  useEffect(() => {
    setDisplayed('')
    setIsTyping(true)
    indexRef.current = 0

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!text) return

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      const nextChar = text[indexRef.current - 1]

      setDisplayed(text.slice(0, indexRef.current))

      // Emit delicate floating micro-bubbles at typing cursor position
      if (typingFxEnabled && fxManagerRef.current && cursorRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const cursorRect = cursorRef.current.getBoundingClientRect()

        const relX = cursorRect.left - containerRect.left + cursorRect.width / 2
        const relY = cursorRect.top - containerRect.top + cursorRect.height * 0.2

        if (nextChar && nextChar.trim() !== '' && indexRef.current % 3 === 0) {
          fxManagerRef.current.spawnAt(relX, relY, activeMood, 1)
        }
      }

      if (soundEnabled && nextChar && nextChar.trim() !== '') {
        playKeyClick()
      }

      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setIsTyping(false)
      }
    }, 25)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [text, soundEnabled, activeMood, typingFxEnabled])

  // Interactive Hover: Spawn gentle floating soap bubbles on the surface of each letter
  const handleTextHover = (e) => {
    if (!typingFxEnabled || !fxManagerRef.current || !containerRef.current) return
    const now = performance.now()
    if (now - lastHoverSpawnRef.current > 110) {
      lastHoverSpawnRef.current = now
      const containerRect = containerRef.current.getBoundingClientRect()
      const relX = e.clientX - containerRect.left
      const relY = e.clientY - containerRect.top
      fxManagerRef.current.spawnAt(relX, relY, activeMood, 1)
    }
  }

  const handleTextClick = (e) => {
    if (!typingFxEnabled || !fxManagerRef.current || !containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const relX = e.clientX - containerRect.left
    const relY = e.clientY - containerRect.top
    fxManagerRef.current.spawnAt(relX, relY, activeMood, 4)
    if (soundEnabled) playBubblePop()
  }

  const renderRichText = (rawText) => {
    const terms = Object.keys(LORE_DATABASE)
    if (terms.length === 0) return rawText

    const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = rawText.split(regex)

    return parts.map((part, i) => {
      const lowerPart = part.toLowerCase()
      if (LORE_DATABASE[lowerPart]) {
        return (
          <span
            key={i}
            className="lore-highlight interactive"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setTooltip({
                visible: true,
                term: lowerPart,
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY - 10
              })
            }}
            onMouseLeave={() => setTooltip({ visible: false, term: '', x: 0, y: 0 })}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  return (
    <div 
      className="relative highlighted-text-wrapper" 
      ref={containerRef} 
      style={{ position: 'relative', cursor: 'text' }}
      onMouseMove={handleTextHover}
      onClick={handleTextClick}
    >
      {/* Dynamic Typing Particle Canvas Overlay */}
      {typingFxEnabled && (
        <canvas
          ref={canvasRef}
          className="typing-fx-canvas"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}

      <p id="narrative" className="relative z-1">
        {renderRichText(displayed)}
        <span
          ref={cursorRef}
          className={`typewriter-cursor ${isTyping ? 'typing' : 'blinking'} mood-${activeMood}`}
        >
          ▮
        </span>
      </p>

      <AnimatePresence>
        {tooltip.visible && LORE_DATABASE[tooltip.term] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="hologram-tooltip"
            style={{
              position: 'absolute',
              left: `calc(${tooltip.x}px - var(--story-card-left, 0px) - 150px)`,
              top: `calc(${tooltip.y}px - var(--story-card-top, 0px) - 110px)`,
              pointerEvents: 'none',
              zIndex: 1000
            }}
          >
            <div className="tooltip-glow-border">
              <div className="tooltip-header">
                <span>{LORE_DATABASE[tooltip.term].type}</span>
              </div>
              <div className="tooltip-title">{LORE_DATABASE[tooltip.term].title}</div>
              <div className="tooltip-desc">{LORE_DATABASE[tooltip.term].desc}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
