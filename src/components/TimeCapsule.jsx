import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hourglass, 
  Lock, 
  Unlock, 
  Clock, 
  Calendar, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Compass, 
  FileText, 
  Share2, 
  Download, 
  Image as ImageIcon,
  KeyRound,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react'
import { playKeyClick, playChronoLockSound, playChronoUnlockSound, playSynthTone } from '../utils/audioSynth.js'

// Pre-loaded sample capsules for instant immersion
const DEFAULT_CAPSULES = [
  {
    id: 'capsule-demo-ready',
    title: 'Gửi Tôi Của Ngày Mai: Hãy Luôn Kiên Trì',
    recipient: 'Tôi của ngày mai',
    createdAt: new Date(Date.now() - 86400000 * 364).toISOString(), // 364 days ago
    unlockDate: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 mins ago (READY TO OPEN!)
    mood: 'joy',
    moodLabel: 'Hân hoan & Đầy Hy Vọng',
    sealType: 'quantum',
    hint: 'Nhớ lại những bước chân đầu tiên khi khởi đầu dự án này',
    content: 'Chào tôi của tương lai!\n\nNếu bạn đang đọc những dòng này, nghĩa là bạn đã hoàn thành một hành trình dài đầy dũng cảm. Đừng bao giờ quên lý do vì sao bạn đã bắt đầu: niềm đam mê với công nghệ, cái đẹp và khát vọng tạo ra những điều kỳ diệu.\n\nHãy mỉm cười và tự hào về chính mình ngày hôm nay nhé!',
    imageUrl: '',
    status: 'READY' // READY to be unlocked
  },
  {
    id: 'capsule-1year-future',
    title: 'Thư Gửi Tôi Đúng Ngày Này Năm Sau',
    recipient: 'Tôi của 1 năm sau (2027)',
    createdAt: new Date().toISOString(),
    unlockDate: new Date(Date.now() + 86400000 * 365).toISOString(), // 1 year from now
    mood: 'transcendence',
    moodLabel: 'Thức Tỉnh & Tĩnh Lặng',
    sealType: 'chrono',
    hint: 'Bí mật về ước mơ lớn nhất mà tôi từng ấp ủ',
    content: 'Gửi bản thân thân yêu,\n\nMột năm đã trôi qua kể từ khi bạn niêm phong chiếc hộp thời gian này vào Ma trận Không - Thời gian. Bạn đã đi qua bao nhiêu mùa thay đổi, đã học thêm được bao nhiêu bài học quý giá?\n\nDù hiện tại cuộc sống có ra sao, tôi tin bạn vẫn luôn giữ vững ngọn lửa nhiệt huyết bên trong. Chúc mừng bạn đã bước tiếp thêm một năm rực rỡ!',
    imageUrl: '',
    status: 'SEALED'
  }
]

const MOOD_OPTIONS = [
  { id: 'joy', name: 'Hân hoan', color: '#00f0ff', emoji: '✨' },
  { id: 'calm', name: 'Bình yên', color: '#10b981', emoji: '🌿' },
  { id: 'passion', name: 'Nhiệt huyết', color: '#f59e0b', emoji: '🔥' },
  { id: 'melancholy', name: 'Trầm tư', color: '#8b5cf6', emoji: '🌌' },
  { id: 'transcendence', name: 'Siêu việt', color: '#ec4899', emoji: '🔮' }
]

const DURATION_PRESETS = [
  { label: '1 Ngày (Demo nhanh)', days: 1 },
  { label: '7 Ngày (1 Tuần)', days: 7 },
  { label: '30 Ngày (1 Tháng)', days: 30 },
  { label: '6 Tháng', days: 182 },
  { label: '⭐ 1 Năm (Chuẩn)', days: 365 },
]

