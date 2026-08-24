import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  GripVertical,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  Clock,
  Activity,
  Headphones,
  BookOpen,
  Calendar,
  BarChart3,
  Compass,
  Sliders,
  Play,
  Square,
  Volume2,
  VolumeX,
  Send,
  Check,
  Zap,
  Flame,
  Wind,
  Shield,
  Layers,
  HelpCircle,
  TrendingUp,
  Heart,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import {
  WIDGET_REGISTRY,
  LAYOUT_PRESETS,
  getDashboardLayout,
  saveDashboardLayout,
  resetDashboardPreset,
  reorderDashboardWidgets,
  setDashboardWidgetSize,
  toggleDashboardWidgetVisibility
} from '../utils/dragDropDashboardEngine.js'
import { playKeyClick, playMood, stopAll, playInsightChimeSound } from '../utils/audioSynth.js'
import { storyData } from '../data/storyNodes.js'

export default function CustomizableDashboard({
  isOpen = true,
  onClose = () => {},
  isEmbedded = false,
  soundEnabled = true,
  currentNode = 'start',
  journeyPath = ['start'],
  onNavigateTab = () => {},
  onJumpToNode = () => {}
}) {
  const [layout, setLayout] = useState(() => getDashboardLayout())
  const [editMode, setEditMode] = useState(false)
  const [activePreset, setActivePreset] = useState('default')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [toastMsg, setToastMsg] = useState(null)

  // Widget 1: Cyber Clock & Weather State
  const [currentTime, setCurrentTime] = useState(new Date())

  // Widget 3: Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [currentAudioMood, setCurrentAudioMood] = useState('calm')

  // Widget 4: Quick Journal & Quote State
  const [quickNote, setQuickNote] = useState('')
  const [savedNotesCount, setSavedNotesCount] = useState(0)

  // Widget 7: Mini Oracle State
  const [oracleQuery, setOracleQuery] = useState('')
  const [oracleAnswer, setOracleAnswer] = useState('Hãy lắng nghe tiếng thì thầm của Lõi Nhận Thức, câu trả lời nằm ở nhịp đập tâm trí bạn.')
  const [oracleLoading, setOracleLoading] = useState(false)

  // Listen to external layout changes
  useEffect(() => {
    const handleLayoutUpdate = (e) => {
      if (e.detail?.layout) setLayout(e.detail.layout)
    }
    window.addEventListener('mr-dashboard-layout-updated', handleLayoutUpdate)
    return () => window.removeEventListener('mr-dashboard-layout-updated', handleLayoutUpdate)
  }, [])

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const triggerToast = (msg) => {
    setToastMsg(msg)
    if (soundEnabled) playInsightChimeSound()
    setTimeout(() => setToastMsg(null), 3000)
  }

  // Preset switch
  const handlePresetChange = (presetKey) => {
    setActivePreset(presetKey)
    const updated = resetDashboardPreset(presetKey)
    setLayout(updated)
    if (soundEnabled) playKeyClick()
    triggerToast(`Đã chuyển sang bố cục "${LAYOUT_PRESETS[presetKey].name}"`)
  }

  // Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const reordered = reorderDashboardWidgets(draggedIndex, targetIndex)
      setLayout(reordered)
      if (soundEnabled) playKeyClick()
      triggerToast('Đã sắp xếp lại vị trí thẻ widget!')
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Size toggle cycle: normal -> wide -> expanded -> compact -> normal
  const cycleWidgetSize = (widgetId, currentSize) => {
    const sizeMap = {
      'compact': 'normal',
      'normal': 'wide',
      'wide': 'expanded',
      'expanded': 'compact'
    }
    const nextSize = sizeMap[currentSize] || 'normal'
    const updated = setDashboardWidgetSize(widgetId, nextSize)
    setLayout(updated)
    if (soundEnabled) playKeyClick()
  }

  // Visibility toggle
  const toggleVisibility = (widgetId) => {
    const updated = toggleDashboardWidgetVisibility(widgetId)
    setLayout(updated)
    if (soundEnabled) playKeyClick()
  }

  // Quick Journal Submit
  const handleQuickJournalSubmit = (e) => {
    e.preventDefault()
    if (!quickNote.trim()) return
    try {
      const existing = JSON.parse(localStorage.getItem('mr-quick-journal-notes') || '[]')
      const newEntry = {
        id: Date.now(),
        text: quickNote.trim(),
        date: new Date().toISOString(),
        node: currentNode
      }
      localStorage.setItem('mr-quick-journal-notes', JSON.stringify([newEntry, ...existing]))
      setQuickNote('')
      setSavedNotesCount(c => c + 1)
      triggerToast('Đã lưu ghi chú cảm xúc vào nhật ký!')
    } catch {
      triggerToast('Đã lưu ghi chú!')
    }
  }

  // Mini Oracle Ask
  const handleMiniOracleSubmit = (e) => {
    e.preventDefault()
    if (!oracleQuery.trim()) return
    setOracleLoading(true)
    if (soundEnabled) playKeyClick()

    const PROPHECIES = [
      'Ánh sáng từ Lõi MR-CORE-01 chiếu rọi rằng: Mọi lựa chọn trong quá khứ đang dẫn bạn đến một bước ngoặt cảm xúc diệu kỳ.',
      'Sóng não cho thấy sự cân bằng đang được thiết lập. Hãy tin tưởng vào trực giác đầu tiên của bạn.',
      'Một luồng năng lượng mới sắp thức tỉnh. Hãy dành vài phút tĩnh lặng để lắng nghe chính mình.',
      'Vượt qua tường lửa của nỗi bất an, bạn sẽ tìm thấy khoang ký ức chứa đầy tình yêu thương và sự can đảm.',
      'Vũ trụ số phản hồi: Mọi cảm xúc tiêu cực chỉ là dữ liệu tạm thời, chúng sẽ tan biến như khói sương.'
    ]

    setTimeout(() => {
      const randomProphecy = PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)]
      setOracleAnswer(randomProphecy)
      setOracleLoading(false)
      setOracleQuery('')
      if (soundEnabled) playInsightChimeSound()
    }, 600)
  }

  // Render Widget Content based on ID
  const renderWidgetContent = (widgetId) => {
    switch (widgetId) {
      case 'cyber-clock-weather':
        return (
          <div className="widget-cyber-clock-box">
            <div className="clock-digital-time">
              {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="clock-date-row">
              <span>{currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <div className="weather-badge-pill">
                <Sparkles size={12} /> Bầu Trời Cảm Xúc: Trong Xanh
              </div>
            </div>
          </div>
        )

      case 'biometrics-stress':
        return (
          <div className="biometrics-gauge-grid">
            <div className="bio-gauge-card">
              <span className="bio-gauge-value" style={{ color: '#ef4444' }}>74</span>
              <span className="bio-gauge-label">Nhịp Tim (BPM)</span>
            </div>
            <div className="bio-gauge-card">
              <span className="bio-gauge-value" style={{ color: '#22c55e' }}>22%</span>
              <span className="bio-gauge-label">Mức Stress (Thấp)</span>
            </div>
            <div className="bio-gauge-card">
              <span className="bio-gauge-value" style={{ color: '#00f0ff' }}>98%</span>
              <span className="bio-gauge-label">Đồng Bộ Nhận Thức</span>
            </div>
          </div>
        )

      case 'audio-player':
        return (
          <div className="audio-widget-content">
            <div className="audio-soundwave-canvas">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="soundwave-bar"
                  style={{
                    animationDuration: `${0.8 + (i % 5) * 0.25}s`,
                    animationPlayState: isPlayingAudio ? 'running' : 'paused',
                    height: isPlayingAudio ? undefined : '6px'
                  }}
                />
              ))}
            </div>
            <div className="audio-controls-row">
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="dashboard-btn"
                  style={{ background: isPlayingAudio ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 240, 255, 0.2)', borderColor: isPlayingAudio ? '#ef4444' : 'var(--accent)' }}
                  onClick={() => {
                    if (isPlayingAudio) {
                      stopAll()
                      setIsPlayingAudio(false)
                    } else {
                      playMood(currentAudioMood)
                      setIsPlayingAudio(true)
                    }
                  }}
                >
                  {isPlayingAudio ? <Square size={14} /> : <Play size={14} />}
                  <span>{isPlayingAudio ? 'Dừng Nhạc' : 'Phát Tần Số'}</span>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['calm', 'friction', 'breach'].map(m => (
                  <button
                    key={m}
                    className={`theme-cat-pill ${currentAudioMood === m ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentAudioMood(m)
                      if (isPlayingAudio) playMood(m)
                    }}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 'quick-journal':
        return (
          <div className="quick-journal-box">
            <div className="daily-quote-card">
              "Tâm trí như mặt hồ phẳng lặng, khi bình yên sẽ phản chiếu trọn vẹn vẻ đẹp của cả vũ trụ."
            </div>
            <form onSubmit={handleQuickJournalSubmit} className="quick-journal-input-row">
              <input
                type="text"
                value={quickNote}
                onChange={e => setQuickNote(e.target.value)}
                placeholder="Tâm trạng bạn lúc này thế nào? Viết nhanh..."
              />
              <button type="submit" className="dashboard-btn" style={{ background: 'var(--accent)', color: '#000', fontWeight: 700 }}>
                <Send size={14} /> Lưu
              </button>
            </form>
          </div>
        )

      case 'mood-calendar':
        return (
          <div>
            <div className="mini-calendar-grid">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{d}</div>
              ))}
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1
                const colors = ['#00f0ff', '#10b981', '#a855f7', '#f59e0b', '#ec4899']
                const dotColor = colors[dayNum % colors.length]
                return (
                  <div key={idx} className="mini-cal-day-cell">
                    <span>{dayNum}</span>
                    <div className="mini-cal-dot" style={{ background: dotColor }} />
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'mood-chart':
        return (
          <div className="mini-mood-chart-bars">
            {[
              { day: 'T2', height: '65%', color: '#00f0ff' },
              { day: 'T3', height: '40%', color: '#10b981' },
              { day: 'T4', height: '85%', color: '#f59e0b' },
              { day: 'T5', height: '50%', color: '#00f0ff' },
              { day: 'T6', height: '90%', color: '#a855f7' },
              { day: 'T7', height: '75%', color: '#ec4899' },
              { day: 'CN', height: '95%', color: '#00f0ff' }
            ].map(b => (
              <div key={b.day} className="chart-bar-column">
                <div className="chart-bar-fill" style={{ height: b.height, background: b.color, boxShadow: `0 0 8px ${b.color}` }} />
                <span className="chart-bar-day-label">{b.day}</span>
              </div>
            ))}
          </div>
        )

      case 'mini-oracle':
        return (
          <div className="mini-oracle-form">
            <div className="oracle-response-bubble">
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: '#c084fc' }} />
              {oracleLoading ? 'Đang giải mã thông điệp vũ trụ...' : oracleAnswer}
            </div>
            <form onSubmit={handleMiniOracleSubmit} style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                className="studio-input"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                value={oracleQuery}
                onChange={e => setOracleQuery(e.target.value)}
                placeholder="Hỏi Oracle một câu hỏi..."
              />
              <button type="submit" className="dashboard-btn" style={{ padding: '0.45rem 0.8rem' }}>
                Hỏi
              </button>
            </form>
          </div>
        )

      case 'story-radar':
        {
          const totalNodes = Object.keys(storyData).length
          const visitedCount = journeyPath.length
          const progressPercent = Math.min(100, Math.round((visitedCount / totalNodes) * 100))

          return (
            <div className="story-radar-info-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span>Tiến trình cốt truyện:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{progressPercent}% ({visitedCount}/{totalNodes} cảnh)</span>
              </div>
              <div className="story-progress-bar-container">
                <div className="story-progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                <button
                  className="dashboard-btn"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                  onClick={() => onJumpToNode('start')}
                >
                  ⚡ Về Bắt Đầu
                </button>
                <button
                  className="dashboard-btn"
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', justifyContent: 'center' }}
                  onClick={() => onNavigateTab('core')}
                >
                  🔮 Đến Lõi Cốt Truyện
                </button>
              </div>
            </div>
          )
        }

      default:
        return <div>Khối tính năng tùy biến</div>
    }
  }

  const visibleWidgets = layout.filter(w => w.visible)

  return (
    <div className="custom-dashboard-wrapper">
      {/* Dashboard Topbar */}
      <div className="dashboard-control-topbar">
        <div className="dashboard-title-area">
          <div className="dashboard-icon-gem">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h2 className="dashboard-heading">DASHBOARD CÁ NHÂN HÓA // DRAG & DROP ⚡</h2>
            <p className="dashboard-subheading">Kéo thả, thu phóng và sắp xếp bảng điều khiển cảm xúc theo ý thích của bạn</p>
          </div>
        </div>

        <div className="dashboard-actions-area">
          {/* Preset Selector */}
          <select
            className="dashboard-preset-select"
            value={activePreset}
            onChange={e => handlePresetChange(e.target.value)}
          >
            {Object.entries(LAYOUT_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>Bố Cục: {v.name}</option>
            ))}
          </select>

          {/* Edit / Lock Layout Button */}
          <button
            className={`dashboard-btn ${editMode ? 'edit-mode-active' : ''}`}
            onClick={() => {
              setEditMode(!editMode)
              if (soundEnabled) playKeyClick()
              triggerToast(editMode ? 'Đã khóa vị trí bố cục' : 'Chế độ chỉnh sửa layout đã bật! Bạn có thể kéo thả.')
            }}
          >
            <Sliders size={15} />
            <span>{editMode ? 'Khóa Bố Cục (Done)' : 'Chỉnh Sửa Layout'}</span>
          </button>

          {/* Reset Layout */}
          <button
            className="dashboard-btn"
            onClick={() => handlePresetChange('default')}
            title="Khôi phục bố cục mặc định"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.9), rgba(168, 85, 247, 0.9))',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.84rem',
              alignSelf: 'center',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Mode Drawer: Manage Widgets Toggle */}
      {editMode && (
        <motion.div
          className="dashboard-manage-drawer"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="manage-drawer-title">
            <Sliders size={16} />
            <span>BẬT / ẨN CÁC KHỐI TÍNH NĂNG (WIDGETS):</span>
          </div>

          <div className="manage-widgets-pills">
            {layout.map(w => {
              const reg = WIDGET_REGISTRY.find(r => r.id === w.id)
              return (
                <button
                  key={w.id}
                  className={`widget-toggle-pill ${w.visible ? 'is-active' : ''}`}
                  onClick={() => toggleVisibility(w.id)}
                >
                  {w.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{reg?.title || w.id}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Dynamic Grid Layout */}
      <div className="dashboard-grid">
        {visibleWidgets.map((w, index) => {
          const reg = WIDGET_REGISTRY.find(r => r.id === w.id)
          const sizeClass = `widget-col-${w.size || 'normal'}`
          const isDragging = draggedIndex === index
          const isDragOver = dragOverIndex === index

          return (
            <div
              key={w.id}
              className={`dashboard-widget-card ${sizeClass} ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Header */}
              <div className="widget-card-header">
                <div className="widget-header-title-box">
                  {editMode && (
                    <div className="widget-drag-handle" title="Kéo để đổi vị trí">
                      <GripVertical size={16} />
                    </div>
                  )}
                  <span className="widget-title-text">{reg?.title || w.id}</span>
                </div>

                <div className="widget-header-controls">
                  {/* Resize Cycle Button */}
                  <button
                    className="widget-control-icon-btn"
                    onClick={() => cycleWidgetSize(w.id, w.size || 'normal')}
                    title={`Kích thước: ${w.size || 'normal'}. Nhấn để đổi kích cỡ.`}
                  >
                    <Maximize2 size={13} />
                  </button>

                  {/* Hide Button in Edit Mode */}
                  {editMode && (
                    <button
                      className="widget-control-icon-btn"
                      onClick={() => toggleVisibility(w.id)}
                      title="Ẩn widget này"
                    >
                      <EyeOff size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="widget-card-body">
                {renderWidgetContent(w.id)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
