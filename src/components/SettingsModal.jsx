import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Sparkles, 
  Bot, 
  Terminal, 
  Database, 
  Palette, 
  Zap, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  RefreshCw, 
  ShieldCheck, 
  Cpu, 
  Check,
  Compass,
  Image as ImageIcon,
  Layers,
  Keyboard,
  Radio,
  Headphones,
  Eye,
  Moon,
  Box,
  Network,
  Hourglass,
  Flame,
  Wind,
  Search,
  Calendar,
  BookOpen,
  GitBranch,
  Trophy,
  Award,
  Crown,
  MessageSquareOff,
  Users,
  ArrowUp,
  Activity,
  Heart,
  PhoneCall,
  Phone,
  Copy,
  LifeBuoy,
  X,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Download,
  HardDrive,
  Smartphone,
  Shield,
  Lock,
  Unlock,
  Key,
  Mic,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
  ExternalLink,
  Share2
} from 'lucide-react'
import { playKeyClick, playCloudSyncSound, playVaultLockSound, playVaultUnlockSound, playMood, stopAll } from '../utils/audioSynth.js'
import { TRANSITION_STYLES, playTransitionSound } from '../utils/pageTransitions.js'
import { 
  getMentalHealthSettings, 
  saveMentalHealthSettings, 
  EMERGENCY_HOTLINES, 
  triggerMentalHealthAlert 
} from '../utils/mentalHealthEngine.js'
import { 
  getE2EStatus, 
  lockE2EEVault, 
  unlockE2EEVault, 
  setupE2EEVault, 
  exportVaultKeyCertificate, 
  evaluateKeyStrength,
  isE2EEConfigured 
} from '../utils/e2eEncryptionEngine.js'
import E2EEncryptionModal from './E2EEncryptionModal.jsx'

import { 
  getNetworkStatus, 
  getOfflineQueue, 
  triggerCloudSync, 
  getSyncStats, 
  clearOfflineQueue, 
  isPwaInstallable, 
  triggerPwaInstall 
} from '../utils/offlineSyncEngine.js'
import SpatialAudioRadar from './SpatialAudioRadar.jsx'
import SemanticSearchModal from './SemanticSearchModal.jsx'
import MoodCalendar from './MoodCalendar.jsx'
import EBookExporter from './EBookExporter.jsx'
import StoryNodeTree from './StoryNodeTree.jsx'
import EmotionalQuestsModal from './EmotionalQuestsModal.jsx'
import AchievementsManager from './AchievementsManager.jsx'
import WhisperCorner from './WhisperCorner.jsx'
import CollaborativeWriting from './CollaborativeWriting.jsx'
import EmotionalDashboard from './EmotionalDashboard.jsx'
import AIChatbot from './AIChatbot.jsx'
import TTSVoiceSettings from './TTSVoiceSettings.jsx'


