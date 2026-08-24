import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Download, 
  Copy, 
  Check, 
  Save, 
  Trash2, 
  X, 
  Wind, 
  Eye, 
  BookOpen, 
  FileText,
  Sliders
} from 'lucide-react'
import { analyzeSmartTags, SMART_TAG_CATEGORIES } from '../utils/smartTaggingAI.js'
import { playKeyClick, playMood } from '../utils/audioSynth.js'

// ─── Procedural Web Audio Sound Generator for Typewriter & Zen Ambiance ──────
class ZenSoundEngine {
  constructor() {
    this.ctx = null
    this.ambientSource = null
    this.ambientGain = null
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playTypewriterClick(style = 'typewriter') {
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filter = this.ctx.createBiquadFilter()

    if (style === 'typewriter') {
      // Vintage mechanical typewriter click sound
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(800 + Math.random() * 400, now)
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.04)

      filter.type = 'bandpass'
      filter.frequency.value = 1600
      filter.Q.value = 2.0

      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.05)
    } else if (style === 'soft-click') {
      // Soft modern tactile key switch
      osc.type = 'sine'
      osc.frequency.setValueAtTime(320 + Math.random() * 120, now)
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.03)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.04)
    }
  }

  playZenGong() {
    this.init()
    if (!this.ctx) return

    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const osc2 = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(432, now) // 432Hz Healing Frequency
    osc.frequency.exponentialRampToValueAtTime(428, now + 3.0)

    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(864, now)
    osc2.frequency.exponentialRampToValueAtTime(856, now + 2.0)

    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5)

    osc.connect(gain)
    osc2.connect(gain)
    gain.connect(this.ctx.destination)

    osc.start(now)
    osc2.start(now)
    osc.stop(now + 3.6)
    osc2.stop(now + 3.6)
  }

  startAmbient(type = 'rain') {
    this.stopAmbient()
    this.init()
    if (!this.ctx || type === 'none') return

    try {
      const now = this.ctx.currentTime
      const bufferSize = this.ctx.sampleRate * 2
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const output = noiseBuffer.getChannelData(0)

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1
      }

      const whiteNoise = this.ctx.createBufferSource()
      whiteNoise.buffer = noiseBuffer
      whiteNoise.loop = true

      const filter = this.ctx.createBiquadFilter()
      const gain = this.ctx.createGain()

      if (type === 'rain') {
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1000, now)
        gain.gain.setValueAtTime(0.04, now)
      } else if (type === 'alpha') {
        // Binaural Alpha waves 432Hz harmonic drone
        const drone = this.ctx.createOscillator()
        drone.type = 'sine'
        drone.frequency.setValueAtTime(108, now)
        gain.gain.setValueAtTime(0.06, now)
        drone.connect(gain)
        gain.connect(this.ctx.destination)
        drone.start()
        this.ambientSource = drone
        this.ambientGain = gain
        return
      }

      whiteNoise.connect(filter)
      filter.connect(gain)
      gain.connect(this.ctx.destination)

      whiteNoise.start()
      this.ambientSource = whiteNoise
      this.ambientGain = gain
    } catch (e) {
      console.warn('Ambient sound error', e)
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        this.ambientSource.stop()
        this.ambientSource.disconnect()
      } catch {
        // Ignored
      }
      this.ambientSource = null
    }
  }
}

const zenSound = new ZenSoundEngine()

