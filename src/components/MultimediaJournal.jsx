import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playKeyClick, playMood, playTransitionSound, playAutoSaveTickSound } from '../utils/audioSynth.js'
import AIStoryPrompter from './AIStoryPrompter.jsx'
import ZenMode from './ZenMode.jsx'
import SemanticSearchModal from './SemanticSearchModal.jsx'
import MoodCalendar from './MoodCalendar.jsx'
import EBookExporter from './EBookExporter.jsx'
import VersionHistoryModal from './VersionHistoryModal.jsx'
import E2EEncryptionModal from './E2EEncryptionModal.jsx'
import { analyzeSmartTags, SMART_TAG_CATEGORIES } from '../utils/smartTaggingAI.js'
import { analyzeMentalHealthText, triggerMentalHealthAlert } from '../utils/mentalHealthEngine.js'
import { 
  getE2EStatus, 
  encryptEntryPayload, 
  decryptEntryPayload, 
  isE2EEConfigured, 
  lockE2EEVault 
} from '../utils/e2eEncryptionEngine.js'
import { 
  saveDraft, 
  getSavedDraft, 
  clearSavedDraft, 
  saveVersionSnapshot, 
  formatRelativeTime 
} from '../utils/autoSaveVersionEngine.js'
import { enqueueOfflineAction, getNetworkStatus } from '../utils/offlineSyncEngine.js'
import { getMoodArtSvg } from '../utils/emotionalAnalyticsEngine.js'
import { 
  Sparkles, 
  Lightbulb, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  Wind, 
  Tag, 
  Search, 
  Calendar,
  History,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Save,
  Clock,
  Cloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'


// Pre-loaded artistic sample entries
const DEFAULT_JOURNAL_ENTRIES = [
  {
    id: 'entry-nebula-01',
    title: 'Hạt Tinh Vân Trong Tâm Thức',
    date: '2026-08-15 22:45',
    mood: 'joy',
    intensity: 85,
    type: 'drawing',
    mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23050c18"/><circle cx="300" cy="200" r="90" fill="none" stroke="%2300f0ff" stroke-width="4" filter="drop-shadow(0 0 15px %2300f0ff)"/><circle cx="300" cy="200" r="45" fill="%23ff00ea" opacity="0.6"/><path d="M150,200 Q300,50 450,200 T750,200" fill="none" stroke="%2339ff14" stroke-width="3" opacity="0.8"/><circle cx="220" cy="160" r="5" fill="%23ffffff"/><circle cx="380" cy="240" r="7" fill="%2300f0ff"/><circle cx="340" cy="130" r="4" fill="%23ffb000"/></svg>',
    note: 'Khi ánh sáng từ chiếc nhẫn lan tỏa, tôi cảm nhận rõ sự kết nối vô tận giữa các dòng suy nghĩ. Mọi áp lực tan biến thành những chùm sáng rực rỡ.',
    tags: ['#tự_do', '#vũ_trụ', '#hân_hoan'],
    palette: ['#00f0ff', '#ff00ea', '#39ff14', '#050c18', '#ffffff'],
    aiAnalysis: 'Sóng cảm xúc ở tần số cao với sắc thái lạc quan và cởi mở. Đường nét hình học đồng tâm biểu thị sự hội tụ tư duy và trạng thái thăng hoa sáng tạo.'
  },
  {
    id: 'entry-ocean-02',
    title: 'Khoảng Lặng Đáy Biển Số',
    date: '2026-08-14 19:10',
    mood: 'calm',
    intensity: 60,
    type: 'drawing',
    mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2302120e"/><path d="M50,260 C150,220 250,300 350,250 C450,200 550,280 650,240" fill="none" stroke="%2310b981" stroke-width="5" opacity="0.9"/><path d="M0,320 C180,290 320,350 480,310 C560,290 600,310 700,300" fill="none" stroke="%2334d399" stroke-width="3" opacity="0.6"/><circle cx="300" cy="140" r="30" fill="%2310b981" opacity="0.3"/><circle cx="300" cy="140" r="12" fill="%23ecfdf5"/></svg>',
    note: 'Một ngày trôi qua chậm rãi. Lắng nghe từng nhịp thở và để tâm trí lắng đọng như mặt hồ phẳng lặng sau cơn bão.',
    tags: ['#bình_yên', '#khoảng_lặng', '#chữa_lành'],
    palette: ['#10b981', '#34d399', '#02120e', '#ecfdf5', '#064e3b'],
    aiAnalysis: 'Trạng thái cân bằng nội tại sâu sắc (Theta Wave Resonance). Các đường cong nhịp nhàng phản ánh sự điều hòa cảm xúc ổn định.'
  },
  {
    id: 'entry-breach-03',
    title: 'Xung Đột Lượng Tử & Phá Vỡ',
    date: '2026-08-13 14:20',
    mood: 'breach',
    intensity: 95,
    type: 'drawing',
    mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23140202"/><path d="M50,350 L200,80 L280,240 L380,40 L460,290 L580,120" fill="none" stroke="%23ef4444" stroke-width="6"/><path d="M100,380 L220,130 L320,290 L420,90 L520,330" fill="none" stroke="%23ffb000" stroke-width="3" opacity="0.8"/><circle cx="380" cy="40" r="16" fill="%23ef4444" opacity="0.6"/></svg>',
    note: 'Sự bùng nổ dữ dội của những suy nghĩ chồng chéo. Đôi khi sự phá vỡ là khởi đầu cần thiết để tái cấu trúc lại chính mình.',
    tags: ['#bão_tố', '#bùng_nổ', '#chuyển_hóa'],
    palette: ['#ef4444', '#ffb000', '#140202', '#fee2e2', '#7f1d1d'],
    aiAnalysis: 'Năng lượng giải phóng tức thời ở cường độ đỉnh (95%). Nét vẽ dứt khoát hình zig-zag thể hiện sự quyết đoán và giải tỏa ức chế.'
  },
  {
    id: 'entry-amber-04',
    title: 'Ánh Hoàng Hôn & Sự Thức Tỉnh',
    date: '2026-08-12 18:30',
    mood: 'friction',
    intensity: 78,
    type: 'drawing',
    mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231a1003"/><polygon points="300,90 380,180 300,270 220,180" fill="none" stroke="%23fbbf24" stroke-width="3.5"/><circle cx="300" cy="180" r="45" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="6 4"/><path d="M100,280 Q300,120 500,280" fill="none" stroke="%23f59e0b" stroke-width="3" opacity="0.8"/><circle cx="300" cy="180" r="15" fill="%23fef3c7"/></svg>',
    note: 'Đứng trước những lựa chọn lớn của cuộc đời, sự ma sát trong suy nghĩ giúp ta thấu hiểu rõ hơn giá trị của những điều chân thực.',
    tags: ['#trăn_trở', '#thức_tỉnh', '#đột_phá'],
    palette: ['#f59e0b', '#fbbf24', '#1a1003', '#fef3c7', '#78350f'],
    aiAnalysis: 'Xung đột nhận thức mang tính kiến thiết (Cognitive Friction). Sự giao thoa giữa ánh sáng hổ phách và cấu trúc hình học thể hiện quá trình tìm kiếm chân lý.'
  }
]

const MOOD_OPTIONS = [
  { id: 'calm', name: 'Bình Yên', icon: '🌿', color: '#10b981', desc: 'Trạng thái tĩnh lặng, cân bằng và sâu lắng' },
  { id: 'joy', name: 'Hân Hoan', icon: '⚡', color: '#00f0ff', desc: 'Tràn đầy năng lượng, tích cực và sáng tạo' },
  { id: 'melancholy', name: 'Trầm Mặc', icon: '🌌', color: '#60a5fa', desc: 'Suy tư hoài niệm, sâu sắc và nhẹ nhàng' },
  { id: 'friction', name: 'Trăn Trở', icon: '⚙️', color: '#f59e0b', desc: 'Nhiều suy nghĩ đối lập, tìm kiếm lời giải' },
  { id: 'breach', name: 'Bùng Nổ', icon: '🔥', color: '#ef4444', desc: 'Cảm xúc mãnh liệt, giải phóng năng lượng' }
]

const BRUSH_MODES = [
  { id: 'neon', name: 'Neon Glow', icon: '✨', tip: 'Nét vẽ phát sáng dạ quang rực rỡ' },
  { id: 'circuit', name: 'Cyber Circuit', icon: '⚡', tip: 'Đường nét điện tử góc cạnh' },
  { id: 'particles', name: 'Star Trail', icon: '🌌', tip: 'Vệt bụi sao và hạt lấp lánh' },
  { id: 'ink', name: 'Calligraphy', icon: '🖌️', tip: 'Mực mềm mại thanh đậm tự nhiên' },
  { id: 'spray', name: 'Aerosol Spray', icon: '💨', tip: 'Phun sương tán xạ đa điểm' },
  { id: 'rainbow', name: 'Rainbow Pulse', icon: '🌈', tip: 'Tự động biến đổi màu theo nét vẽ' },
  { id: 'eraser', name: 'Eraser', icon: '🧹', tip: 'Tẩy xóa nét vẽ' }
]

const COLOR_PRESETS = [
  { hex: '#00f0ff', name: 'Cyan Cyber' },
  { hex: '#10b981', name: 'Emerald Zen' },
  { hex: '#a855f7', name: 'Cosmic Violet' },
  { hex: '#ef4444', name: 'Breach Red' },
  { hex: '#f59e0b', name: 'Solar Amber' },
  { hex: '#ec4899', name: 'Neon Pink' },
  { hex: '#ffffff', name: 'Pure Starlight' },
  { hex: '#000000', name: 'Dark Void' }
]

const CANVAS_BG_PRESETS = [
  { id: 'void', name: 'Void Dark', color: '#070b14', grid: true },
  { id: 'matrix', name: 'Cyber Grid', color: '#03120e', grid: true },
  { id: 'cosmos', name: 'Cosmic Blue', color: '#050c1e', grid: false },
  { id: 'noir', name: 'Pure Black', color: '#000000', grid: false }
]

const PRESET_TAGS = [
  '#Gia_đình', '#Công_việc', '#Tình_yêu', '#Áp_lực',
  '#bình_yên', '#hân_hoan', '#hy_vọng', '#bão_tố', '#khoảng_lặng', 
  '#tự_do', '#chữa_lành', '#vũ_trụ', '#sáng_tạo', '#hoài_niệm'
]

export default function MultimediaJournal({
  onSyncMoodChange,
  currentMood = 'calm',
  soundEnabled = false,
  onOpenZenMode,
  activeTransition = 'book-flip',
  setActiveTransition,
  initialView = 'studio'
}) {
  // Navigation sub-tabs: 'studio' | 'vault' | 'search' | 'calendar' | 'ebook'
  const [journalView, setJournalView] = useState(initialView || 'studio')
  const [studioMode, setStudioMode] = useState('draw') // 'draw' | 'upload' | 'camera'

  useEffect(() => {
    if (initialView) {
      setJournalView(initialView)
    }
  }, [initialView])

  useEffect(() => {
    const handleSubViewEvent = (e) => {
      if (e.detail?.subview) {
        setJournalView(e.detail.subview)
      }
    }
    window.addEventListener('open-journal-subview', handleSubViewEvent)
    return () => window.removeEventListener('open-journal-subview', handleSubViewEvent)
  }, [])

  const triggerJournalTransition = (targetView, specificType = null) => {
    const type = specificType || activeTransition
    window.dispatchEvent(new CustomEvent('trigger-page-transition', {
      detail: { type, duration: 750, onPeak: () => setJournalView(targetView) }
    }))
    if (soundEnabled) playTransitionSound(type)
  }

  // Drawing state
  const canvasRef = useRef(null)
  const [brushMode, setBrushMode] = useState('neon')
  const [brushColor, setBrushColor] = useState('#00f0ff')
  const [brushSize, setBrushSize] = useState(6)
  const [brushOpacity, setBrushOpacity] = useState(0.9)
  const [canvasBg, setCanvasBg] = useState('void')
  const [isDrawing, setIsDrawing] = useState(false)
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(-1)
  const lastPointRef = useRef(null)
  const rainbowHueRef = useRef(0)

  // Media upload & webcam state
  const [uploadedMedia, setUploadedMedia] = useState(null) // { type: 'image'|'video', url: string, name: string }
  const [mediaFilter, setMediaFilter] = useState('cyber-glow') // 'none' | 'cyber-glow' | 'scanlines' | 'glitch' | 'noir'
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const mediaStreamRef = useRef(null)

  // Journal Metadata
  const [entryTitle, setEntryTitle] = useState('')
  const [entryNote, setEntryNote] = useState('')
  const [selectedMood, setSelectedMood] = useState(currentMood || 'calm')
  const [moodIntensity, setMoodIntensity] = useState(75)
  const [selectedTags, setSelectedTags] = useState(['#sáng_tạo', '#vũ_trụ'])
  const [extractedPalette, setExtractedPalette] = useState(['#00f0ff', '#10b981', '#a855f7', '#070b14', '#ffffff'])

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiReflection, setAiReflection] = useState(null)
  const [showStoryPrompter, setShowStoryPrompter] = useState(false)
  
  // Smart AI Tagging & Zen Mode state (Features 20 & 21)
  const [showZenMode, setShowZenMode] = useState(false)
  const [smartTagAnalysis, setSmartTagAnalysis] = useState({ tags: [], detailedTags: [] })
  const [isScanningSmartTags, setIsScanningSmartTags] = useState(false)

  // Real-time AI Tagging Scanner on note change
  useEffect(() => {
    if (!entryNote.trim()) {
      setSmartTagAnalysis({ tags: [], detailedTags: [] })
      return
    }
    const timer = setTimeout(() => {
      const res = analyzeSmartTags(entryNote, { minConfidence: 15, maxTags: 5 })
      setSmartTagAnalysis(res)
    }, 450)
    return () => clearTimeout(timer)
  }, [entryNote])

  // Trigger manual Smart AI Scan
  const triggerManualSmartScan = () => {
    setIsScanningSmartTags(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => {
      const res = analyzeSmartTags(entryNote, { minConfidence: 10, maxTags: 6 })
      setSmartTagAnalysis(res)
      if (res.tags.length > 0) {
        setSelectedTags(prev => [...new Set([...prev, ...res.tags])])
      }
      setIsScanningSmartTags(false)
    }, 600)
  }

  // Saved Entries (Clean 4 Curated Entries)
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('mr-multimedia-journal-entries')
      if (saved) {
        const list = JSON.parse(saved)
        if (Array.isArray(list)) {
          // If the list is the bloated 800+ demo blob, reset to exactly 4 curated entries
          if (list.length > 4) {
            localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(DEFAULT_JOURNAL_ENTRIES))
            return DEFAULT_JOURNAL_ENTRIES
          }
          return list.map(item => ({
            ...item,
            mediaUrl: item.mediaUrl || getMoodArtSvg(item.mood, item.title, item.intensity)
          }))
        }
      }
      localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(DEFAULT_JOURNAL_ENTRIES))
      return DEFAULT_JOURNAL_ENTRIES
    } catch {
      return DEFAULT_JOURNAL_ENTRIES
    }
  })

  // Filter state for journal gallery
  const [galleryFilter, setGalleryFilter] = useState('all')

  // Computed filtered list for gallery and flip navigation
  const filteredEntries = useMemo(() => {
    if (!Array.isArray(entries)) return []
    if (galleryFilter === 'all') return entries
    return entries.filter(e => {
      if (['drawing', 'image', 'video'].includes(galleryFilter)) return e.type === galleryFilter
      if (['joy', 'calm', 'breach', 'melancholy', 'friction'].includes(galleryFilter)) return e.mood === galleryFilter
      if (galleryFilter.startsWith('#')) return (e.tags || []).includes(galleryFilter)
      return true
    })
  }, [entries, galleryFilter])

  // Feature 39: End-to-End Encryption (E2EE) State
  const [showE2EEModal, setShowE2EEModal] = useState(false)
  const [e2eeStatus, setE2eeStatus] = useState(() => getE2EStatus())

  // Reload & Decrypt entries when E2EE status changes or data is migrated / seeded
  useEffect(() => {
    const handleE2EEChange = async (e) => {
      const status = e?.detail || getE2EStatus()
      setE2eeStatus(status)
      try {
        const raw = localStorage.getItem('mr-multimedia-journal-entries')
        if (!raw) return
        const list = JSON.parse(raw)
        if (status.isUnlocked) {
          const decryptedList = await Promise.all(list.map(item => decryptEntryPayload(item)))
          setEntries(decryptedList.map(item => ({
            ...item,
            mediaUrl: item.mediaUrl || getMoodArtSvg(item.mood, item.title, item.intensity)
          })))
        } else {
          setEntries(list.map(item => ({
            ...item,
            mediaUrl: item.mediaUrl || getMoodArtSvg(item.mood, item.title, item.intensity)
          })))
        }
      } catch (err) {
        console.warn('[E2EE Journal Reload Error]', err)
      }
    }

    const handleDataUpdated = () => {
      try {
        const raw = localStorage.getItem('mr-multimedia-journal-entries')
        if (raw) {
          const list = JSON.parse(raw)
          if (Array.isArray(list)) {
            setEntries(list.map(item => ({
              ...item,
              mediaUrl: item.mediaUrl || getMoodArtSvg(item.mood, item.title, item.intensity)
            })))
          }
        }
      } catch (err) {
        console.warn('[Journal Reload Error]', err)
      }
    }

    window.addEventListener('mr-e2ee-status-changed', handleE2EEChange)
    window.addEventListener('mr-vault-data-encrypted', handleE2EEChange)
    window.addEventListener('mr-vault-data-decrypted', handleE2EEChange)
    window.addEventListener('mr-emotional-data-updated', handleDataUpdated)
    return () => {
      window.removeEventListener('mr-e2ee-status-changed', handleE2EEChange)
      window.removeEventListener('mr-vault-data-encrypted', handleE2EEChange)
      window.removeEventListener('mr-vault-data-decrypted', handleE2EEChange)
      window.removeEventListener('mr-emotional-data-updated', handleDataUpdated)
    }
  }, [])


  // Feature 37: Auto-Save & Version History State
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false)
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [unsavedDraft, setUnsavedDraft] = useState(null)


  // Check for unsaved draft on initial load
  useEffect(() => {
    const draft = getSavedDraft('journal')
    if (draft && (draft.note?.trim() || draft.title?.trim())) {
      setUnsavedDraft(draft)
    }
  }, [])

  // Auto-Save interval every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (entryNote.trim() || entryTitle.trim()) {
        setIsAutoSaving(true)
        saveDraft('journal', {
          title: entryTitle,
          note: entryNote,
          mood: selectedMood,
          intensity: moodIntensity,
          tags: selectedTags,
          mediaFilter
        })

        // Also capture version snapshot
        saveVersionSnapshot('journal', {
          title: entryTitle,
          note: entryNote,
          mood: selectedMood,
          intensity: moodIntensity,
          tags: selectedTags
        })

        setLastAutoSavedTime(Date.now())
        setTimeout(() => setIsAutoSaving(false), 600)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [entryNote, entryTitle, selectedMood, moodIntensity, selectedTags, mediaFilter])

  // Draft Recovery Handlers
  const handleRestoreDraft = () => {
    if (!unsavedDraft) return
    if (unsavedDraft.title !== undefined) setEntryTitle(unsavedDraft.title)
    if (unsavedDraft.note !== undefined) setEntryNote(unsavedDraft.note)
    if (unsavedDraft.mood) setSelectedMood(unsavedDraft.mood)
    if (unsavedDraft.intensity) setMoodIntensity(unsavedDraft.intensity)
    if (unsavedDraft.tags) setSelectedTags(unsavedDraft.tags)
    if (unsavedDraft.mediaFilter) setMediaFilter(unsavedDraft.mediaFilter)
    setUnsavedDraft(null)
    if (soundEnabled) playKeyClick()
  }

  const handleDiscardDraft = () => {
    clearSavedDraft('journal')
    setUnsavedDraft(null)
    if (soundEnabled) playKeyClick()
  }

  const handleRollbackVersion = (restoredVer) => {
    if (restoredVer.title !== undefined) setEntryTitle(restoredVer.title)
    if (restoredVer.note !== undefined) setEntryNote(restoredVer.note)
    if (restoredVer.mood) setSelectedMood(restoredVer.mood)
    if (restoredVer.intensity) setMoodIntensity(restoredVer.intensity)
    if (restoredVer.tags) setSelectedTags(restoredVer.tags)
    if (soundEnabled) playKeyClick()
  }

  // Selected Entry modal view
  const [inspectEntry, setInspectEntry] = useState(null)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false)

  // Keyboard navigation when inspecting journal entries
  useEffect(() => {
    if (!inspectEntry) return
    const handleInspectKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      if (isInput) return

      const currentIdx = filteredEntries.findIndex(item => item.id === inspectEntry.id)
      const prevEntry = currentIdx > 0 ? filteredEntries[currentIdx - 1] : null
      const nextEntry = currentIdx < filteredEntries.length - 1 ? filteredEntries[currentIdx + 1] : null

      const triggerFlip = (entry) => {
        if (!entry) return
        if (activeTransition === 'instant' || activeTransition === 'none') {
          setInspectEntry(entry)
          if (soundEnabled) playTransitionSound(activeTransition)
          return
        }
        const duration = activeTransition === 'fade-fast' ? 180 : 300
        window.dispatchEvent(new CustomEvent('trigger-page-transition', {
          detail: { type: activeTransition, duration, onPeak: () => setInspectEntry(entry) }
        }))
        if (soundEnabled) playTransitionSound(activeTransition)
      }

      if (e.key === 'ArrowLeft' && prevEntry) {
        e.preventDefault()
        triggerFlip(prevEntry)
      } else if (e.key === 'ArrowRight' && nextEntry) {
        e.preventDefault()
        triggerFlip(nextEntry)
      } else if (e.key === 'Escape') {
        setInspectEntry(null)
      }
    }

    window.addEventListener('keydown', handleInspectKeyDown)
    return () => window.removeEventListener('keydown', handleInspectKeyDown)
  }, [inspectEntry, filteredEntries, activeTransition, soundEnabled])

  // Persist entries to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(entries))
    } catch (e) {
      console.warn('Storage quota limit reached for media journal:', e)
    }
  }, [entries])

  const isDrawingRef = useRef(false)
  const canvasInitializedRef = useRef(false)
  const lastDrawnImageRef = useRef(null)

  // Canvas Setup & Resize handler (Non-destructive to existing drawing)
  const initCanvas = useCallback((forceClear = false) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    
    // Scale for high DPI
    const dpr = window.devicePixelRatio || 1
    const newWidth = Math.round(rect.width * dpr)
    const newHeight = Math.round(rect.height * dpr)

    // Save existing content before resize if canvas was already initialized
    let prevData = null
    if (canvasInitializedRef.current && !forceClear && canvas.width > 0 && canvas.height > 0) {
      try {
        prevData = canvas.toDataURL()
      } catch (e) {
        // ignore
      }
    }

    canvas.width = newWidth
    canvas.height = newHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    
    if (prevData && !forceClear) {
      // Restore existing artwork
      const img = new Image()
      img.onload = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.drawImage(img, 0, 0)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      img.src = prevData
    } else {
      // Fill fresh background
      const bgConfig = CANVAS_BG_PRESETS.find(b => b.id === canvasBg) || CANVAS_BG_PRESETS[0]
      ctx.fillStyle = bgConfig.color
      ctx.fillRect(0, 0, rect.width, rect.height)

      if (bgConfig.grid) {
        drawGrid(ctx, rect.width, rect.height)
      }

      // Save initial state to history stack
      const dataUrl = canvas.toDataURL()
      lastDrawnImageRef.current = dataUrl
      setHistory([dataUrl])
      setHistoryStep(0)
    }

    canvasInitializedRef.current = true
  }, [canvasBg])

  useEffect(() => {
    if (journalView === 'studio' && studioMode === 'draw') {
      const timer = setTimeout(() => {
        if (!canvasInitializedRef.current) {
          initCanvas(false)
        }
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [journalView, studioMode, initCanvas])

  function drawGrid(ctx, w, h) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.lineWidth = 1
    const step = 28
    for (let x = 0; x < w; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }
    ctx.restore()
  }

  function saveCanvasState() {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const dataUrl = canvas.toDataURL()
      lastDrawnImageRef.current = dataUrl
      setHistory(prev => {
        const next = prev.slice(0, historyStep + 1)
        return [...next, dataUrl]
      })
      setHistoryStep(prev => prev + 1)
    } catch (err) {
      // ignore
    }
  }

  function handleUndo() {
    if (historyStep <= 0) return
    if (soundEnabled) playKeyClick()
    const newStep = historyStep - 1
    const dataUrl = history[newStep]
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const img = new Image()
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setHistoryStep(newStep)
      lastDrawnImageRef.current = dataUrl
    }
    img.src = dataUrl
  }

  function handleRedo() {
    if (historyStep >= history.length - 1) return
    if (soundEnabled) playKeyClick()
    const newStep = historyStep + 1
    const dataUrl = history[newStep]
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const img = new Image()
    img.onload = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      setHistoryStep(newStep)
      lastDrawnImageRef.current = dataUrl
    }
    img.src = dataUrl
  }

  function handleClearCanvas() {
    if (window.confirm('Bạn có chắc chắn muốn xóa sạch toàn bộ bảng vẽ này?')) {
      if (soundEnabled) playKeyClick()
      initCanvas(true)
    }
  }

  // Pointer Coordinates with exact sub-pixel CSS precision
  function getCoordinates(e) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // Unbreakable Pointer Events (Left click & Touch with Pointer Capture)
  function handlePointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch (err) {
      // ignore
    }

    isDrawingRef.current = true
    setIsDrawing(true)
    const coords = getCoordinates(e)
    lastPointRef.current = coords
    drawStroke(coords, coords)
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current) return
    e.preventDefault()
    const coords = getCoordinates(e)

    if (lastPointRef.current) {
      drawStroke(lastPointRef.current, coords)
      lastPointRef.current = coords
    } else {
      lastPointRef.current = coords
      drawStroke(coords, coords)
    }
  }

  function handlePointerUp(e) {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    setIsDrawing(false)
    lastPointRef.current = null

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch (err) {
      // ignore
    }

    saveCanvasState()
    extractPaletteFromCanvas()
  }

  // Continuous and smooth drawing stroke generator
  function drawStroke(start, end) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.save()

    // Dynamic Brush Color
    let strokeCol = brushColor
    if (brushMode === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 2.5) % 360
      strokeCol = `hsl(${rainbowHueRef.current}, 100%, 60%)`
    }

    ctx.globalAlpha = brushOpacity
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const dist = Math.hypot(end.x - start.x, end.y - start.y)

    if (brushMode === 'eraser') {
      const bgConfig = CANVAS_BG_PRESETS.find(b => b.id === canvasBg) || CANVAS_BG_PRESETS[0]
      ctx.strokeStyle = bgConfig.color
      ctx.lineWidth = brushSize * 2.5
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    } else if (brushMode === 'neon' || brushMode === 'rainbow') {
      // Outer intense neon glow
      ctx.strokeStyle = strokeCol
      ctx.lineWidth = brushSize
      ctx.shadowColor = strokeCol
      ctx.shadowBlur = brushSize * 2.2
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // Core white laser beam for crisp definition
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = Math.max(1.5, brushSize * 0.28)
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    } else if (brushMode === 'circuit') {
      ctx.strokeStyle = strokeCol
      ctx.lineWidth = Math.max(2, brushSize * 0.8)
      ctx.shadowColor = strokeCol
      ctx.shadowBlur = 6

      // Snapped digital step
      const midX = (start.x + end.x) / 2
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(midX, start.y)
      ctx.lineTo(midX, end.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()

      // Microcircuit logic node
      if (Math.random() > 0.65) {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(end.x, end.y, brushSize * 0.65, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (brushMode === 'particles') {
      const steps = Math.max(1, Math.floor(dist / 4))
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const curX = start.x + (end.x - start.x) * t
        const curY = start.y + (end.y - start.y) * t
        const count = 3
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * brushSize * 2
          const px = curX + Math.cos(angle) * radius
          const py = curY + Math.sin(angle) * radius
          const pSize = Math.random() * (brushSize * 0.45) + 1

          ctx.fillStyle = strokeCol
          ctx.shadowColor = strokeCol
          ctx.shadowBlur = 6
          ctx.beginPath()
          ctx.arc(px, py, pSize, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (brushMode === 'spray') {
      const steps = Math.max(1, Math.floor(dist / 3))
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const curX = start.x + (end.x - start.x) * t
        const curY = start.y + (end.y - start.y) * t
        const count = 12
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * (brushSize * 2.8)
          const px = curX + Math.cos(angle) * radius
          const py = curY + Math.sin(angle) * radius

          ctx.fillStyle = strokeCol
          ctx.beginPath()
          ctx.arc(px, py, Math.random() * 1.4 + 0.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (brushMode === 'ink') {
      ctx.strokeStyle = strokeCol
      const dynamicWidth = Math.max(1.5, brushSize * (1 - Math.min(dist / 40, 0.65)))
      ctx.lineWidth = dynamicWidth
      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }

    ctx.restore()
  }

  // Extract color palette from Canvas
  function extractPaletteFromCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
      const colors = {}
      const step = 4 * 16 // sample every 16th pixel
      for (let i = 0; i < imageData.length; i += step) {
        const r = imageData[i]
        const g = imageData[i + 1]
        const b = imageData[i + 2]
        // skip pure dark background
        if (r + g + b < 30) continue
        const key = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
        colors[key] = (colors[key] || 0) + 1
      }
      const sorted = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(pair => pair[0])

      if (sorted.length > 0) {
        setExtractedPalette([...sorted, ...COLOR_PRESETS.map(c => c.hex)].slice(0, 5))
      }
    } catch {
      // Ignored for cross-origin or local canvas
    }
  }

  // File Upload Handler
  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isImage && !isVideo) {
      alert('Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP) hoặc video (MP4, WebM).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target.result
      setUploadedMedia({
        type: isVideo ? 'video' : 'image',
        url,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      })
      if (soundEnabled) playKeyClick()
    }
    reader.readAsDataURL(file)
  }

  // Webcam Capture
  async function startCamera() {
    setCameraError(null)
    setIsCameraActive(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      })
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setCameraError('Không thể truy cập camera. Vui lòng kiểm tra quyền thiết bị.')
      setIsCameraActive(false)
    }
  }

  function stopCamera() {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    setIsCameraActive(false)
  }

  function capturePhotoFromCamera() {
    if (!videoRef.current) return
    const video = videoRef.current
    const captureCanvas = document.createElement('canvas')
    captureCanvas.width = video.videoWidth || 640
    captureCanvas.height = video.videoHeight || 480
    const ctx = captureCanvas.getContext('2d')
    ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height)
    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.9)

    setUploadedMedia({
      type: 'image',
      url: dataUrl,
      name: `Snapshot_${new Date().toLocaleTimeString('vi-VN').replace(/:/g, '-')}.jpg`,
      size: 'Snapshot'
    })
    stopCamera()
    setStudioMode('upload')
    if (soundEnabled) playKeyClick()
  }

  // Cleanup camera when switching tabs
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // AI Reflection Generator
  function handleGenerateAiAnalysis() {
    setIsAnalyzing(true)
    if (soundEnabled) playKeyClick()

    setTimeout(() => {
      const moodItem = MOOD_OPTIONS.find(m => m.id === selectedMood) || MOOD_OPTIONS[0]
      const insights = [
        `Tần số tâm thức đo được ở mức ${moodIntensity}%. Sự kết hợp của gam màu ${moodItem.name} cùng các đường nét phóng khoáng biểu lộ một trạng thái tự do biểu đạt cao độ.`,
        `Hệ thống nhận diện được những nếp gấp cảm xúc tinh tế trong tác phẩm. Năng lượng tâm lý đang trong giai đoạn chuyển dịch tích cực hướng về ${moodItem.name.toLowerCase()}.`,
        `Các rung cảm lượng tử cho thấy sự hòa hợp sâu sắc giữa tâm trí và thị giác. Cường độ ${moodIntensity}% tạo nên một trường bảo hộ tinh thần vững chắc.`,
        `Biểu đồ trường cảm xúc phản ánh sự tự do khai phóng. Tác phẩm này mở ra một luồng liên kết mới giữa các tế bào thần kinh nhận thức.`
      ]
      const randomInsight = insights[Math.floor(Math.random() * insights.length)]
      setAiReflection(randomInsight)
      setIsAnalyzing(false)
    }, 1100)
  }

  // Save Journal Entry
  function handleSaveEntry() {
    let finalMediaUrl = ''
    let entryType = 'drawing'

    if (studioMode === 'draw') {
      const canvas = canvasRef.current
      if (canvas) {
        finalMediaUrl = canvas.toDataURL('image/png', 0.85)
      }
      entryType = 'drawing'
    } else if (uploadedMedia) {
      finalMediaUrl = uploadedMedia.url
      entryType = uploadedMedia.type
    }

    if (!finalMediaUrl && !entryNote.trim()) {
      alert('Vui lòng vẽ một tác phẩm, tải lên hình ảnh/video hoặc viết một đoạn cảm xúc.')
      return
    }

    const now = new Date()
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newEntry = {
      id: `entry-${Date.now()}`,
      title: entryTitle.trim() || `Nhật ký ${MOOD_OPTIONS.find(m => m.id === selectedMood)?.name || 'Tâm Thức'} #${entries.length + 1}`,
      date: formattedDate,
      mood: selectedMood,
      intensity: moodIntensity,
      type: entryType,
      mediaUrl: finalMediaUrl,
      mediaFilter,
      note: entryNote.trim() || 'Một trang nhật ký đa phương tiện được lưu giữ trong không gian tâm thức số.',
      tags: selectedTags,
      palette: extractedPalette,
      aiAnalysis: aiReflection || `Hệ sinh thái cảm xúc ${selectedMood.toUpperCase()} với chỉ số cường độ ${moodIntensity}%. Được lưu trữ vào kho dữ liệu thần kinh.`
    }

    setEntries(prev => [newEntry, ...prev])
    setSaveSuccessMsg(true)
    if (soundEnabled) playMood(selectedMood)

    // Clear auto-saved draft and record milestone version snapshot
    clearSavedDraft('journal')
    saveVersionSnapshot('journal', newEntry, { isMilestone: true, customNote: 'Đã lưu chính thức vào Nhật Ký' })

    // Enqueue for PWA Cloud Sync
    enqueueOfflineAction({
      entityType: 'journal',
      operation: 'create',
      payload: newEntry
    })

    // Check for distress or crisis keywords
    const combinedText = `${entryTitle} ${entryNote} ${selectedTags.join(' ')}`
    const mentalRes = analyzeMentalHealthText(combinedText, { source: 'Multimedia Journal' })
    if (mentalRes.shouldTriggerAlert) {
      setTimeout(() => {
        triggerMentalHealthAlert({
          severity: mentalRes.severity,
          source: 'Nhật Ký Đa Phương Tiện',
          keywords: mentalRes.keywords,
          message: 'AI nhận thấy những xúc cảm trĩu nặng trong trang nhật ký vừa rồi. Bạn luôn có một nơi an toàn để dừng chân và nhận trợ giúp.'
        })
      }, 1400)
    }

    setTimeout(() => {
      setSaveSuccessMsg(false)
      setJournalView('vault')
    }, 1200)
  }

  // Toggle tag selection
  function toggleTag(tag) {
    if (soundEnabled) playKeyClick()
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="multimedia-journal-container">
      {/* Top Header Bar */}
      <div className="journal-header-card">
        <div className="journal-header-left">
          <div className="journal-badge">
            <span className="live-sparkle">✦</span> QUANTUM MULTIMEDIA STUDIO // NHẬT KÝ ĐA PHƯƠNG TIỆN
          </div>
          <h2 className="journal-title">Diễn Đạt Cảm Xúc Đa Giác Quan</h2>
          <p className="journal-subtitle">
            Vẽ tay trực tiếp, tải ảnh hoặc video và để AI phân tích rung cảm tâm thức của bạn.
          </p>
        </div>

        {/* Transition Style Selector & View Switcher Tabs */}
        <div className="journal-header-right-group">
          {/* Quick Transition Mode Selector */}
          <div className="journal-transition-selector">
            <span className="transition-mode-label">
              <Layers size={13} />
              <span>CHUYỂN CẢNH:</span>
            </span>
            {[
              { id: 'instant', label: '⚡ Siêu Tốc 60fps' },
              { id: 'fade-fast', label: '✨ Mờ Mượt' },
              { id: 'book-flip', label: '📖 Lật Sách' },
              { id: 'water-ripple', label: '💧 Gợn Nước' },
              { id: 'glass-shatter', label: '💎 Kính Vỡ' },
              { id: 'quantum-warp', label: '🌀 Warp' },
              { id: 'cyber-glitch', label: '⚡ Glitch' }
            ].map(t => (
              <button
                key={t.id}
                type="button"
                className={`transition-mode-btn ${activeTransition === t.id ? 'active' : ''}`}
                onClick={() => {
                  if (typeof setActiveTransition === 'function') {
                    setActiveTransition(t.id)
                  }
                  localStorage.setItem('mr-page-transition', t.id)
                  if (soundEnabled) playTransitionSound(t.id)
                  if (t.id !== 'instant') {
                    window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                      detail: { type: t.id, duration: t.id === 'fade-fast' ? 180 : 320 }
                    }))
                  }
                }}
                title={`Hiệu ứng chuyển cảnh toàn trang: ${t.label}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* View Switcher Tabs */}
          <div className="journal-view-tabs">
            <button
              type="button"
              className={`journal-view-btn ${journalView === 'studio' ? 'active' : ''}`}
              onClick={() => { 
                if (journalView !== 'studio') triggerJournalTransition('studio')
                else if (soundEnabled) playKeyClick()
              }}
            >
              🎨 STUDIO SÁNG TẠO
            </button>
            <button
              type="button"
              className={`journal-view-btn ${journalView === 'vault' ? 'active' : ''}`}
              onClick={() => { 
                if (journalView !== 'vault') triggerJournalTransition('vault')
                else if (soundEnabled) playKeyClick()
              }}
            >
              📚 KHO KÝ ỨC ({entries.length})
            </button>
            <button
              type="button"
              className={`journal-view-btn ${journalView === 'search' ? 'active' : ''}`}
              onClick={() => { 
                if (journalView !== 'search') triggerJournalTransition('search')
                else if (soundEnabled) playKeyClick()
              }}
            >
              🔍 TÌM KIẾM NGỮ NGHĨA
            </button>
            <button
              type="button"
              className={`journal-view-btn ${journalView === 'calendar' ? 'active' : ''}`}
              onClick={() => { 
                if (journalView !== 'calendar') triggerJournalTransition('calendar')
                else if (soundEnabled) playKeyClick()
              }}
            >
              📅 LỊCH CẢM XÚC
            </button>
            <button
              type="button"
              className={`journal-view-btn ${journalView === 'ebook' ? 'active' : ''}`}
              onClick={() => { 
                if (journalView !== 'ebook') triggerJournalTransition('ebook')
                else if (soundEnabled) playKeyClick()
              }}
            >
              📖 XUẤT SÁCH (PDF/EPUB)
            </button>
            <button
              type="button"
              className="journal-view-btn"
              onClick={() => {
                setShowE2EEModal(true)
                if (soundEnabled) playKeyClick()
              }}
              title="Quản lý mã hóa đầu-cuối Zero-Knowledge AES-GCM 256-bit"
              style={{
                background: e2eeStatus.isUnlocked ? 'rgba(16, 185, 129, 0.15)' : e2eeStatus.isConfigured ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0, 240, 255, 0.1)',
                borderColor: e2eeStatus.isUnlocked ? '#10b981' : e2eeStatus.isConfigured ? '#f59e0b' : '#00f0ff',
                color: e2eeStatus.isUnlocked ? '#6ee7b7' : e2eeStatus.isConfigured ? '#fcd34d' : '#38bdf8'
              }}
            >
              {e2eeStatus.isUnlocked ? '🛡️ E2EE: MỞ' : e2eeStatus.isConfigured ? '🔒 E2EE: KHÓA' : '🛡️ MÃ HÓA E2EE'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {journalView === 'studio' ? (
          <motion.div
            key="studio"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="journal-studio-layout"
          >
            {/* Left Column: Visual Creative Area (Canvas / Upload / Camera) */}
            <div className="journal-creative-column">
              {/* Studio Input Mode Switcher */}
              <div className="studio-mode-pills">
                <button
                  type="button"
                  className={`mode-pill ${studioMode === 'draw' ? 'active' : ''}`}
                  onClick={() => { setStudioMode('draw'); stopCamera(); if (soundEnabled) playKeyClick(); }}
                >
                  🖌️ VẼ TAY TRỰC TIẾP
                </button>
                <button
                  type="button"
                  className={`mode-pill ${studioMode === 'upload' ? 'active' : ''}`}
                  onClick={() => { setStudioMode('upload'); stopCamera(); if (soundEnabled) playKeyClick(); }}
                >
                  📁 TẢI ẢNH / VIDEO
                </button>
                <button
                  type="button"
                  className={`mode-pill ${studioMode === 'camera' ? 'active' : ''}`}
                  onClick={() => { setStudioMode('camera'); startCamera(); if (soundEnabled) playKeyClick(); }}
                >
                  📷 CHỤP WEBCAM
                </button>
              </div>

              {/* 1. DRAWING CANVAS MODE */}
              {studioMode === 'draw' && (
                <div className="canvas-studio-wrapper">
                  {/* Canvas Toolbar */}
                  <div className="canvas-toolbar">
                    {/* Brush Modes */}
                    <div className="brush-modes-group">
                      {BRUSH_MODES.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={`brush-tool-btn ${brushMode === b.id ? 'active' : ''}`}
                          onClick={() => { setBrushMode(b.id); if (soundEnabled) playKeyClick(); }}
                          title={`${b.name} — ${b.tip}`}
                        >
                          <span className="tool-icon">{b.icon}</span>
                          <span className="tool-name">{b.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Canvas Actions (Undo / Redo / Clear / Download) */}
                    <div className="canvas-actions-group">
                      <button
                        type="button"
                        className="canvas-action-icon-btn"
                        onClick={handleUndo}
                        disabled={historyStep <= 0}
                        title="Hoàn tác nét vẽ (Ctrl+Z)"
                      >
                        ↩
                      </button>
                      <button
                        type="button"
                        className="canvas-action-icon-btn"
                        onClick={handleRedo}
                        disabled={historyStep >= history.length - 1}
                        title="Làm lại nét vẽ (Ctrl+Y)"
                      >
                        ↪
                      </button>
                      <button
                        type="button"
                        className="canvas-action-icon-btn danger"
                        onClick={handleClearCanvas}
                        title="Xóa sạch bảng vẽ"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Brush Color & Controls Strip */}
                  <div className="canvas-controls-strip">
                    {/* Color Swatches */}
                    <div className="color-palette-picker">
                      <span className="strip-label">MÀU SẮC:</span>
                      {COLOR_PRESETS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          className={`color-swatch-dot ${brushColor === c.hex ? 'active' : ''}`}
                          style={{ backgroundColor: c.hex }}
                          onClick={() => { setBrushColor(c.hex); if (soundEnabled) playKeyClick(); }}
                          title={c.name}
                        />
                      ))}
                      {/* Native Custom Color Input */}
                      <label className="custom-color-label" title="Chọn màu tùy chỉnh">
                        <input
                          type="color"
                          value={brushColor}
                          onChange={(e) => setBrushColor(e.target.value)}
                          className="custom-color-input"
                        />
                        <span className="custom-color-preview" style={{ backgroundColor: brushColor }}>+</span>
                      </label>
                    </div>

                    {/* Brush Size Slider */}
                    <div className="brush-slider-group">
                      <span className="strip-label">CỠ CỌ: {brushSize}px</span>
                      <input
                        type="range"
                        min="2"
                        max="42"
                        value={brushSize}
                        onChange={(e) => setBrushSize(parseInt(e.target.value, 10))}
                        className="cyber-range-slider"
                      />
                    </div>

                    {/* Brush Opacity */}
                    <div className="brush-slider-group">
                      <span className="strip-label">ĐỘ MỜ: {Math.round(brushOpacity * 100)}%</span>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={brushOpacity}
                        onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                        className="cyber-range-slider"
                      />
                    </div>

                    {/* Canvas Background Presets */}
                    <div className="bg-preset-group">
                      <span className="strip-label">NỀN:</span>
                      {CANVAS_BG_PRESETS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          className={`bg-preset-btn ${canvasBg === bg.id ? 'active' : ''}`}
                          onClick={() => { setCanvasBg(bg.id); }}
                        >
                          {bg.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HTML5 Canvas Element */}
                  <div className="canvas-board-viewport">
                    <canvas
                      ref={canvasRef}
                      className="emotion-canvas-board"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    />
                    <div className="canvas-corner-glow top-left"></div>
                    <div className="canvas-corner-glow top-right"></div>
                    <div className="canvas-corner-glow bottom-left"></div>
                    <div className="canvas-corner-glow bottom-right"></div>
                  </div>
                </div>
              )}

              {/* 2. MEDIA UPLOAD MODE */}
              {studioMode === 'upload' && (
                <div className="upload-studio-wrapper">
                  {uploadedMedia ? (
                    <div className="uploaded-preview-stage">
                      <div className={`media-filter-frame ${mediaFilter}`}>
                        {uploadedMedia.type === 'video' ? (
                          <video
                            src={uploadedMedia.url}
                            controls
                            autoPlay
                            loop
                            className="media-preview-element"
                          />
                        ) : (
                          <img
                            src={uploadedMedia.url}
                            alt="Media Preview"
                            className="media-preview-element"
                          />
                        )}
                        <div className="filter-overlay-scanline"></div>
                      </div>

                      {/* Filter Presets Toolbar */}
                      <div className="media-filter-bar">
                        <span className="filter-label">HIỆU ỨNG THỊ GIÁC:</span>
                        {[
                          { id: 'none', label: 'Gốc' },
                          { id: 'cyber-glow', label: '✨ Neon Glow' },
                          { id: 'scanlines', label: '📺 Scanlines' },
                          { id: 'glitch', label: '⚡ Glitch VHS' },
                          { id: 'noir', label: '🌑 Cyber Noir' }
                        ].map(f => (
                          <button
                            key={f.id}
                            type="button"
                            className={`filter-btn ${mediaFilter === f.id ? 'active' : ''}`}
                            onClick={() => { setMediaFilter(f.id); if (soundEnabled) playKeyClick(); }}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="media-info-bar">
                        <span>📁 {uploadedMedia.name} ({uploadedMedia.size})</span>
                        <button
                          type="button"
                          className="change-media-btn"
                          onClick={() => setUploadedMedia(null)}
                        >
                          ✕ ĐỔI TỆP KHÁC
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="upload-dropzone">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden-file-input"
                      />
                      <div className="dropzone-inner">
                        <div className="dropzone-icon">🌌</div>
                        <h3 className="dropzone-title">Kéo & thả hoặc Chọn Tệp Đa Phương Tiện</h3>
                        <p className="dropzone-desc">
                          Hỗ trợ ảnh PNG, JPG, WebP, GIF hoặc Video ngắn MP4, WebM để diễn tả cảm xúc
                        </p>
                        <span className="browse-files-badge">📂 DUYỆT TỆP TRÊN MÁY</span>
                      </div>
                    </label>
                  )}
                </div>
              )}

              {/* 3. WEBCAM CAPTURE MODE */}
              {studioMode === 'camera' && (
                <div className="camera-studio-wrapper">
                  {cameraError ? (
                    <div className="camera-error-box">
                      <div className="error-icon">⚠️</div>
                      <p>{cameraError}</p>
                      <button type="button" className="retry-cam-btn" onClick={startCamera}>
                        Thử Lại
                      </button>
                    </div>
                  ) : (
                    <div className="camera-viewport-card">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="live-webcam-stream"
                      />
                      <div className="camera-scan-reticle">
                        <div className="reticle-corner tl"></div>
                        <div className="reticle-corner tr"></div>
                        <div className="reticle-corner bl"></div>
                        <div className="reticle-corner br"></div>
                        <div className="reticle-center-cross">+</div>
                      </div>
                      <div className="camera-bottom-actions">
                        <button
                          type="button"
                          className="capture-shutter-btn"
                          onClick={capturePhotoFromCamera}
                        >
                          📸 CHỤP ẢNH TÂM THỨC
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Emotion Resonance & Story Details */}
            <div className="journal-details-column">
              <div className="details-card-glass">
                <h3 className="section-title">
                  <span className="title-icon">🔮</span> THÔNG TIN CẢM XÚC & TÂM TRẠNG
                </h3>

                {/* Mood Category Selector */}
                <div className="form-group">
                  <label className="form-label">CHỌN TÂM TRẠNG CHỦ ĐẠO:</label>
                  <div className="mood-select-grid">
                    {MOOD_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`mood-card-option ${selectedMood === m.id ? 'active' : ''}`}
                        style={{
                          '--option-color': m.color,
                          borderColor: selectedMood === m.id ? m.color : 'rgba(255,255,255,0.1)'
                        }}
                        onClick={() => {
                          setSelectedMood(m.id);
                          if (soundEnabled) playMood(m.id);
                        }}
                      >
                        <span className="mood-opt-icon">{m.icon}</span>
                        <div className="mood-opt-text">
                          <span className="mood-opt-name">{m.name}</span>
                          <span className="mood-opt-desc">{m.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div className="form-group">
                  <div className="slider-label-row">
                    <label className="form-label">CƯỜNG ĐỘ CẢM XÚC:</label>
                    <span className="intensity-badge" style={{ color: MOOD_OPTIONS.find(m => m.id === selectedMood)?.color }}>
                      {moodIntensity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={moodIntensity}
                    onChange={(e) => setMoodIntensity(parseInt(e.target.value, 10))}
                    className="cyber-range-slider intensity"
                    style={{
                      '--slider-accent': MOOD_OPTIONS.find(m => m.id === selectedMood)?.color || '#00f0ff'
                    }}
                  />
                </div>

                {/* Title Input */}
                <div className="form-group">
                  <label className="form-label">TIÊU ĐỀ BẢN GHI (TÙY CHỌN):</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Cơn bão ánh sáng lúc nửa đêm..."
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    className="cyber-text-input"
                  />
                </div>

                  {/* Unsaved Draft Recovery Banner */}
                  {unsavedDraft && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="unsaved-draft-recovery-alert"
                    >
                      <div className="alert-content-row">
                        <AlertCircle size={18} className="text-amber-400 shrink-0" />
                        <div className="alert-text">
                          <b>Phát hiện bản thảo chưa hoàn tất:</b>{' '}
                          <span>"{unsavedDraft.title || unsavedDraft.note?.substring(0, 40) || 'Bản nháp...'}" (Đã tự lưu lúc {unsavedDraft.savedAtFormatted || 'gần đây'})</span>
                        </div>
                      </div>
                      <div className="alert-actions">
                        <button
                          type="button"
                          className="restore-draft-btn"
                          onClick={handleRestoreDraft}
                        >
                          <RotateCcw size={13} /> Phục Hồi Bản Nháp
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

                {/* Journal Thought Narrative with AI Prompter Spark & Zen Mode trigger */}
                <div className="form-group">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <label className="form-label mb-0">GHI CHÚ / SUY NGHĨ ĐI KÈM:</label>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Auto-Save Status Badge */}
                      <div className={`autosave-status-indicator ${isAutoSaving ? 'saving' : ''}`}>
                        <span className="pulse-dot"></span>
                        <span>
                          {isAutoSaving 
                            ? 'Đang tự lưu 5s...' 
                            : lastAutoSavedTime 
                              ? `Đã lưu lúc ${new Date(lastAutoSavedTime).toLocaleTimeString('vi-VN')}` 
                              : 'Tự lưu 5s bật'}
                        </span>
                      </div>

                      {/* Version History Time Travel Trigger */}
                      <button
                        type="button"
                        className="version-history-trigger-btn"
                        onClick={() => {
                          setShowVersionHistoryModal(true)
                          if (soundEnabled) playKeyClick()
                        }}
                        title="Xem lịch sử phiên bản, so sánh diff và quay lại bản thảo 10 phút trước nếu lỡ xóa nhầm"
                      >
                        <History size={13} className="text-cyan-400" />
                        <span>LỊCH SỬ PHIÊN BẢN (10 PHÚT TRƯỚC)</span>
                      </button>

                      {/* FEATURE 39: E2EE QUANTUM SHIELD BADGE */}
                      <button
                        type="button"
                        className={`e2ee-hud-tag ${e2eeStatus.isUnlocked ? 'unlocked' : e2eeStatus.isConfigured ? 'locked' : ''}`}
                        onClick={() => {
                          setShowE2EEModal(true)
                          if (soundEnabled) playKeyClick()
                        }}
                        title="Mã hóa đầu-cuối AES-GCM 256-bit chuẩn Zero-Knowledge"
                      >
                        {e2eeStatus.isUnlocked ? (
                          <>
                            <ShieldCheck size={13} className="text-emerald-400" />
                            <span>E2EE: 256-BIT BẢO VỆ</span>
                          </>
                        ) : e2eeStatus.isConfigured ? (
                          <>
                            <Lock size={13} className="text-amber-400" />
                            <span>E2EE: KÉT ĐÃ KHÓA</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={13} className="text-cyan-400" />
                            <span>E2EE: CHƯA BẬT</span>
                          </>
                        )}
                      </button>


                      <button
                        type="button"
                        className="zen-mode-inline-trigger-btn"
                        onClick={() => {
                          if (typeof onOpenZenMode === 'function') {
                            onOpenZenMode()
                          } else {
                            setShowZenMode(true)
                          }
                          if (soundEnabled) playKeyClick()
                        }}
                        title="Mở Chế độ Tập Trung (Zen Mode) để viết trong không gian đen/trắng không xao nhãng"
                      >
                        <span className="zen-spark-icon">🧘</span>
                        <span>ZEN MODE</span>
                      </button>

                      <button
                        type="button"
                        className="ai-spark-prompter-btn"
                        onClick={() => setShowStoryPrompter(true)}
                        title="Gợi ý 3 hướng đi tiếp theo bằng AI khi bạn bí ý tưởng"
                      >
                        <Sparkles size={13} className="text-amber-300 animate-pulse" />
                        <span>AI MUSE</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Viết vài dòng tâm tư, cảm nhận (AI sẽ tự quét gắn thẻ #Gia_đình, #Công_việc, #Tình_yêu, #Áp_lực...)..."
                    value={entryNote}
                    onChange={(e) => setEntryNote(e.target.value)}
                    className="cyber-textarea"
                  />
                </div>

                {/* AI Story Prompter Modal */}
                <AnimatePresence>
                  {showStoryPrompter && (
                    <div className="prompter-modal-backdrop" onClick={() => setShowStoryPrompter(false)}>
                      <motion.div 
                        className="prompter-modal-card"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AIStoryPrompter
                          currentNode="journal-entry"
                          storyData={{
                            'journal-entry': {
                              title: entryTitle || 'Bản Ghi Tâm Thức',
                              chapter: 'Nhật Ký Đa Phương Tiện',
                              character: 'Người Khám Phá',
                              narrative: entryNote || 'Đang tìm kiếm cảm hứng kể chuyện tiếp theo...',
                              mood: selectedMood
                            }
                          }}
                          currentMood={selectedMood}
                          onInsertToJournal={(branch) => {
                            const textToAdd = entryNote 
                              ? `${entryNote}\n\n[Ý tưởng AI: ${branch.title}]\n${branch.narrativeTeaser}\n👉 Hướng đi: ${branch.suggestedAction}`
                              : `[${branch.title}]\n${branch.narrativeTeaser}\n👉 Hướng đi: ${branch.suggestedAction}`
                            setEntryNote(textToAdd)
                            setShowStoryPrompter(false)
                            if (soundEnabled) playKeyClick()
                          }}
                          soundEnabled={soundEnabled}
                          onClose={() => setShowStoryPrompter(false)}
                        />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* Smart AI Tagging Scanner Row (Feature 20) */}
                <div className="form-group smart-ai-tagging-group">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cyan-400" />
                      <label className="form-label mb-0 text-cyan-300">GẮN THẺ THÔNG MINH (SMART AI TAGS):</label>
                    </div>
                    <button
                      type="button"
                      className={`ai-smart-scan-trigger-btn ${isScanningSmartTags ? 'scanning' : ''}`}
                      onClick={triggerManualSmartScan}
                      title="AI quét nội dung và tự động phân loại các thẻ phù hợp"
                    >
                      <Sparkles size={12} className="animate-spin-slow" />
                      <span>{isScanningSmartTags ? 'ĐANG QUÉT NỘI DUNG...' : '✨ AI QUÉT & GẮN THẺ'}</span>
                    </button>
                  </div>

                  {/* Dynamic Smart Tag Detected Chips */}
                  {smartTagAnalysis.detailedTags && smartTagAnalysis.detailedTags.length > 0 && (
                    <div className="smart-detected-chips-row">
                      <span className="smart-detected-label">Phát hiện:</span>
                      {smartTagAnalysis.detailedTags.map((dt) => {
                        const isSelected = selectedTags.includes(dt.tag)
                        return (
                          <button
                            key={dt.tag}
                            type="button"
                            className={`smart-tag-chip ${isSelected ? 'active' : ''}`}
                            style={{
                              color: dt.color,
                              backgroundColor: dt.bg,
                              borderColor: dt.border
                            }}
                            onClick={() => toggleTag(dt.tag)}
                            title={`AI nhận diện với độ tin cậy ${dt.confidence}% - Bấm để bật/tắt`}
                          >
                            <span>{dt.icon}</span>
                            <span>{dt.tag}</span>
                            <span className="chip-conf">{dt.confidence}%</span>
                            {isSelected && <span className="chip-check">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Preset Tag Pills Cloud */}
                  <div className="tags-pill-cloud">
                    {PRESET_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`tag-pill-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Emotion Analysis Trigger */}
                <div className="ai-resonance-box">
                  <div className="ai-resonance-header">
                    <div className="ai-res-title">
                      <span className="ai-res-pulse"></span> AI ORACLE // PHÂN TÍCH RUNG CẢM
                    </div>
                    <button
                      type="button"
                      className="ai-res-btn"
                      disabled={isAnalyzing}
                      onClick={handleGenerateAiAnalysis}
                    >
                      {isAnalyzing ? '⚡ ĐANG PHÂN TÍCH...' : '✨ PHÂN TÍCH TÂM THỨC'}
                    </button>
                  </div>
                  {aiReflection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="ai-reflection-content"
                    >
                      <p>"{aiReflection}"</p>
                    </motion.div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="journal-submit-actions">
                  <button
                    type="button"
                    className="sync-mood-core-btn"
                    onClick={() => {
                      if (onSyncMoodChange) onSyncMoodChange(selectedMood)
                      if (soundEnabled) playMood(selectedMood)
                      alert(`Đã đồng bộ Mood Ring và giao diện toàn trang sang trạng thái [${selectedMood.toUpperCase()}]!`)
                    }}
                    title="Cập nhật màu sắc toàn bộ giao diện và Scene 3D theo tâm trạng này"
                  >
                    🔮 ĐỒNG BỘ MOOD RING
                  </button>

                  <button
                    type="button"
                    className="save-journal-entry-btn"
                    onClick={handleSaveEntry}
                  >
                    {saveSuccessMsg ? '✓ ĐÃ LƯU THÀNH CÔNG!' : '💾 LƯU VÀO NHẬT KÝ KÝ ỨC'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : journalView === 'vault' ? (
          /* 4. JOURNAL VAULT GALLERY VIEW */
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="journal-gallery-layout"
          >
            {/* Filter Bar with Smart Tag Filters */}
            <div className="gallery-filter-strip">
              <span className="gallery-filter-label">BỘ LỌC KÝ ỨC:</span>
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'drawing', label: '🖌️ BẢN VẼ' },
                { id: 'image', label: '🖼️ HÌNH ẢNH' },
                { id: 'video', label: '🎬 VIDEO' },
                { id: 'joy', label: '⚡ HÂN HOAN' },
                { id: 'calm', label: '🌿 BÌNH YÊN' },
                { id: 'breach', label: '🔥 BÙNG NỔ' },
                { id: 'melancholy', label: '🌌 TRẦM MẶC' },
                { id: '#Gia_đình', label: '🏡 #Gia_đình' },
                { id: '#Công_việc', label: '💼 #Công_việc' },
                { id: '#Tình_yêu', label: '💖 #Tình_yêu' },
                { id: '#Áp_lực', label: '⚡ #Áp_lực' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  className={`gallery-filter-btn ${galleryFilter === f.id ? 'active' : ''}`}
                  onClick={() => { setGalleryFilter(f.id); if (soundEnabled) playKeyClick(); }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            {filteredEntries.length === 0 ? (
              <div className="empty-gallery-state">
                <div className="empty-icon">📂</div>
                <h3>Chưa có mục nhật ký nào phù hợp</h3>
                <p>Hãy chuyển sang tab "Studio Sáng Tạo" để bắt đầu ghi lại cảm xúc đầu tiên của bạn!</p>
                <button
                  type="button"
                  className="start-creating-btn"
                  onClick={() => setJournalView('studio')}
                >
                  TẠO MỤC NHẬT KÝ MỚI
                </button>
              </div>
            ) : (
              <div className="journal-grid-cards">
                {filteredEntries.map((entry) => {
                  const moodConfig = MOOD_OPTIONS.find(m => m.id === entry.mood) || MOOD_OPTIONS[0]
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      className="journal-entry-card"
                      style={{ '--entry-mood-col': moodConfig.color }}
                      onClick={() => { setInspectEntry(entry); if (soundEnabled) playKeyClick(); }}
                    >
                      {/* Media Thumbnail */}
                      <div className="card-thumb-container">
                        {entry.type === 'video' && entry.mediaUrl ? (
                          <video src={entry.mediaUrl} className="card-media-preview" muted />
                        ) : (
                          <img 
                            src={entry.mediaUrl || getMoodArtSvg(entry.mood, entry.title, entry.intensity)} 
                            alt={entry.title} 
                            className="card-media-preview"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null
                              e.currentTarget.src = getMoodArtSvg(entry.mood, entry.title, entry.intensity)
                            }}
                          />
                        )}
                        <span className="card-type-badge">
                          {entry.type === 'drawing' ? '🖌️ VẼ' : entry.type === 'video' ? '🎬 VIDEO' : '🖼️ ẢNH'}
                        </span>
                        <span className="card-mood-badge" style={{ backgroundColor: moodConfig.color }}>
                          {moodConfig.icon} {entry.intensity || 75}%
                        </span>
                      </div>

                      {/* Card Content */}
                      <div className="card-info-box">
                        <div className="card-meta-row">
                          <span className="card-date">{entry.date}</span>
                          <span className="card-mood-name" style={{ color: moodConfig.color }}>
                            {moodConfig.name}
                          </span>
                        </div>
                        <h4 className="card-entry-title">{entry.title}</h4>
                        <p className="card-entry-snippet">{entry.note}</p>

                        {/* Tags */}
                        <div className="card-tags-row">
                          {entry.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="mini-tag-badge">{tag}</span>
                          ))}
                        </div>

                        {/* Palette dots */}
                        {entry.palette && (
                          <div className="card-palette-strip">
                            {entry.palette.map((col, idx) => (
                              <span key={idx} className="mini-color-dot" style={{ backgroundColor: col }} />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        ) : journalView === 'search' ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="journal-search-embedded-view"
          >
            <SemanticSearchModal
              isEmbedded={true}
              soundEnabled={soundEnabled}
              onInspectEntry={(entry) => setInspectEntry(entry)}
            />
          </motion.div>
        ) : journalView === 'calendar' ? (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="journal-calendar-embedded-view"
          >
            <MoodCalendar
              isEmbedded={true}
              soundEnabled={soundEnabled}
              onInspectEntry={(entry) => setInspectEntry(entry)}
            />
          </motion.div>
        ) : journalView === 'ebook' ? (
          <motion.div
            key="ebook"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="journal-ebook-embedded-view"
          >
            <EBookExporter
              isEmbedded={true}
              soundEnabled={soundEnabled}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Entry Inspection Full Modal */}
      <AnimatePresence>
        {inspectEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            data-lenis-prevent
            onClick={() => setInspectEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 25 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 25 }}
              className="modal-card journal-inspect-modal"
              data-lenis-prevent
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                if (e.touches && e.touches[0]) {
                  e.currentTarget._touchStartX = e.touches[0].clientX
                  e.currentTarget._touchStartY = e.touches[0].clientY
                  e.currentTarget._touchStartTime = Date.now()
                }
              }}
              onTouchEnd={(e) => {
                if (!e.changedTouches || !e.changedTouches[0] || !e.currentTarget._touchStartX) return
                const deltaX = e.changedTouches[0].clientX - e.currentTarget._touchStartX
                const deltaY = e.changedTouches[0].clientY - e.currentTarget._touchStartY
                const elapsed = Date.now() - (e.currentTarget._touchStartTime || 0)

                const currentIdx = filteredEntries.findIndex(item => item.id === inspectEntry.id)
                const prevEntry = currentIdx > 0 ? filteredEntries[currentIdx - 1] : null
                const nextEntry = currentIdx < filteredEntries.length - 1 ? filteredEntries[currentIdx + 1] : null

                // Dominant horizontal swipe to flip page
                if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && elapsed < 700) {
                  const targetEntry = deltaX < 0 ? nextEntry : prevEntry
                  if (targetEntry) {
                    if (activeTransition === 'instant' || activeTransition === 'none') {
                      setInspectEntry(targetEntry)
                      if (soundEnabled) playTransitionSound(activeTransition)
                    } else {
                      const duration = activeTransition === 'fade-fast' ? 180 : 300
                      window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                        detail: { type: activeTransition, duration, onPeak: () => setInspectEntry(targetEntry) }
                      }))
                      if (soundEnabled) playTransitionSound(activeTransition)
                    }
                  }
                }
              }}
            >
              <header className="modal-header">
                <div>
                  <span className="modal-tag">
                    {(inspectEntry.type || 'drawing').toUpperCase()} ENTRY // {inspectEntry.date || new Date().toLocaleDateString('vi-VN')}
                  </span>
                  <h2>{inspectEntry.title || 'Mục Nhật Ký'}</h2>
                </div>
                
                {/* Page Flip Navigation Buttons */}
                <div className="flex items-center gap-2">
                  {(() => {
                    const currentIdx = filteredEntries.findIndex(e => e.id === inspectEntry.id)
                    const prevEntry = currentIdx > 0 ? filteredEntries[currentIdx - 1] : null
                    const nextEntry = currentIdx < filteredEntries.length - 1 ? filteredEntries[currentIdx + 1] : null

                    const handleFlip = (targetEntry) => {
                      if (!targetEntry) return
                      if (activeTransition === 'instant' || activeTransition === 'none') {
                        setInspectEntry(targetEntry)
                        if (soundEnabled) playTransitionSound(activeTransition)
                        return
                      }
                      const duration = activeTransition === 'fade-fast' ? 180 : 300
                      window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                        detail: { type: activeTransition, duration, onPeak: () => setInspectEntry(targetEntry) }
                      }))
                      if (soundEnabled) playTransitionSound(activeTransition)
                    }

                    return (
                      <div className="inspect-page-flipper">
                        <button
                          type="button"
                          className="page-flip-nav-btn"
                          disabled={!prevEntry}
                          onClick={() => handleFlip(prevEntry)}
                          title="Lật sang trang trước (← hoặc Vuốt Phải)"
                        >
                          <ChevronLeft size={16} />
                          <span>TRANG TRƯỚC</span>
                        </button>
                        <span className="page-flip-indicator" title="Vuốt ngang để lật trang">
                          {currentIdx + 1} / {filteredEntries.length}
                        </span>
                        <button
                          type="button"
                          className="page-flip-nav-btn"
                          disabled={!nextEntry}
                          onClick={() => handleFlip(nextEntry)}
                          title="Lật sang trang tiếp (→ hoặc Vuốt Trái)"
                        >
                          <span>TRANG TIẾP</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )
                  })()}

                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setInspectEntry(null)}
                  >
                    ✕
                  </button>
                </div>
              </header>

              <div className="modal-body journal-modal-body">
                {/* Media Presentation Box */}
                <div className={`inspect-media-viewport ${inspectEntry.mediaFilter || ''}`}>
                  {inspectEntry.type === 'video' && inspectEntry.mediaUrl ? (
                    <video src={inspectEntry.mediaUrl} controls autoPlay loop className="inspect-full-media" />
                  ) : (
                    <img 
                      src={inspectEntry.mediaUrl || getMoodArtSvg(inspectEntry.mood, inspectEntry.title, inspectEntry.intensity)} 
                      alt={inspectEntry.title} 
                      className="inspect-full-media" 
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = getMoodArtSvg(inspectEntry.mood, inspectEntry.title, inspectEntry.intensity)
                      }}
                    />
                  )}
                </div>

                {/* Metadata & AI Insight */}
                <div className="inspect-details-grid">
                  <div className="inspect-meta-pill">
                    <span className="pill-title">TÂM TRẠNG</span>
                    <span className="pill-val" style={{ color: MOOD_OPTIONS.find(m => m.id === inspectEntry.mood)?.color }}>
                      {MOOD_OPTIONS.find(m => m.id === inspectEntry.mood)?.name || inspectEntry.mood} ({inspectEntry.intensity}%)
                    </span>
                  </div>
                  <div className="inspect-meta-pill">
                    <span className="pill-title">LOẠI ĐA PHƯƠNG TIỆN</span>
                    <span className="pill-val">{inspectEntry.type === 'drawing' ? 'Bản vẽ tay' : inspectEntry.type === 'video' ? 'Video cảm xúc' : 'Hình ảnh'}</span>
                  </div>
                </div>

                {/* Narrative Note */}
                <div className="inspect-narrative-box">
                  <div className="inspect-section-title">SUY NGHĨ TÂM THỨC:</div>
                  <p>{inspectEntry.note}</p>
                </div>

                {/* AI Resonance Report */}
                {inspectEntry.aiAnalysis && (
                  <div className="inspect-ai-box">
                    <div className="inspect-section-title">✨ PHÂN TÍCH TÂM LÝ TỪ AI:</div>
                    <p>"{inspectEntry.aiAnalysis}"</p>
                  </div>
                )}

                {/* Tags */}
                <div className="inspect-tags-row">
                  {inspectEntry.tags?.map(t => (
                    <span key={t} className="tag-pill-btn active">{t}</span>
                  ))}
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-action"
                  onClick={() => {
                    if (onSyncMoodChange) onSyncMoodChange(inspectEntry.mood || 'calm')
                    if (soundEnabled) playMood(inspectEntry.mood || 'calm')
                    alert(`Đã đồng bộ Mood Ring sang [${(inspectEntry.mood || 'calm').toUpperCase()}]!`)
                  }}
                >
                  🔮 ĐỒNG BỘ MOOD NÀY
                </button>
                <button
                  type="button"
                  className="modal-btn-action danger"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa vĩnh viễn mục nhật ký này?')) {
                      setEntries(prev => prev.filter(e => e.id !== inspectEntry.id))
                      setInspectEntry(null)
                    }
                  }}
                >
                  🗑️ XÓA MỤC NÀY
                </button>
                <button
                  type="button"
                  className="modal-btn-action"
                  onClick={() => setInspectEntry(null)}
                >
                  ĐÓNG
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Standalone Zen Mode Modal triggered within Journal */}
      <AnimatePresence>
        {showZenMode && (
          <ZenMode
            isOpen={showZenMode}
            onClose={() => setShowZenMode(false)}
            initialText={entryNote}
            soundEnabled={soundEnabled}
            onSaveToJournal={(zenData) => {
              setEntryNote(zenData.note)
              setSelectedTags(prev => [...new Set([...prev, ...(zenData.tags || [])])])
              if (zenData.mood) setSelectedMood(zenData.mood)
              setShowZenMode(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Feature 37: Time-Travel Version History & Rollback Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
        scope="journal"
        currentData={{
          title: entryTitle,
          note: entryNote,
          mood: selectedMood,
          intensity: moodIntensity,
          tags: selectedTags,
          mediaUrl: uploadedMedia?.url || ''
        }}
        onRestoreVersion={handleRollbackVersion}
        soundEnabled={soundEnabled}
      />

      {/* Feature 39: End-to-End Encryption (E2EE) Modal */}
      <E2EEncryptionModal
        isOpen={showE2EEModal}
        onClose={() => setShowE2EEModal(false)}
        soundEnabled={soundEnabled}
      />
    </div>
  )
}