export default function SettingsModal({
  isOpen = false,
  onClose = () => {},
  activeTheme = 'default',
  setActiveTheme = () => {},
  customImageTheme = null,
  soundEnabled = true,
  setSoundEnabled = () => {},
  toggleSound = () => {},
  hapticsEnabled = true,
  setHapticsEnabled = () => {},
  lowGraphics = false,
  setLowGraphics = () => {},
  gyroActive = true,
  setGyroActive = () => {},
  nativeCursor = false,
  setNativeCursor = () => {},
  cursorStyle = 'classic',
  setCursorStyle = () => {},
  activeTransition = 'book-flip',
  setActiveTransition = () => {},
  onOpenVisualStoryteller = () => {},
  onOpenSpatialAudio = () => {},
  onOpenZenMode = () => {},
  onOpenStoryTree = () => {},
  onOpenQuests = () => {},
  onOpenWrapped = () => {},
  onOpenDashboard = () => {},
  onOpenMentalHealth = () => {},
  onOpenOfflineSync = () => {},
  onOpenThemeStore = () => {},
  onOpenCustomDashboard = () => {},
  onOpenShare = () => {},
  currentNode = 'start',
  journeyPath = ['start'],
  customStoryNodes = {},
  onJumpToNode = () => {},
  onNavigateTab = () => {},
  onResetJourney = () => {},
  initialTab = 'features'
}) {
  const [activeSettingsTab, setActiveSettingsTab] = useState(() => {
    try {
      const saved = localStorage.getItem('mr-last-settings-tab')
      return saved || initialTab || 'features'
    } catch {
      return initialTab || 'features'
    }
  })
  const [previewingTransition, setPreviewingTransition] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mhSettings, setMhSettings] = useState(() => getMentalHealthSettings())
  const [pwaSyncStats, setPwaSyncStats] = useState(null)
  const [pwaIsSyncing, setPwaIsSyncing] = useState(false)
  const [pwaSyncProgress, setPwaSyncProgress] = useState(0)
  const [pwaSyncMsg, setPwaSyncMsg] = useState('')
  const [pwaQueue, setPwaQueue] = useState(() => getOfflineQueue())
  const [pwaInstallReady, setPwaInstallReady] = useState(() => isPwaInstallable())
  const [pwaFeedback, setPwaFeedback] = useState(null)
  const [showE2EEModalStandalone, setShowE2EEModalStandalone] = useState(false)
  const [activeHapticTest, setActiveHapticTest] = useState(null)
  const [activeSoundTest, setActiveSoundTest] = useState(null)
  const contentPanelRef = useRef(null)
  const trackBarRef = useRef(null)

  // Horizontal Scroll & Mouse/Touch Pan State
  const [scrollProgressX, setScrollProgressX] = useState(0)
  const [canScrollX, setCanScrollX] = useState(false)
  const [isPanDragging, setIsPanDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0)
  const isSliderThumbDragging = useRef(false)

  // Update horizontal and vertical scroll metrics
  const checkScrollMetrics = () => {
    if (!contentPanelRef.current) return
    const { scrollLeft, scrollWidth, clientWidth, scrollTop } = contentPanelRef.current
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    setCanScrollX(maxScroll > 5)
    if (maxScroll > 0) {
      setScrollProgressX(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)))
    } else {
      setScrollProgressX(0)
    }
    if (scrollTop > 300) setShowScrollTop(true)
    else setShowScrollTop(false)
  }

  useEffect(() => {
    const el = contentPanelRef.current
    if (!el) return
    checkScrollMetrics()
    const handleScroll = () => {
      checkScrollMetrics()
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', checkScrollMetrics)

    const timer = setTimeout(checkScrollMetrics, 200)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkScrollMetrics)
      clearTimeout(timer)
    }
  }, [activeSettingsTab, isOpen])

  // Mouse Drag-to-Scroll (Hand / Mouse Grab & Slide) on Content Panel
  const handleContentPointerDown = (e) => {
    if (!contentPanelRef.current) return
    // Don't drag when clicking inputs, buttons, sliders, textareas, links
    if (e.target.closest('input, button, textarea, select, a, .spatial-radar-disk, .canvas-container')) {
      return
    }
    if (e.button !== undefined && e.button !== 0) return

    setIsPanDragging(true)
    setDragStartX(e.clientX)
    setDragStartScrollLeft(contentPanelRef.current.scrollLeft)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isPanDragging || !contentPanelRef.current) return
      const dx = e.clientX - dragStartX
      contentPanelRef.current.scrollLeft = dragStartScrollLeft - dx
      checkScrollMetrics()
    }

    const handlePointerUp = () => {
      if (isPanDragging) setIsPanDragging(false)
      if (isSliderThumbDragging.current) isSliderThumbDragging.current = false
    }

    if (isPanDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [isPanDragging, dragStartX, dragStartScrollLeft])

  // Smooth Scroll Step (Left / Right)
  const scrollStepX = (delta) => {
    if (!contentPanelRef.current) return
    contentPanelRef.current.scrollBy({ left: delta, behavior: 'smooth' })
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    setTimeout(checkScrollMetrics, 200)
  }

  // Jump to Position Percentage (0%, 50%, 100%)
  const jumpToPercentX = (percent) => {
    if (!contentPanelRef.current) return
    const { scrollWidth, clientWidth } = contentPanelRef.current
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    contentPanelRef.current.scrollTo({ left: (percent / 100) * maxScroll, behavior: 'smooth' })
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    setTimeout(checkScrollMetrics, 200)
  }

  // Slider Bar Click & Drag
  const handleTrackPointerDown = (e) => {
    if (!trackBarRef.current || !contentPanelRef.current) return
    isSliderThumbDragging.current = true
    const rect = trackBarRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const percent = x / rect.width
    const { scrollWidth, clientWidth } = contentPanelRef.current
    const maxScroll = Math.max(0, scrollWidth - clientWidth)
    contentPanelRef.current.scrollTo({ left: percent * maxScroll, behavior: 'smooth' })
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
  }

  useEffect(() => {
    const refreshPwa = async () => {
      setPwaQueue(getOfflineQueue())
      setPwaInstallReady(isPwaInstallable())
      const stats = await getSyncStats()
      setPwaSyncStats(stats)
    }
    refreshPwa()
    const handleQueue = () => refreshPwa()
    const handleNet = () => refreshPwa()
    const handlePwaReady = () => setPwaInstallReady(true)
    const handleComplete = (e) => {
      refreshPwa()
      setPwaIsSyncing(false)
      if (!e.detail?.silent) {
        setPwaFeedback({ type: 'success', msg: 'Đồng bộ Cloud hoàn tất thành công!' })
        if (soundEnabled && typeof playCloudSyncSound === 'function') playCloudSyncSound()
        setTimeout(() => setPwaFeedback(null), 3500)
      }
    }

    window.addEventListener('offline-queue-changed', handleQueue)
    window.addEventListener('network-status-changed', handleNet)
    window.addEventListener('pwa-install-ready', handlePwaReady)
    window.addEventListener('cloud-sync-complete', handleComplete)

    return () => {
      window.removeEventListener('offline-queue-changed', handleQueue)
      window.removeEventListener('network-status-changed', handleNet)
      window.removeEventListener('pwa-install-ready', handlePwaReady)
      window.removeEventListener('cloud-sync-complete', handleComplete)
    }
  }, [soundEnabled])

  const scrollToSection = (tabId) => {
    setActiveSettingsTab(tabId)
    try {
      localStorage.setItem('mr-last-settings-tab', tabId)
    } catch {}
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    if (contentPanelRef.current) {
      contentPanelRef.current.scrollTop = 0
      contentPanelRef.current.scrollLeft = 0
    }
    setTimeout(checkScrollMetrics, 100)
  }

  // Restore last visited tab or sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('mr-last-settings-tab')
        if (initialTab && initialTab !== 'features') {
          setActiveSettingsTab(initialTab)
          localStorage.setItem('mr-last-settings-tab', initialTab)
        } else if (saved) {
          setActiveSettingsTab(saved)
        } else if (initialTab) {
          setActiveSettingsTab(initialTab)
        }
      } catch {
        if (initialTab) setActiveSettingsTab(initialTab)
      }
      if (contentPanelRef.current) {
        contentPanelRef.current.scrollTop = 0
        contentPanelRef.current.scrollLeft = 0
      }
      setTimeout(checkScrollMetrics, 100)
    }
  }, [isOpen, initialTab])

  // Global Keyboard Shortcuts (Alt + Key) for each section from Audio to E2EE
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (!e.altKey) return
      const key = e.key.toLowerCase()

      const HOTKEY_MAP = {
        'a': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenSpatialAudio === 'function') onOpenSpatialAudio()
        },
        'v': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          scrollToSection('tts')
        },
        't': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenStoryTree === 'function') onOpenStoryTree()
        },
        'q': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenQuests === 'function') onOpenQuests()
        },
        'k': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          scrollToSection('achievements')
        },
        'w': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('whisper')
        },
        'g': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('collab')
        },
        'd': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenDashboard === 'function') onOpenDashboard()
        },
        '9': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('ring')
        },
        'h': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenMentalHealth === 'function') onOpenMentalHealth()
        },
        'b': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'ebook')
          if (typeof onClose === 'function') onClose()
        },
        's': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'search')
          if (typeof onClose === 'function') onClose()
        },
        'm': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'calendar')
          if (typeof onClose === 'function') onClose()
        },
        'o': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          if (typeof onOpenOfflineSync === 'function') onOpenOfflineSync()
          if (typeof onClose === 'function') onClose()
        },
        'e': () => {
          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
          setShowE2EEModalStandalone(true)
        }
      }

      if (HOTKEY_MAP[key]) {
        e.preventDefault()
        HOTKEY_MAP[key]()
      }
    }

    window.addEventListener('keydown', handleGlobalShortcuts)
    return () => window.removeEventListener('keydown', handleGlobalShortcuts)
  }, [soundEnabled, onOpenSpatialAudio, onOpenStoryTree, onOpenQuests, onOpenDashboard, onOpenWrapped, onOpenMentalHealth, onNavigateTab, onClose])

  if (!isOpen) return null

  const THEMES = [
    { id: 'default', name: 'Default Cyan', color: '#00f0ff', desc: 'Sắc xanh Cyberpunk cổ điển của MR-CORE-01' },
    { id: 'green-hack', name: 'Green Hack', color: '#22c55e', desc: 'Ma trận xanh lá phong cách Terminal Hacker' },
    { id: 'neon-violet', name: 'Neon Violet', color: '#a855f7', desc: 'Huyền ảo Synthwave tím mộng mơ' },
    { id: 'amber-matrix', name: 'Amber Matrix', color: '#f59e0b', desc: 'Hổ phách cảnh báo rực lửa' },
    { id: 'deep-ocean', name: 'Deep Ocean', color: '#38bdf8', desc: 'Đại dương số tĩnh lặng sâu thẳm' }
  ]

  const CURSOR_STYLES = [
    {
      id: 'classic',
      name: 'Classic Glowing Ring',
      vietnameseName: 'Vòng Sáng Cyberpunk',
      icon: '◎',
      badge: 'DUAL RING',
      color: '#00f0ff',
      desc: 'Vòng hào quang kép đổi màu theo tâm trạng, tự động co giãn và phát sáng theo tương tác chuột.',
    },
    {
      id: 'comet',
      name: 'Stardust Comet',
      vietnameseName: 'Đuôi Sao Chổi',
      icon: '✦',
      badge: 'PARTICLES',
      color: '#f59e0b',
      desc: 'Đầu sao chổi phát sáng tỏa ra chùm bụi sao lấp lánh và vệt sao chổi lung linh theo quán tính chuột.',
    },
    {
      id: 'water',
      name: 'Water Droplet & Waves',
      vietnameseName: 'Giọt Nước & Gợn Sóng',
      icon: '💧',
      badge: 'AQUATIC',
      color: '#38bdf8',
      desc: 'Giọt nước căng mọng trong suốt, để lại vệt nước và tạo sóng nước lan tỏa kèm âm thanh khi click.',
    },
    {
      id: 'neon',
      name: 'Neon Laser Ribbon',
      vietnameseName: 'Vệt Sáng Neon Laser',
      icon: '⚡',
      badge: 'GLOW TRAIL',
      color: '#ec4899',
      desc: 'Dải lụa neon laser Cyberpunk uyển chuyển uốn lượn liên tục mượt mà theo đường cong di chuyển.',
    },
    {
      id: 'bubbles',
      name: 'Soap Bubbles Float',
      vietnameseName: 'Bong Bóng Xà Phòng',
      icon: '🫧',
      badge: 'PHYSICS',
      color: '#a855f7',
      desc: 'Bong bóng bảy màu bồng bềnh trôi dạt trên màn hình, tự động vỡ tan tạo sóng nước khi tương tác.',
    }
  ]

  return (
    <div className="settings-modal-backdrop" onClick={() => {
      if (typeof onClose === 'function') onClose()
    }}>
      <motion.div 
        className="settings-modal-card"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="settings-header">
          <div className="flex items-center gap-3">
            <div className="settings-badge-icon">
              <Settings size={20} className="text-cyan-400 animate-spin-slow" />
            </div>
            <div>
              <span className="settings-tag">// MAINFRAME CONFIGURATION //</span>
              <h3 className="settings-title">CÀI ĐẶT HỆ THỐNG & TRUNG TÂM TÍNH NĂNG</h3>
            </div>
          </div>

          <button 
            className="settings-close-btn"
            onClick={() => {
              if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              if (typeof onClose === 'function') onClose()
            }}
            title="Đóng bảng cài đặt (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="settings-body-grid">
          {/* Navigation Sidebar */}
          <nav className="settings-sidebar" style={{ overflowY: 'auto' }}>
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'features' ? 'active' : ''}`}
              onClick={() => scrollToSection('features')}
            >
              <Sparkles size={16} />
              <span>Trung Tâm Tính Năng</span>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'appearance' ? 'active' : ''}`}
              onClick={() => scrollToSection('appearance')}
            >
              <Palette size={16} />
              <span>Chủ Đề & Con Trỏ</span>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'performance' ? 'active' : ''}`}
              onClick={() => scrollToSection('performance')}
            >
              <Cpu size={16} />
              <span>Hiệu Năng & 3D</span>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'audio' ? 'active' : ''}`}
              onClick={() => scrollToSection('audio')}
              title="Xem cài đặt Âm Thanh & Rung (Phím tắt: Alt + A)"
            >
              <Volume2 size={16} />
              <span>Âm Thanh & Rung</span>
              <span className="nav-hotkey-pill">Alt+A</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenSpatialAudio === 'function') onOpenSpatialAudio()
                }}
                title="Nhấn để mở ngay Radar 3D toàn màn hình"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 52: SOCIAL SHARING & TYPOGRAPHIC STORY CARD TAB */}
            <button
              type="button"
              className="settings-nav-btn"
              onClick={() => {
                if (typeof onOpenShare === 'function') onOpenShare()
                if (typeof onClose === 'function') onClose()
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              }}
              title="Chia sẻ Website và tạo ảnh trích dẫn Typographic (Alt+S)"
            >
              <Share2 size={16} className="text-cyan-400" />
              <span>Chia Sẻ Mạng Xã Hội // Social Hub 🌐</span>
              <span className="nav-hotkey-pill">Alt+S</span>
              <span role="button" className="nav-direct-jump-btn">↗</span>
            </button>

            {/* FEATURE 41: AI VOICE TTS TAB */}
            {/* FEATURE 41: AI VOICE TTS TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'tts' ? 'active' : ''} tts-only-desktop`}
              onClick={() => scrollToSection('tts')}
              title="Xem cài đặt Giọng Đọc AI"
            >
              <Mic size={16} className="text-cyan-400" />
              <span>Đọc Truyền Cảm (AI Voice) 🎙️</span>
            </button>

            {/* FEATURE 25: STORY NODE TREE TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'tree' ? 'active' : ''}`}
              onClick={() => scrollToSection('tree')}
              title="Xem Cây Cốt Truyện (Phím tắt: Alt + T)"
            >
              <GitBranch size={16} className="text-cyan-400" />
              <span>Cây Cốt Truyện (Tree)</span>
              <span className="nav-hotkey-pill">Alt+T</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenStoryTree === 'function') onOpenStoryTree()
                }}
                title="Nhấn để mở ngay Cây Cốt Truyện Toàn Màn Hình"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 26: EMOTIONAL QUESTS TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'quests' ? 'active' : ''}`}
              onClick={() => scrollToSection('quests')}
              title="Xem Nhiệm Vụ & Huy Hiệu (Phím tắt: Alt + Q)"
            >
              <Trophy size={16} className="text-amber-400" />
              <span>Nhiệm Vụ & Huy Hiệu</span>
              <span className="nav-hotkey-pill">Alt+Q</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenQuests === 'function') onOpenQuests()
                }}
                title="Nhấn để mở ngay Bảng Nhiệm Vụ Độc Lập"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 27: ACHIEVEMENTS & TITLES TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'achievements' ? 'active' : ''}`}
              onClick={() => scrollToSection('achievements')}
              title="Xem Danh Hiệu & Thành Tựu (Phím tắt: Alt + K)"
            >
              <Crown size={16} className="text-amber-400" />
              <span>Danh Hiệu & Thành Tựu</span>
              <span className="nav-hotkey-pill">Alt+K</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  scrollToSection('achievements')
                }}
                title="Nhấn để xem bảng Danh Hiệu & Thành Tựu"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 28: WHISPER CORNER TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'whisper' ? 'active' : ''}`}
              onClick={() => scrollToSection('whisper')}
              title="Xem Góc Chia Sẻ Ẩn Danh (Phím tắt: Alt + W)"
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>🕊️</span>
              <span>Góc Chia Sẻ Ẩn Danh</span>
              <span className="nav-hotkey-pill">Alt+W</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onNavigateTab === 'function') onNavigateTab('whisper')
                }}
                title="Nhấn để chuyển thẳng đến trang Góc Thì Thầm Ẩn Danh"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 29: COLLABORATIVE WRITING TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'collab' ? 'active' : ''}`}
              onClick={() => scrollToSection('collab')}
              title="Xem Cộng Tác Viết Truyện (Phím tắt: Alt + G)"
            >
              <Users size={16} className="text-cyan-400" />
              <span>Cộng Tác Viết Truyện</span>
              <span className="nav-hotkey-pill">Alt+G</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onNavigateTab === 'function') onNavigateTab('collab')
                  if (typeof onClose === 'function') onClose()
                }}
                title="Nhấn để mở ngay trang Phòng Viết Truyện Đôi"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 31: EMOTIONAL DASHBOARD TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => scrollToSection('dashboard')}
              title="Xem Bảng Chỉ Số Tâm Lý (Phím tắt: Alt + D)"
            >
              <Activity size={16} className="text-cyan-400" />
              <span>Bảng Chỉ Số Tâm Lý (Dashboard)</span>
              <span className="nav-hotkey-pill">Alt+D</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenDashboard === 'function') onOpenDashboard()
                }}
                title="Nhấn để mở ngay Dashboard phân tích tâm lý toàn trang"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 32: SPOTIFY WRAPPED TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'wrapped' ? 'active' : ''}`}
              onClick={() => scrollToSection('wrapped')}
              title="Xem Báo Cáo Wrapped (Phím tắt: Alt + R)"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>Báo Cáo Wrapped (Story) ✨</span>
              <span className="nav-hotkey-pill">Alt+R</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenWrapped === 'function') onOpenWrapped('year')
                }}
                title="Nhấn để xem ngay Trình chiếu Spotify Wrapped Story"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 35: MENTAL HEALTH & HOTLINES TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'mental-health' ? 'active' : ''}`}
              onClick={() => scrollToSection('mental-health')}
              title="Xem Sức Khỏe Tâm Thần & Hotline (Phím tắt: Alt + H)"
            >
              <Heart size={16} className="text-rose-400" />
              <span>Sức Khỏe Tâm Thần & Hotline 🕊️</span>
              <span className="nav-hotkey-pill">Alt+H</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenMentalHealth === 'function') onOpenMentalHealth()
                }}
                title="Nhấn để mở ngay Trung Tâm Cứu Hộ & Hotline 24/7"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 24: E-BOOK EXPORT TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'ebook' ? 'active' : ''}`}
              onClick={() => scrollToSection('ebook')}
              title="Xuất Sách Điện Tử PDF (Phím tắt: Alt + B)"
            >
              <BookOpen size={16} className="text-amber-400" />
              <span>Xuất Sách Điện Tử (PDF)</span>
              <span className="nav-hotkey-pill">Alt+B</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'ebook')
                  if (typeof onClose === 'function') onClose()
                }}
                title="Nhấn để mở giao diện xuất sách trong Nhật Ký Đa Phương Tiện"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 22: SEMANTIC SEARCH TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'semantic' ? 'active' : ''}`}
              onClick={() => scrollToSection('semantic')}
              title="Tìm Kiếm Ngữ Nghĩa (Phím tắt: Alt + S)"
            >
              <Search size={16} className="text-cyan-400" />
              <span>Tìm Kiếm Ngữ Nghĩa</span>
              <span className="nav-hotkey-pill">Alt+S</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'search')
                  if (typeof onClose === 'function') onClose()
                }}
                title="Nhấn để mở tìm kiếm ngữ nghĩa trong Nhật Ký Đa Phương Tiện"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 23: MOOD CALENDAR TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'calendar' ? 'active' : ''}`}
              onClick={() => scrollToSection('calendar')}
              title="Lịch Cảm Xúc 30 Ngày (Phím tắt: Alt + M)"
            >
              <Calendar size={16} className="text-emerald-400" />
              <span>Lịch Cảm Xúc 30 Ngày</span>
              <span className="nav-hotkey-pill">Alt+M</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'calendar')
                  if (typeof onClose === 'function') onClose()
                }}
                title="Nhấn để mở lịch cảm xúc 30 ngày trong Nhật Ký Đa Phương Tiện"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 36: OFFLINE PWA & CLOUD SYNC TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'pwa-sync' ? 'active' : ''}`}
              onClick={() => scrollToSection('pwa-sync')}
              title="Chế Độ Offline & PWA Sync (Phím tắt: Alt + O)"
            >
              <Cloud size={16} className="text-cyan-400" />
              <span>Chế Độ Offline & PWA (Sync) ⚡</span>
              <span className="nav-hotkey-pill">Alt+O</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  if (typeof onOpenOfflineSync === 'function') onOpenOfflineSync()
                  if (typeof onClose === 'function') onClose()
                }}
                title="Nhấn để mở ngay Bảng Đồng Bộ Offline & Wifi"
              >
                ↗
              </span>
            </button>

            {/* FEATURE 39: END-TO-END ENCRYPTION (E2EE) TAB */}
            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'e2ee' ? 'active' : ''}`}
              onClick={() => scrollToSection('e2ee')}
              title="Mã Hóa Đầu-Cuối E2EE (Phím tắt: Alt + E)"
            >
              <Shield size={16} className="text-emerald-400" />
              <span>Mã Hóa Đầu-Cuối (E2EE) 🛡️</span>
              <span className="nav-hotkey-pill">Alt+E</span>
              <span
                role="button"
                className="nav-direct-jump-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                  setShowE2EEModalStandalone(true)
                }}
                title="Nhấn để mở ngay Trung Tâm Bảo Mật E2EE độc lập"
              >
                ↗
              </span>
            </button>

            <button
              type="button"
              className={`settings-nav-btn ${activeSettingsTab === 'data' ? 'active' : ''}`}
              onClick={() => scrollToSection('data')}
            >
              <Database size={16} />
              <span>Dữ Liệu & Hệ Thống</span>
            </button>


            {/* QUICK LINK: EMOTIONAL DASHBOARD */}
            <button
              type="button"
              className="settings-nav-btn"
              style={{ color: '#00f0ff' }}
              onClick={() => {
                if (typeof onOpenDashboard === 'function') onOpenDashboard()
                if (typeof onClose === 'function') onClose()
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              }}
              title="Mở Bảng Điều Khiển Chỉ Số Tâm Lý"
            >
              <Activity size={16} className="text-cyan-400" />
              <span>Bảng Chỉ Số 📊 ↗</span>
            </button>

            {/* QUICK LINK: SPOTIFY WRAPPED */}
            <button
              type="button"
              className="settings-nav-btn"
              style={{ color: '#fbbf24' }}
              onClick={() => {
                if (typeof onOpenWrapped === 'function') onOpenWrapped('year')
                if (typeof onClose === 'function') onClose()
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              }}
              title="Mở Báo Cáo Cá Nhân Hóa Wrapped"
            >
              <Sparkles size={16} className="text-amber-400" />
              <span>Spotify Wrapped ✨ ↗</span>
            </button>

            {/* QUICK LINK: REALTIME MOOD LAB */}
            <button
              type="button"
              className="settings-nav-btn"
              style={{ color: '#a855f7' }}
              onClick={() => {
                if (typeof onNavigateTab === 'function') onNavigateTab('moodlab')
                if (typeof onClose === 'function') onClose()
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              }}
            >
              <Zap size={16} className="text-purple-400" />
              <span>Realtime Mood Lab 🧠</span>
            </button>

            {/* QUICK LINK: SYSTEM INTRO DOCS */}
            <a
              href="intro.html"
              className="settings-nav-btn"
              style={{ textDecoration: 'none', color: '#38bdf8' }}
              title="Xem trang giới thiệu tổng quan hệ thống"
            >
              <Compass size={16} className="text-sky-400" />
              <span>Trang Giới Thiệu 📖 ↗</span>
            </a>
          </nav>

          {/* Tab-based Content Panel (Instant 0ms Load & Silky Smooth, Drag-to-Scroll enabled) */}
          <div 
            ref={contentPanelRef} 
            className={`settings-content-panel ${isPanDragging ? 'is-dragging' : ''}`} 
            onPointerDown={handleContentPointerDown}
            data-lenis-prevent
          >

            {activeSettingsTab !== 'features' && (
              <div className="mb-4 flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg"
                  onClick={() => scrollToSection('features')}
                >
                  <span>←</span> TRUNG TÂM TÍNH NĂNG
                </button>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  TAB: {(activeSettingsTab || '').toUpperCase()}
                </span>
              </div>
            )}

            {/* 1. FEATURES HUB */}
            {activeSettingsTab === 'features' && (
              <section id="settings-sec-features" className="settings-section">
                <div className="section-header">
                  <h4>TRUNG TÂM ĐIỀU HƯỚNG TÍNH NĂNG NÂNG CAO</h4>
                  <p>Khám phá toàn bộ công cụ cảm xúc, chế độ tương tác và tiện ích thông minh trong hệ sinh thái.</p>
                </div>

                <div className="feature-cards-grid">
                  {/* Feature 52: Social Share Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Share2 size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">SOCIAL HUB 🌐</span>
                    </div>
                    <h5>CHIA SẺ MẠNG XÃ HỘI & ẢNH TRÍCH DẪN</h5>
                    <p>Chia sẻ 1-chạm lên 9+ mạng xã hội (Facebook, X, Threads, Zalo), quét mã QR động và tạo ảnh trích dẫn Typographic nghệ thuật.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      style={{ background: 'rgba(56, 189, 248, 0.2)', borderColor: 'rgba(56, 189, 248, 0.5)', color: '#38bdf8' }}
                      onClick={() => {
                        if (typeof onOpenShare === 'function') onOpenShare()
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Social Share Hub</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 43: Theme Store Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-pink-400">
                        <Palette size={20} />
                      </div>
                      <span className="hub-badge text-pink-300 border-pink-400/40">THEME STORE 🎨</span>
                    </div>
                    <h5>CHỢ GIAO DIỆN & THEME CREATOR</h5>
                    <p>Khám phá, tải về miễn phí các bộ Theme (Cyberpunk, Retro 80s, Forest Zen, Sunset, Deep Ocean) hoặc tự tạo và chia sẻ theme tùy biến.</p>
                    <button
                      type="button"
                      className="hub-action-btn pink"
                      style={{ background: 'rgba(236, 72, 153, 0.2)', borderColor: 'rgba(236, 72, 153, 0.5)', color: '#f472b6' }}
                      onClick={() => {
                        if (typeof onOpenThemeStore === 'function') onOpenThemeStore()
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Chợ Giao Diện</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 44: Drag & Drop Customizable Dashboard Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <Layers size={20} />
                      </div>
                      <span className="hub-badge text-amber-300 border-amber-400/40">DRAG & DROP ⚡</span>
                    </div>
                    <h5>DASHBOARD KÉO THẢ TÙY BIẾN</h5>
                    <p>Tự do kéo thả, thu phóng và sắp xếp 8+ widget cảm xúc (Lịch, Audio, Ghi chú, Mini Oracle, Biểu đồ) theo các bộ Preset yêu thích.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(245, 158, 11, 0.5)', color: '#fbbf24' }}
                      onClick={() => {
                        if (typeof onOpenCustomDashboard === 'function') onOpenCustomDashboard()
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Dashboard Kéo Thả</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 41: AI Voice TTS Hub Card */}
                  <div className="feature-hub-card hidden md:flex">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Mic size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">AI VOICE TTS 🎙️</span>
                    </div>
                    <h5>ĐỌC VĂN BẢN TRUYỀN CẢM (AI VOICE)</h5>
                    <p>Tích hợp AI Voice ElevenLabs Multilingual v2 với các chất giọng trầm ấm, tự nhiên, tái hiện câu chuyện sống động như radio sách nói.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('tts')}
                    >
                      <span>Cấu Hình Giọng Đọc</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Story Node Tree Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <GitBranch size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">NARRATIVE MAP 🌳</span>
                    </div>
                    <h5>SƠ ĐỒ CÂY CỐT TRUYỆN (STORY NODE TREE)</h5>
                    <p>Khảo sát toàn bộ phân nhánh câu chuyện, định vị vị trí hiện tại và dịch chuyển thời gian (Time Jump) giữa các chương.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('tree')}
                    >
                      <span>Xem Cây Cốt Truyện</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Emotional Quests & Badges Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <Trophy size={20} />
                      </div>
                      <span className="hub-badge text-amber-300 border-amber-400/40">DAILY QUESTS 🏆</span>
                    </div>
                    <h5>NHIỆM VỤ CẢM XÚC & HUY HIỆU</h5>
                    <p>Hoàn thành thử thách cảm xúc hàng ngày, tích lũy XP chữa lành và nâng cấp cấp độ bậc thầy tâm thức.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      onClick={() => scrollToSection('quests')}
                    >
                      <span>Xem Nhiệm Vụ</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Achievements & Titles Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <Crown size={20} />
                      </div>
                      <span className="hub-badge text-amber-300 border-amber-400/40">TITLES & RANKS 👑</span>
                    </div>
                    <h5>DANH HIỆU & THÀNH TỰU TÂM THỨC</h5>
                    <p>Khám phá 12 danh hiệu cao quý và kho thành tựu ẩn, trang bị vương miện tỏa sáng ngay trên đỉnh Mainframe.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      onClick={() => scrollToSection('achievements')}
                    >
                      <span>Xem Danh Hiệu</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Whisper Corner Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🕊️</span>
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">ANTI-TOXIC 🕊️</span>
                    </div>
                    <h5>GÓC CHIA SẺ ẨN DANH (WHISPER CORNER)</h5>
                    <p>Không gian thì thầm ẩn danh an toàn, nhận và trao gửi những cái ôm, lời động viên và thắp nến bình an 100% nhân văn.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('whisper')}
                    >
                      <span>Mở Góc Ẩn Danh</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Collaborative Writing Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Users size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">CO-AUTHOR ✍️</span>
                    </div>
                    <h5>CỘNG TÁC VIẾT TRUYỆN ĐÔI</h5>
                    <p>Tạo phòng viết truyện thời gian thực cùng bạn bè qua link chia sẻ hoặc viết nối tiếp cùng AI Co-Author thơ mộng.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('collab')}
                    >
                      <span>Mở Phòng Viết Đôi</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 31: Emotional Dashboard Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Activity size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">TELEMETRY 📊</span>
                    </div>
                    <h5>BẢNG ĐIỀU KHIỂN CHỈ SỐ TÂM LÝ (DASHBOARD)</h5>
                    <p>Biểu đồ Line/Bar/Radar/Heatmap đa chiều phân tích xu hướng cảm xúc 7 ngày, 30 ngày, 1 năm và chẩn đoán AI.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('dashboard')}
                    >
                      <span>Mở Bảng Chỉ Số</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 32: Wrapped Report Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <Sparkles size={20} />
                      </div>
                      <span className="hub-badge text-amber-300 border-amber-400/40">SPOTIFY WRAPPED ✨</span>
                    </div>
                    <h5>BÁO CÁO CÁ NHÂN HÓA CUỐI TUẦN / CUỐI NĂM</h5>
                    <p>Trình chiếu Story tương tác đỉnh cao Spotify Wrapped tổng hợp bản giao hưởng cảm xúc và nhân vật tâm lý của bạn.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      onClick={() => scrollToSection('wrapped')}
                    >
                      <span>Trải Nghiệm Wrapped</span>
                      <span>✨</span>
                    </button>
                  </div>

                  {/* Feature 35: Mental Health Alert Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-rose-400">
                        <Heart size={20} />
                      </div>
                      <span className="hub-badge text-rose-300 border-rose-400/40">CRISIS CARE 🕊️</span>
                    </div>
                    <h5>CẢNH BÁO SỨC KHỎE TÂM THẦN & HOTLINE</h5>
                    <p>AI nhận diện dấu hiệu tuyệt vọng liên tục, kích hoạt popup lời khuyên dịu dàng, bài tập thở 4-7-8 và hotline cứu trợ 24/7.</p>
                    <button
                      type="button"
                      className="hub-action-btn rose"
                      onClick={() => scrollToSection('mental-health')}
                      style={{ background: 'rgba(244, 63, 94, 0.2)', borderColor: 'rgba(244, 63, 94, 0.5)', color: '#fb7185' }}
                    >
                      <span>Cài Đặt & Hotline</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Feature 42: Keyboard & Touch Gesture Navigation Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Keyboard size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">HANDS-FREE NAV ⌨️</span>
                    </div>
                    <h5>LƯỚT WEB BẰNG TAY & DI CHUỘT BẰNG PHÍM</h5>
                    <p>Điều khiển con trỏ chuột bằng phím [I/K/J/L/Mũi tên], click bằng [F/Enter], cuộn trang bằng [Space/J/K] và cử chỉ Trackpad không cần chuột.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => {
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Bảng Hướng Dẫn (Alt + H / ?)</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* E-Book Export Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <BookOpen size={20} />
                      </div>
                      <span className="hub-badge text-amber-300 border-amber-400/40">PDF EXPORT 📖</span>
                    </div>
                    <h5>XUẤT SÁCH ĐIỆN TỬ (E-BOOK PDF)</h5>
                    <p>Đóng gói toàn bộ hành trình câu chuyện thành tác phẩm PDF nghệ thuật với bìa tùy biến và bố cục sách cổ điển.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      onClick={() => scrollToSection('ebook')}
                    >
                      <span>Mở Bộ Xuất Sách</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Semantic Search Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Search size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">AI NLP 🔍</span>
                    </div>
                    <h5>TÌM KIẾM THEO NGỮ NGHĨA (SEMANTIC SEARCH)</h5>
                    <p>Tìm kiếm nhật ký và dòng ký ức bằng ngôn ngữ tự nhiên thông minh hỗ trợ Vector Semantic Match.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('semantic')}
                    >
                      <span>Mở Tìm Kiếm</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Mood Calendar Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-emerald-400">
                        <Calendar size={20} />
                      </div>
                      <span className="hub-badge text-emerald-300 border-emerald-400/40">30-DAY MAP 📅</span>
                    </div>
                    <h5>LỊCH CẢM XÚC 30 NGÀY (CALENDAR VIEW)</h5>
                    <p>Trực quan hóa bức tranh tâm trạng cả tháng với từng điểm màu đại diện cho Mood của mỗi ngày.</p>
                    <button
                      type="button"
                      className="hub-action-btn emerald"
                      onClick={() => scrollToSection('calendar')}
                    >
                      <span>Mở Lịch Cảm Xúc</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* E2EE Zero-Knowledge Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-emerald-400">
                        <Shield size={20} />
                      </div>
                      <span className="hub-badge text-emerald-300 border-emerald-400/40">AES-GCM 256-BIT 🛡️</span>
                    </div>
                    <h5>MÃ HÓA ĐẦU-CUỐI & KÉT LƯỢNG TỬ (E2EE)</h5>
                    <p>Bảo mật Zero-Knowledge chuẩn quân sự. Admin database và hacker máy chủ 100% không thể đọc được nội dung nhật ký người dùng.</p>
                    <button
                      type="button"
                      className="hub-action-btn emerald"
                      onClick={() => scrollToSection('e2ee')}
                      style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.5)', color: '#6ee7b7' }}
                    >
                      <span>Quản Lý Két E2EE</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Multimedia Journal */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-purple-400">
                        <Layers size={20} />
                      </div>
                      <span className="hub-badge">JOURNAL 🎨</span>
                    </div>
                    <h5>NHẬT KÝ ĐA PHƯƠNG TIỆN</h5>

                    <p>Lưu giữ dòng suy nghĩ với hình ảnh, bản ghi âm giọng nói, thẻ âm nhạc và sticker cảm xúc.</p>
                    <button
                      type="button"
                      className="hub-action-btn purple"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('journal')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Nhật Ký</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Realtime Mood Lab */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-purple-400">
                        <Zap size={20} />
                      </div>
                      <span className="hub-badge">MOOD LAB 🧠</span>
                    </div>
                    <h5>REALTIME MOOD LAB</h5>
                    <p>Phòng thí nghiệm tâm trạng với bảng đo nhịp tim, nhiệt độ lõi và đồng bộ nhịp thở Solfeggio.</p>
                    <button
                      type="button"
                      className="hub-action-btn purple"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('moodlab')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Mood Lab</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Chrono Vault */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-amber-400">
                        <Hourglass size={20} />
                      </div>
                      <span className="hub-badge">CHRONO VAULT ⌛</span>
                    </div>
                    <h5>HỘP THỜI GIAN</h5>
                    <p>Niêm phong thư & cảm xúc vào kén Stasis lượng tử, chỉ mở khóa vào ngày này năm sau.</p>
                    <button
                      type="button"
                      className="hub-action-btn amber"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('journal')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Hộp Thời Gian</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Stress Burner */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-orange-400">
                        <Flame size={20} />
                      </div>
                      <span className="hub-badge">XẢ STRESS 🔥</span>
                    </div>
                    <h5>PHÁ HỦY CẢM XÚC TIÊU CỰC</h5>
                    <p>Viết những dằn vặt, ấm ức rồi kích hoạt vụ nổ hạt phân rã để chữa lành tâm hồn.</p>
                    <button
                      type="button"
                      className="hub-action-btn orange"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('burn')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Chế Độ Burn</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Dream Journal */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-teal-400">
                        <Moon size={20} />
                      </div>
                      <span className="hub-badge">DREAMS 🌙</span>
                    </div>
                    <h5>SỔ TAY ƯỚC MƠ & GIẤC MƠ</h5>
                    <p>Không gian ghi lại những giấc mơ kỳ ảo với bảng phân tích Lucidity và giấc mơ sáng suốt.</p>
                    <button
                      type="button"
                      className="hub-action-btn teal"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('dream')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Sổ Giấc Mơ</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Spatial Audio Radar Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-cyan-400">
                        <Headphones size={20} />
                      </div>
                      <span className="hub-badge text-cyan-300 border-cyan-400/40">3D BINAURAL 🎧</span>
                    </div>
                    <h5>ÂM THANH KHÔNG GIAN 3D</h5>
                    <p>Trải nghiệm radar âm thanh 360 độ với các nguồn âm phát ra từ nhiều hướng khác nhau.</p>
                    <button
                      type="button"
                      className="hub-action-btn cyan"
                      onClick={() => scrollToSection('audio')}
                    >
                      <span>Mở Cài Đặt Âm Thanh</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Zen Mode Hub Card */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-emerald-400">
                        <Wind size={20} />
                      </div>
                      <span className="hub-badge text-emerald-300 border-emerald-400/40">FOCUS 🧘</span>
                    </div>
                    <h5>CHẾ ĐỘ TẬP TRUNG (ZEN MODE)</h5>
                    <p>Không gian viết tối giản không xao nhãng với âm thanh mưa rơi, tiếng gõ phím cơ và bộ đếm chữ.</p>
                    <button
                      type="button"
                      className="hub-action-btn emerald"
                      onClick={() => {
                        if (typeof onOpenZenMode === 'function') onOpenZenMode()
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Bật Zen Mode</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Visual Storyteller */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-pink-400">
                        <ImageIcon size={20} />
                      </div>
                      <span className="hub-badge">VISUAL 🖼️</span>
                    </div>
                    <h5>KỂ CHUYỆN BẰNG HÌNH ẢNH</h5>
                    <p>Tải ảnh lên để AI phân tích màu sắc, trích xuất Mood và tự động tạo chương truyện mới.</p>
                    <button
                      type="button"
                      className="hub-action-btn pink"
                      onClick={() => {
                        if (typeof onOpenVisualStoryteller === 'function') onOpenVisualStoryteller()
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Visual AI</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Neural Grid */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-emerald-400">
                        <Network size={20} />
                      </div>
                      <span className="hub-badge">NEURAL GRID 🌌</span>
                    </div>
                    <h5>MẠNG LƯỚI THẦN KINH TOÀN CẦU</h5>
                    <p>Khám phá bản đồ cảm xúc của cộng đồng, đồng bộ sóng não và chia sẻ năng lượng tích cực.</p>
                    <button
                      type="button"
                      className="hub-action-btn emerald"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('journal')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Neural Grid</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* Oracle AI Muse */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-purple-400">
                        <Bot size={20} />
                      </div>
                      <span className="hub-badge">GEMINI AI 🔮</span>
                    </div>
                    <h5>AI ORACLE & VIẾT TIẾP</h5>
                    <p>Trợ lý cảm xúc và cố vấn cốt truyện Gemini 2.5 Flash, gợi ý ngã rẽ và phân tích tâm lý sâu sắc.</p>
                    <button
                      type="button"
                      className="hub-action-btn purple"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('oracle')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở AI Oracle</span>
                      <span>➔</span>
                    </button>

                  </div>

                  {/* Command Console */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-emerald-400">
                        <Terminal size={20} />
                      </div>
                      <span className="hub-badge">CLI (Ctrl+K)</span>
                    </div>
                    <h5>COMMAND CONSOLE</h5>
                    <p>Trình thông dịch dòng lệnh Mainframe, nhập lệnh hack và mở khóa easter eggs.</p>
                    <button
                      type="button"
                      className="hub-action-btn emerald"
                      onClick={() => {
                        if (typeof onNavigateTab === 'function') onNavigateTab('terminal')
                        if (typeof onClose === 'function') onClose()
                      }}
                    >
                      <span>Mở Console</span>
                      <span>➔</span>
                    </button>
                  </div>

                  {/* System Introduction */}
                  <div className="feature-hub-card">
                    <div className="card-top">
                      <div className="hub-icon-box text-sky-400">
                        <Compass size={20} />
                      </div>
                      <span className="hub-badge">DOCS</span>
                    </div>
                    <h5>TRANG GIỚI THIỆU HỆ THỐNG</h5>
                    <p>Khám phá tài liệu giới thiệu tổng quan, kiến trúc kỹ thuật và thông số cốt lõi.</p>
                    <a
                      href="intro.html"
                      className="hub-action-btn sky"
                      style={{ textDecoration: 'none' }}
                    >
                      <span>Xem Giới Thiệu</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* 2. APPEARANCE & THEMES */}
            {activeSettingsTab === 'appearance' && (
              <section id="settings-sec-appearance" className="settings-section">
                <div className="section-header">
                  <h4>CHỦ ĐỀ GIAO DIỆN & CON TRỎ CHUỘT</h4>
                  <p>Cá nhân hóa bảng màu HUD, hiệu ứng chuyển trang và phong cách con trỏ Cyberpunk theo sở thích của bạn.</p>
                </div>

                {/* Themes Palette Selector */}
                <div className="settings-group-box">
                  <div className="flex items-center justify-between mb-2">
                    <span className="group-title mb-0">BẢNG MÀU CHỦ ĐỀ HUD (THEMES)</span>
                    {typeof onOpenVisualStoryteller === 'function' && (
                      <button
                        type="button"
                        className="visual-theme-quick-btn"
                        onClick={() => {
                          onOpenVisualStoryteller()
                          if (typeof onClose === 'function') onClose()
                        }}
                      >
                        <ImageIcon size={13} />
                        <span>Trích Xuất Từ Ảnh</span>
                      </button>
                    )}
                  </div>

                  {activeTheme === 'custom-image' && customImageTheme && (
                    <div className="custom-theme-active-banner">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-cyan-300">✓ ĐANG SỬ DỤNG THEME TRÍCH XUẤT TỪ ẢNH</span>
                        <span className="text-[11px] text-slate-400">Mood: {(customImageTheme.detectedMood || 'CALM').toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {customImageTheme.palette?.map((c, i) => (
                          <span
                            key={i}
                            className="inline-block w-4 h-4 rounded-full border border-white/20"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="theme-options-grid">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`theme-option-card ${activeTheme === t.id ? 'active' : ''}`}
                        onClick={() => {
                          if (typeof setActiveTheme === 'function') setActiveTheme(t.id)
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                        }}
                        style={{ borderColor: activeTheme === t.id ? t.color : 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="theme-color-disc" style={{ background: t.color }}></span>
                          <span className="theme-opt-name" style={{ color: activeTheme === t.id ? t.color : '#f1f5f9' }}>
                            {t.name}
                          </span>
                        </div>
                        <p className="theme-opt-desc">{t.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Zen Mode Theme Preference */}
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-teal-400 font-mono tracking-wider">
                          // PHONG CÁCH CHẾ ĐỘ TẬP TRUNG (ZEN MODE THEME) //
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">Chọn phong cách mặc định khi viết trong Zen Mode:</p>
                      </div>
                      {typeof onOpenZenMode === 'function' && (
                        <button
                          type="button"
                          className="visual-theme-quick-btn"
                          style={{ borderColor: 'rgba(45, 212, 191, 0.4)', color: '#2dd4bf' }}
                          onClick={() => {
                            onOpenZenMode()
                            if (typeof onClose === 'function') onClose()
                          }}
                        >
                          <span>Mở Zen Mode Ngay</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {[
                        { id: 'oled-noir', name: 'OLED Noir', color: '#000000', border: '#444', desc: 'Đen tuyệt đối' },
                        { id: 'paper-zen', name: 'Paper Zen', color: '#fafafa', border: '#bbb', text: '#18181b', desc: 'Trắng tinh khôi' },
                        { id: 'warm-sepia', name: 'Warm Sepia', color: '#1a1614', border: '#f6d395', desc: 'Trầm ấm cổ điển' },
                        { id: 'cyber-charcoal', name: 'Cyber Slate', color: '#0d1117', border: '#2dd4bf', desc: 'Than chì lượng tử' }
                      ].map(zt => (
                        <button
                          key={zt.id}
                          type="button"
                          className="p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderColor: localStorage.getItem('mr-zen-theme') === zt.id ? zt.border : 'rgba(255,255,255,0.1)'
                          }}
                          onClick={() => {
                            localStorage.setItem('mr-zen-theme', zt.id)
                            if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: zt.color }} />
                            <span className="text-xs font-bold text-slate-200">{zt.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{zt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cursor Style Option & Library Showcase (Desktop Only) */}
                <div className="settings-group-box cursor-settings-group hidden md:block">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="group-title mb-0">CON TRỎ CHUỘT HẠT CYBERPUNK</span>
                      <p className="group-subtext">Bật / Tắt hiệu ứng con trỏ chuột nghệ thuật tương tác thời gian thực</p>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${!nativeCursor ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof setNativeCursor === 'function') setNativeCursor(prev => !prev)
                        if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      }}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>

                  {!nativeCursor && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-cyan-400 font-mono tracking-wider">
                          // THƯ VIỆN CON TRỎ NGHỆ THUẬT (CUSTOM CURSOR STORE) //
                        </span>
                        <span className="text-[11px] text-slate-400">Chọn 1 kiểu để áp dụng ngay:</span>
                      </div>

                      <div className="cursor-library-grid">
                        {CURSOR_STYLES.map((c) => {
                          const isSelected = cursorStyle === c.id
                          return (
                            <div
                              key={c.id}
                              className={`cursor-preview-card ${isSelected ? 'active' : ''}`}
                              onClick={() => {
                                if (typeof setCursorStyle === 'function') {
                                  setCursorStyle(c.id)
                                  localStorage.setItem('mr-cursor-style', c.id)
                                }
                                if (typeof setNativeCursor === 'function') {
                                  setNativeCursor(false)
                                  localStorage.setItem('mr-native-cursor', 'false')
                                }
                                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                              }}
                              style={{
                                borderColor: isSelected ? c.color : 'rgba(255,255,255,0.08)'
                              }}
                            >
                              <div className="cursor-card-top">
                                <div
                                  className="cursor-icon-box"
                                  style={{ color: c.color, background: `rgba(255,255,255,0.06)` }}
                                >
                                  {c.icon}
                                </div>
                                <span className="cursor-badge-pill">{c.badge}</span>
                              </div>

                              <div className="cursor-title" style={{ color: isSelected ? c.color : '#f8fafc' }}>
                                {c.vietnameseName}
                              </div>
                              <div className="text-[10px] text-slate-400 mb-1 font-mono">{c.name}</div>
                              <p className="cursor-desc">{c.desc}</p>

                              <div className="cursor-interactive-preview">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="cursor-preview-dot-anim"
                                    style={{ backgroundColor: c.color, boxShadow: `0 0 8px ${c.color}` }}
                                  />
                                  <span>{isSelected ? 'ĐANG KÍCH HOẠT' : 'CHẠM ĐỂ CHỌN'}</span>
                                </div>
                                <span className="font-mono text-xs">{isSelected ? '✓ ACTIVE' : 'USE'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page Transitions Library */}
                <div className="settings-group-box">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="group-title mb-0">THƯ VIỆN CHUYỂN CẢNH (PAGE TRANSITIONS)</span>
                      <p className="group-subtext">Hiệu ứng chuyển trang mượt mà giữa các tab và các trang nhật ký</p>
                    </div>

                    <button
                      type="button"
                      className="preview-transition-btn"
                      onClick={() => {
                        setPreviewingTransition(true)
                        const duration = activeTransition === 'instant' ? 0 : activeTransition === 'fade-fast' ? 180 : 320
                        if (activeTransition !== 'instant') {
                          window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                            detail: { type: activeTransition, duration }
                          }))
                        }
                        if (soundEnabled && typeof playTransitionSound === 'function') playTransitionSound(activeTransition)
                        setTimeout(() => setPreviewingTransition(false), duration + 80)
                      }}
                      disabled={previewingTransition}
                      title="Xem thử hiệu ứng chuyển cảnh ngay trên màn hình"
                    >
                      <Eye size={14} className={previewingTransition ? 'animate-spin-slow' : ''} />
                      <span>{previewingTransition ? 'ĐANG CHUYỂN...' : 'XEM THỬ NGAY'}</span>
                    </button>
                  </div>

                  <div className="cursor-library-grid">
                    {TRANSITION_STYLES.map((t) => {
                      const isSelected = activeTransition === t.id
                      return (
                        <div
                          key={t.id}
                          className={`cursor-preview-card transition-card ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            if (typeof setActiveTransition === 'function') {
                              setActiveTransition(t.id)
                              localStorage.setItem('mr-page-transition', t.id)
                            }
                            const duration = t.id === 'instant' ? 0 : t.id === 'fade-fast' ? 180 : 320
                            if (t.id !== 'instant') {
                              window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                                detail: { type: t.id, duration }
                              }))
                            }
                            if (soundEnabled && typeof playTransitionSound === 'function') playTransitionSound(t.id)
                          }}
                          style={{
                            borderColor: isSelected ? t.color : 'rgba(255,255,255,0.08)'
                          }}
                        >
                          <div className="cursor-card-top">
                            <div
                              className="cursor-icon-box"
                              style={{ color: t.color, background: `rgba(255,255,255,0.06)` }}
                            >
                              {t.icon}
                            </div>
                            <span className="cursor-badge-pill" style={{ color: t.color }}>{t.badge}</span>
                          </div>

                          <div className="cursor-title" style={{ color: isSelected ? t.color : '#f8fafc' }}>
                            {t.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mb-1 font-mono">{t.englishName}</div>
                          <p className="cursor-desc">{t.desc}</p>

                          <div className="cursor-interactive-preview">
                            <div className="flex items-center gap-2">
                              <span
                                className="cursor-preview-dot-anim"
                                style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}` }}
                              />
                              <span>{isSelected ? 'ĐANG DÙNG' : 'CHỌN HIỆU ỨNG'}</span>
                            </div>
                            <span className="font-mono text-xs">{isSelected ? '✓ ACTIVE' : 'TEST'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 3. PERFORMANCE & 3D */}
            {activeSettingsTab === 'performance' && (
              <section id="settings-sec-performance" className="settings-section">
                <div className="section-header">
                  <h4>HIỆU NĂNG & ĐỒ HỌA 3D AICORE</h4>
                  <p>Tối ưu hóa tốc độ khung hình và mức tiêu thụ pin trên các thiết bị cấu hình nhẹ.</p>
                </div>

                <div className="settings-group-box">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="group-title mb-0">CHẾ ĐỘ TIẾT KIỆM PIN / ĐỒ HỌA THẤP (LOW GRAPHICS)</span>
                      <p className="group-subtext">Giảm bớt mật độ hạt tinh vân và tắt DNA helix để máy chạy mượt mà nhất</p>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${lowGraphics ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof setLowGraphics === 'function') setLowGraphics(prev => !prev)
                        if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      }}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>

                <div className="settings-group-box">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="group-title mb-0">CẢM BIẾN CON QUAY HỒI CHUYỂN (GYROSCOPE)</span>
                      <p className="group-subtext">Xoay lõi 3D theo góc nghiêng của điện thoại / máy tính bảng khi di chuyển</p>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${gyroActive ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof setGyroActive === 'function') setGyroActive(prev => !prev)
                        if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      }}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 4. AUDIO, SPATIAL AUDIO 3D & HAPTICS */}
            {activeSettingsTab === 'audio' && (
              <section id="settings-sec-audio" className="settings-section">
                <div className="section-header">
                  <h4>ÂM THANH TỔNG HỢP & KHÔNG GIAN 3D BINAURAL</h4>
                  <p>Cấu hình âm thanh nền Synthesizer, hiệu ứng không gian 3D HRTF và phản hồi rung đa nền tảng.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + A</strong></span>
                    <span className="quick-launch-desc">Mở radar không gian 3D HRTF toàn màn hình</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenSpatialAudio === 'function') onOpenSpatialAudio()
                    }}
                    title="Mở Radar Âm Thanh Không Gian 3D Toàn Màn Hình (Alt + A)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ 3D RADAR TOÀN CẢNH (Alt + A) ↗</span>
                  </button>
                </div>

                {/* SPATIAL AUDIO 3D RADAR EMBED */}
                <div className="settings-group-box spatial-embed-box">
                  <SpatialAudioRadar soundEnabled={soundEnabled} isCompact={false} />
                </div>

                {/* 1. AMBIENT SYNTHESIZER CARD */}
                <div className="sound-haptic-card">
                  <div className="sound-haptic-header">
                    <div className="sound-haptic-left">
                      <div className={`sound-haptic-icon-box ${soundEnabled ? 'active-sound' : ''}`}>
                        {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} className="text-gray-500" />}
                      </div>
                      <div className="sound-haptic-text-box">
                        <div className="sound-haptic-title-row">
                          <span className="sound-haptic-title">ÂM THANH TÂM THỨC (AMBIENT SYNTH)</span>
                          <span className={`sound-haptic-pill ${soundEnabled ? 'active' : 'inactive'}`}>
                            {soundEnabled ? '● ĐANG BẬT' : '○ ĐÃ TẮT'}
                          </span>
                        </div>
                        <p className="sound-haptic-desc">
                          Tự động hòa âm tần số 432Hz & Binaural Synth theo từng diễn biến cảm xúc thực tế.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${soundEnabled ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof toggleSound === 'function') toggleSound()
                      }}
                      title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>

                  {/* Sound quick test buttons */}
                  {soundEnabled && (
                    <div className="haptic-test-btns-grid">
                      <button
                        type="button"
                        className="sound-test-btn"
                        onClick={() => {
                          playMood('calm')
                          setActiveSoundTest('calm')
                          setTimeout(() => setActiveSoundTest(null), 2500)
                        }}
                      >
                        <span>{activeSoundTest === 'calm' ? '🎵 ĐANG PHÁT 432Hz' : '🌊 Thử: Êm Dịu (Calm)'}</span>
                      </button>
                      <button
                        type="button"
                        className="sound-test-btn"
                        onClick={() => {
                          playMood('friction')
                          setActiveSoundTest('friction')
                          setTimeout(() => setActiveSoundTest(null), 2500)
                        }}
                      >
                        <span>{activeSoundTest === 'friction' ? '⚡ ĐANG PHÁT Friction' : '⚡ Thử: Căng Thẳng'}</span>
                      </button>
                      <button
                        type="button"
                        className="sound-test-btn"
                        onClick={() => {
                          playMood('breach')
                          setActiveSoundTest('breach')
                          setTimeout(() => setActiveSoundTest(null), 2500)
                        }}
                      >
                        <span>{activeSoundTest === 'breach' ? '🔥 ĐANG PHÁT Breach' : '🔥 Thử: Đột Phá'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. HAPTICS VIBRATION CARD */}
                <div className="sound-haptic-card">
                  <div className="sound-haptic-header">
                    <div className="sound-haptic-left">
                      <div className={`sound-haptic-icon-box ${hapticsEnabled ? 'active-haptic' : ''}`}>
                        <Smartphone size={22} className={hapticsEnabled ? 'text-amber-400' : 'text-gray-500'} />
                      </div>
                      <div className="sound-haptic-text-box">
                        <div className="sound-haptic-title-row">
                          <span className="sound-haptic-title">RUNG PHẢN HỒI XÚC GIÁC (HAPTICS)</span>
                          <span className={`sound-haptic-pill ${hapticsEnabled ? 'active' : 'inactive'}`} style={{ color: hapticsEnabled ? '#fbbf24' : undefined, borderColor: hapticsEnabled ? 'rgba(245, 158, 11, 0.4)' : undefined, background: hapticsEnabled ? 'rgba(245, 158, 11, 0.12)' : undefined }}>
                            {hapticsEnabled ? '● ĐANG BẬT' : '○ ĐÃ TẮT'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {typeof navigator !== 'undefined' && navigator.vibrate ? '📱 Bộ rung phần cứng sẵn sàng' : '💻 Mô phỏng hình ảnh PC'}
                          </span>
                        </div>
                        <p className="sound-haptic-desc">
                          {typeof navigator !== 'undefined' && navigator.vibrate
                            ? 'Đã kích hoạt rung vật lý trực tiếp qua mô tơ rung phần cứng điện thoại.'
                            : 'Mô phỏng xung nhịp phát sáng phản hồi trực quan trên màn hình máy tính.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${hapticsEnabled ? 'active' : ''}`}
                      onClick={() => {
                        if (typeof setHapticsEnabled === 'function') setHapticsEnabled(prev => !prev)
                        if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      }}
                      title={hapticsEnabled ? 'Tắt rung' : 'Bật rung'}
                    >
                      <span className="toggle-slider"></span>
                    </button>
                  </div>

                  {/* Haptics quick test triggers */}
                  {hapticsEnabled && (
                    <div className="haptic-test-btns-grid">
                      <button
                        type="button"
                        className="haptic-test-btn"
                        onClick={() => {
                          setActiveHapticTest('subtle')
                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            try { navigator.vibrate(25) } catch {}
                          }
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          setTimeout(() => setActiveHapticTest(null), 600)
                        }}
                      >
                        <span>{activeHapticTest === 'subtle' ? '📳 ĐANG RUNG (25ms)...' : '📳 Thử Rung Nhẹ'}</span>
                      </button>
                      <button
                        type="button"
                        className="haptic-test-btn"
                        onClick={() => {
                          setActiveHapticTest('pulse')
                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            try { navigator.vibrate([40, 30, 50]) } catch {}
                          }
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          setTimeout(() => setActiveHapticTest(null), 800)
                        }}
                      >
                        <span>{activeHapticTest === 'pulse' ? '💓 ĐANG RUNG NHỊP...' : '💓 Thử Nhịp Tim Kép'}</span>
                      </button>
                      <button
                        type="button"
                        className="haptic-test-btn"
                        onClick={() => {
                          setActiveHapticTest('alert')
                          if (typeof navigator !== 'undefined' && navigator.vibrate) {
                            try { navigator.vibrate([60, 40, 90, 40, 120]) } catch {}
                          }
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          setTimeout(() => setActiveHapticTest(null), 1000)
                        }}
                      >
                        <span>{activeHapticTest === 'alert' ? '⚡ ĐANG BÁO ĐỘNG...' : '⚡ Thử Rung Cảnh Báo'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 4.5. AI VOICE & TTS SETTINGS */}
            {activeSettingsTab === 'tts' && (
              <section id="settings-sec-tts" className="settings-section tts-only-desktop" style={{ padding: '0.5rem 0' }}>
                <div className="section-header">
                  <h4>GIỌNG ĐỌC TRUYỀN CẢM AI (NEURAL TTS VOICE)</h4>
                  <p>Tùy chỉnh giọng đọc nhân vật, ngữ điệu cảm xúc tự động và tốc độ đọc truyện.</p>
                </div>

                <TTSVoiceSettings soundEnabled={soundEnabled} />
              </section>
            )}

            {/* 5. STORY NODE TREE */}
            {activeSettingsTab === 'tree' && (
              <section id="settings-sec-tree" className="settings-section" style={{ padding: 0 }}>
                <div className="section-header">
                  <h4>SƠ ĐỒ CÂY CỐT TRUYỆN (STORY NODE TREE)</h4>
                  <p>Khảo sát mạng lưới phân nhánh, nhảy mốc thời gian và khám phá các đoạn kết khác nhau.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar" style={{ margin: '0.5rem 0.5rem 1rem 0.5rem' }}>
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + T</strong></span>
                    <span className="quick-launch-desc">Khám phá sơ đồ cây phân nhánh cốt truyện toàn màn hình</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenStoryTree === 'function') onOpenStoryTree()
                    }}
                    title="Mở Cây Cốt Truyện Toàn Màn Hình (Alt + T)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ CÂY CỐT TRUYỆN TOÀN CẢNH (Alt + T) ↗</span>
                  </button>
                </div>

                <StoryNodeTree
                  isEmbedded={true}
                  onClose={() => {
                    if (typeof onClose === 'function') onClose()
                    if (typeof onNavigateTab === 'function') onNavigateTab('core')
                  }}
                  currentNode={currentNode}
                  journeyPath={journeyPath}
                  customStoryNodes={customStoryNodes}
                  onJumpToNode={(nodeId) => {
                    if (typeof onJumpToNode === 'function') onJumpToNode(nodeId)
                    if (typeof onClose === 'function') onClose()
                    if (typeof onNavigateTab === 'function') onNavigateTab('core')
                  }}
                  soundEnabled={soundEnabled}
                />
              </section>
            )}

            {/* 6. EMOTIONAL QUESTS */}
            {activeSettingsTab === 'quests' && (
              <section id="settings-sec-quests" className="settings-section" style={{ padding: 0 }}>
                <div className="section-header">
                  <h4>NHIỆM VỤ CẢM XÚC & HUY HIỆU HÀNG NGÀY</h4>
                  <p>Theo dõi tiến độ nhiệm vụ ngày và tuần, nhận điểm kinh nghiệm chữa lành tâm thức.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar" style={{ margin: '0.5rem 0.5rem 1rem 0.5rem' }}>
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + Q</strong></span>
                    <span className="quick-launch-desc">Mở bảng theo dõi nhiệm vụ cảm xúc và huy hiệu độc lập</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenQuests === 'function') onOpenQuests()
                    }}
                    title="Mở Bảng Nhiệm Vụ & Huy Hiệu Độc Lập (Alt + Q)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ BẢNG NHIỆM VỤ ĐỘC LẬP (Alt + Q) ↗</span>
                  </button>
                </div>

                <EmotionalQuestsModal
                  isEmbedded={true}
                  onClose={() => scrollToSection('features')}
                  soundEnabled={soundEnabled}
                  onNavigateTab={(tab) => {
                    onNavigateTab(tab)
                    onClose()
                  }}
                  onOpenZenMode={() => {
                    onOpenZenMode()
                    onClose()
                  }}
                  onOpenStoryTree={() => scrollToSection('tree')}
                />
              </section>
            )}

            {/* 7. ACHIEVEMENTS & TITLES */}
            {activeSettingsTab === 'achievements' && (
              <section id="settings-sec-achievements" className="settings-section" style={{ padding: '0.5rem 0' }}>
                <div className="section-header">
                  <h4>DANH HIỆU & THÀNH TỰU TÂM THỨC</h4>
                  <p>Trang bị danh hiệu cao quý và mở khóa toàn bộ thành tựu khám phá.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + K</strong></span>
                    <span className="quick-launch-desc">Kho danh hiệu và thành tựu tâm thức đã mở khóa</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      onNavigateTab('achievements')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Xem toàn bộ danh hiệu & thành tựu (Alt + K)"
                  >
                    <ExternalLink size={13} />
                    <span>KHO THÀNH TỰU TOÀN TRANG (Alt + K) ↗</span>
                  </button>
                </div>

                <AchievementsManager
                  soundEnabled={soundEnabled}
                  onClose={onClose}
                />
              </section>
            )}

            {/* 8. WHISPER CORNER */}
            {activeSettingsTab === 'whisper' && (
              <section id="settings-sec-whisper" className="settings-section" style={{ padding: '0.5rem 0' }}>
                <div className="section-header">
                  <h4>GÓC CHIA SẺ ẨN DANH (WHISPER CORNER)</h4>
                  <p>Không gian thì thầm tâm sự ẩn danh thời gian thực, trao gửi 5 biểu tượng thấu cảm nhân văn.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + W</strong></span>
                    <span className="quick-launch-desc">Không gian thì thầm tâm sự ẩn danh thời gian thực</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onNavigateTab === 'function') onNavigateTab('whisper')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Chuyển đến trang Góc Chia Sẻ Ẩn Danh (Alt + W)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ GÓC THÌ THẦM TOÀN TRANG (Alt + W) ↗</span>
                  </button>
                </div>

                <WhisperCorner
                  soundEnabled={soundEnabled}
                  onClose={onClose}
                />
              </section>
            )}

            {/* 9. COLLABORATIVE WRITING */}
            {activeSettingsTab === 'collab' && (
              <section id="settings-sec-collab" className="settings-section" style={{ padding: '0.5rem 0' }}>
                <div className="section-header">
                  <h4>CỘNG TÁC VIẾT TRUYỆN ĐÔI</h4>
                  <p>Phòng viết truyện thời gian thực cùng bạn thân hoặc AI Co-Author thơ mộng.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + G</strong></span>
                    <span className="quick-launch-desc">Phòng viết truyện nối tiếp trực tuyến cùng bạn bè hoặc AI</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onNavigateTab === 'function') onNavigateTab('collab')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Chuyển đến trang Cộng Tác Viết Truyện Đôi (Alt + G)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ PHÒNG VIẾT ĐÔI TOÀN TRANG (Alt + G) ↗</span>
                  </button>
                </div>

                <CollaborativeWriting
                  soundEnabled={soundEnabled}
                  onClose={onClose}
                  onNavigateToWhisper={() => scrollToSection('whisper')}
                />
              </section>
            )}

            {/* 10. E-BOOK EXPORT */}
            {activeSettingsTab === 'ebook' && (
              <section id="settings-sec-ebook" className="settings-section">
                <div className="section-header">
                  <h4>XUẤT SÁCH ĐIỆN TỬ (E-BOOK PDF)</h4>
                  <p>Đóng gói toàn bộ cuốn tiểu thuyết tâm trạng của bạn thành tài liệu PDF trang nhã.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + B</strong></span>
                    <span className="quick-launch-desc">Đóng gói và xuất toàn bộ hành trình thành tài liệu PDF</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'ebook')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Mở Trình Xuất Sách Trong Nhật Ký Đa Phương Tiện (Alt + B)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ TRÌNH XUẤT SÁCH TRONG NHẬT KÝ ĐA PHƯƠNG TIỆN (Alt + B) ↗</span>
                  </button>
                </div>

                <EBookExporter
                  isEmbedded={true}
                  soundEnabled={soundEnabled}
                  onClose={onClose}
                />
              </section>
            )}

            {/* 11. SEMANTIC SEARCH */}
            {activeSettingsTab === 'semantic' && (
              <section id="settings-sec-semantic" className="settings-section">
                <div className="section-header">
                  <h4>TÌM KIẾM BẰNG NGỮ NGHĨA (SEMANTIC SEARCH)</h4>
                  <p>Truy vấn nhật ký và ký ức bằng các câu hỏi tự nhiên như "Lần trước mình cảm thấy vui vì điều gì?".</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + S</strong></span>
                    <span className="quick-launch-desc">Tìm kiếm ngữ nghĩa thông minh bằng AI NLP Vector</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'search')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Mở Tìm Kiếm Ngữ Nghĩa Trong Nhật Ký (Alt + S)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ TÌM KIẾM VECTOR TRONG NHẬT KÝ (Alt + S) ↗</span>
                  </button>
                </div>

                <SemanticSearchModal
                  isEmbedded={true}
                  soundEnabled={soundEnabled}
                />
              </section>
            )}

            {/* 12. MOOD CALENDAR */}
            {activeSettingsTab === 'calendar' && (
              <section id="settings-sec-calendar" className="settings-section">
                <div className="section-header">
                  <h4>LỊCH CẢM XÚC 30 NGÀY (CALENDAR VIEW)</h4>
                  <p>Tổng quan cảm xúc cả tháng với từng chấm màu đại diện cho Mood chủ đạo của mỗi ngày.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + M</strong></span>
                    <span className="quick-launch-desc">Trực quan hóa bức tranh tâm trạng cả tháng với điểm màu Mood</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onNavigateTab === 'function') onNavigateTab('journal', 'calendar')
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Mở Lịch Cảm Xúc 30 Ngày Trong Nhật Ký (Alt + M)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ LỊCH CẢM XÚC TRONG NHẬT KÝ (Alt + M) ↗</span>
                  </button>
                </div>

                <MoodCalendar
                  isEmbedded={true}
                  soundEnabled={soundEnabled}
                />
              </section>
            )}

            {/* 13. EMOTIONAL DASHBOARD (FEATURE 31) */}
            {activeSettingsTab === 'dashboard' && (
              <section id="settings-sec-dashboard" className="settings-section">
                <div className="section-header">
                  <h4>BẢNG ĐIỀU KHIỂN CHỈ SỐ TÂM LÝ (EMOTIONAL DASHBOARD)</h4>
                  <p>Khảo sát sâu sắc biểu đồ Line/Bar chart, bản đồ 5 trục radar và nhịp sinh học cảm xúc.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + D</strong></span>
                    <span className="quick-launch-desc">Bảng phân tích đo lường cảm xúc đa chiều 30 ngày & 1 năm</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenDashboard === 'function') onOpenDashboard()
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Mở Bảng Chỉ Số Tâm Lý Toàn Màn Hình (Alt + D)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ DASHBOARD TOÀN TRANG (Alt + D) ↗</span>
                  </button>
                </div>

                <EmotionalDashboard
                  isEmbedded={true}
                  soundEnabled={soundEnabled}
                  onOpenWrapped={(period) => {
                    if (typeof onOpenWrapped === 'function') onOpenWrapped(period)
                    if (typeof onClose === 'function') onClose()
                  }}
                />
              </section>
            )}

            {/* 14. SPOTIFY WRAPPED EXPERIENCE (FEATURE 32) */}
            {activeSettingsTab === 'wrapped' && (
              <section id="settings-sec-wrapped" className="settings-section">
                <div className="section-header">
                  <h4>BÁO CÁO CÁ NHÂN HÓA CUỐI TUẦN / CUỐI NĂM (SPOTIFY WRAPPED)</h4>
                  <p>Trình phát Story đa slide tái hiện bản giao hưởng cảm xúc và tấm thẻ vinh danh danh dự.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + R</strong></span>
                    <span className="quick-launch-desc">Trình chiếu tổng kết Story phong cách Spotify Wrapped</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenWrapped === 'function') onOpenWrapped('year')
                    }}
                    title="Xem Báo Cáo Wrapped Toàn Màn Hình (Alt + R)"
                  >
                    <ExternalLink size={13} />
                    <span>TRÌNH CHIẾU WRAPPED TOÀN CẢNH (Alt + R) ↗</span>
                  </button>
                </div>

                <div className="settings-group-box text-center py-6">
                  <span className="text-4xl mb-3 block">✨ 🌌 🎵</span>
                  <h4 className="text-xl font-bold text-cyan-300 mb-2">Trải Nghiệm Toàn Màn Hình Spotify Wrapped</h4>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto mb-5">
                    Bản giao hưởng cảm xúc cá nhân hóa với âm thanh sống động, phân tích nhân vật tâm lý Archetype và xuất thẻ Hologram Card chia sẻ.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      className="dashboard-action-btn wrapped-launch-btn"
                      onClick={() => {
                        if (typeof onOpenWrapped === 'function') onOpenWrapped('week')
                      }}
                    >
                      <span>⚡ Báo Cáo Cuối Tuần</span>
                    </button>
                    <button
                      type="button"
                      className="dashboard-action-btn seed-btn"
                      onClick={() => {
                        if (typeof onOpenWrapped === 'function') onOpenWrapped('year')
                      }}
                      style={{ background: 'linear-gradient(135deg, #00f0ff, #a855f7)', color: '#000', fontWeight: 'bold' }}
                    >
                      <span>✨ Bản Giao Hưởng Năm 2026</span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 14.5. MENTAL HEALTH ALERT & CRISIS HOTLINES (FEATURE 35) */}
            {activeSettingsTab === 'mental-health' && (
              <section id="settings-sec-mental-health" className="settings-section">
                <div className="section-header">
                  <h4>CẢNH BÁO SỨC KHỎE TÂM THẦN & ĐƯỜNG DÂY NÓNG HỖ TRỢ</h4>
                  <p>Hệ thống AI giám sát và bảo vệ sức khỏe tinh thần, tự động phát tín hiệu xoa dịu và kết nối chuyên gia khi phát hiện khủng hoảng.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + H</strong></span>
                    <span className="quick-launch-desc">Hỗ trợ khẩn cấp, bài tập thở 4-7-8 và danh bạ hotline cứu hộ</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenMentalHealth === 'function') onOpenMentalHealth()
                    }}
                    title="Mở Bảng Cứu Hộ & Hotline Toàn Cảnh (Alt + H)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ BẢNG HOTLINE TOÀN CẢNH (Alt + H) ↗</span>
                  </button>
                </div>

                <div className="settings-group-box">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="group-title text-emerald-400 mb-0">TỰ ĐỘNG CẢNH BÁO KHI PHÁT HIỆN TIÊU CỰC LIÊN TỤC</span>
                      <p className="group-subtext">Khi bạn viết nhật ký hoặc chia sẻ tâm sự có tần suất từ ngữ bế tắc cao, hệ thống sẽ popup xoa dịu</p>
                    </div>

                    <button
                      type="button"
                      className={`settings-toggle-btn ${mhSettings.enabled ? 'active' : ''}`}
                      onClick={() => {
                        const updated = saveMentalHealthSettings({ enabled: !mhSettings.enabled })
                        setMhSettings(updated)
                        if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      }}
                    >
                      <div className="toggle-thumb" />
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <span className="text-xs font-mono text-slate-300 block mb-2 font-bold">ĐỘ NHẠY NHẬN DIỆN CỦA AI:</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { id: 'mild', label: 'Nhẹ Nhàng', desc: 'Chỉ cảnh báo khi có từ ngữ khủng hoảng nghiêm trọng' },
                        { id: 'standard', label: 'Tiêu Chuẩn (Khuyên Dùng)', desc: 'Cảnh báo khi tuyệt vọng hoặc u uất kéo dài' },
                        { id: 'strict', label: 'Nghiêm Ngặt', desc: 'Nhắc nhở ngay cả khi xuất hiện nỗi buồn vừa phải' }
                      ].map(level => (
                        <button
                          key={level.id}
                          type="button"
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            mhSettings.sensitivity === level.id 
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                              : 'bg-slate-900/40 border-slate-700/60 text-slate-400 hover:border-slate-500'
                          }`}
                          onClick={() => {
                            const updated = saveMentalHealthSettings({ sensitivity: level.id })
                            setMhSettings(updated)
                            if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          }}
                        >
                          <div className="font-bold text-xs">{level.label}</div>
                          <div className="text-[11px] text-slate-400 mt-1 leading-tight">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-mono text-slate-300 block font-bold">THỜI GIAN GIÃN CÁCH POPUP (COOLDOWN):</span>
                      <span className="text-xs text-slate-400">Tránh làm phiền bạn liên tục khi đang tập trung viết</span>
                    </div>

                    <div className="flex gap-1.5">
                      {[5, 15, 30, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                            mhSettings.cooldownMinutes === mins
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                              : 'bg-slate-800/40 border-slate-700 text-slate-400'
                          }`}
                          onClick={() => {
                            const updated = saveMentalHealthSettings({ cooldownMinutes: mins })
                            setMhSettings(updated)
                            if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                          }}
                        >
                          {mins}p
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Instant Launch & Preview Action */}
                <div className="settings-group-box text-center py-5 bg-gradient-to-r from-emerald-950/30 to-rose-950/30 border-emerald-500/30">
                  <span className="text-3xl mb-2 block">🕊️ 💖 📞</span>
                  <h4 className="text-base font-bold text-white mb-1">Mở Trực Tiếp Trung Tâm Hỗ Trợ & Hotline Tâm Lý</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                    Trải nghiệm ngay popup lời khuyên dịu dàng, bài tập hít thở 4-7-8, kỹ thuật tiếp đất 5-4-3-2-1 và danh bạ hotline cứu trợ 24/7.
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] hover:-translate-y-0.5 transition-all cursor-pointer"
                    onClick={() => {
                      if (typeof onOpenMentalHealth === 'function') {
                        onOpenMentalHealth()
                      } else {
                        triggerMentalHealthAlert({ force: true, initialTab: 'comfort', message: 'Bạn vừa chủ động mở Trung tâm Hỗ trợ Sức khỏe Tâm thần từ Cài đặt.' })
                      }
                    }}
                  >
                    <Heart size={16} className="fill-slate-950" />
                    <span>MỞ TRUNG TÂM HỖ TRỢ TÂM LÝ (ALT + H)</span>
                  </button>
                </div>

                {/* Direct Hotlines Table */}
                <div className="settings-group-box">
                  <span className="group-title text-cyan-400 mb-2">DANH BẠ HOTLINE CỨU TRỢ NHANH</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {EMERGENCY_HOTLINES.slice(0, 4).map(h => (
                      <div key={h.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-white">{h.name}</div>
                          <div className="text-[11px] text-cyan-400 font-mono font-bold">{h.displayNumber}</div>
                          <div className="text-[10px] text-slate-400">{h.hours} • {h.fee}</div>
                        </div>
                        <a
                          href={h.telLink}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                        >
                          Gọi
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 14.8. OFFLINE PWA & CLOUD SYNC (FEATURE 36) */}
            {activeSettingsTab === 'pwa-sync' && (
              <section id="settings-sec-pwa-sync" className="settings-section">
                <div className="section-header">
                  <h4>CHẾ ĐỘ OFFLINE PWA & ĐỒNG BỘ ĐÁM MÂY (CLOUD AUTO-SYNC)</h4>
                  <p>Tích hợp Service Worker và bộ đệm lưu trữ ngoại tuyến cho phép sử dụng trọn vẹn app ngay cả khi mất mạng, tự động đồng bộ lên đám mây khi có mạng lại.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + O</strong></span>
                    <span className="quick-launch-desc">Kiểm tra kết nối Wifi, hàng đợi đồng bộ và sao lưu dữ liệu PWA</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      if (typeof onOpenOfflineSync === 'function') onOpenOfflineSync()
                      if (typeof onClose === 'function') onClose()
                    }}
                    title="Mở Bảng Điều Khiển Offline & Wifi Toàn Cảnh (Alt + O)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ BẢNG ĐIỀU KHIỂN OFFLINE & WIFI TOÀN CẢNH (Alt + O) ↗</span>
                  </button>
                </div>

                {pwaFeedback && (
                  <div className={`p-3 rounded-xl mb-4 flex items-center gap-2 border text-xs font-mono font-bold ${
                    pwaFeedback.type === 'success' ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300' : 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                  }`}>
                    <Check size={16} />
                    <span>{pwaFeedback.msg}</span>
                  </div>
                )}

                {/* Status Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className={`p-4 rounded-xl border ${pwaSyncStats?.isOnline ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'}`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-slate-400">
                      {pwaSyncStats?.isOnline ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-rose-400" />}
                      <span>TRẠNG THÁI MẠNG</span>
                    </div>
                    <div className="text-lg font-bold text-white mb-1">
                      {pwaSyncStats?.isOnline ? '🟢 TRỰC TUYẾN (ONLINE)' : '🔴 NGOẠI TUYẾN (OFFLINE PWA)'}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {pwaSyncStats?.isOnline 
                        ? 'Dữ liệu được lưu trữ kép tại thiết bị và tự động cập nhật lên đám mây.' 
                        : 'Mất kết nối. Mọi thao tác viết, vẽ, xoay nhẫn được bảo lưu an toàn 100% trong bộ nhớ máy.'}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400">
                      Lần đồng bộ gần nhất: <span className="text-cyan-300 font-bold">{pwaSyncStats?.lastSyncFormatted || 'Vừa xong'}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-cyan-950/20 border-cyan-500/40 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-slate-400">
                        <Smartphone size={16} className="text-cyan-400" />
                        <span>TRUY XUẤT DỮ LIỆU CỤC BỘ</span>
                      </div>
                      <div className="text-lg font-bold text-cyan-300 mb-1">
                        TRUY XUẤT DỮ LIỆU
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Hỗ trợ truy xuất dữ liệu ngoại tuyến, lưu trữ tức thì và đồng bộ hóa tiến trình câu chuyện liền mạch.
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        pwaInstallReady 
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]' 
                          : 'bg-slate-800/60 border-slate-700 text-slate-400 opacity-60'
                      }`}
                      onClick={async () => {
                        const res = await triggerPwaInstall()
                        if (res.success) {
                          setPwaInstallReady(false)
                          setPwaFeedback({ type: 'success', msg: 'Truy xuất & cài đặt PWA thành công!' })
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                        }
                      }}
                      disabled={!pwaInstallReady}
                    >
                      <Download size={14} />
                      <span>{pwaInstallReady ? 'TRUY XUẤT & CÀI ĐẶT VÀO THIẾT BỊ' : 'DỮ LIỆU ĐÃ ĐƯỢC TRUY XUẤT SẴN SÀNG'}</span>
                    </button>
                  </div>
                </div>

                {/* Storage Meter */}
                <div className="settings-group-box mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HardDrive size={16} className="text-cyan-400" />
                      <span className="group-title mb-0">DUNG LƯỢNG LƯU TRỮ OFFLINE</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {pwaSyncStats?.localStorageUsageKB || 0} KB đã dùng
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.max(3, Math.min(100, (parseFloat(pwaSyncStats?.localStorageUsageKB || 0) / 5120) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Hỗ trợ lưu trữ hơn 10.000 bản ghi ngoại tuyến an toàn.</span>
                    <span className="text-emerald-400 font-mono flex items-center gap-1"><ShieldCheck size={12} /> Mã hóa lưu trữ</span>
                  </div>
                </div>

                {/* Sync Action & Queue */}
                <div className="settings-group-box">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <div>
                      <span className="group-title mb-0">HÀNG ĐỢI ĐỒNG BỘ ĐÁM MÂY ({pwaQueue.length})</span>
                      <p className="group-subtext">Các thao tác lưu nhật ký hoặc chỉnh sửa đang chờ gửi lên máy chủ</p>
                    </div>

                    <div className="flex gap-2">
                      {pwaQueue.length > 0 && (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-mono text-slate-300 hover:text-white"
                          onClick={() => {
                            clearOfflineQueue()
                            setPwaQueue([])
                          }}
                        >
                          Xóa hàng đợi
                        </button>
                      )}

                      <button
                        type="button"
                        className={`px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.3)] ${pwaIsSyncing ? 'opacity-70' : ''}`}
                        onClick={async () => {
                          if (pwaIsSyncing) return
                          setPwaIsSyncing(true)
                          setPwaSyncProgress(15)
                          setPwaSyncMsg('Đang chuẩn bị gói dữ liệu...')
                          if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()

                          await triggerCloudSync({
                            silent: false,
                            source: 'settings-tab',
                            onProgress: (prog, msg) => {
                              setPwaSyncProgress(prog)
                              setPwaSyncMsg(msg)
                            }
                          })
                        }}
                        disabled={pwaIsSyncing}
                      >
                        <RefreshCw size={14} className={pwaIsSyncing ? 'animate-spin' : ''} />
                        <span>{pwaIsSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ CLOUD NGAY'}</span>
                      </button>
                    </div>
                  </div>

                  {pwaIsSyncing && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-cyan-500/40 mb-2">
                      <div className="flex justify-between text-xs font-mono text-cyan-300 mb-1">
                        <span>{pwaSyncMsg}</span>
                        <span>{pwaSyncProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${pwaSyncProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {pwaQueue.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
                      <Check size={16} className="text-emerald-400" />
                      <span>Toàn bộ dữ liệu đã được đồng bộ đồng nhất với Cloud.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {pwaQueue.map((item) => (
                        <div key={item.id} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono flex justify-between items-center">
                          <span className="text-cyan-400 font-bold">[{item.entityType?.toUpperCase()}] {item.payload?.title || 'Bản ghi'}</span>
                          <span className="text-slate-500">{new Date(item.timestamp).toLocaleTimeString('vi-VN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 14.9. END-TO-END ENCRYPTION (E2EE) (FEATURE 39) */}
            {activeSettingsTab === 'e2ee' && (
              <section id="settings-sec-e2ee" className="settings-section">
                <div className="section-header">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/40">
                      ZERO-KNOWLEDGE
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold border border-cyan-500/40">
                      AES-GCM-256
                    </span>
                  </div>
                  <h4>MÃ HÓA ĐẦU-CUỐI & KÉT LƯỢNG TỬ (E2E ENCRYPTION)</h4>
                  <p>Bảo vệ toàn vẹn và tuyệt mật 100% dữ liệu nhật ký, giấc mơ và viên nang. Dữ liệu được mã hóa trực tiếp tại trình duyệt bằng Web Crypto API.</p>
                </div>

                {/* Quick Launch & Hotkey Bar */}
                <div className="section-quick-launch-bar">
                  <div className="quick-launch-left">
                    <span className="quick-hotkey-badge">PHÍM TẮT TOÀN CẢNH: <strong>Alt + E</strong></span>
                    <span className="quick-launch-desc">Bảo mật Zero-Knowledge AES-GCM 256-bit và Két Lượng Tử</span>
                  </div>
                  <button
                    type="button"
                    className="quick-launch-fullscreen-btn"
                    onClick={() => {
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                      setShowE2EEModalStandalone(true)
                    }}
                    title="Mở Két Bảo Mật Lượng Tử E2EE Độc Lập (Alt + E)"
                  >
                    <ExternalLink size={13} />
                    <span>MỞ KÉT E2EE TOÀN CẢNH (Alt + E) ↗</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-slate-400">
                        <Shield className="text-emerald-400" size={16} />
                        <span>CHUẨN BẢO MẬT</span>
                      </div>
                      <div className="text-base font-bold text-emerald-300 mb-1">
                        AES-GCM 256-BIT
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Chuẩn mã hóa khối đối xứng cấp quân sự với Random IV 12-byte và Tag xác thực toàn vẹn.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-slate-400">
                        <Key className="text-cyan-400" size={16} />
                        <span>HÀM DẪN XUẤT (KDF)</span>
                      </div>
                      <div className="text-base font-bold text-cyan-300 mb-1">
                        PBKDF2-SHA256
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        150,000 vòng lặp băm mật mã kèm Salt 16-byte ngẫu nhiên chống tấn công từ điển và Rainbow Table.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border bg-slate-900/60 border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-slate-400">
                        <Terminal className="text-amber-400" size={16} />
                        <span>KHÔI PHỤC LƯỢNG TỬ</span>
                      </div>
                      <div className="text-base font-bold text-amber-300 mb-1">
                        12-WORD MNEMONIC
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Cụm từ hạt giống lượng tử độc quyền và file chứng chỉ khóa .json để cứu hộ dữ liệu an toàn.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 mb-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="text-sm font-bold text-cyan-300 mb-1">TRUNG TÂM BẢO MẬT & TRÌNH GIẢ LẬP ADMIN DB</div>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Mở bảng điều khiển E2EE tương tác để kiểm tra giả lập góc nhìn Admin Database, tạo mã bảo mật, sao chép 12 từ khóa khôi phục và thực hiện mã hóa 1-chạm.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                    onClick={() => {
                      setShowE2EEModalStandalone(true)
                      if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                    }}
                  >
                    <Shield size={14} />
                    <span>MỞ TRUNG TÂM E2EE</span>
                  </button>
                </div>
              </section>
            )}

            {/* FEATURE 41: AI VOICE TEXT-TO-SPEECH (ELEVENLABS) */}
            {activeSettingsTab === 'tts' && (
              <section id="settings-sec-tts" className="settings-section">
                <TTSVoiceSettings soundEnabled={soundEnabled} />
              </section>
            )}

            {/* 15. DATA & SYSTEM REBOOT */}
            {activeSettingsTab === 'data' && (
              <section id="settings-sec-data" className="settings-section">

                <div className="section-header">
                  <h4>QUẢN LÝ DỮ LIỆU & KHỞI ĐỘNG LẠI</h4>
                  <p>Kiểm soát bộ nhớ cục bộ, trạng thái lưu trữ và đặt lại hành trình.</p>
                </div>


                <div className="settings-group-box">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="group-title text-rose-400 mb-0">KHỞI ĐỘNG LẠI HÀNH TRÌNH TÂM THỨC</span>
                      <p className="group-subtext">Đặt lại tiến trình câu chuyện về Chương 1 (Khởi Nguyên) mà không xóa các bản ghi nhật ký</p>
                    </div>

                    <button
                      type="button"
                      className="danger-action-btn"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc muốn đặt lại hành trình câu chuyện về điểm bắt đầu?')) {
                          if (typeof onResetJourney === 'function') onResetJourney()
                          if (typeof onClose === 'function') onClose()
                        }
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Reboot Story</span>
                    </button>
                  </div>
                </div>

                <div className="system-info-box">
                  <div className="info-row">
                    <span>PHIÊN BẢN HỆ THỐNG:</span>
                    <strong>MR-CORE-01 v4.5 PRO (Seamless Instant Settings Tabs)</strong>
                  </div>
                  <div className="info-row">
                    <span>LƯU TRỮ CỤC BỘ:</span>
                    <strong>HTML5 LocalStorage (Encrypted)</strong>
                  </div>
                  <div className="info-row">
                    <span>TRÍ TUỆ NHÂN TẠO:</span>
                    <strong>Google Gemini 3.6 Flash + Neural Semantic NLP</strong>
                  </div>
                </div>
              </section>
            )}

            {/* Floating Back to Top Button */}
            {showScrollTop && (
              <button
                type="button"
                className="settings-scroll-top-btn"
                onClick={() => scrollToSection('features')}
                title="Cuộn nhanh lên đầu bảng cài đặt"
              >
                <ArrowUp size={14} />
                <span>LÊN ĐẦU TRANG</span>
              </button>
            )}

          </div>
        </div>



        {/* Modal Footer */}
        <div className="settings-footer">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Mọi tùy chỉnh & ký ức được bảo vệ an toàn trên thiết bị của bạn.</span>
          </div>

          <button
            type="button"
            className="settings-done-btn"
            onClick={() => {
              if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
              if (typeof onClose === 'function') onClose()
            }}
          >
            <Check size={15} />
            <span>HOÀN TẤT & ĐÓNG</span>
          </button>
        </div>
      </motion.div>

      {/* Standalone E2EE Security Modal */}
      <E2EEncryptionModal
        isOpen={showE2EEModalStandalone}
        onClose={() => setShowE2EEModalStandalone(false)}
        soundEnabled={soundEnabled}
      />
    </div>
  )
}

