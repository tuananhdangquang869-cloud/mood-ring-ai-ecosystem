import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  RotateCcw, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Award, 
  Zap, 
  Flame, 
  Clock, 
  Calendar, 
  Tag, 
  ShieldCheck,
  Compass
} from 'lucide-react'
import { generateSpotifyWrappedData } from '../utils/emotionalAnalyticsEngine.js'
import { playWrappedSlideSound, playWrappedFanfareSound, playKeyClick } from '../utils/audioSynth.js'

export default function EmotionalWrappedStory({
  isOpen = true,
  onClose = () => {},
  initialPeriod = 'year', // 'year' | 'week'
  soundEnabled = true,
  toggleSound = () => {}
}) {
  const [periodType, setPeriodType] = useState(initialPeriod || 'year')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)
  const cardExportRef = useRef(null)

  const wrappedData = useMemo(() => {
    void dataVersion
    return generateSpotifyWrappedData(periodType)
  }, [periodType, dataVersion])

  const totalSlides = 8
  const SLIDE_DURATION = 6500 // 6.5s per slide

  // Slide auto-advance timer
  const [progress, setProgress] = useState(0)
  const progressIntervalRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // Sound effect on slide change
    if (soundEnabled) {
      if (currentSlide === totalSlides - 1) {
        playWrappedFanfareSound()
      } else {
        playWrappedSlideSound(currentSlide)
      }
    }

    setProgress(0)
    if (isPaused) return

    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100)
      setProgress(pct)

      if (elapsed >= SLIDE_DURATION) {
        clearInterval(progressIntervalRef.current)
        if (currentSlide < totalSlides - 1) {
          setCurrentSlide(s => s + 1)
        } else {
          setIsPaused(true)
        }
      }
    }, 40)

    return () => clearInterval(progressIntervalRef.current)
  }, [currentSlide, isPaused, isOpen, soundEnabled, totalSlides])

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide()
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault()
        setIsPaused(p => !p)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentSlide])

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(s => s + 1)
    }
  }

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(s => s - 1)
    }
  }

  const handleReplay = () => {
    setCurrentSlide(0)
    setIsPaused(false)
    setProgress(0)
    if (soundEnabled) playWrappedSlideSound(0)
  }

  // Copy share text
  const handleCopySummary = () => {
    const summaryText = `✨ [MOOD RING STORY // ${wrappedData.periodTitle}] ✨
🎭 Nhân vật Tâm lý: ${wrappedData.archetype.name} (${wrappedData.archetype.title})
⚡ Sắc thái cảm xúc: ${wrappedData.dominantMood.name} (${wrappedData.dominantPercent}%)
💫 Chỉ số hài hòa: ${wrappedData.resonanceIndex}/100 | Độ ổn định: ${wrappedData.stabilityScore}%
📖 Đã lưu lại: ${wrappedData.totalEntries} khoảnh khắc & ${wrappedData.totalWords} từ ngữ
🌟 Khám phá hành trình cảm xúc của bạn tại: Mood Ring Story!`

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  // Real Ultra-HD Canvas Card Exporter & File Downloader
  const handleDownloadCard = (e) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    setDownloading(true)
    if (soundEnabled && typeof playWrappedFanfareSound === 'function') playWrappedFanfareSound()

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const width = 1080
      const height = 1350
      canvas.width = width
      canvas.height = height

      // Background Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height)
      bgGrad.addColorStop(0, '#040817')
      bgGrad.addColorStop(0.5, '#0b1329')
      bgGrad.addColorStop(1, '#020612')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, width, height)

      // Ambient Glow Circles
      const soulCol = wrappedData.soulColor || '#00f0ff'
      ctx.strokeStyle = `${soulCol}33`
      ctx.lineWidth = 3
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.arc(width * 0.55 + i * 35, height * 0.38 + i * 20, 140 + i * 50, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Outer Rounded Border Card
      ctx.strokeStyle = soulCol
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.roundRect(50, 50, width - 100, height - 100, 32)
      ctx.stroke()

      // Header Tag: MOOD RING WRAPPED
      ctx.fillStyle = soulCol
      ctx.font = 'bold 30px "Space Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText('MOOD RING WRAPPED', 110, 140)

      // Year Badge Pill
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.roundRect(width - 250, 100, 140, 50, 12)
      ctx.fill()
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 28px "Space Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(wrappedData.periodTitle || '2026', width - 180, 136)

      // Archetype Badge & Icon
      ctx.strokeStyle = soulCol
      ctx.lineWidth = 3
      ctx.fillStyle = `${soulCol}18`
      ctx.beginPath()
      ctx.arc(160, 260, 50, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      ctx.font = '40px serif'
      ctx.textAlign = 'center'
      ctx.fillText(wrappedData.archetype.icon || '🌿', 160, 275)

      // Archetype Title
      ctx.textAlign = 'left'
      ctx.fillStyle = '#94a3b8'
      ctx.font = 'bold 24px "Space Mono", monospace'
      ctx.fillText(wrappedData.archetype.name.toUpperCase(), 235, 245)

      ctx.fillStyle = soulCol
      ctx.font = '800 50px "Plus Jakarta Sans", sans-serif'
      ctx.fillText(wrappedData.archetype.title, 235, 298)

      // 4 Stats Grid Boxes
      const boxW = 420
      const boxH = 175

      const drawStat = (x, y, val, label, valColor) => {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)'
        ctx.beginPath()
        ctx.roundRect(x, y, boxW, boxH, 18)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.fillStyle = valColor
        ctx.font = '800 52px "Plus Jakarta Sans", sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(String(val), x + 30, y + 78)

        ctx.fillStyle = '#94a3b8'
        ctx.font = '22px "Space Mono", monospace'
        ctx.fillText(label, x + 30, y + 130)
      }

      // Box 1: Moments
      drawStat(110, 370, wrappedData.totalEntries || 0, 'Khoảnh Khắc Ghi Lại', '#ffffff')

      // Box 2: Dominant Mood
      drawStat(550, 370, wrappedData.dominantMood?.name || 'Bình Yên', 'Aura Thống Trị', wrappedData.dominantMood?.color || soulCol)

      // Box 3: Positive %
      drawStat(110, 575, `${wrappedData.dominantPercent || 67}%`, 'Chỉ Số Tích Cực', '#38bdf8')

      // Box 4: Stability
      drawStat(550, 575, `${wrappedData.stabilityScore || 95}%`, 'Độ Cân Bằng Cảm Xúc', '#10b981')

      // Tags Row
      let tagX = 110
      ctx.font = 'bold 24px "Space Mono", monospace'
      if (Array.isArray(wrappedData.topTags)) {
        wrappedData.topTags.slice(0, 3).forEach((t) => {
          const tagText = `#${t.tag || t}`
          const tagW = ctx.measureText(tagText).width + 36
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
          ctx.beginPath()
          ctx.roundRect(tagX, 790, tagW, 52, 12)
          ctx.fill()
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
          ctx.stroke()
          ctx.fillStyle = '#f1f5f9'
          ctx.fillText(tagText, tagX + 18, 825)
          tagX += tagW + 16
        })
      }

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 1.5
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(110, 890)
      ctx.lineTo(width - 110, 890)
      ctx.stroke()
      ctx.setLineDash([])

      // Footer
      ctx.fillStyle = '#64748b'
      ctx.font = '22px "Space Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('■■■■■ MOOD RING STORY MAINFRAME // TỔNG KẾT CẢM XÚC ■■■■■', width / 2, 950)

      // Direct PNG Blob Export
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `MoodRingWrapped_${wrappedData.periodTitle || '2026'}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        setDownloading(false)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }, 'image/png')
    } catch (err) {
      console.error('Error exporting wrapped card:', err)
      setDownloading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="wrapped-story-overlay" data-lenis-prevent>
      {/* Background Ambience & Particles */}
      <div 
        className="wrapped-backdrop-glow" 
        style={{
          background: `radial-gradient(circle at 50% 40%, ${wrappedData.soulColor}25 0%, rgba(10, 15, 25, 0.96) 75%)`
        }}
      />
      <div className="wrapped-floating-particles">
        {[...Array(20)].map((_, i) => (
          <span 
            key={i} 
            className="wrapped-particle-dot"
            style={{
              left: `${(i * 17) % 95}%`,
              top: `${(i * 23) % 90}%`,
              animationDelay: `${(i * 0.35) % 4}s`,
              backgroundColor: wrappedData.soulColor
            }}
          />
        ))}
      </div>

      {/* Main Center Story Frame */}
      <div 
        className="wrapped-story-card-frame"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Segment Bars */}
        <div className="wrapped-progress-bars-container">
          {[...Array(totalSlides)].map((_, idx) => {
            let width = '0%'
            if (idx < currentSlide) width = '100%'
            else if (idx === currentSlide) width = `${progress}%`

            return (
              <div 
                key={idx} 
                className="wrapped-progress-segment"
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentSlide(idx)
                }}
              >
                <div 
                  className="wrapped-progress-fill" 
                  style={{ 
                    width,
                    backgroundColor: idx === currentSlide ? wrappedData.soulColor : '#fff'
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Top Navigation & Controls Header */}
        <div className="wrapped-top-controls">
          {/* Period Toggle Button */}
          <button 
            type="button"
            className="wrapped-period-toggle-btn"
            onClick={(e) => {
              e.stopPropagation()
              setPeriodType(p => p === 'year' ? 'week' : 'year')
              setCurrentSlide(0)
              if (soundEnabled) playKeyClick()
            }}
            title="Chuyển đổi Báo cáo Cuối Tuần / Cuối Năm"
          >
            <span>{periodType === 'year' ? '📅 Năm 2026' : '⚡ Cuối Tuần'}</span>
          </button>

          <div className="wrapped-top-right-group">
            {/* Play/Pause Button */}
            <button 
              type="button" 
              className="wrapped-control-icon-btn"
              onClick={(e) => {
                e.stopPropagation()
                setIsPaused(p => !p)
              }}
              title={isPaused ? 'Tiếp tục chạy' : 'Tạm dừng'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>

            {/* Sound Toggle Button */}
            <button 
              type="button" 
              className="wrapped-control-icon-btn"
              onClick={(e) => {
                e.stopPropagation()
                toggleSound()
              }}
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Button */}
            <button 
              type="button" 
              className="wrapped-control-icon-btn close"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              title="Thoát Story"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Left / Right Click Nav Tap Zones */}
        <div className="wrapped-tap-zone left" onClick={goToPrevSlide} title="Nhấn để lùi lại slide trước" />
        <div className="wrapped-tap-zone right" onClick={goToNextSlide} title="Nhấn để sang slide kế tiếp" />

        {/* Slide Content Carousel */}
        <div className="wrapped-slide-content-area">
          <AnimatePresence mode="wait">
            {/* ─── SLIDE 0: CỔNG KHÔNG GIAN KÝ ỨC (INTRO) ────────────────────── */}
            {currentSlide === 0 && (
              <motion.div
                key="slide-0"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, y: -20 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-intro"
              >
                <div className="wrapped-cosmic-ring" style={{ borderColor: wrappedData.soulColor, boxShadow: `0 0 45px ${wrappedData.soulColor}60` }}>
                  <span className="wrapped-sparkle-center">✨</span>
                </div>

                <span className="wrapped-eyebrow-tag">// MAINFRAME REWIND //</span>
                <h1 className="wrapped-hero-title">
                  {wrappedData.periodTitle}
                </h1>
                <p className="wrapped-hero-subtitle">
                  Mỗi trang viết là một viên ngọc ký ức. Hãy cùng nhìn lại bản giao hưởng nội tâm rực rỡ mà bạn đã kiến tạo.
                </p>

                <div className="wrapped-tap-hint">
                  <span>Chạm hoặc nhấn mũi tên phải để bắt đầu</span>
                  <ChevronRight size={16} className="hint-arrow" />
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 1: BẢN ĐỒ CON SỐ (THE NUMBERS) ───────────────────────── */}
            {currentSlide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-numbers"
              >
                <span className="wrapped-eyebrow-tag">DẤU CHÂN THỜI GIAN</span>
                <h2 className="wrapped-slide-heading">Bạn Đã Lưu Giữ Lại...</h2>

                <div className="wrapped-number-hero-box">
                  <motion.span 
                    className="wrapped-huge-number"
                    style={{ color: wrappedData.soulColor, textShadow: `0 0 25px ${wrappedData.soulColor}80` }}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    {wrappedData.totalEntries}
                  </motion.span>
                  <span className="wrapped-number-unit">Khoảnh Khắc Cảm Xúc</span>
                </div>

                <div className="wrapped-stats-dual-row">
                  <div className="dual-stat-pill">
                    <span className="dual-stat-value">{wrappedData.totalWords.toLocaleString()}</span>
                    <span className="dual-stat-label">Từ Ngữ Thấu Cảm</span>
                  </div>
                  <div className="dual-stat-pill">
                    <span className="dual-stat-value">{wrappedData.resonanceIndex}/100</span>
                    <span className="dual-stat-label">Chỉ Số Tích Cực</span>
                  </div>
                </div>

                <p className="wrapped-slide-quote">
                  "Viết là cách tâm hồn lắng nghe chính nó giữa dòng đời vội vã."
                </p>
              </motion.div>
            )}

            {/* ─── SLIDE 2: BÀI CA CẢM XÚC (DOMINANT MOOD & COLOR) ───────────── */}
            {currentSlide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-dominant-mood"
              >
                <span className="wrapped-eyebrow-tag">AURA THỐNG TRỊ</span>
                <h2 className="wrapped-slide-heading">Giai Điệu Tâm Hồn Của Bạn</h2>

                {/* Animated Pulsing Mood Orb */}
                <div 
                  className="wrapped-mood-orb-hero"
                  style={{ 
                    backgroundColor: wrappedData.dominantMood.color + '20',
                    borderColor: wrappedData.dominantMood.color,
                    boxShadow: `0 0 50px ${wrappedData.dominantMood.glow}`
                  }}
                >
                  <span className="wrapped-orb-emoji">{wrappedData.dominantMood.icon}</span>
                  <div className="wrapped-orb-wave w1" style={{ borderColor: wrappedData.dominantMood.color }} />
                  <div className="wrapped-orb-wave w2" style={{ borderColor: wrappedData.dominantMood.color }} />
                </div>

                <h3 className="wrapped-dominant-name" style={{ color: wrappedData.dominantMood.color }}>
                  {wrappedData.dominantMood.name}
                </h3>
                <span className="wrapped-percent-tag">
                  Chiếm {wrappedData.dominantPercent}% hành trình của bạn
                </span>

                <p className="wrapped-mood-explanation">
                  {wrappedData.dominantMood.description}
                </p>

                <div className="wrapped-soul-color-code">
                  <span>MÃ MÀU LINH HỒN: </span>
                  <code style={{ color: wrappedData.soulColor }}>{wrappedData.soulColor.toUpperCase()}</code>
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 3: NGÀY ĐÁNG NHỚ NHẤT (PEAK DAY) ────────────────────── */}
            {currentSlide === 3 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-peak-day"
              >
                <span className="wrapped-eyebrow-tag">KHOẢNH KHẮC THĂNG HOA</span>
                <h2 className="wrapped-slide-heading">Ngày Tỏa Sáng Rực Rỡ Nhất</h2>

                <div className="wrapped-peak-day-badge">
                  <Calendar size={22} className="peak-cal-icon" />
                  <span className="peak-date-text">NGÀY {wrappedData.peakDay.label}</span>
                </div>

                <div className="wrapped-highlight-memory-card" style={{ borderColor: wrappedData.soulColor }}>
                  <div className="memory-card-header">
                    <span className="memory-tag">✨ TRÍCH ĐOẠN ĐÁNG NHỚ</span>
                  </div>
                  <h4 className="memory-title">"{wrappedData.highlightEntry.title}"</h4>
                  {wrappedData.highlightEntry.text && (
                    <p className="memory-snippet">
                      {wrappedData.highlightEntry.text.slice(0, 140)}...
                    </p>
                  )}
                </div>

                <div className="wrapped-peak-time-pill">
                  <span>{wrappedData.peakTime.icon} Thời điểm tâm trí thăng hoa nhất: <strong>{wrappedData.peakTime.label}</strong></span>
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 4: ĐỊNH DANH TÂM LÝ (YOUR ARCHETYPE) ────────────────── */}
            {currentSlide === 4 && (
              <motion.div
                key="slide-4"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.55 }}
                className="wrapped-slide-inner slide-archetype"
              >
                <span className="wrapped-eyebrow-tag">ĐỊNH DANH TÂM THỨC</span>
                <h2 className="wrapped-slide-heading">Nhân Vật Của Bạn Là...</h2>

                {/* Holographic Tarot Card */}
                <div 
                  className="wrapped-tarot-card"
                  style={{
                    borderColor: wrappedData.archetype.color,
                    boxShadow: `0 0 35px ${wrappedData.archetype.color}50`
                  }}
                >
                  <div className="tarot-card-top">
                    <span className="tarot-rarity-pill" style={{ backgroundColor: wrappedData.archetype.color + '25', color: wrappedData.archetype.color }}>
                      {wrappedData.archetype.badge}
                    </span>
                    <span className="tarot-symbol">{wrappedData.archetype.icon}</span>
                  </div>

                  <div className="tarot-card-artwork">
                    <div className="tarot-hologram-glow" style={{ background: `radial-gradient(circle, ${wrappedData.archetype.color}40 0%, transparent 70%)` }} />
                    <span className="tarot-main-emoji">{wrappedData.archetype.icon}</span>
                  </div>

                  <div className="tarot-card-bottom">
                    <span className="tarot-en-name">{wrappedData.archetype.title}</span>
                    <h3 className="tarot-vn-name" style={{ color: wrappedData.archetype.color }}>
                      {wrappedData.archetype.name}
                    </h3>
                    <p className="tarot-quote">"{wrappedData.archetype.quote}"</p>

                    <div className="tarot-traits-row">
                      {wrappedData.archetype.traits.map((t, idx) => (
                        <span key={idx} className="tarot-trait-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 5: HỆ SINH THÁI TỪ KHÓA & THÀNH TỰU (TAGS & MILESTONES) ── */}
            {currentSlide === 5 && (
              <motion.div
                key="slide-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-tags"
              >
                <span className="wrapped-eyebrow-tag">HỆ SINH THÁI Ý NIỆM</span>
                <h2 className="wrapped-slide-heading">Những Chủ Đề Gắn Bó Nhất</h2>

                <div className="wrapped-orbiting-tags-cloud">
                  {wrappedData.topTags.map((t, idx) => (
                    <motion.div
                      key={idx}
                      className="wrapped-floating-tag-item"
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: idx * 0.08, type: 'spring' }}
                      style={{
                        borderColor: wrappedData.soulColor,
                        boxShadow: `0 0 14px ${wrappedData.soulColor}30`
                      }}
                    >
                      <Tag size={14} className="tag-orbit-icon" />
                      <span className="tag-orbit-name">{t.tag}</span>
                      <span className="tag-orbit-count">{t.count} lần</span>
                    </motion.div>
                  ))}
                </div>

                <div className="wrapped-stability-box">
                  <div className="stability-icon-col">
                    <ShieldCheck size={28} color="#10b981" />
                  </div>
                  <div>
                    <span className="stability-title">Độ Vững Vàng Nội Tâm: <strong>{wrappedData.stabilityScore}%</strong></span>
                    <p className="stability-desc">
                      Tâm trí bạn giữ được sự cân bằng xuất sắc trước những biến động cảm xúc.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 6: THÔNG ĐIỆP TƯƠNG LAI (AI ORACLE BLESSING) ────────── */}
            {currentSlide === 6 && (
              <motion.div
                key="slide-6"
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -35 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-blessing"
              >
                <div className="wrapped-oracle-halo">
                  <span className="oracle-eye-icon">🔮</span>
                </div>

                <span className="wrapped-eyebrow-tag">LỜI CHÚC TỪ LÕI NHẬN THỨC</span>
                <h2 className="wrapped-slide-heading">Thông Điệp Dành Cho Tương Lai</h2>

                <div className="wrapped-oracle-speech-card" style={{ borderColor: wrappedData.soulColor }}>
                  <p className="oracle-speech-text">
                    "{wrappedData.aiOracleBlessing}"
                  </p>
                </div>

                <div className="wrapped-resonance-pill">
                  <span>✨ Năng lượng chữa lành: <strong>ĐẠT ĐỈNH CAO</strong></span>
                </div>
              </motion.div>
            )}

            {/* ─── SLIDE 7: THẺ WRAPPED VINH DANH (SHAREABLE SUMMARY CARD) ────── */}
            {currentSlide === 7 && (
              <motion.div
                key="slide-7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45 }}
                className="wrapped-slide-inner slide-shareable-card"
              >
                <span className="wrapped-eyebrow-tag">TỔNG KẾT HOÀN HẢO</span>

                {/* Cyberpunk Holographic Card to Export */}
                <div 
                  className="wrapped-final-hologram-card"
                  ref={cardExportRef}
                  style={{
                    borderColor: wrappedData.soulColor,
                    boxShadow: `0 0 35px ${wrappedData.soulColor}40`
                  }}
                >
                  <div className="card-top-brand">
                    <span className="brand-logo-text">MOOD RING WRAPPED</span>
                    <span className="brand-year-pill">{periodType === 'year' ? '2026' : 'WEEKLY'}</span>
                  </div>

                  <div className="card-archetype-row">
                    <div className="card-archetype-avatar" style={{ borderColor: wrappedData.archetype.color }}>
                      <span>{wrappedData.archetype.icon}</span>
                    </div>
                    <div>
                      <span className="card-archetype-sub">{wrappedData.archetype.title}</span>
                      <h3 className="card-archetype-title" style={{ color: wrappedData.archetype.color }}>
                        {wrappedData.archetype.name}
                      </h3>
                    </div>
                  </div>

                  <div className="card-metrics-grid">
                    <div className="card-metric-box">
                      <span className="metric-k">{wrappedData.totalEntries}</span>
                      <span className="metric-l">Khoảnh Khắc</span>
                    </div>
                    <div className="card-metric-box">
                      <span className="metric-k" style={{ color: wrappedData.soulColor }}>{wrappedData.dominantMood.name}</span>
                      <span className="metric-l">Aura Thống Trị</span>
                    </div>
                    <div className="card-metric-box">
                      <span className="metric-k">{wrappedData.resonanceIndex}%</span>
                      <span className="metric-l">Chỉ Số Tích Cực</span>
                    </div>
                    <div className="card-metric-box">
                      <span className="metric-k">{wrappedData.stabilityScore}%</span>
                      <span className="metric-l">Độ Cân Bằng</span>
                    </div>
                  </div>

                  <div className="card-tags-footer">
                    {wrappedData.topTags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="card-tag-pill">{t.tag}</span>
                    ))}
                  </div>

                  <div className="card-qr-footer">
                    <span className="qr-sim-code">■■■■■ MOOD RING STORY MAINFRAME ■■■■■</span>
                  </div>
                </div>

                {/* Final Action Buttons */}
                <div className="wrapped-final-actions-row">
                  <button 
                    type="button"
                    className="wrapped-action-btn primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownloadCard(e)
                    }}
                    disabled={downloading}
                    style={{ backgroundColor: wrappedData.soulColor, color: '#000' }}
                  >
                    <Download size={15} />
                    <span>{downloading ? 'Đang Lưu...' : 'Tải Thẻ Về Máy'}</span>
                  </button>

                  <button 
                    type="button"
                    className="wrapped-action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopySummary(e)
                    }}
                  >
                    {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                    <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Tóm Tắt'}</span>
                  </button>

                  <button 
                    type="button"
                    className="wrapped-action-btn replay"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReplay(e)
                    }}
                    title="Xem lại từ đầu"
                  >
                    <RotateCcw size={15} />
                    <span>Xem Lại</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Slide Indicators & Slide Number */}
        <div className="wrapped-bottom-bar">
          <button 
            type="button" 
            className="bottom-nav-arrow-btn" 
            onClick={goToPrevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft size={16} />
          </button>

          <span className="bottom-slide-counter">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button 
            type="button" 
            className="bottom-nav-arrow-btn" 
            onClick={goToNextSlide}
            disabled={currentSlide === totalSlides - 1}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
