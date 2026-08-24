import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Moon, 
  Sparkles, 
  CloudMoon, 
  Feather, 
  Eye, 
  Clock, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  Save, 
  Share2, 
  Compass, 
  Tag, 
  Bookmark, 
  Bot, 
  Star, 
  Edit3, 
  Palette, 
  RotateCcw, 
  Check, 
  Send,
  Sliders,
  ChevronRight,
  History,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { playKeyClick, playMood } from '../utils/audioSynth.js'
import VersionHistoryModal from './VersionHistoryModal.jsx'
import { 
  saveDraft, 
  getSavedDraft, 
  clearSavedDraft, 
  saveVersionSnapshot 
} from '../utils/autoSaveVersionEngine.js'
import { enqueueOfflineAction } from '../utils/offlineSyncEngine.js'

// Pre-loaded mystical dream entries
const DEFAULT_DREAM_ENTRIES = [
  {
    id: 'dream-1701',
    title: 'Bay Qua Thành Phố Thủy Tinh Vô Cực',
    date: '2026-08-16 06:15',
    wakeUpTime: '06:10',
    type: 'lucid',
    typeName: '🌌 Giấc Mơ Tỉnh Thức (Lucid Dream)',
    vividness: 5,
    lucidity: 85,
    hazeLevel: 40,
    tags: ['#dream', '#lucid_dream', '#bay_lượn', '#thành_phố_thủy_tinh', '#tự_do'],
    content: 'Tôi nhận ra mình đang mơ khi nhìn vào bàn tay phát sáng ánh xanh neon. Ngay lập tức, tôi nhún chân và bay vút qua những tòa tháp bằng pha lê trong suốt. Bên dưới, dòng sông ánh sáng uốn lượn như một mạch vi xử lý khổng lồ. Cảm giác gió lướt qua da thịt chân thật đến nghẹt thở.',
    drawingUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="100%" height="100%" fill="%23050412"/><circle cx="200" cy="125" r="70" fill="none" stroke="%23a855f7" stroke-width="3" filter="drop-shadow(0 0 10px %23a855f7)"/><path d="M50,180 Q200,60 350,180" fill="none" stroke="%2338bdf8" stroke-width="4"/><circle cx="200" cy="90" r="15" fill="%23ec4899" opacity="0.7"/></svg>',
    interpretation: 'Biểu tượng thành phố pha lê và khả năng bay lượn thể hiện khát vọng giải phóng tiềm năng vô thức và sự sáng suốt cao độ trong việc định hướng tương lai. Chiếc nhẫn cảm xúc khuyến nghị: Sắc xanh Cyan / Hân hoan.',
    recommendedMood: 'joy'
  },
  {
    id: 'dream-1698',
    title: 'Người Gác Đền Dưới Đáy Đại Dương Sao',
    date: '2026-08-15 05:40',
    wakeUpTime: '05:35',
    type: 'prophetic',
    typeName: '🔮 Điềm Báo & Ký Ức Tiền Kiếp',
    vividness: 4,
    lucidity: 60,
    hazeLevel: 65,
    tags: ['#dream', '#đại_dương_sao', '#người_gác_đền', '#bí_ẩn', '#chữa_lành'],
    content: 'Một cánh cổng cổ kính chìm dưới mặt biển lấp lánh như bầu trời đêm. Có một bóng hình mờ ảo trao cho tôi một chiếc nhẫn phát sáng và nói: "Thời gian không phải là một đường thẳng, em đã trở về."',
    drawingUrl: '',
    interpretation: 'Cánh cổng đại dương sao là biểu tượng của tầng vô thức tập thể (Collective Unconscious). Lời nhắn về chiếc nhẫn phản ánh sự kết nối sâu sắc với cốt lõi bản ngã.',
    recommendedMood: 'calm'
  }
]

