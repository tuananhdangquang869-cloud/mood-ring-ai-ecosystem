import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Clock, 
  Tag, 
  X, 
  Check, 
  Plus, 
  Eye, 
  TrendingUp, 
  Smile, 
  Layers, 
  Compass,
  ArrowRight
} from 'lucide-react'
import { playKeyClick, playMood } from '../utils/audioSynth.js'

const MOOD_COLOR_MAP = {
  joy: { name: 'Hân Hoan', icon: '⚡', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' },
  calm: { name: 'Bình Yên', icon: '🌿', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  melancholy: { name: 'Trầm Mặc', icon: '🌌', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)' },
  friction: { name: 'Trăn Trở', icon: '⚙️', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  breach: { name: 'Bùng Nổ', icon: '🔥', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' }
}

const DAYS_OF_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export default function MoodCalendar({
  isOpen = true,
  onClose,
  isEmbedded = false,
  soundEnabled = true,
  onInspectEntry
}) {
  // Current calendar view year & month (Default: August 2026)
  const [viewDate, setViewDate] = useState(() => new Date(2026, 7, 16)) // Aug 16, 2026
  const [selectedDateKey, setSelectedDateKey] = useState('2026-08-16')
  const [showQuickLogModal, setShowQuickLogModal] = useState(false)
  const [quickMood, setQuickMood] = useState('calm')
  const [quickTitle, setQuickTitle] = useState('')
  const [quickNote, setQuickNote] = useState('')
  const [quickIntensity, setQuickIntensity] = useState(80)
  const [localEntriesVersion, setLocalEntriesVersion] = useState(0)

  // Load all entries from all sources
  const allEntriesByDate = useMemo(() => {
    // Dependency on localEntriesVersion to re-evaluate after quick logging
    void localEntriesVersion

    const map = {}

    const addEntryToMap = (entry) => {
      if (!entry.date) return
      // Format YYYY-MM-DD
      const dateObj = new Date(entry.date)
      if (isNaN(dateObj.getTime())) return
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`

      if (!map[dateKey]) {
        map[dateKey] = []
      }
      map[dateKey].push(entry)
    }

    // 1. Multimedia Journal
    try {
      const saved = localStorage.getItem('mr-multimedia-journal-entries')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.forEach(e => addEntryToMap({ ...e, source: 'journal', sourceIcon: '🎨', sourceLabel: 'Nhật Ký Nghệ Thuật' }))
      }
    } catch (e) {
      console.warn('Error reading journal for calendar:', e)
    }

    // 2. Dream Journal
    try {
      const saved = localStorage.getItem('mr-dream-journal-entries')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.forEach(e => addEntryToMap({
          id: e.id,
          title: e.title || 'Giấc mơ vô thực',
          date: e.date || e.createdAt,
          mood: 'calm',
          intensity: 75,
          note: e.content || e.note || '',
          tags: e.tags || ['#dream'],
          source: 'dream',
          sourceIcon: '🌙',
          sourceLabel: 'Sổ Tay Ước Mơ'
        }))
      }
    } catch (e) {
      console.warn('Error reading dream for calendar:', e)
    }

    // 3. Time Capsules
    try {
      const saved = localStorage.getItem('mr-time-capsules')
      if (saved) {
        const parsed = JSON.parse(saved)
        parsed.forEach(e => addEntryToMap({
          id: e.id,
          title: e.title || 'Hộp thời gian',
          date: e.createdAt,
          mood: e.mood || 'calm',
          intensity: 85,
          note: e.isLocked ? '(Đang niêm phong)' : (e.message || ''),
          tags: ['#thời_gian'],
          source: 'capsule',
          sourceIcon: '⏳',
          sourceLabel: 'Hộp Thời Gian'
        }))
      }
    } catch (e) {
      console.warn('Error reading capsules for calendar:', e)
    }

    return map
  }, [localEntriesVersion])

  // Calendar calculations for viewDate
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7 // Monday = 0
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
    const prevMonthDays = new Date(year, month, 0).getDate()

    const days = []

    // Padding previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i
      const pMonth = month === 0 ? 12 : month
      const pYear = month === 0 ? year - 1 : year
      const dateKey = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      days.push({
        dayNum,
        dateKey,
        isCurrentMonth: false,
        entries: allEntriesByDate[dateKey] || []
      })
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dayNum: i,
        dateKey,
        isCurrentMonth: true,
        entries: allEntriesByDate[dateKey] || []
      })
    }

    // Trailing next month days to complete 42 grid cells
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const nMonth = month + 2 > 12 ? 1 : month + 2
      const nYear = month + 2 > 12 ? year + 1 : year
      const dateKey = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dayNum: i,
        dateKey,
        isCurrentMonth: false,
        entries: allEntriesByDate[dateKey] || []
      })
    }

    return days
  }, [viewDate, allEntriesByDate])

  // Selected Day Entries
  const selectedEntries = allEntriesByDate[selectedDateKey] || []

  // Monthly Analytics Statistics
  const monthStats = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth() + 1
    const prefix = `${year}-${String(month).padStart(2, '0')}`

    const moodCounts = { joy: 0, calm: 0, melancholy: 0, friction: 0, breach: 0 }
    let totalMonthEntries = 0
    let totalIntensity = 0
    const activeDaysSet = new Set()

    Object.entries(allEntriesByDate).forEach(([dKey, eList]) => {
      if (dKey.startsWith(prefix) && eList.length > 0) {
        activeDaysSet.add(dKey)
        eList.forEach(e => {
          totalMonthEntries++
          const m = e.mood || 'calm'
          if (moodCounts[m] !== undefined) moodCounts[m]++
          totalIntensity += (e.intensity || 70)
        })
      }
    })

    // Find dominant mood
    let dominantMood = 'calm'
    let maxCount = -1
    Object.entries(moodCounts).forEach(([m, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantMood = m
      }
    })

    // Calculate streak
    const sortedKeys = Object.keys(allEntriesByDate).sort().reverse()
    let currentStreak = 0
    if (sortedKeys.length > 0) {
      currentStreak = Math.min(activeDaysSet.size, 14) // sensible demo streak
      if (currentStreak === 0 && activeDaysSet.size > 0) currentStreak = activeDaysSet.size
    }

    const avgIntensity = totalMonthEntries > 0 ? Math.round(totalIntensity / totalMonthEntries) : 75

    return {
      moodCounts,
      totalMonthEntries,
      activeDaysCount: activeDaysSet.size,
      dominantMood,
      currentStreak: Math.max(1, currentStreak),
      avgIntensity
    }
  }, [viewDate, allEntriesByDate])

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    if (soundEnabled) playKeyClick()
  }

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    if (soundEnabled) playKeyClick()
  }

  const handleDaySelect = (day) => {
    setSelectedDateKey(day.dateKey)
    if (day.entries.length > 0 && day.entries[0].mood) {
      if (soundEnabled) playMood(day.entries[0].mood)
    } else {
      if (soundEnabled) playKeyClick()
    }
  }

  // Quick Log Mood Handler
  const handleSaveQuickLog = () => {
    if (!quickTitle.trim()) return

    const newEntry = {
      id: `quick-${Date.now()}`,
      title: quickTitle.trim(),
      date: `${selectedDateKey} 12:00`,
      mood: quickMood,
      intensity: quickIntensity,
      type: 'drawing',
      note: quickNote.trim() || 'Ghi chép cảm xúc nhanh từ Lịch Cảm Xúc.',
      tags: [`#${quickMood}`, '#lịch_cảm_xúc'],
      palette: [MOOD_COLOR_MAP[quickMood].color, '#070b14', '#ffffff'],
      aiAnalysis: `Bản ghi cảm xúc nhanh tại ngày ${selectedDateKey}. Tâm trạng chủ đạo: ${MOOD_COLOR_MAP[quickMood].name}.`
    }

    try {
      const saved = localStorage.getItem('mr-multimedia-journal-entries')
      const parsed = saved ? JSON.parse(saved) : []
      parsed.unshift(newEntry)
      localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(parsed))
      setLocalEntriesVersion(v => v + 1)
      setShowQuickLogModal(false)
      setQuickTitle('')
      setQuickNote('')
      if (soundEnabled) playMood(quickMood)
    } catch (e) {
      console.warn('Failed to save quick log:', e)
    }
  }

  if (!isOpen && !isEmbedded) return null

  const monthYearLabel = viewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })

  const content = (
    <div className={`mood-calendar-container ${isEmbedded ? 'embedded-view' : ''}`}>
      {/* Header */}
      {!isEmbedded && (
        <div className="calendar-modal-header">
          <div className="flex items-center gap-3">
            <div className="calendar-badge-icon">
              <CalendarIcon size={20} className="text-cyan-400" />
            </div>
            <div>
              <span className="settings-tag">// CHRONO EMOTIONAL TRACKER //</span>
              <h3 className="settings-title">LỊCH CẢM XÚC (CALENDAR VIEW)</h3>
            </div>
          </div>

          {onClose && (
            <button 
              className="settings-close-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                onClose()
              }}
              title="Đóng (ESC)"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Main Grid + Sidebar Layout */}
      <div className="calendar-main-grid">
        {/* Left Column: Interactive Month Grid */}
        <div className="calendar-grid-card">
          {/* Navigation Controls */}
          <div className="calendar-controls-bar">
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                className="cal-nav-btn"
                onClick={handlePrevMonth}
                title="Tháng trước"
              >
                <ChevronLeft size={16} />
              </button>
              <h4 className="cal-month-title text-capitalize">
                {(monthYearLabel || '').toUpperCase()}
              </h4>
              <button 
                type="button" 
                className="cal-nav-btn"
                onClick={handleNextMonth}
                title="Tháng sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="cal-today-btn"
                onClick={() => {
                  setViewDate(new Date(2026, 7, 16))
                  setSelectedDateKey('2026-08-16')
                  if (soundEnabled) playKeyClick()
                }}
              >
                <Clock size={13} />
                <span>Hôm Nay</span>
              </button>

              <button
                type="button"
                className="cal-add-entry-btn"
                onClick={() => {
                  setShowQuickLogModal(true)
                  if (soundEnabled) playKeyClick()
                }}
              >
                <Plus size={13} />
                <span>Ghi Nhận Mood</span>
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="cal-weekdays-row">
            {DAYS_OF_WEEK.map((w, idx) => (
              <div key={idx} className="cal-weekday-cell">{w}</div>
            ))}
          </div>

          {/* 42-Cell Calendar Matrix */}
          <div className="cal-matrix-grid">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDateKey === day.dateKey
              const hasEntries = day.entries.length > 0
              const primaryEntry = hasEntries ? day.entries[0] : null
              const primaryMood = primaryEntry?.mood || null
              const moodConfig = primaryMood ? MOOD_COLOR_MAP[primaryMood] : null
              const isToday = day.dateKey === '2026-08-16'

              return (
                <div
                  key={idx}
                  className={`cal-day-cell ${!day.isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDaySelect(day)}
                  style={{
                    borderColor: isSelected 
                      ? (moodConfig ? moodConfig.color : '#00f0ff') 
                      : (isToday ? 'rgba(0, 240, 255, 0.4)' : undefined)
                  }}
                >
                  <div className="day-number-row">
                    <span className="day-number">{day.dayNum}</span>
                    {isToday && <span className="today-badge">NOW</span>}
                  </div>

                  {/* Mood Glowing Dot & Visual Indicator */}
                  <div className="day-mood-indicator-area">
                    {hasEntries && (
                      <div className="flex items-center gap-1 flex-wrap justify-center">
                        {day.entries.slice(0, 3).map((e, eIdx) => {
                          const mCfg = MOOD_COLOR_MAP[e.mood] || MOOD_COLOR_MAP.calm
                          return (
                            <span
                              key={eIdx}
                              className="mood-glowing-dot"
                              style={{
                                backgroundColor: mCfg.color,
                                boxShadow: `0 0 10px ${mCfg.color}`
                              }}
                              title={`${mCfg.name}: ${e.title}`}
                            />
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {hasEntries && (
                    <div className="day-entry-count-pill" style={{ color: moodConfig?.color || '#94a3b8' }}>
                      <span>{day.entries.length} log</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Color Legend Bar */}
          <div className="cal-legend-bar">
            <span className="legend-label">Bảng Màu Cảm Xúc:</span>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(MOOD_COLOR_MAP).map(([mKey, cfg]) => (
                <div key={mKey} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: cfg.color }} />
                  <span className="legend-text">{cfg.icon} {cfg.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Day Inspector & Monthly Stats */}
        <div className="calendar-sidebar-col">
          {/* Selected Date Inspector Card */}
          <div className="cal-day-inspector-card">
            <div className="inspector-header">
              <div className="flex items-center gap-2">
                <CalendarIcon size={15} className="text-cyan-400" />
                <span className="inspector-date-label">
                  NGÀY {selectedDateKey.split('-').reverse().join('/')}
                </span>
              </div>
              <span className="inspector-count-pill">
                {selectedEntries.length} Bản ghi
              </span>
            </div>

            <div className="inspector-entries-scroll">
              {selectedEntries.length === 0 ? (
                <div className="inspector-empty">
                  <div className="empty-cal-icon">🗓️</div>
                  <p>Chưa có bản ghi cảm xúc nào trong ngày này.</p>
                  <button
                    type="button"
                    className="cal-quick-add-btn"
                    onClick={() => {
                      setShowQuickLogModal(true)
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <Plus size={13} />
                    <span>Thêm Bản Ghi Ngay</span>
                  </button>
                </div>
              ) : (
                <div className="inspector-entries-list">
                  {selectedEntries.map((item) => {
                    const mCfg = MOOD_COLOR_MAP[item.mood] || MOOD_COLOR_MAP.calm
                    return (
                      <div 
                        key={item.id}
                        className="day-entry-item"
                        style={{ borderLeftColor: mCfg.color }}
                      >
                        <div className="entry-item-top">
                          <span className="entry-item-title">{item.title}</span>
                          <span 
                            className="entry-mood-pill"
                            style={{ color: mCfg.color, borderColor: `${mCfg.color}44`, backgroundColor: `${mCfg.color}15` }}
                          >
                            {mCfg.icon} {mCfg.name} ({item.intensity || 75}%)
                          </span>
                        </div>

                        <p className="entry-item-note">
                          "{item.note || item.content || 'Không có ghi chú.'}"
                        </p>

                        <div className="entry-item-footer">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="source-mini-tag">{item.sourceIcon} {item.sourceLabel}</span>
                            {item.tags?.slice(0, 2).map((t, idx) => (
                              <span key={idx} className="tag-mini-pill">{t}</span>
                            ))}
                          </div>

                          {onInspectEntry && (
                            <button
                              type="button"
                              className="view-detail-btn"
                              onClick={() => onInspectEntry(item)}
                            >
                              <Eye size={12} />
                              <span>Xem</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Monthly Analytics Statistics Card */}
          <div className="cal-monthly-stats-card">
            <div className="stats-header">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-emerald-400" />
                <span className="stats-title">THỐNG KÊ TÂM TRẠNG THÁNG</span>
              </div>
              <div className="streak-badge">
                <Flame size={12} className="text-amber-400" />
                <span>Streak {monthStats.currentStreak} Ngày</span>
              </div>
            </div>

            {/* Dominant Mood Highlight */}
            <div className="dominant-mood-banner">
              <span className="text-[11px] text-slate-400">TÂM TRẠNG CHỦ ĐẠO THÁNG NÀY:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl">{MOOD_COLOR_MAP[monthStats.dominantMood]?.icon || '🌿'}</span>
                <span className="text-sm font-bold" style={{ color: MOOD_COLOR_MAP[monthStats.dominantMood]?.color || '#10b981' }}>
                  {(MOOD_COLOR_MAP[monthStats.dominantMood]?.name || monthStats.dominantMood || 'Bình Yên').toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({monthStats.moodCounts?.[monthStats.dominantMood] || 0} lần ghi nhận)
                </span>
              </div>
            </div>

            {/* Distribution Bars */}
            <div className="mood-distribution-list">
              {Object.entries(MOOD_COLOR_MAP).map(([mKey, cfg]) => {
                const count = monthStats.moodCounts[mKey] || 0
                const percent = monthStats.totalMonthEntries > 0 
                  ? Math.round((count / monthStats.totalMonthEntries) * 100) 
                  : 0

                return (
                  <div key={mKey} className="dist-row">
                    <div className="dist-labels">
                      <span className="dist-name">{cfg.icon} {cfg.name}</span>
                      <span className="dist-val">{percent}% ({count})</span>
                    </div>
                    <div className="dist-bar-track">
                      <div 
                        className="dist-bar-fill" 
                        style={{ width: `${percent}%`, backgroundColor: cfg.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Log Modal Overlay */}
      <AnimatePresence>
        {showQuickLogModal && (
          <div className="entry-inspect-overlay" onClick={() => setShowQuickLogModal(false)}>
            <motion.div 
              className="quick-log-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="quick-log-header">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">GHI NHẬN TÂM TRẠNG CHO NGÀY {selectedDateKey}</h4>
                </div>
                <button 
                  className="settings-close-btn"
                  onClick={() => setShowQuickLogModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="quick-log-body">
                <div className="form-group mb-3">
                  <label className="text-xs font-bold text-slate-300 block mb-1">CHỌN MOOD CHỦ ĐẠO:</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Object.entries(MOOD_COLOR_MAP).map(([mKey, cfg]) => (
                      <button
                        key={mKey}
                        type="button"
                        className={`mood-picker-btn ${quickMood === mKey ? 'active' : ''}`}
                        style={{ borderColor: quickMood === mKey ? cfg.color : 'rgba(255,255,255,0.1)' }}
                        onClick={() => {
                          setQuickMood(mKey)
                          if (soundEnabled) playMood(mKey)
                        }}
                      >
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="text-[10px] font-bold mt-1" style={{ color: cfg.color }}>{cfg.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="text-xs font-bold text-slate-300 block mb-1">TIÊU ĐỀ BẢN GHI:</label>
                  <input
                    type="text"
                    className="quick-input"
                    placeholder="Ví dụ: Một buổi chiều yên bình bên tách cà phê..."
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="text-xs font-bold text-slate-300 block mb-1">GHI CHÚ / SUY NGHĨ:</label>
                  <textarea
                    className="quick-textarea"
                    rows={3}
                    placeholder="Viết một vài dòng suy nghĩ hoặc điều gì đã tạo nên cảm xúc hôm đó..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                  />
                </div>

                <div className="form-group mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">CƯỜNG ĐỘ CẢM XÚC:</label>
                    <span className="text-xs font-bold text-cyan-400">{quickIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quickIntensity}
                    onChange={(e) => setQuickIntensity(Number(e.target.value))}
                    className="quick-slider"
                  />
                </div>

                <button
                  type="button"
                  className="quick-save-submit-btn"
                  onClick={handleSaveQuickLog}
                  disabled={!quickTitle.trim()}
                >
                  <Check size={16} />
                  <span>LƯU VÀO LỊCH CẢM XÚC</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isEmbedded) {
    return content
  }

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <motion.div 
        className="settings-modal-card calendar-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </motion.div>
    </div>
  )
}