export default function TimeCapsule({
  onSyncMoodChange,
  currentMood = 'calm',
  soundEnabled = false,
  onClose
}) {
  const [capsules, setCapsules] = useState(() => {
    try {
      const saved = localStorage.getItem('mr-time-capsules')
      return saved ? JSON.parse(saved) : DEFAULT_CAPSULES
    } catch {
      return DEFAULT_CAPSULES
    }
  })

  const [activeView, setActiveView] = useState('list') // 'list' | 'compose' | 'detail'
  const [filter, setFilter] = useState('all') // 'all' | 'sealed' | 'ready' | 'unlocked'
  const [selectedCapsule, setSelectedCapsule] = useState(null)
  const [currentTime, setCurrentTime] = useState(Date.now())

  // New capsule form state
  const [formTitle, setFormTitle] = useState('')
  const [formRecipient, setFormRecipient] = useState('Tôi của tương lai')
  const [formMood, setFormMood] = useState(currentMood || 'joy')
  const [formContent, setFormContent] = useState('')
  const [formHint, setFormHint] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formSealType, setFormSealType] = useState('chrono') // 'chrono' | 'quantum' | 'biometric'
  const [customDays, setCustomDays] = useState(365)
  const [customUnlockDatetime, setCustomUnlockDatetime] = useState(() => {
    const oneYearLater = new Date(Date.now() + 86400000 * 365)
    return oneYearLater.toISOString().slice(0, 16)
  })
  const [isCustomDate, setIsCustomDate] = useState(false)

  // Emergency override state
  const [overrideModalCapsule, setOverrideModalCapsule] = useState(null)
  const [overrideCode, setOverrideCode] = useState('')
  const [overrideError, setOverrideError] = useState('')

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null)

  const fileInputRef = useRef(null)

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('mr-time-capsules', JSON.stringify(capsules))
  }, [capsules])

  // Live timer interval updating every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3800)
  }

  // Calculate remaining time breakdown
  function getTimeRemaining(targetDateStr) {
    const total = Date.parse(targetDateStr) - currentTime
    if (total <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }
    const seconds = Math.floor((total / 1000) % 60)
    const minutes = Math.floor((total / 1000 / 60) % 60)
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
    const days = Math.floor(total / (1000 * 60 * 60 * 24))
    return { total, days, hours, minutes, seconds, isExpired: false }
  }

  // Check capsule effective status
  function getCapsuleStatus(capsule) {
    if (capsule.status === 'UNLOCKED') return 'UNLOCKED'
    const remaining = getTimeRemaining(capsule.unlockDate)
    if (remaining.isExpired) return 'READY'
    return 'SEALED'
  }

  // Create new capsule
  function handleCreateCapsule(e) {
    e.preventDefault()
    if (!formTitle.trim() || !formContent.trim()) {
      showToast('⚠️ Vui lòng nhập tiêu đề và nội dung lá thư!')
      return
    }

    let calculatedUnlockDate
    if (isCustomDate) {
      calculatedUnlockDate = new Date(customUnlockDatetime).toISOString()
    } else {
      calculatedUnlockDate = new Date(Date.now() + customDays * 86400000).toISOString()
    }

    const selectedMoodObj = MOOD_OPTIONS.find(m => m.id === formMood) || MOOD_OPTIONS[0]

    const newCapsule = {
      id: `capsule-${Date.now()}`,
      title: formTitle.trim(),
      recipient: formRecipient.trim() || 'Tôi của tương lai',
      createdAt: new Date().toISOString(),
      unlockDate: calculatedUnlockDate,
      mood: formMood,
      moodLabel: `${selectedMoodObj.emoji} ${selectedMoodObj.name}`,
      sealType: formSealType,
      hint: formHint.trim() || 'Không có gợi ý phong ấn',
      content: formContent.trim(),
      imageUrl: formImageUrl,
      status: 'SEALED'
    }

    setCapsules(prev => [newCapsule, ...prev])
    playChronoLockSound()
    showToast('🔒 HỘP THỜI GIAN ĐÃ ĐƯỢC NIÊM PHONG VÀO DÒNG THỜI GIAN!')

    // Reset form
    setFormTitle('')
    setFormContent('')
    setFormHint('')
    setFormImageUrl('')
    setActiveView('list')
  }

  // Unlock capsule when ready or through override
  function handleUnlockCapsule(capsule) {
    const updated = capsules.map(c => {
      if (c.id === capsule.id) {
        return { ...c, status: 'UNLOCKED', unlockedAt: new Date().toISOString() }
      }
      return c
    })
    setCapsules(updated)
    setSelectedCapsule({ ...capsule, status: 'UNLOCKED', unlockedAt: new Date().toISOString() })
    setActiveView('detail')
    playChronoUnlockSound()
    showToast('✨ CHÚC MỪNG! HỘP THỜI GIAN ĐÃ ĐƯỢC MỞ KHÓA THÀNH CÔNG!')
  }

  // Emergency override unlock
  function handleExecuteOverride() {
    if (!overrideCode.trim()) {
      setOverrideError('Vui lòng nhập mã ghi đè (ví dụ: OVERRIDE-CHRONO-99 hoặc 2026)')
      return
    }
    // Accept standard override codes
    if (['OVERRIDE', '2026', 'CHRONO', 'FUTURE', 'MOOD', 'UNLOCK'].includes(overrideCode.trim().toUpperCase())) {
      const target = overrideModalCapsule
      setOverrideModalCapsule(null)
      setOverrideCode('')
      setOverrideError('')
      handleUnlockCapsule(target)
      showToast('⚡ CẢNH BÁO NGHỊCH LÝ: PHONG ẤN ĐÃ ĐƯỢC MỞ KHÓA SỚM!')
    } else {
      setOverrideError('❌ Mã ghi đè không hợp lệ! Hãy thử nhập mã: OVERRIDE hoặc CHRONO')
    }
  }

  // Delete capsule
  function handleDeleteCapsule(id) {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn Hộp Thời Gian này khỏi dòng thời gian?')) {
      setCapsules(prev => prev.filter(c => c.id !== id))
      if (selectedCapsule?.id === id) {
        setSelectedCapsule(null)
        setActiveView('list')
      }
      if (soundEnabled) playKeyClick()
      showToast('🗑️ Đã xóa hộp thời gian!')
    }
  }

  // Handle image upload
  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh < 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormImageUrl(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Format nice date string
  function formatDate(isoStr) {
    if (!isoStr) return 'N/A'
    const d = new Date(isoStr)
    return d.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtered capsules
  const filteredCapsules = capsules.filter(c => {
    const status = getCapsuleStatus(c)
    if (filter === 'sealed') return status === 'SEALED'
    if (filter === 'ready') return status === 'READY'
    if (filter === 'unlocked') return status === 'UNLOCKED'
    return true
  })

  // Count stats
  const stats = {
    total: capsules.length,
    sealed: capsules.filter(c => getCapsuleStatus(c) === 'SEALED').length,
    ready: capsules.filter(c => getCapsuleStatus(c) === 'READY').length,
    unlocked: capsules.filter(c => getCapsuleStatus(c) === 'UNLOCKED').length
  }

  return (
    <div className="time-capsule-container">
      {/* Top Banner & Header */}
      <div className="time-capsule-header">
        <div className="flex items-center gap-3">
          <div className="chrono-icon-badge">
            <Hourglass className="text-amber-400 animate-pulse" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">
                // CHRONO STASIS VAULT //
              </span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                PHONG ẤN THỜI GIAN
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
              HỘP THỜI GIAN <span className="text-amber-400 text-sm font-normal">(Time Capsule)</span>
            </h2>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          {activeView !== 'list' && (
            <button
              onClick={() => {
                setActiveView('list')
                if (soundEnabled) playKeyClick()
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-400 text-xs font-mono flex items-center gap-1.5 border border-cyan-500/30 transition-all"
            >
              <RotateCcw size={14} />
              <span>Danh sách Pod</span>
            </button>
          )}

          {activeView === 'list' && (
            <button
              onClick={() => {
                setActiveView('compose')
                if (soundEnabled) playKeyClick()
              }}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
            >
              <Plus size={16} />
              <span>Tạo Hộp Thời Gian</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="chrono-toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <Sparkles size={16} className="text-amber-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: LIST CAPSULES */}
      {activeView === 'list' && (
        <div className="chrono-view-list">
          {/* Stats Bar */}
          <div className="chrono-stats-bar">
            <div 
              className={`stat-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <span className="label">Tổng số Hộp</span>
              <span className="count text-cyan-400">{stats.total}</span>
            </div>
            <div 
              className={`stat-pill ${filter === 'sealed' ? 'active' : ''}`}
              onClick={() => setFilter('sealed')}
            >
              <span className="label">🔒 Đang Niêm Phong</span>
              <span className="count text-amber-400">{stats.sealed}</span>
            </div>
            <div 
              className={`stat-pill ${filter === 'ready' ? 'active' : ''}`}
              onClick={() => setFilter('ready')}
            >
              <span className="label">✨ Sẵn Sàng Mở Khóa</span>
              <span className="count text-emerald-400">{stats.ready}</span>
            </div>
            <div 
              className={`stat-pill ${filter === 'unlocked' ? 'active' : ''}`}
              onClick={() => setFilter('unlocked')}
            >
              <span className="label">📜 Đã Giải Mã</span>
              <span className="count text-purple-400">{stats.unlocked}</span>
            </div>
          </div>

          {/* Capsules Grid */}
          {filteredCapsules.length === 0 ? (
            <div className="chrono-empty-state">
              <Hourglass size={48} className="text-slate-600 mb-3 animate-pulse" />
              <h4 className="text-slate-300 font-medium">Chưa có Hộp Thời Gian nào trong danh mục này</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-md">
                Hãy viết một bức thư, gói ghém cảm xúc hiện tại và niêm phong lại để bản thân trong tương lai mở ra khám phá!
              </p>
              <button
                onClick={() => setActiveView('compose')}
                className="mt-4 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono hover:bg-amber-500/30 transition-all flex items-center gap-2"
              >
                <Plus size={14} />
                <span>Niêm phong chiếc hộp đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="chrono-cards-grid">
              {filteredCapsules.map((capsule) => {
                const status = getCapsuleStatus(capsule)
                const remaining = getTimeRemaining(capsule.unlockDate)
                const moodObj = MOOD_OPTIONS.find(m => m.id === capsule.mood) || MOOD_OPTIONS[0]

                return (
                  <motion.div
                    key={capsule.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`chrono-card status-${status.toLowerCase()}`}
                  >
                    {/* Card Top / Header */}
                    <div className="card-header-flex">
                      <div className="flex items-center gap-2">
                        <span 
                          className="mood-indicator-dot"
                          style={{ backgroundColor: moodObj.color }}
                          title={`Tâm trạng lúc niêm phong: ${moodObj.name}`}
                        />
                        <span className="capsule-recipient">To: {capsule.recipient}</span>
                      </div>
                      
                      <div className={`status-badge badge-${status.toLowerCase()}`}>
                        {status === 'SEALED' && <Lock size={12} />}
                        {status === 'READY' && <Sparkles size={12} className="animate-spin-slow" />}
                        {status === 'UNLOCKED' && <Unlock size={12} />}
                        <span>
                          {status === 'SEALED' && 'ĐANG NIÊM PHONG'}
                          {status === 'READY' && 'SẴN SÀNG MỞ KHÓA'}
                          {status === 'UNLOCKED' && 'ĐÃ GIẢI MÃ'}
                        </span>
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="capsule-card-title">{capsule.title}</h3>

                    {/* Secret Hint or Snippet */}
                    <div className="capsule-card-hint">
                      <span className="hint-label">Gợi ý phong ấn:</span>
                      <p className="hint-text">"{capsule.hint}"</p>
                    </div>

                    {/* Dynamic Countdown Display */}
                    <div className="countdown-container">
                      {status === 'SEALED' && (
                        <>
                          <div className="countdown-title flex items-center justify-between">
                            <span>Thời gian còn lại đến khi mở khóa:</span>
                            <Clock size={12} className="text-amber-400 animate-spin-slow" />
                          </div>
                          <div className="countdown-digits">
                            <div className="digit-box">
                              <span className="num">{remaining.days}</span>
                              <span className="unit">Ngày</span>
                            </div>
                            <span className="colon">:</span>
                            <div className="digit-box">
                              <span className="num">{String(remaining.hours).padStart(2, '0')}</span>
                              <span className="unit">Giờ</span>
                            </div>
                            <span className="colon">:</span>
                            <div className="digit-box">
                              <span className="num">{String(remaining.minutes).padStart(2, '0')}</span>
                              <span className="unit">Phút</span>
                            </div>
                            <span className="colon">:</span>
                            <div className="digit-box highlight">
                              <span className="num">{String(remaining.seconds).padStart(2, '0')}</span>
                              <span className="unit">Giây</span>
                            </div>
                          </div>
                        </>
                      )}

                      {status === 'READY' && (
                        <div className="ready-announcement">
                          <Sparkles size={20} className="text-emerald-400 animate-bounce" />
                          <div>
                            <span className="font-bold text-emerald-300 block">ĐÃ ĐẾN THỜI ĐIỂM HOÀN TẤT!</span>
                            <span className="text-[11px] text-emerald-400/80">Kén thời gian đã sẵn sàng giải phóng bức thư của bạn.</span>
                          </div>
                        </div>
                      )}

                      {status === 'UNLOCKED' && (
                        <div className="unlocked-announcement">
                          <CheckCircle2 size={18} className="text-purple-400" />
                          <div>
                            <span className="font-semibold text-purple-300 block">ĐÃ GIẢI PHÓNG BỨC THƯ</span>
                            <span className="text-[11px] text-slate-400">Niêm phong vào: {formatDate(capsule.createdAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline Info Footer */}
                    <div className="capsule-timeline-meta">
                      <div className="meta-row">
                        <span>Ngày niêm phong:</span>
                        <span className="font-mono text-slate-400">{formatDate(capsule.createdAt)}</span>
                      </div>
                      <div className="meta-row">
                        <span>Ngày mở khóa:</span>
                        <span className="font-mono text-amber-300/90">{formatDate(capsule.unlockDate)}</span>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="capsule-card-actions">
                      {status === 'SEALED' && (
                        <>
                          <button
                            type="button"
                            className="btn-inspect-lock"
                            onClick={() => {
                              playChronoLockSound()
                              showToast(`🔒 Phong ấn Stasis đang kích hoạt. Mở khóa vào ${formatDate(capsule.unlockDate)}`)
                            }}
                          >
                            <ShieldCheck size={14} />
                            <span>Trường lực An toàn</span>
                          </button>
                          <button
                            type="button"
                            className="btn-override-lock"
                            onClick={() => {
                              setOverrideModalCapsule(capsule)
                              setOverrideCode('')
                              setOverrideError('')
                            }}
                            title="Mở khóa thử nghiệm khẩn cấp"
                          >
                            <KeyRound size={14} />
                            <span>Mã ghi đè</span>
                          </button>
                        </>
                      )}

                      {status === 'READY' && (
                        <button
                          type="button"
                          className="btn-open-capsule"
                          onClick={() => handleUnlockCapsule(capsule)}
                        >
                          <Sparkles size={16} />
                          <span>MỞ HỘP THỜI GIAN NGAY</span>
                        </button>
                      )}

                      {status === 'UNLOCKED' && (
                        <button
                          type="button"
                          className="btn-view-capsule"
                          onClick={() => {
                            setSelectedCapsule(capsule)
                            setActiveView('detail')
                            if (soundEnabled) playKeyClick()
                          }}
                        >
                          <FileText size={15} />
                          <span>Đọc lại bức thư</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-delete-capsule"
                        onClick={() => handleDeleteCapsule(capsule.id)}
                        title="Xóa hộp thời gian"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COMPOSE NEW TIME CAPSULE */}
      {activeView === 'compose' && (
        <motion.div 
          className="chrono-view-compose"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="compose-banner">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
              <Sparkles size={14} />
              <span>GỬI THÔNG ĐIỆP VƯỢT KHÔNG GIAN ĐẾN TƯƠNG LAI</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">Soạn Thảo Hộp Thời Gian Mới</h3>
            <p className="text-xs text-slate-400 mt-1">
              Hãy thành thật với chính mình. Sau khi niêm phong, bức thư này sẽ bị khóa mã hóa lượng tử và chỉ có thể mở lại vào đúng ngày giờ bạn đã chọn.
            </p>
          </div>

          <form onSubmit={handleCreateCapsule} className="chrono-form">
            {/* Row 1: Title & Recipient */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Tiêu đề lá thư / Chủ đề *</label>
                <input 
                  type="text" 
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Gửi tôi ngày sinh nhật 25 tuổi / Nhớ lại ước mơ..."
                  className="chrono-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Người nhận (Đối tượng tương lai)</label>
                <input 
                  type="text" 
                  value={formRecipient}
                  onChange={(e) => setFormRecipient(e.target.value)}
                  placeholder="Ví dụ: Tôi của 1 năm sau / Tôi khi thành công..."
                  className="chrono-input"
                />
              </div>
            </div>

            {/* Row 2: Mood Selection & Seal Type */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Cảm xúc được gói ghém cùng bức thư</label>
                <div className="mood-select-row">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setFormMood(m.id)
                        if (soundEnabled) playKeyClick()
                      }}
                      className={`mood-chip-btn ${formMood === m.id ? 'active' : ''}`}
                      style={{
                        borderColor: formMood === m.id ? m.color : 'rgba(255,255,255,0.1)',
                        boxShadow: formMood === m.id ? `0 0 12px ${m.color}50` : 'none'
                      }}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Cấp độ Niêm phong (Stasis Lock Type)</label>
                <div className="seal-type-row">
                  {[
                    { id: 'chrono', name: '⏳ Khóa Thời Gian', desc: 'Niêm phong dòng thời gian' },
                    { id: 'quantum', name: '🔮 Pha Lê Lượng Tử', desc: 'Mã hóa lượng tử 512-bit' },
                    { id: 'biometric', name: '🧬 Sinh Trắc Học', desc: 'Gắn liền tần số sóng não' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormSealType(s.id)}
                      className={`seal-chip-btn ${formSealType === s.id ? 'active' : ''}`}
                    >
                      <span className="font-semibold text-xs text-white block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 block">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Unlock Duration Selection */}
            <div className="form-group">
              <label className="flex items-center justify-between">
                <span>Thời hạn mở khóa hộp thời gian</span>
                <span className="text-amber-400 font-mono text-xs">
                  {isCustomDate ? `Đến ngày: ${formatDate(customUnlockDatetime)}` : `Khoảng ${customDays} ngày tới`}
                </span>
              </label>

              <div className="duration-preset-grid">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => {
                      setIsCustomDate(false)
                      setCustomDays(preset.days)
                      if (soundEnabled) playKeyClick()
                    }}
                    className={`preset-btn ${!isCustomDate && customDays === preset.days ? 'active' : ''}`}
                  >
                    {preset.label}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={() => setIsCustomDate(true)}
                  className={`preset-btn ${isCustomDate ? 'active' : ''}`}
                >
                  📅 Tự chọn ngày giờ
                </button>
              </div>

              {isCustomDate && (
                <div className="custom-datetime-box mt-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Chọn ngày & giờ mở khóa chính xác:</label>
                  <input
                    type="datetime-local"
                    value={customUnlockDatetime}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setCustomUnlockDatetime(e.target.value)}
                    className="chrono-input datetime-input"
                  />
                </div>
              )}
            </div>

            {/* Row 4: Secret Hint & Photo Attachment */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Gợi ý phong ấn (Stasis Hint - Công khai khi đang khóa)</label>
                <input 
                  type="text" 
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="Ví dụ: Nhớ bài hát hai đứa từng nghe / Nơi ta từng hứa hẹn..."
                  className="chrono-input"
                />
              </div>

              <div className="form-group">
                <label>Đính kèm ảnh kỷ niệm bí mật (Tùy chọn)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-2 flex-1"
                  >
                    <ImageIcon size={14} className="text-amber-400" />
                    <span>{formImageUrl ? 'Đã đính kèm ảnh (Bấm để đổi)' : 'Tải lên ảnh bí mật'}</span>
                  </button>
                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 text-xs"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {formImageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-amber-500/40">
                    <img src={formImageUrl} alt="Attachment Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Letter Content */}
            <div className="form-group">
              <label>Nội dung bức thư gửi tới tương lai *</label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Gửi bản thân thân yêu, hôm nay tôi muốn ghi lại những điều này..."
                className="chrono-textarea"
                rows={7}
                required
              />
            </div>

            {/* Submit / Cancel Button Row */}
            <div className="form-actions-row">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-mono transition-all"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all"
              >
                <Lock size={16} />
                <span>NIÊM PHONG VÀO DÒNG THỜI GIAN</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* VIEW 3: DETAIL / READ UNLOCKED TIME CAPSULE */}
      {activeView === 'detail' && selectedCapsule && (
        <motion.div 
          className="chrono-view-detail"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="detail-scroll-card">
            {/* Top Glowing Header */}
            <div className="scroll-header">
              <div className="flex items-center justify-between">
                <span className="scroll-badge">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>KỶ VẬT THỜI GIAN ĐÃ GIẢI MÃ</span>
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {selectedCapsule.id}</span>
              </div>

              <h2 className="scroll-title">{selectedCapsule.title}</h2>
              <div className="scroll-sub-meta">
                <span>Gửi tới: <strong className="text-cyan-300">{selectedCapsule.recipient}</strong></span>
                <span>•</span>
                <span>Niêm phong vào: <strong className="text-slate-300">{formatDate(selectedCapsule.createdAt)}</strong></span>
                <span>•</span>
                <span>Mở khóa lúc: <strong className="text-amber-300">{formatDate(selectedCapsule.unlockDate)}</strong></span>
              </div>
            </div>

            {/* Past vs Present Mood Reflection */}
            <div className="mood-reflection-banner">
              <div className="reflection-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Cảm xúc khi gửi gắm:</span>
                <span className="text-sm font-semibold text-amber-300 flex items-center gap-1.5 mt-0.5">
                  {selectedCapsule.moodLabel || 'Hân hoan'}
                </span>
              </div>
              <div className="reflection-divider">➔</div>
              <div className="reflection-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tâm trạng hiện tại của bạn:</span>
                <span className="text-sm font-semibold text-cyan-300 flex items-center gap-1.5 mt-0.5">
                  {currentMood.toUpperCase()} (Hiện tại)
                </span>
              </div>
            </div>

            {/* Letter Body Parchment */}
            <div className="scroll-content-body">
              <p className="whitespace-pre-wrap leading-relaxed text-slate-200 text-sm sm:text-base font-serif">
                {selectedCapsule.content}
              </p>

              {selectedCapsule.imageUrl && (
                <div className="scroll-image-container">
                  <img src={selectedCapsule.imageUrl} alt="Capsule Memory" className="scroll-attached-image" />
                  <span className="text-[11px] text-slate-400 text-center block mt-1">Ảnh kỷ niệm được bảo quản trong kén Stasis</span>
                </div>
              )}
            </div>

            {/* Scroll Bottom Actions */}
            <div className="scroll-footer-actions">
              <button
                type="button"
                onClick={() => setActiveView('list')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-cyan-400 hover:bg-slate-700 text-xs font-mono border border-cyan-500/30 flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Trở lại Danh sách</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`[BỨC THƯ TỪ QUÁ KHỨ]\nTiêu đề: ${selectedCapsule.title}\n\n${selectedCapsule.content}`)
                    showToast('📋 Đã sao chép nội dung bức thư vào clipboard!')
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5"
                  title="Sao chép"
                >
                  <Share2 size={14} />
                  <span>Sao chép</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteCapsule(selectedCapsule.id)}
                  className="px-3 py-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 border border-red-800/40 text-xs flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Xóa Hộp</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* EMERGENCY OVERRIDE MODAL */}
      <AnimatePresence>
        {overrideModalCapsule && (
          <div className="chrono-override-backdrop">
            <motion.div 
              className="chrono-override-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="override-header">
                <AlertCircle size={22} className="text-amber-400" />
                <h4 className="text-base font-bold text-white">Ghi Đè Phong Ấn Khẩn Cấp</h4>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                Hộp thời gian <strong>"{overrideModalCapsule.title}"</strong> được lập trình để mở vào ngày{' '}
                <span className="text-amber-300 font-mono">{formatDate(overrideModalCapsule.unlockDate)}</span>.
              </p>
              <p className="text-[11px] text-amber-400/90 mt-1 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                ⚠️ Mở khóa trước thời hạn có thể làm giảm trải nghiệm kỳ diệu của việc nhận thư từ quá khứ. Nhập mã <code>OVERRIDE</code> hoặc <code>2026</code> để xác nhận mở sớm.
              </p>

              <div className="mt-4">
                <label className="text-xs text-slate-400 block mb-1">Mã Ghi Đè Khẩn Cấp:</label>
                <input 
                  type="text"
                  value={overrideCode}
                  onChange={(e) => {
                    setOverrideCode(e.target.value)
                    setOverrideError('')
                  }}
                  placeholder="Nhập: OVERRIDE"
                  className="chrono-input"
                  autoFocus
                />
                {overrideError && (
                  <p className="text-xs text-red-400 mt-1.5">{overrideError}</p>
                )}
              </div>

              <div className="override-actions mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalCapsule(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                >
                  Giữ nguyên phong ấn
                </button>
                <button
                  type="button"
                  onClick={handleExecuteOverride}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Xác nhận Mở Khóa Sớm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