const DREAM_TYPES = [
  { id: 'lucid', name: '🌌 Lucid Dream (Tỉnh Mộng)', desc: 'Ý thức rõ mình đang mơ và điều khiển được giấc mơ', color: '#a855f7' },
  { id: 'flying', name: '🕊️ Flying & Float (Bay Lượn)', desc: 'Cảm giác không trọng lượng, lơ lửng giữa không trung', color: '#38bdf8' },
  { id: 'prophetic', name: '🔮 Prophetic (Điềm Báo)', desc: 'Cảm giác Deja Vu, thông điệp trực giác sâu thẳm', color: '#ec4899' },
  { id: 'surreal', name: '🎭 Surreal (Kỳ Ảo)', desc: 'Không gian biến đổi phi logic, thế giới siêu thực', color: '#f59e0b' },
  { id: 'conquered', name: '🛡️ Nightmare Conquered (Hóa Giải)', desc: 'Chuyển hóa nỗi sợ hãi thành sức mạnh nội tâm', color: '#ef4444' },
  { id: 'void', name: '🌊 Calm Void (Hư Vô Tĩnh Lặng)', desc: 'Chìm trong biển mây êm dịu không vướng bận', color: '#10b981' }
]

const PRESET_DREAM_TAGS = [
  '#dream', '#lucid_dream', '#bay_lượn', '#kỳ_ảo', '#ác_mộng_hóa_giải', 
  '#vũ_trụ', '#người_lạ', '#đại_dương', '#thức_tỉnh', '#thời_gian', '#chữa_lành'
]

const QUICK_WAKEUP_PROMPTS = [
  'Tôi nhớ ấn tượng đầu tiên là...',
  'Không gian lúc đó có màu...',
  'Người xuất hiện cùng tôi là...',
  'Cảm giác mạnh nhất khi thức dậy là...'
]