export default function ZenMode({
  isOpen = true,
  onClose,
  initialText = '',
  onSaveToJournal,
  soundEnabled = false
}) {
  const [content, setContent] = useState(initialText || '')
  const [zenTheme, setZenTheme] = useState(() => localStorage.getItem('mr-zen-theme') || 'oled-noir') // 'oled-noir' | 'paper-zen' | 'warm-sepia' | 'cyber-charcoal'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [keySoundType, setKeySoundType] = useState(() => localStorage.getItem('mr-zen-keysound') || 'typewriter') // 'typewriter' | 'soft-click' | 'off'
  const [ambientType, setAmbientType] = useState('none') // 'none' | 'rain' | 'alpha'
  
  // Pomodoro / Focus Timer
  const [timerPreset, setTimerPreset] = useState(0) // 0: Free flow, 15: 15min, 25: 25min, 45: 45min
  const [timeLeft, setTimeLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  
  // Mindful Breathing Guide (4-7-8)
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState('inhale') // 'inhale' (4s) | 'hold' (7s) | 'exhale' (8s)
  const [breathSeconds, setBreathSeconds] = useState(4)

  // Smart AI Tagging
  const [autoTagging, setAutoTagging] = useState(true)
  const [aiTagResult, setAiTagResult] = useState({ tags: [], detailedTags: [], confidenceSummary: '' })
  const [isScanningTags, setIsScanningTags] = useState(false)

  // UI state
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState(false)
  const textareaRef = useRef(null)

  // Sync Zen Theme
  useEffect(() => {
    localStorage.setItem('mr-zen-theme', zenTheme)
  }, [zenTheme])

  useEffect(() => {
    localStorage.setItem('mr-zen-keysound', keySoundType)
  }, [keySoundType])

  // Sync ambient sound
  useEffect(() => {
    if (ambientType !== 'none') {
      zenSound.startAmbient(ambientType)
    } else {
      zenSound.stopAmbient()
    }
    return () => zenSound.stopAmbient()
  }, [ambientType])

  // ESC and Alt+Z handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (showSettingsDrawer) {
          setShowSettingsDrawer(false)
        } else {
          onClose?.()
        }
      }
      if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showSettingsDrawer, onClose])

  // Realtime Smart AI Tagging Analysis (Debounced)
  useEffect(() => {
    if (!autoTagging || !content.trim()) {
      setAiTagResult({ tags: [], detailedTags: [], confidenceSummary: '' })
      return
    }
    const timer = setTimeout(() => {
      const result = analyzeSmartTags(content, { minConfidence: 12, maxTags: 5 })
      setAiTagResult(result)
    }, 400)
    return () => clearTimeout(timer)
  }, [content, autoTagging])

  // Pomodoro Focus Timer Countdown
  useEffect(() => {
    let interval = null
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false)
            zenSound.playZenGong()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning, timeLeft])

  // Breathing Guide Loop
  useEffect(() => {
    let breathTimer = null
    if (showBreathing) {
      if (breathPhase === 'inhale') {
        setBreathSeconds(4)
        breathTimer = setTimeout(() => setBreathPhase('hold'), 4000)
      } else if (breathPhase === 'hold') {
        setBreathSeconds(7)
        breathTimer = setTimeout(() => setBreathPhase('exhale'), 7000)
      } else if (breathPhase === 'exhale') {
        setBreathSeconds(8)
        breathTimer = setTimeout(() => setBreathPhase('inhale'), 8000)
      }
    }
    return () => clearTimeout(breathTimer)
  }, [showBreathing, breathPhase])

  // Handle typing & keystroke audio
  const handleContentChange = (e) => {
    const val = e.target.value
    setContent(val)
    if (keySoundType !== 'off') {
      zenSound.playTypewriterClick(keySoundType)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Timer Preset Selector
  const selectTimerPreset = (mins) => {
    setTimerPreset(mins)
    if (mins === 0) {
      setTimeLeft(0)
      setTimerRunning(false)
    } else {
      setTimeLeft(mins * 60)
      setTimerRunning(true)
      zenSound.playZenGong()
    }
  }

  // Copy to clipboard
  const handleCopy = () => {
    if (!content) return
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as markdown
  const handleDownload = () => {
    if (!content) return
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Zen_Writing_${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Save to Journal
  const handleSaveJournal = () => {
    if (!content.trim()) return
    const tags = aiTagResult.tags.length > 0 ? aiTagResult.tags : ['#bình_yên', '#tập_trung']
    if (typeof onSaveToJournal === 'function') {
      onSaveToJournal({
        note: content,
        tags,
        mood: aiTagResult.predictedMood || 'calm'
      })
    }
    setSavedFeedback(true)
    setTimeout(() => setSavedFeedback(false), 2500)
  }

  // Statistics calculation
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const chars = content.length
  const readingTime = Math.max(1, Math.ceil(words / 200))

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className={`zen-mode-viewport theme-${zenTheme}`}>
      {/* Zen Ambient Grain / Minimal Atmosphere */}
      <div className="zen-ambient-overlay" />

      {/* Top Subtle Status Bar (Auto-fades on idle) */}
      <header className="zen-top-bar">
        <div className="zen-brand">
          <span className="zen-symbol">🧘</span>
          <span className="zen-title">ZEN FOCUS SANCTUARY</span>
          <span className="zen-badge">KHÔNG GIAN TĨNH TÂM</span>
        </div>

        {/* Live Word & Timer Counters */}
        <div className="zen-stats-pill">
          <span className="stat-item" title="Số từ đã viết">
            <strong>{words}</strong> từ
          </span>
          <span className="stat-dot">•</span>
          <span className="stat-item" title="Số ký tự">
            {chars} ký tự
          </span>
          <span className="stat-dot">•</span>
          <span className="stat-item" title="Thời gian đọc ước tính">
            ~{readingTime} phút đọc
          </span>
          {timerPreset > 0 && (
            <>
              <span className="stat-dot">•</span>
              <span className={`stat-timer ${timeLeft < 60 ? 'timer-urgent' : ''}`} title="Đồng hồ Pomodoro">
                ⏱️ {formatTime(timeLeft)}
              </span>
            </>
          )}
        </div>

        {/* Zen Actions Toolbar */}
        <div className="zen-top-actions">
          <button 
            type="button" 
            className={`zen-tool-btn ${showBreathing ? 'active' : ''}`}
            onClick={() => setShowBreathing(!showBreathing)}
            title="Vòng hướng dẫn nhịp thở sâu 4-7-8"
          >
            <Wind size={15} />
            <span className="tool-text">Thở 4-7-8</span>
          </button>

          <button 
            type="button" 
            className={`zen-tool-btn ${showSettingsDrawer ? 'active' : ''}`}
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Tùy chỉnh giao diện & âm thanh gõ máy chữ"
          >
            <Sliders size={15} />
            <span className="tool-text">Tùy Chỉnh</span>
          </button>

          <button 
            type="button" 
            className="zen-tool-btn"
            onClick={toggleFullscreen}
            title="Bật/Tắt toàn màn hình"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>

          <button 
            type="button" 
            className="zen-tool-btn exit-zen-btn"
            onClick={onClose}
            title="Thoát Chế độ Tập trung (ESC / Alt+Z)"
          >
            <X size={16} />
            <span>Thoát</span>
          </button>
        </div>
      </header>

      {/* Main Focus Writing Canvas */}
      <main className="zen-editor-wrapper">
        <textarea
          ref={textareaRef}
          className="zen-textarea"
          value={content}
          onChange={handleContentChange}
          placeholder="Hãy thả lỏng và để những dòng suy nghĩ tuôn trào tự nhiên. Không có gì làm bạn phân tâm nơi đây..."
          autoFocus
          spellCheck={false}
        />
      </main>

      {/* Mindful 4-7-8 Breathing Guide Circle (Floating Minimalist) */}
      <AnimatePresence>
        {showBreathing && (
          <motion.div 
            className="zen-breathing-pill"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
          >
            <div className={`breath-orb-ring phase-${breathPhase}`}>
              <div className="breath-orb-core" />
            </div>
            <div className="breath-text-info">
              <span className="breath-phase-title">
                {breathPhase === 'inhale' && 'Hít vào nhẹ nhàng (4s)...'}
                {breathPhase === 'hold' && 'Giữ hơi tĩnh lặng (7s)...'}
                {breathPhase === 'exhale' && 'Thở ra thư thái (8s)...'}
              </span>
              <span className="breath-sub-tip">Thả lỏng vai và an trú trong hiện tại</span>
            </div>
            <button 
              className="breath-close-btn" 
              onClick={() => setShowBreathing(false)}
              title="Ẩn vòng thở"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Smart AI Tagging & Action Bar */}
      <footer className="zen-bottom-bar">
        {/* Smart AI Tagging Live Pills */}
        <div className="zen-smart-tags-group">
          <div className="ai-tag-lead" title="Hệ thống AI tự động quét nội dung và phân loại chủ đề">
            <Sparkles size={14} className="text-amber-300 animate-pulse" />
            <span>AI Smart Tags:</span>
          </div>

          {aiTagResult.detailedTags.length > 0 ? (
            <div className="ai-tags-list">
              {aiTagResult.detailedTags.map((tagObj) => (
                <span 
                  key={tagObj.tag} 
                  className="zen-tag-badge"
                  style={{ 
                    color: tagObj.color, 
                    backgroundColor: tagObj.bg, 
                    borderColor: tagObj.border 
                  }}
                  title={`AI nhận diện với độ tin cậy ${tagObj.confidence}% - Từ khóa: ${tagObj.matchedKeywords.join(', ')}`}
                >
                  <span className="tag-icon">{tagObj.icon}</span>
                  <span className="tag-name">{tagObj.tag}</span>
                  <span className="tag-confidence">{tagObj.confidence}%</span>
                </span>
              ))}
            </div>
          ) : (
            <span className="ai-tag-placeholder">
              {content.trim().length > 10 
                ? 'Đang lắng nghe từ khóa (#Gia_đình, #Công_việc, #Tình_yêu, #Áp_lực...)' 
                : 'Viết để AI tự động phân loại chủ đề...'}
            </span>
          )}
        </div>

        {/* Quick Journal & Export Actions */}
        <div className="zen-bottom-actions">
          <button
            type="button"
            className="zen-action-btn copy-btn"
            onClick={handleCopy}
            title="Sao chép toàn bộ văn bản vào bộ nhớ tạm"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
          </button>

          <button
            type="button"
            className="zen-action-btn download-btn"
            onClick={handleDownload}
            title="Tải văn bản về máy dưới dạng Markdown"
          >
            <Download size={14} />
            <span>Tải .MD</span>
          </button>

          <button
            type="button"
            className="zen-action-btn save-journal-btn"
            onClick={handleSaveJournal}
            title="Lưu trang viết này vào Nhật ký Đa phương tiện kèm các Tag thông minh"
          >
            {savedFeedback ? <Check size={14} className="text-emerald-400" /> : <Save size={14} />}
            <span>{savedFeedback ? 'Đã lưu Nhật ký!' : 'Lưu vào Nhật Ký'}</span>
          </button>
        </div>
      </footer>

      {/* Slide-out Customization Drawer */}
      <AnimatePresence>
        {showSettingsDrawer && (
          <>
            <motion.div 
              className="zen-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsDrawer(false)}
            />
            <motion.div
              className="zen-drawer-card"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            >
              <div className="zen-drawer-header">
                <div className="flex items-center gap-2">
                  <Sliders size={18} />
                  <h4>TÙY CHỈNH CHẾ ĐỘ TẬP TRUNG</h4>
                </div>
                <button 
                  className="drawer-close-btn"
                  onClick={() => setShowSettingsDrawer(false)}
                >
                  ✕
                </button>
              </div>

              <div className="zen-drawer-content">
                {/* 1. Theme Selection */}
                <div className="drawer-group">
                  <label className="drawer-label">PHONG CÁCH GIAO DIỆN ZEN</label>
                  <div className="zen-themes-grid">
                    {[
                      { id: 'oled-noir', name: 'OLED Noir', color: '#000000', border: '#333', desc: 'Đen tuyệt đối & Chữ ngà' },
                      { id: 'paper-zen', name: 'Paper Zen', color: '#fafafa', border: '#ccc', text: '#18181b', desc: 'Trắng tinh khôi & Than chì' },
                      { id: 'warm-sepia', name: 'Warm Sepia', color: '#1a1614', border: '#f6d395', desc: 'Trầm ấm cổ điển & Hổ phách' },
                      { id: 'cyber-charcoal', name: 'Cyber Slate', color: '#0d1117', border: '#2dd4bf', desc: 'Than chì lượng tử' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        className={`zen-theme-card ${zenTheme === t.id ? 'active' : ''}`}
                        onClick={() => setZenTheme(t.id)}
                      >
                        <span className="theme-color-chip" style={{ backgroundColor: t.color, borderColor: t.border }} />
                        <div className="theme-meta">
                          <span className="theme-name">{t.name}</span>
                          <span className="theme-desc">{t.desc}</span>
                        </div>
                        {zenTheme === t.id && <Check size={14} className="theme-check-icon" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pomodoro Focus Timer */}
                <div className="drawer-group">
                  <label className="drawer-label">ĐỒNG HỒ TẬP TRUNG (POMODORO)</label>
                  <div className="timer-presets-row">
                    {[
                      { mins: 0, label: 'Tự do' },
                      { mins: 15, label: '15 Phút' },
                      { mins: 25, label: '25 Phút (Pomodoro)' },
                      { mins: 45, label: '45 Phút' }
                    ].map(item => (
                      <button
                        key={item.mins}
                        type="button"
                        className={`timer-preset-btn ${timerPreset === item.mins ? 'active' : ''}`}
                        onClick={() => selectTimerPreset(item.mins)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Keyboard Sound Effects */}
                <div className="drawer-group">
                  <label className="drawer-label">ÂM THANH GÕ BÀN PHÍM</label>
                  <div className="sound-options-row">
                    {[
                      { id: 'typewriter', label: 'Máy Chữ Vintage', icon: '⌨️' },
                      { id: 'soft-click', label: 'Phím Tactile Mềm', icon: '🔘' },
                      { id: 'off', label: 'Tắt Âm Thanh', icon: '🔇' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`sound-option-btn ${keySoundType === item.id ? 'active' : ''}`}
                        onClick={() => {
                          setKeySoundType(item.id)
                          if (item.id !== 'off') zenSound.playTypewriterClick(item.id)
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Ambient Background Drone */}
                <div className="drawer-group">
                  <label className="drawer-label">ÂM THANH MÔI TRƯỜNG THƯ THÁI</label>
                  <div className="sound-options-row">
                    {[
                      { id: 'none', label: 'Yên Lặng Tuyệt Đối', icon: '🌙' },
                      { id: 'rain', label: 'Mưa Đêm Nhẹ Nhàng', icon: '🌧️' },
                      { id: 'alpha', label: 'Sóng Não Alpha 432Hz', icon: '🧘' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`sound-option-btn ${ambientType === item.id ? 'active' : ''}`}
                        onClick={() => setAmbientType(item.id)}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Smart AI Tagging Switch */}
                <div className="drawer-group">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="drawer-label mb-0">TỰ ĐỘNG QUÉT THẺ THÔNG MINH</label>
                      <p className="drawer-subtext">AI quét nội dung phân loại #Gia_đình, #Công_việc, #Tình_yêu, #Áp_lực...</p>
                    </div>
                    <button
                      type="button"
                      className={`toggle-switch-pill ${autoTagging ? 'active' : ''}`}
                      onClick={() => setAutoTagging(!autoTagging)}
                    >
                      <span className="switch-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="zen-drawer-footer">
                <button
                  type="button"
                  className="drawer-done-btn"
                  onClick={() => setShowSettingsDrawer(false)}
                >
                  Xác Nhận & Tiếp Tục Viết
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