export default function DreamJournal({
  onSyncMoodChange,
  currentMood = 'calm',
  soundEnabled = false,
  onClose
}) {
  // State for dream entries
  const [dreamEntries, setDreamEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('mr-dream-journal-entries')
      return saved ? JSON.parse(saved) : DEFAULT_DREAM_ENTRIES
    } catch {
      return DEFAULT_DREAM_ENTRIES
    }
  })

  // View state: 'write' | 'archive' | 'interpret'
  const [viewMode, setViewMode] = useState('write')
  const [selectedDream, setSelectedDream] = useState(null)

  // Current drafting form
  const [dreamTitle, setDreamTitle] = useState('')
  const [dreamContent, setDreamContent] = useState('')
  const [dreamType, setDreamType] = useState('lucid')
  const [vividness, setVividness] = useState(4)
  const [lucidity, setLucidity] = useState(50)
  const [tags, setTags] = useState(['#dream'])
  const [customTagInput, setCustomTagInput] = useState('')
  const [hazeBlurLevel, setHazeBlurLevel] = useState(35) // 0 to 100
  const [fontStyle, setFontStyle] = useState('ethereal') // 'ethereal' | 'lucid-mono' | 'cursive'
  
  // Sketchpad state
  const [showSketchpad, setShowSketchpad] = useState(false)
  const [sketchBrush, setSketchBrush] = useState('mist')
  const [sketchColor, setSketchColor] = useState('#a855f7')
  const [sketchDataUrl, setSketchDataUrl] = useState('')
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)

  // Audio Synth: Theta Wave Ambient Soundscape
  const [isThetaPlaying, setIsThetaPlaying] = useState(false)
  const audioCtxRef = useRef(null)
  const osc1Ref = useRef(null)
  const osc2Ref = useRef(null)
  const gainNodeRef = useRef(null)

  // Dream Fade Countdown (Timer after waking up)
  const [wakeUpTimer, setWakeUpTimer] = useState(300) // 5 minutes (300s)
  const [timerActive, setTimerActive] = useState(true)

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mr-dream-journal-entries', JSON.stringify(dreamEntries))
    } catch (e) {
      console.error('Failed to save dream entries', e)
    }
  }, [dreamEntries])

  // Feature 37: Auto-Save & Version History State
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false)
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [unsavedDraft, setUnsavedDraft] = useState(null)

  // Check for unsaved dream draft on initial load
  useEffect(() => {
    const draft = getSavedDraft('dream')
    if (draft && (draft.content?.trim() || draft.title?.trim())) {
      setUnsavedDraft(draft)
    }
  }, [])

  // Auto-Save dream interval every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (dreamContent.trim() || dreamTitle.trim()) {
        setIsAutoSaving(true)
        saveDraft('dream', {
          title: dreamTitle,
          content: dreamContent,
          type: dreamType,
          vividness,
          lucidity,
          tags,
          sketchDataUrl
        })

        // Also capture version snapshot
        saveVersionSnapshot('dream', {
          title: dreamTitle,
          note: dreamContent,
          mood: 'calm',
          intensity: lucidity,
          tags,
          mediaUrl: sketchDataUrl
        })

        setLastAutoSavedTime(Date.now())
        setTimeout(() => setIsAutoSaving(false), 600)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [dreamContent, dreamTitle, dreamType, vividness, lucidity, tags, sketchDataUrl])

  const handleRestoreDraft = () => {
    if (!unsavedDraft) return
    if (unsavedDraft.title !== undefined) setDreamTitle(unsavedDraft.title)
    if (unsavedDraft.content !== undefined) setDreamContent(unsavedDraft.content)
    if (unsavedDraft.type) setDreamType(unsavedDraft.type)
    if (unsavedDraft.vividness) setVividness(unsavedDraft.vividness)
    if (unsavedDraft.lucidity) setLucidity(unsavedDraft.lucidity)
    if (unsavedDraft.tags) setTags(unsavedDraft.tags)
    if (unsavedDraft.sketchDataUrl) setSketchDataUrl(unsavedDraft.sketchDataUrl)
    setUnsavedDraft(null)
    if (soundEnabled) playKeyClick()
  }

  const handleDiscardDraft = () => {
    clearSavedDraft('dream')
    setUnsavedDraft(null)
    if (soundEnabled) playKeyClick()
  }

  const handleRollbackVersion = (ver) => {
    if (ver.title !== undefined) setDreamTitle(ver.title)
    if (ver.note !== undefined) setDreamContent(ver.note)
    if (ver.tags) setTags(ver.tags)
    if (ver.mediaUrl) setSketchDataUrl(ver.mediaUrl)
    if (soundEnabled) playKeyClick()
  }

  // Dream Fade Timer Interval
  useEffect(() => {
    if (!timerActive || wakeUpTimer <= 0) return
    const interval = setInterval(() => {
      setWakeUpTimer(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [timerActive, wakeUpTimer])

  // Theta Wave Binaural Beat Audio (4-7Hz difference for lucid dream state)
  const toggleThetaAudio = () => {
    if (isThetaPlaying) {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5)
        setTimeout(() => {
          osc1Ref.current?.stop()
          osc2Ref.current?.stop()
          audioCtxRef.current?.close()
          audioCtxRef.current = null
        }, 600)
      }
      setIsThetaPlaying(false)
    } else {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        const ctx = new AudioContext()
        audioCtxRef.current = ctx

        const baseFreq = 140
        const binauralBeat = 6.0 // 6 Hz Theta wave

        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const merger = ctx.createChannelMerger(2)
        const masterGain = ctx.createGain()

        osc1.type = 'sine'
        osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime)
        osc2.type = 'sine'
        osc2.frequency.setValueAtTime(baseFreq + binauralBeat, ctx.currentTime)

        const panner1 = ctx.createStereoPanner ? ctx.createStereoPanner() : null
        const panner2 = ctx.createStereoPanner ? ctx.createStereoPanner() : null

        if (panner1 && panner2) {
          panner1.pan.setValueAtTime(-0.8, ctx.currentTime)
          panner2.pan.setValueAtTime(0.8, ctx.currentTime)
          osc1.connect(panner1)
          panner1.connect(masterGain)
          osc2.connect(panner2)
          panner2.connect(masterGain)
        } else {
          osc1.connect(masterGain)
          osc2.connect(masterGain)
        }

        masterGain.gain.setValueAtTime(0.01, ctx.currentTime)
        masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 2.0)
        masterGain.connect(ctx.destination)

        osc1.start()
        osc2.start()

        osc1Ref.current = osc1
        osc2Ref.current = osc2
        gainNodeRef.current = masterGain

        setIsThetaPlaying(true)
      } catch (err) {
        console.error('Theta Web Audio failed', err)
      }
    }
  }

  // Ensure Theta audio stops on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  // Canvas Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    isDrawing.current = true
    ctx.beginPath()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
  }

  const drawMove = (e) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.strokeStyle = sketchColor
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (sketchBrush === 'mist') {
      ctx.lineWidth = 14
      ctx.globalAlpha = 0.15
      ctx.shadowBlur = 15
      ctx.shadowColor = sketchColor
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (sketchBrush === 'starlight') {
      ctx.lineWidth = 2.5
      ctx.globalAlpha = 0.9
      ctx.shadowBlur = 8
      ctx.shadowColor = '#ffffff'
      ctx.lineTo(x, y)
      ctx.stroke()

      // Random micro-stars
      if (Math.random() > 0.4) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(x + (Math.random() - 0.5) * 16, y + (Math.random() - 0.5) * 16, Math.random() * 2 + 1, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      ctx.lineWidth = 4
      ctx.globalAlpha = 0.8
      ctx.shadowBlur = 10
      ctx.shadowColor = sketchColor
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  }

  const stopDrawing = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (canvasRef.current) {
      setSketchDataUrl(canvasRef.current.toDataURL('image/png'))
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSketchDataUrl('')
  }

  // Tag Manager
  const toggleTag = (tag) => {
    if (tag === '#dream') return // '#dream' is always kept
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag))
    } else {
      setTags([...tags, tag])
    }
  }

  const addCustomTag = (e) => {
    e.preventDefault()
    if (!customTagInput.trim()) return
    const formatted = customTagInput.startsWith('#') ? customTagInput.trim() : `#${customTagInput.trim()}`
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted])
    }
    setCustomTagInput('')
  }

  // AI Dream Interpretation Generator
  const generateDreamInterpretation = () => {
    const typeObj = DREAM_TYPES.find(t => t.id === dreamType) || DREAM_TYPES[0]
    const interpretations = [
      `Giấc mơ mang tần số sóng não ${typeObj.name}. Các hình ảnh trong văn bản thể hiện tiềm thức đang mở rộng và giải phóng các khối tư duy đóng khung. Khuyến nghị tâm trạng: Sắc xanh Biển sâu / Bình yên.`,
      `Sự kết hợp giữa độ rõ nét (${vividness}/5) và các thẻ ${tags.slice(0, 3).join(' ')} phản ánh sự tái cấu trúc ý niệm và trực giác nhạy bén đối với các biến chuyển sắp tới.`,
      `Biểu tượng xuất hiện trong giấc mơ chỉ ra một bước nhảy vọt trong sự tự nhận thức bản ngã (Lucid Transcendence). Tâm thức của bạn đang hài hòa với tần số của chiếc nhẫn.`
    ]
    const chosen = interpretations[Math.floor(Math.random() * interpretations.length)]
    return chosen
  }

  // Save Dream Entry
  const handleSaveDream = () => {
    if (!dreamContent.trim()) return
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    
    // Always guarantee '#dream' is present
    const finalTags = Array.from(new Set(['#dream', ...tags]))
    const typeObj = DREAM_TYPES.find(t => t.id === dreamType) || DREAM_TYPES[0]

    const newEntry = {
      id: `dream-${Date.now()}`,
      title: dreamTitle.trim() || `Giấc Mơ Lúc ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      date: dateStr,
      wakeUpTime: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      type: dreamType,
      typeName: typeObj.name,
      vividness,
      lucidity,
      hazeLevel: hazeBlurLevel,
      tags: finalTags,
      content: dreamContent.trim(),
      drawingUrl: sketchDataUrl,
      interpretation: generateDreamInterpretation(),
      recommendedMood: dreamType === 'lucid' ? 'joy' : dreamType === 'conquered' ? 'breach' : 'calm'
    }

    setDreamEntries([newEntry, ...dreamEntries])
    setSelectedDream(newEntry)
    setViewMode('archive')

    // Clear auto-save draft & record version milestone
    clearSavedDraft('dream')
    saveVersionSnapshot('dream', {
      title: newEntry.title,
      note: newEntry.content,
      mood: 'calm',
      intensity: newEntry.lucidity,
      tags: newEntry.tags,
      mediaUrl: newEntry.drawingUrl
    }, { isMilestone: true, customNote: 'Đã lưu chính thức vào Sổ Mơ' })

    // Enqueue Offline Sync
    enqueueOfflineAction({
      entityType: 'dream',
      operation: 'create',
      payload: newEntry
    })

    // Reset Form
    setDreamTitle('')
    setDreamContent('')
    setTags(['#dream'])
    setSketchDataUrl('')
    clearCanvas()
  }

  const handleDeleteDream = (id) => {
    setDreamEntries(dreamEntries.filter(d => d.id !== id))
    if (selectedDream?.id === id) setSelectedDream(null)
  }

  // CSS variables for Dream Haze Blur Effect
  const hazeBlurPx = (hazeBlurLevel / 100) * 1.8
  const hazeGlowPx = 4 + (hazeBlurLevel / 100) * 10
  const dreamTextStyle = {
    filter: hazeBlurLevel > 15 ? `blur(${hazeBlurPx}px)` : 'none',
    textShadow: `0 0 ${hazeGlowPx}px rgba(168, 85, 247, ${0.3 + hazeBlurLevel / 150}), 0 0 ${hazeGlowPx * 1.8}px rgba(56, 189, 248, 0.25)`,
    transition: 'filter 0.25s ease, text-shadow 0.25s ease'
  }

  return (
    <div className="dream-journal-wrapper">
      {/* Mystical Nocturne Starfield Background */}
      <div className="dream-aurora-bg">
        <div className="aurora-blob a1"></div>
        <div className="aurora-blob a2"></div>
        <div className="aurora-blob a3"></div>
      </div>

      {/* Top Dream Navigation Header */}
      <header className="dream-header">
        <div className="dream-brand">
          <Moon className="dream-moon-icon" size={24} />
          <div>
            <h2 className="dream-title">SỔ TAY ƯỚC MƠ // DREAM JOURNAL 🌙</h2>
            <p className="dream-subtitle">Chế độ ghi chép giấc mơ mờ ảo & Đồng hồ chống quên khi vừa thức dậy</p>
          </div>
        </div>

        <div className="dream-header-actions">
          {/* Theta Brainwave Ambient Synth Toggle */}
          <button
            type="button"
            className={`dream-btn-pill theta-btn ${isThetaPlaying ? 'active' : ''}`}
            onClick={toggleThetaAudio}
            title="Bật âm thanh sóng não Theta 6Hz hỗ trợ duy trì ký ức giấc mơ"
          >
            {isThetaPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{isThetaPlaying ? 'THETA WAVES ĐANG PHÁT 🎧' : 'BẬT SÓNG NÃO THETA 6Hz'}</span>
          </button>

          {/* View Mode Switcher */}
          <button
            type="button"
            className={`dream-btn-pill ${viewMode === 'write' ? 'active' : ''}`}
            onClick={() => setViewMode('write')}
          >
            <Edit3 size={15} />
            <span>GHI GIẤC MƠ</span>
          </button>

          <button
            type="button"
            className={`dream-btn-pill ${viewMode === 'archive' ? 'active' : ''}`}
            onClick={() => setViewMode('archive')}
          >
            <Bookmark size={15} />
            <span>KHO KÝ ỨC ({dreamEntries.length})</span>
          </button>

          {typeof onClose === 'function' && (
            <button type="button" className="dream-close-btn" onClick={onClose} aria-label="Đóng sổ tay">
              ✕
            </button>
          )}
        </div>
      </header>

      {/* VIEW 1: DRAFTING / WRITING NEW DREAM */}
      {viewMode === 'write' && (
        <div className="dream-writing-grid">
          {/* Main Writing Canvas & Haze Controls */}
          <div className="dream-editor-column">
            {/* Wake-up Dream Fade Countdown Bar */}
            <div className="dream-fade-alert-bar">
              <div className="fade-alert-left">
                <Clock className="spin-slow" size={16} />
                <span>ĐỒNG HỒ KÝ ỨC: Giấc mơ mờ dần sau khi thức dậy!</span>
              </div>
              <div className="fade-timer-badge">
                ⏳ CÒN {Math.floor(wakeUpTimer / 60)}:{String(wakeUpTimer % 60).padStart(2, '0')}
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="dream-prompt-chips">
              <span className="chips-label">Gợi ý khơi gợi:</span>
              {QUICK_WAKEUP_PROMPTS.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  className="prompt-chip"
                  onClick={() => setDreamContent(prev => prev ? `${prev}\n${prompt} ` : `${prompt} `)}
                >
                  + {prompt}
                </button>
              ))}
            </div>

            {/* Unsaved Draft Recovery Alert */}
            {unsavedDraft && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="unsaved-draft-recovery-alert dream-theme"
              >
                <div className="alert-content-row">
                  <AlertCircle size={17} className="text-amber-400 shrink-0" />
                  <div className="alert-text">
                    <b>Phát hiện giấc mơ chưa lưu:</b>{' '}
                    <span>"{unsavedDraft.title || unsavedDraft.content?.substring(0, 35) || 'Bản nháp...'}" (Đã tự lưu lúc {unsavedDraft.savedAtFormatted || 'gần đây'})</span>
                  </div>
                </div>
                <div className="alert-actions">
                  <button
                    type="button"
                    className="restore-draft-btn"
                    onClick={handleRestoreDraft}
                  >
                    <RotateCcw size={13} /> Phục Hồi Giấc Mơ
                  </button>
                  <button
                    type="button"
                    className="discard-draft-btn"
                    onClick={handleDiscardDraft}
                  >
                    Bỏ qua
                  </button>
                </div>
              </motion.div>
            )}

            {/* Auto-Save & Version History Toolbar */}
            <div className="dream-autosave-toolbar">
              <div className={`autosave-status-indicator ${isAutoSaving ? 'saving' : ''}`}>
                <span className="pulse-dot"></span>
                <span>
                  {isAutoSaving 
                    ? 'Đang tự lưu 5s...' 
                    : lastAutoSavedTime 
                      ? `Đã tự lưu lúc ${new Date(lastAutoSavedTime).toLocaleTimeString('vi-VN')}` 
                      : 'Tự động lưu 5s'}
                </span>
              </div>

              <button
                type="button"
                className="version-history-trigger-btn dream-ver-btn"
                onClick={() => {
                  setShowVersionHistoryModal(true)
                  if (soundEnabled) playKeyClick()
                }}
                title="Xem lịch sử phiên bản giấc mơ & quay lại bản thảo 10 phút trước nếu lỡ xóa nhầm"
              >
                <History size={13} className="text-purple-300" />
                <span>LỊCH SỬ PHIÊN BẢN (10 PHÚT TRƯỚC)</span>
              </button>
            </div>

            {/* Dream Title Input */}
            <input
              type="text"
              className="dream-title-input"
              placeholder="Đặt tên cho giấc mơ... (VD: Cổng Không Gian Dưới Biển Mây)"
              value={dreamTitle}
              onChange={(e) => setDreamTitle(e.target.value)}
              style={dreamTextStyle}
            />

            {/* Dream Haze Typography Textarea */}
            <div className="dream-textarea-container">
              <textarea
                className={`dream-textarea font-${fontStyle}`}
                placeholder="Ngay khi vừa mở mắt, bạn còn nhớ những gì? Hãy ghi lại dòng suy nghĩ, cảm xúc, màu sắc, những người hoặc sự kiện vừa trải qua trước khi chúng tan biến..."
                value={dreamContent}
                onChange={(e) => setDreamContent(e.target.value)}
                style={dreamTextStyle}
                rows={10}
              />

              {/* Dream Haze Floating Badge */}
              <div className="dream-haze-indicator">
                <Sparkles size={13} />
                <span>FONT MỜ ẢO: {hazeBlurLevel}% HAZE</span>
              </div>
            </div>

            {/* Tagging System: Always keeps #dream + Custom tags */}
            <div className="dream-tags-section">
              <div className="tags-header">
                <Tag size={15} />
                <span>TỰ ĐỘNG GẮN TAG: <strong style={{ color: '#a855f7' }}>#dream</strong> (Bắt buộc) + Thẻ tùy chọn:</span>
              </div>
              <div className="tags-pill-list">
                {PRESET_DREAM_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-pill ${tags.includes(t) ? 'active' : ''} ${t === '#dream' ? 'locked' : ''}`}
                    onClick={() => toggleTag(t)}
                  >
                    {t} {t === '#dream' && '🔒'}
                  </button>
                ))}
              </div>

              {/* Add Custom Tag */}
              <form onSubmit={addCustomTag} className="custom-tag-form">
                <input
                  type="text"
                  placeholder="Thêm tag giấc mơ riêng (VD: #gặp_người_cũ)..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                />
                <button type="submit">+ Thêm Tag</button>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="dream-editor-bottom-bar">
              <button
                type="button"
                className="dream-sketch-toggle-btn"
                onClick={() => setShowSketchpad(!showSketchpad)}
              >
                <Palette size={16} />
                <span>{showSketchpad ? 'ẨN BẢNG VẼ BIỂU TƯỢNG' : '🎨 VẼ PHÁC THẢO BIỂU TƯỢNG'}</span>
              </button>

              <button
                type="button"
                className="dream-save-btn interactive"
                disabled={!dreamContent.trim()}
                onClick={handleSaveDream}
              >
                <Save size={18} />
                <span>LƯU VÀO SỔ TAY ƯỚC MƠ (TỰ GẮN #DREAM)</span>
              </button>
            </div>
          </div>

          {/* Sidebar Controls: Clarity, Lucidity, Type & Typography Sliders */}
          <div className="dream-controls-sidebar">
            {/* 1. Typography & Dream Haze Blur Control */}
            <div className="dream-card-box">
              <div className="card-box-header">
                <Sliders size={16} />
                <h4>HIỆU ỨNG FONT CHỮ MỜ ẢO</h4>
              </div>
              <div className="slider-control-group">
                <div className="slider-label-row">
                  <span>Độ mờ ảo & phát sáng (Haze):</span>
                  <span className="slider-val">{hazeBlurLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={hazeBlurLevel}
                  onChange={(e) => setHazeBlurLevel(Number(e.target.value))}
                  className="dream-range-slider"
                />
                <div className="slider-hints">
                  <span>Rõ nét</span>
                  <span>Mơ màng</span>
                  <span>Huyền ảo</span>
                </div>
              </div>

              {/* Font Switcher */}
              <div className="font-switch-row">
                <button
                  type="button"
                  className={`font-switch-btn ${fontStyle === 'ethereal' ? 'active' : ''}`}
                  onClick={() => setFontStyle('ethereal')}
                >
                  Ethereal
                </button>
                <button
                  type="button"
                  className={`font-switch-btn ${fontStyle === 'lucid-mono' ? 'active' : ''}`}
                  onClick={() => setFontStyle('lucid-mono')}
                >
                  Lucid Mono
                </button>
                <button
                  type="button"
                  className={`font-switch-btn ${fontStyle === 'cursive' ? 'active' : ''}`}
                  onClick={() => setFontStyle('cursive')}
                >
                  Dream Flow
                </button>
              </div>
            </div>

            {/* 2. Dream Type Selector */}
            <div className="dream-card-box">
              <div className="card-box-header">
                <Sparkles size={16} />
                <h4>PHÂN LOẠI THỂ LOẠI GIẤC MƠ</h4>
              </div>
              <div className="dream-type-list">
                {DREAM_TYPES.map((type) => (
                  <div
                    key={type.id}
                    className={`dream-type-item ${dreamType === type.id ? 'active' : ''}`}
                    onClick={() => setDreamType(type.id)}
                  >
                    <div className="type-item-header">
                      <span className="type-title" style={{ color: type.color }}>{type.name}</span>
                      {dreamType === type.id && <Check size={14} color={type.color} />}
                    </div>
                    <p className="type-desc">{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Vividness & Lucidity Metric */}
            <div className="dream-card-box">
              <div className="card-box-header">
                <Eye size={16} />
                <h4>CHỈ SỐ TỈNH THỨC & ĐỘ RÕ NÉT</h4>
              </div>

              <div className="metric-row">
                <span>Độ sống động (Vividness):</span>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${vividness >= star ? 'active' : ''}`}
                      onClick={() => setVividness(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="metric-row">
                <div className="slider-label-row">
                  <span>Mức độ kiểm soát (Lucidity):</span>
                  <span className="slider-val">{lucidity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={lucidity}
                  onChange={(e) => setLucidity(Number(e.target.value))}
                  className="dream-range-slider"
                />
              </div>
            </div>

            {/* 4. Dream Sketchpad Canvas Modal */}
            {showSketchpad && (
              <div className="dream-card-box sketchpad-box">
                <div className="card-box-header">
                  <Palette size={16} />
                  <h4>PHÁC THẢO BIỂU TƯỢNG GIẤC MƠ</h4>
                  <button type="button" className="clear-btn" onClick={clearCanvas}>Xóa</button>
                </div>
                <div className="sketch-brush-selector">
                  {['mist', 'starlight', 'glow'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`brush-chip ${sketchBrush === b ? 'active' : ''}`}
                      onClick={() => setSketchBrush(b)}
                    >
                      {b === 'mist' ? 'Sương Mờ' : b === 'starlight' ? 'Bụi Sao' : 'Dạ Quang'}
                    </button>
                  ))}
                </div>
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={180}
                  className="dream-sketch-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={drawMove}
                  onTouchEnd={stopDrawing}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: DREAM ARCHIVE & GALLERY */}
      {viewMode === 'archive' && (
        <div className="dream-archive-container">
          <div className="archive-sidebar-list">
            <div className="archive-list-header">
              <span>DANH SÁCH GIẤC MƠ ĐÃ LƯU</span>
              <span className="count-tag">{dreamEntries.length} BẢN GHI</span>
            </div>
            <div className="archive-items-scroll">
              {dreamEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`archive-item-card ${selectedDream?.id === entry.id ? 'active' : ''}`}
                  onClick={() => setSelectedDream(entry)}
                >
                  <div className="item-card-top">
                    <span className="entry-type-pill">{entry.typeName}</span>
                    <span className="entry-date">{entry.date}</span>
                  </div>
                  <h4 className="entry-title">{entry.title}</h4>
                  <p className="entry-snippet">{entry.content.slice(0, 75)}...</p>
                  <div className="entry-tags-row">
                    {entry.tags.map(t => (
                      <span key={t} className="archive-tag">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dream Detail View */}
          <div className="archive-detail-panel">
            {selectedDream ? (
              <motion.div
                key={selectedDream.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="dream-detail-card"
              >
                <div className="detail-header">
                  <div>
                    <span className="detail-type-tag">{selectedDream.typeName}</span>
                    <h3 className="detail-title">{selectedDream.title}</h3>
                    <div className="detail-meta">
                      <span>📅 Ghi nhận: {selectedDream.date}</span>
                      <span>⭐ Độ rõ nét: {selectedDream.vividness}/5</span>
                      <span>🌌 Tỉnh thức: {selectedDream.lucidity}%</span>
                    </div>
                  </div>
                  <div className="detail-top-actions">
                    <button
                      type="button"
                      className="delete-dream-btn"
                      onClick={() => handleDeleteDream(selectedDream.id)}
                      title="Xóa giấc mơ này"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Dream Content with Haze Typography */}
                <div className="detail-body-text" style={dreamTextStyle}>
                  <p>{selectedDream.content}</p>
                </div>

                {/* Attached Dream Sketch if exists */}
                {selectedDream.drawingUrl && (
                  <div className="detail-sketch-preview">
                    <h5>BIỂU TƯỢNG PHÁC THẢO:</h5>
                    <img src={selectedDream.drawingUrl} alt="Dream sketch" className="sketch-img" />
                  </div>
                )}

                {/* AI Dream Interpretation Card */}
                {selectedDream.interpretation && (
                  <div className="detail-ai-interpretation-box">
                    <div className="ai-box-title">
                      <Bot size={18} />
                      <span>GIẢI MÃ ĐIỀM MỘNG AI // JUNGIAN ARCHETYPE:</span>
                    </div>
                    <p className="ai-interpretation-text">{selectedDream.interpretation}</p>
                    {selectedDream.recommendedMood && typeof onSyncMoodChange === 'function' && (
                      <button
                        type="button"
                        className="apply-dream-mood-btn"
                        onClick={() => onSyncMoodChange(selectedDream.recommendedMood)}
                      >
                        ⚡ ĐỒNG BỘ MÀU NHẪN THEO GIẤC MƠ ({selectedDream.recommendedMood.toUpperCase()})
                      </button>
                    )}
                  </div>
                )}

                {/* Tags Footer */}
                <div className="detail-tags-footer">
                  {selectedDream.tags.map(t => (
                    <span key={t} className="detail-tag-pill">{t}</span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="archive-empty-placeholder">
                <CloudMoon size={48} />
                <p>Chọn một giấc mơ từ danh sách bên trái để xem lại chi tiết và lời giải mã AI.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 37: Dream Version History & Rollback Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
        scope="dream"
        currentData={{
          title: dreamTitle,
          note: dreamContent,
          mood: 'calm',
          intensity: lucidity,
          tags,
          mediaUrl: sketchDataUrl
        }}
        onRestoreVersion={handleRollbackVersion}
        soundEnabled={soundEnabled}
      />
    </div>
  )
}
