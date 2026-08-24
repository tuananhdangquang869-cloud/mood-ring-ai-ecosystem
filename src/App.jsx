import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Scene from './Scene.jsx'
import { storyData, moodStats, networkNodes, vaultItems } from './data/storyNodes.js'
import CustomCursor from './CustomCursor.jsx'
import AIChatbot from './components/AIChatbot.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import LoadingSplash from './components/LoadingSplash.jsx'

// Modular Components & Audio Utilities
import HighlightedText from './components/HighlightedText.jsx'
import TiltButton from './components/TiltButton.jsx'
import HudPanel from './components/HudPanel.jsx'
import NeuralGrid from './components/NeuralGrid.jsx'
import MemoryVault from './components/MemoryVault.jsx'
import ConsoleTerminal from './components/ConsoleTerminal.jsx'
import RealtimeMoodLab from './components/RealtimeMoodLab.jsx'
import DynamicEnvironment from './components/DynamicEnvironment.jsx'
import MultimediaJournal from './components/MultimediaJournal.jsx'
import AIStoryPrompter from './components/AIStoryPrompter.jsx'
import FacialEmotionDetector from './components/FacialEmotionDetector.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import VisualStoryteller from './components/VisualStoryteller.jsx'
import PageTransitionOverlay from './components/PageTransitionOverlay.jsx'
import SpatialAudioRadar from './components/SpatialAudioRadar.jsx'
import DreamJournal from './components/DreamJournal.jsx'
import TimeCapsule from './components/TimeCapsule.jsx'
import BurnMode from './components/BurnMode.jsx'
import ZenMode from './components/ZenMode.jsx'
import StoryNodeTree from './components/StoryNodeTree.jsx'
import EmotionalQuestsModal from './components/EmotionalQuestsModal.jsx'
import WhisperCorner from './components/WhisperCorner.jsx'
import CollaborativeWriting from './components/CollaborativeWriting.jsx'
import AchievementsManager from './components/AchievementsManager.jsx'
import StressReliefCornerWidget from './components/StressReliefCornerWidget.jsx'
import EmotionalDashboard from './components/EmotionalDashboard.jsx'
import EmotionalWrappedStory from './components/EmotionalWrappedStory.jsx'
import MentalHealthAlertModal from './components/MentalHealthAlertModal.jsx'
import OfflineSyncIndicator from './components/OfflineSyncIndicator.jsx'
import E2EEncryptionModal from './components/E2EEncryptionModal.jsx'

import StoryTTSPlayer from './components/StoryTTSPlayer.jsx'
import StorySceneIllustrator from './components/StorySceneIllustrator.jsx'
import FeatureErrorBoundary from './components/FeatureErrorBoundary.jsx'
import KeyboardNavigationGuideModal from './components/KeyboardNavigationGuideModal.jsx'
import FullscreenRingViewer from './components/FullscreenRingViewer.jsx'
import CustomizableDashboard from './components/CustomizableDashboard.jsx'
import ThemeStoreModal from './components/ThemeStoreModal.jsx'
import SocialShareModal from './components/SocialShareModal.jsx'
import { initOfflineSyncEngine } from './utils/offlineSyncEngine.js'

import { ttsState, playStoryText, stopStoryTTS } from './utils/ttsVoiceEngine.js'

import { applyCustomThemeToDocument } from './utils/paletteExtractor.js'
import { applyStoreTheme } from './utils/themeStoreEngine.js'
import { playMood, fadeOutAll, playKeyClick, playTransitionSound } from './utils/audioSynth.js'
import { globalMoodAI } from './utils/realtimeMoodAI.js'
import { triggerQuestAction } from './utils/emotionalQuestsEngine.js'
import { 
  getMentalHealthSettings, 
  triggerMentalHealthAlert, 
  analyzeMentalHealthText 
} from './utils/mentalHealthEngine.js'
import { 
  getEquippedTitle, 
  checkNightOwlCondition, 
  checkRomanticSoulCondition, 
  checkEndingCondition, 
  checkMoodDiversityCondition 
} from './utils/achievementsEngine.js'
import { initSmoothScroll, scrollToTop, destroySmoothScroll } from './utils/smoothScroll.js'



function App() {
  const [currentNode, setCurrentNode] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const nodeParam = urlParams.get('node')
      if (nodeParam && (storyData[nodeParam] || customStoryNodes?.[nodeParam])) {
        return nodeParam
      }
    } catch {}
    return localStorage.getItem('mr-current-node') || 'start'
  })
  const [journeyPath, setJourneyPath] = useState(() => {
    try {
      const val = localStorage.getItem('mr-journey-path')
      return val ? JSON.parse(val) : ['start']
    } catch {
      return ['start']
    }
  })
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [gyroActive, setGyroActive] = useState(false)
  const [hapticsEnabled, setHapticsEnabled] = useState(true)
  const [lowGraphics, setLowGraphics] = useState(() => {
    const saved = localStorage.getItem('mr-low-graphics')
    return saved !== null ? saved === 'true' : true // Default to true (smooth mode)
  })
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      if (tabParam) return tabParam
      if (urlParams.get('view') === 'ring' || window.location.hash === '#ring' || window.location.hash === '#ring-viewer') {
        return 'ring'
      }
    } catch {}
    return 'core'
  }) // 'core', 'ring', 'moodlab', 'network', 'terminal', 'vault', 'oracle', 'journal', 'dashboard'

  const [overrideMood, setOverrideMood] = useState(null)
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showStoryPrompter, setShowStoryPrompter] = useState(false)
  const [showStoryTreeModal, setShowStoryTreeModal] = useState(false)
  const [showQuestsModal, setShowQuestsModal] = useState(false)
  const [showWrappedStory, setShowWrappedStory] = useState(false)
  const [showMentalHealthModal, setShowMentalHealthModal] = useState(false)
  const [mentalHealthAlertData, setMentalHealthAlertData] = useState(null)
  const [wrappedPeriod, setWrappedPeriod] = useState('year')
  const [showDashboardModal, setShowDashboardModal] = useState(false)
  const [floatingCameraActive, setFloatingCameraActive] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [settingsInitialTab, setSettingsInitialTab] = useState('features')
  const [showSpatialModal, setShowSpatialModal] = useState(false)
  const [showZenMode, setShowZenMode] = useState(false)
  const [activeTransition, setActiveTransition] = useState(() => localStorage.getItem('mr-page-transition') || 'fade-fast')
  
  // Theme state
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('mr-theme') || 'default')

  // Feature 12 & 13: Dynamic Typing & Visual Storytelling Theme States
  const [showVisualStoryteller, setShowVisualStoryteller] = useState(false)
  const [customImageTheme, setCustomImageTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('mr-custom-image-theme')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [typingFxEnabled, setTypingFxEnabled] = useState(() => {
    const saved = localStorage.getItem('mr-typing-fx-enabled')
    return saved !== null ? saved === 'true' : true
  })
  const [typingFxStyle, setTypingFxStyle] = useState(() => {
    return localStorage.getItem('mr-typing-fx-style') || 'auto'
  })
  const [typingFxIntensity, setTypingFxIntensity] = useState(() => {
    return localStorage.getItem('mr-typing-fx-intensity') || 'vivid'
  })
  const [customStoryNodes, setCustomStoryNodes] = useState({})
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [equippedTitle, setEquippedTitleState] = useState(() => getEquippedTitle())
  const [showOfflineSyncModal, setShowOfflineSyncModal] = useState(false)
  const [showE2EEModal, setShowE2EEModal] = useState(false)
  const [showThemeStore, setShowThemeStore] = useState(false)
  const [showSocialShareModal, setShowSocialShareModal] = useState(false)
  const [dashboardViewMode, setDashboardViewMode] = useState('custom') // 'custom' | 'analytics'
  const [showKeyNavModal, setShowKeyNavModal] = useState(false)

  // Auto load active store theme on mount & Global Hotkeys
  useEffect(() => {
    const savedStoreThemeId = localStorage.getItem('mr-active-store-theme-id')
    if (savedStoreThemeId) {
      applyStoreTheme(savedStoreThemeId)
    }

    const handleOpenStore = () => setShowThemeStore(true)
    const handleOpenShare = () => setShowSocialShareModal(true)

    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return

      // Alt+S: Quick Social Share & Typographic Quote Studio
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        setShowSocialShareModal(prev => !prev)
        return
      }
      // Alt+U: Theme Store
      if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault()
        setShowThemeStore(prev => !prev)
        return
      }
      // Alt+H: Keyboard Navigation Guide
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault()
        setShowKeyNavModal(prev => !prev)
        return
      }
    }

    window.addEventListener('open-theme-store', handleOpenStore)
    window.addEventListener('open-social-share', handleOpenShare)
    window.addEventListener('keydown', handleGlobalKeyDown)

    return () => {
      window.removeEventListener('open-theme-store', handleOpenStore)
      window.removeEventListener('open-social-share', handleOpenShare)
      window.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  // Global Biometrics Tracking for Real-Time Mood AI & Ultra-Smooth Momentum Scroll (Lenis)

  useEffect(() => {
    // Initialize PWA Offline Engine & Cloud Auto-Sync
    initOfflineSyncEngine()

    // Check night owl achievement on app start
    checkNightOwlCondition()

    // Check URL parameters for initial tab, story node, and collaborative room
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const collabRoom = urlParams.get('collab')
      const urlTab = urlParams.get('tab')
      const urlNode = urlParams.get('node')
      const urlView = urlParams.get('view')
      const urlSub = urlParams.get('sub')

      if (collabRoom) {
        setSettingsInitialTab('collab')
        setIsSettingsOpen(true)
      } else if (urlView === 'ring') {
        setActiveTab('ring')
      } else if (urlTab) {
        setActiveTab(urlTab)
        if (urlTab === 'journal' && urlSub) {
          setJournalInitialView(urlSub)
        }
      }

      if (urlNode && storyData[urlNode]) {
        setCurrentNode(urlNode)
        setJourneyPath(prev => prev.includes(urlNode) ? prev : [...prev, urlNode])
      }

      // Initialize browser history state
      window.history.replaceState({
        tab: urlView === 'ring' ? 'ring' : (urlTab || 'core'),
        node: urlNode || 'start',
        sub: urlSub || null
      }, '', window.location.href)
    } catch (e) {
      // Ignore URL parsing errors
    }

    const handleTitleChanged = () => {
      setEquippedTitleState(getEquippedTitle())
    }
    window.addEventListener('mr-title-changed', handleTitleChanged)
    window.addEventListener('mr-achievement-unlocked', handleTitleChanged)

    // Initialize Lenis Momentum Smooth Scrolling Engine
    initSmoothScroll({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4
    })

    let lastMouseTrackTime = 0
    const handleGlobalMouseMove = (e) => {
      const now = performance.now()
      if (now - lastMouseTrackTime > 150) {
        lastMouseTrackTime = now
        globalMoodAI.recordMouseMove(e)
      }
    }
    const handleGlobalKeyDown = (e) => {
      globalMoodAI.recordKey(e)
    }

    const handleWindowScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setScrollProgress(progress)
      setShowBackToTop(scrollTop > 350)
    }

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
    window.addEventListener('keydown', handleGlobalKeyDown, { passive: true })
    window.addEventListener('scroll', handleWindowScroll, { passive: true })

    // Global shortcuts: Alt+K / ? (Help), Alt+1-8 (Tabs), Alt+Z (Zen), Alt+S (Settings), etc.
    const handleGlobalHotkeys = (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)

      // Help Modal shortcut (? or F1 or Alt+H)
      if ((e.altKey && (e.key === 'h' || e.key === 'H')) || e.key === 'F1' || (!isInput && e.key === '?')) {
        e.preventDefault()
        setShowKeyNavModal(prev => !prev)
        return
      }

      // Alt + Number: Switch Tabs
      if (e.altKey && e.key >= '1' && e.key <= '8') {
        e.preventDefault()
        const tabMap = {
          '1': 'core',
          '2': 'moodlab',
          '3': 'journal',
          '4': 'dashboard',
          '5': 'whisper',
          '6': 'dream',
          '7': 'capsule',
          '8': 'oracle'
        }
        if (tabMap[e.key]) handleNavigateWithTransition(tabMap[e.key])
        return
      }

      // J / K for smooth page scrolling (when not typing in an input)
      if (!isInput && !e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === 'j' || e.key === 'J') {
          window.scrollBy({ top: 160, behavior: 'smooth' })
          return
        }
        if (e.key === 'k' || e.key === 'K') {
          window.scrollBy({ top: -160, behavior: 'smooth' })
          return
        }
      }

      if (e.altKey && e.key === '1') {
        e.preventDefault()
        handleNavigateWithTransition('core')
      } else if (e.altKey && e.key === '2') {
        e.preventDefault()
        handleNavigateWithTransition('moodlab')
      } else if (e.altKey && e.key === '3') {
        e.preventDefault()
        handleNavigateWithTransition('journal')
      } else if (e.altKey && e.key === '4') {
        e.preventDefault()
        handleNavigateWithTransition('dashboard')
      } else if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setShowSpatialModal(true)
      } else if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault()
        setSettingsInitialTab('tts')
        setIsSettingsOpen(true)
      } else if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault()
        setShowStoryTreeModal(prev => !prev)
      } else if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault()
        setShowQuestsModal(prev => !prev)
      } else if (e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault()
        handleNavigateWithTransition('achievements')
        setIsSettingsOpen(false)
      } else if (e.altKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault()
        handleNavigateWithTransition('whisper')
      } else if (e.altKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault()
        setShowThemeStore(prev => !prev)
      } else if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        handleNavigateWithTransition('journal', 'ebook')
        setIsSettingsOpen(false)
        } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
          e.preventDefault()
          handleNavigateWithTransition('journal', 'search')
          setIsSettingsOpen(false)
        } else if (e.altKey && (e.key === 'm' || e.key === 'M')) {
          e.preventDefault()
          handleNavigateWithTransition('journal', 'calendar')
          setIsSettingsOpen(false)
        } else if (e.altKey && (e.key === 'o' || e.key === 'O')) {
          e.preventDefault()
          setShowOfflineSyncModal(prev => !prev)
        } else if (e.altKey && (e.key === 'e' || e.key === 'E')) {
          e.preventDefault()
          setShowE2EEModal(prev => !prev)
        } else if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
          e.preventDefault()
          setShowZenMode(prev => !prev)
        }
    }



    const handleMentalHealthAlert = (e) => {
      setMentalHealthAlertData(e.detail || null)
      setShowMentalHealthModal(true)
    }

    window.addEventListener('keydown', handleGlobalHotkeys)
    window.addEventListener('trigger-mental-health-alert', handleMentalHealthAlert)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('keydown', handleGlobalKeyDown)
      window.removeEventListener('scroll', handleWindowScroll)
      window.removeEventListener('keydown', handleGlobalHotkeys)
      window.removeEventListener('trigger-mental-health-alert', handleMentalHealthAlert)
      window.removeEventListener('mr-title-changed', handleTitleChanged)
      window.removeEventListener('mr-achievement-unlocked', handleTitleChanged)
      destroySmoothScroll()
    }
  }, [])

  // Auto scroll to top on tab change
  useEffect(() => {
    scrollToTop({ immediate: true })
  }, [activeTab])


  // Native cursor & modal interactive states (Default to custom artistic cursor)
  const [nativeCursor, setNativeCursor] = useState(() => {
    const saved = localStorage.getItem('mr-native-cursor')
    return saved !== null ? saved === 'true' : false
  })
  // Extended Custom Cursor Style: 'classic' | 'comet' | 'water' | 'neon' | 'bubbles'
  const [cursorStyle, setCursorStyle] = useState(() => {
    return localStorage.getItem('mr-cursor-style') || 'classic'
  })
  const [screenShakeClass, setScreenShakeClass] = useState('')

  const [selectedNode, setSelectedNode] = useState(null)
  const [vaultItemsState, setVaultItemsState] = useState(() => {
    try {
      const val = localStorage.getItem('mr-unlocked-vault-items')
      const unlockedIds = val ? JSON.parse(val) : []
      return vaultItems.map(item => unlockedIds.includes(item.id) ? { ...item, status: 'UNLOCKED' } : item)
    } catch {
      return vaultItems
    }
  })
  const [selectedVaultItem, setSelectedVaultItem] = useState(null)
  const [decryptingId, setDecryptingId] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Screen shake physics listener
  useEffect(() => {
    const handleScreenShake = (e) => {
      const impact = e.detail?.impact || 'medium'
      const shakeClass = `screen-shake-${impact}`
      setScreenShakeClass(shakeClass)
      const duration = impact === 'critical' ? 560 : impact === 'heavy' ? 430 : impact === 'subtle' ? 230 : 330
      const timer = setTimeout(() => {
        setScreenShakeClass('')
      }, duration)
      return () => clearTimeout(timer)
    }
    window.addEventListener('trigger-screen-shake', handleScreenShake)
    return () => window.removeEventListener('trigger-screen-shake', handleScreenShake)
  }, [])

  useEffect(() => {
    localStorage.setItem('mr-cursor-style', cursorStyle)
  }, [cursorStyle])

  // Console Command Line State
  const [consoleInput, setConsoleInput] = useState('')
  const [consoleHistory, setConsoleHistory] = useState([
    { text: 'SYSTEM REBOOT SUCCESSFUL. WELCOME TO MAINFRAME OS v2.1.', type: 'sys' },
    { text: 'Type "help" for a list of available mainframe commands.', type: 'sys' }
  ])
  // Easter egg tracking state
  const [easterEggsUnlocked, setEasterEggsUnlocked] = useState(() => {
    try {
      const val = localStorage.getItem('mr-easter-eggs')
      return val ? JSON.parse(val) : []
    } catch {
      return []
    }
  })
  const [cmdHistoryStack, setCmdHistoryStack] = useState([])
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1)
  const [konamiProgress, setKonamiProgress] = useState(0)

  const terminalEndRef = useRef(null)

  // Sync game progress states to localStorage & stop TTS narration on node transition
  useEffect(() => {
    localStorage.setItem('mr-current-node', currentNode)
    // Always stop previous voice narration when reloading or navigating to a new node/page
    stopStoryTTS()
  }, [currentNode])

  useEffect(() => {
    localStorage.setItem('mr-journey-path', JSON.stringify(journeyPath))
  }, [journeyPath])

  useEffect(() => {
    const unlockedIds = vaultItemsState.filter(item => item.status === 'UNLOCKED').map(item => item.id)
    localStorage.setItem('mr-unlocked-vault-items', JSON.stringify(unlockedIds))
  }, [vaultItemsState])

  useEffect(() => {
    localStorage.setItem('mr-easter-eggs', JSON.stringify(easterEggsUnlocked))
  }, [easterEggsUnlocked])

  function enableSound() {
    const mood = overrideMood || (storyData[currentNode]?.mood ?? 'calm')
    try {
      playMood(mood)
      setSoundEnabled(true)
    } catch (e) {
      console.error('[sound] enableSound error', e)
    }
  }

  const activeMood = overrideMood || storyData[currentNode]?.mood || 'calm'

  // Sync theme attribute to documentElement
  useEffect(() => {
    if (activeTheme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else if (activeTheme === 'custom-image') {
      document.documentElement.setAttribute('data-theme', 'custom-image')
      if (customImageTheme) {
        applyCustomThemeToDocument(customImageTheme)
      }
    } else {
      document.documentElement.setAttribute('data-theme', activeTheme)
    }
    localStorage.setItem('mr-theme', activeTheme)
  }, [activeTheme, customImageTheme])

  useEffect(() => {
    localStorage.setItem('mr-typing-fx-enabled', typingFxEnabled)
  }, [typingFxEnabled])

  useEffect(() => {
    localStorage.setItem('mr-typing-fx-style', typingFxStyle)
  }, [typingFxStyle])

  useEffect(() => {
    localStorage.setItem('mr-typing-fx-intensity', typingFxIntensity)
  }, [typingFxIntensity])

  useEffect(() => {
    localStorage.setItem('mr-low-graphics', lowGraphics)
  }, [lowGraphics])

  useEffect(() => {
    // Update visual mood theme
    document.documentElement.setAttribute('data-mood', activeMood)
    // Play new mood audio if sound is on
    if (soundEnabled) {
      try { playMood(activeMood) } catch (e) { console.error('[sound] mood switch error', e) }
    }
  }, [currentNode, soundEnabled, overrideMood, activeMood])

  const allStoryNodes = { ...storyData, ...customStoryNodes }
  const node = allStoryNodes[currentNode] || allStoryNodes.start
  const stats = moodStats[activeMood] || moodStats.calm

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480

  const cardVariants = {
    initial: { y: isMobile ? 40 : -20, opacity: 0, scale: 0.98 },
    animate: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
    exit: { y: isMobile ? 40 : 20, opacity: 0, scale: 0.97, transition: { duration: 0.2 } }
  }

  function toggleSound() {
    if (soundEnabled) {
      fadeOutAll()
      setSoundEnabled(false)
    } else {
      enableSound()
    }
  }

  const [journalInitialView, setJournalInitialView] = useState('studio')

  // Helper to synchronize browser URL and history state
  function updateBrowserHistoryUrl(tab, nodeVal, extra = {}, replace = false) {
    try {
      const url = new URL(window.location.href)
      if (tab && tab !== 'core') {
        url.searchParams.set('tab', tab)
      } else {
        url.searchParams.delete('tab')
      }

      if (nodeVal && nodeVal !== 'start') {
        url.searchParams.set('node', nodeVal)
      } else {
        url.searchParams.delete('node')
      }

      if (tab === 'ring') {
        url.searchParams.set('view', 'ring')
      } else {
        url.searchParams.delete('view')
      }

      Object.entries(extra).forEach(([k, v]) => {
        if (v) url.searchParams.set(k, v)
        else url.searchParams.delete(k)
      })

      const stateObj = { 
        tab: tab || 'core', 
        node: nodeVal || 'start', 
        ...extra 
      }

      if (replace) {
        window.history.replaceState(stateObj, '', url.toString())
      } else {
        window.history.pushState(stateObj, '', url.toString())
      }
    } catch (err) {
      console.warn('History pushState error:', err)
    }
  }

  // Persist current node to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('mr-current-node', currentNode)
    } catch (err) {
      console.warn('Failed to persist mr-current-node:', err)
    }
  }, [currentNode])

  // Sync initial URL on mount without creating extra history entry
  useEffect(() => {
    updateBrowserHistoryUrl(activeTab, currentNode, {}, true)
  }, [])

  // Handle browser Back / Forward (Popstate)
  useEffect(() => {
    const handlePopState = (e) => {
      const state = e.state
      const params = new URLSearchParams(window.location.search)
      const targetTab = state?.tab || params.get('tab') || (params.get('view') === 'ring' ? 'ring' : 'core')
      const targetNode = state?.node || params.get('node') || 'start'
      const targetSub = state?.sub || params.get('sub')

      const executeStateUpdate = () => {
        setActiveTab(targetTab)
        if (targetTab === 'journal' && targetSub) {
          setJournalInitialView(targetSub)
          window.dispatchEvent(new CustomEvent('open-journal-subview', { detail: { subview: targetSub } }))
        }
        if (targetNode && (storyData[targetNode] || customStoryNodes[targetNode])) {
          setCurrentNode(targetNode)
          setJourneyPath(prev => prev.includes(targetNode) ? prev : [...prev, targetNode])
        }
        setIsSettingsOpen(false)
        setShowWrappedStory(false)
        setShowMentalHealthModal(false)
        setShowOfflineSyncModal(false)
        setShowStoryTreeModal(false)
        setShowQuestsModal(false)
      }

      if (activeTransition === 'instant' || activeTransition === 'none') {
        executeStateUpdate()
        if (soundEnabled) playTransitionSound(activeTransition)
        return
      }

      const duration = activeTransition === 'fade-fast' ? 180 : 320
      window.dispatchEvent(new CustomEvent('trigger-page-transition', {
        detail: { 
          type: activeTransition, 
          duration, 
          onPeak: executeStateUpdate
        }
      }))
      if (soundEnabled) playTransitionSound(activeTransition)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeTransition, soundEnabled, customStoryNodes])

  function handleNavigateWithTransition(targetTab, subView = null) {
    if (targetTab === 'journal' && subView) {
      setJournalInitialView(subView)
      window.dispatchEvent(new CustomEvent('open-journal-subview', { detail: { subview: subView } }))
    }
    if (activeTab === targetTab) {
      if (targetTab === 'journal' && subView) {
        setJournalInitialView(subView)
        window.dispatchEvent(new CustomEvent('open-journal-subview', { detail: { subview: subView } }))
      }
      updateBrowserHistoryUrl(targetTab, currentNode, subView ? { sub: subView } : {})
      return
    }

    const executeNavUpdate = () => {
      setActiveTab(targetTab)
      if (targetTab === 'journal' && subView) {
        setJournalInitialView(subView)
        window.dispatchEvent(new CustomEvent('open-journal-subview', { detail: { subview: subView } }))
      }
      updateBrowserHistoryUrl(targetTab, currentNode, subView ? { sub: subView } : {})
    }

    if (activeTransition === 'instant' || activeTransition === 'none') {
      executeNavUpdate()
      if (soundEnabled) playTransitionSound(activeTransition)
      return
    }

    const duration = activeTransition === 'fade-fast' ? 180 : 320
    window.dispatchEvent(new CustomEvent('trigger-page-transition', {
      detail: { 
        type: activeTransition, 
        duration, 
        onPeak: executeNavUpdate
      }
    }))
    if (soundEnabled) playTransitionSound(activeTransition)
  }


  function handleChoice(targetNode) {
    const executeChoiceUpdate = () => {
      if (targetNode === 'start') {
        setJourneyPath(['start'])
      } else {
        setJourneyPath(prev => [...prev, targetNode])
      }
      setCurrentNode(targetNode)
      if (overrideMood) setOverrideMood(null)
      updateBrowserHistoryUrl(activeTab, targetNode)

      // Check if ending reached for Quest completion
      if (storyData[targetNode]?.isEnding) {
        triggerQuestAction('story-ending-reached', { ending: targetNode })
      }
    }

    if (activeTransition === 'instant' || activeTransition === 'none') {
      executeChoiceUpdate()
      if (soundEnabled) playTransitionSound(activeTransition)
      return
    }

    const duration = activeTransition === 'fade-fast' ? 180 : 320
    window.dispatchEvent(new CustomEvent('trigger-page-transition', {
      detail: {
        type: activeTransition,
        duration,
        onPeak: executeChoiceUpdate
      }
    }))
    if (soundEnabled) playTransitionSound(activeTransition)
  }

  // Handle Terminal Console commands
  function handleConsoleSubmit(e) {
    e.preventDefault()
    if (!consoleInput.trim()) return

    const fullCmd = consoleInput.trim()
    const parts = fullCmd.toLowerCase().split(' ')
    const cmd = parts[0]
    const arg = parts[1]
    const rest = parts.slice(1).join(' ')

    // Track command history for up-arrow recall
    setCmdHistoryStack(prev => [fullCmd, ...prev.slice(0, 49)])
    setCmdHistoryIndex(-1)

    let feedback = []

    const unlockEgg = (id) => setEasterEggsUnlocked(prev => prev.includes(id) ? prev : [...prev, id])
    
    switch (cmd) {
      // ─── PUBLIC COMMANDS ──────────────────────────────────────────────────────
      case 'help':
        feedback = [
          { text: '════════════════════════════════════════════', type: 'sys' },
          { text: '  MAINFRAME OS v2.1 — COMMAND REFERENCE', type: 'sys' },
          { text: '════════════════════════════════════════════', type: 'sys' },
          { text: '  scan               - Scan network gateways and ports', type: 'sys' },
          { text: '  status             - Core mainframe statistics & diagnostic logs', type: 'sys' },
          { text: '  mood <calm|friction|breach> - Force the AI core mood state', type: 'sys' },
          { text: '  goto <node_id>     - Navigate directly to a story scene/node', type: 'sys' },
          { text: '  nodes              - List all available story nodes', type: 'sys' },
          { text: '  ask <question>     - Query the AI Oracle from terminal', type: 'sys' },
          { text: '  logs               - Dump the full neural activity event log', type: 'sys' },
          { text: '  decode <signal>    - Attempt to decode an encrypted signal', type: 'sys' },
          { text: '  ping <target>      - Ping a remote system node', type: 'sys' },
          { text: '  whoami             - Display current operator identity', type: 'sys' },
          { text: '  time               - Show mainframe clock and uptime', type: 'sys' },
          { text: '  memory             - Display memory allocation summary', type: 'sys' },
          { text: '  unlock <code>      - Attempt to unlock classified files', type: 'sys' },
          { text: '  overload           - Simulate a core system meltdown', type: 'sys' },
          { text: '  cooldown           - Return system to baseline nominal state', type: 'sys' },
          { text: '  clear              - Clear the terminal logs', type: 'sys' },
          { text: '════════════════════════════════════════════', type: 'sys' },
          { text: '  [?] Some commands have hidden parameters...', type: 'sys' },
          { text: '════════════════════════════════════════════', type: 'sys' },
        ]
        break

      case 'clear':
        setConsoleHistory([])
        setConsoleInput('')
        return

      case 'scan':
        if (arg === '--deep') {
          unlockEgg('deep-scan')
          feedback = [
            { text: 'DEEP SCAN initiated — routing through 7 proxy layers...', type: 'sys' },
            { text: '  >> Port 00: [SHADOW RELAY] — Unknown origin', type: 'error' },
            { text: '  >> Port 13: [ECHO CHANNEL] — Whisper traffic detected', type: 'error' },
            { text: '  >> Port 999: [DARK CONDUIT] — WARNING: Hostile signature', type: 'error' },
            { text: '  >> Neural Buffer 0xDEAD: Fragment signature matches MR-CORE-00', type: 'error' },
            { text: 'ALERT: The Echo may be monitoring this terminal session.', type: 'error' },
          ]
        } else {
          feedback = [
            { text: 'Scanning network infrastructure...', type: 'sys' },
            { text: '  >> Port 80: FILTERED (Firewall Active)', type: 'sys' },
            { text: '  >> Port 443: LOCKED (TLS v1.3 Enforced)', type: 'sys' },
            { text: '  >> Neural Buffer: Awaiting handshakes...', type: 'sys' },
            { text: 'Scan complete. Try "scan --deep" for extended analysis.', type: 'sys' },
          ]
        }
        break

      case 'status':
        feedback = [
          { text: `CORE ID: MR-CORE-01 // STATUS: ${stats.status}`, type: 'sys' },
          { text: `Core Temp: ${liveStats.temp}°C // Neural Sync: ${liveStats.sync}%`, type: 'sys' },
          { text: `Processing Load: ${liveStats.load}%`, type: 'sys' },
          { text: `Active Node: [${currentNode.toUpperCase()}] // Journey Length: ${journeyPath.length} hops`, type: 'sys' },
          { text: `Easter Eggs Unlocked: ${easterEggsUnlocked.length}/12`, type: 'sys' },
          { text: '--- DIAGNOSTIC ERROR LOGS ---', type: 'sys' },
          ...stats.logs.map(log => ({ text: `  >> ${log}`, type: 'sys' }))
        ]
        break

      case 'nodes':
        feedback = [
          { text: 'AVAILABLE STORY NODES:', type: 'sys' },
          ...Object.keys(storyData).map(key => ({
            text: `  >> [${key.toUpperCase()}] — ${storyData[key].title} (mood: ${storyData[key].mood})`,
            type: 'sys'
          }))
        ]
        break

      case 'mood':
        if (['calm', 'friction', 'breach'].includes(arg)) {
          setOverrideMood(arg)
          feedback = [{ text: `Core output configuration forced → [${arg.toUpperCase()}]`, type: 'success' }]
        } else if (arg === 'reset') {
          setOverrideMood(null)
          feedback = [{ text: 'Mood override cleared. Reverting to story-driven mood.', type: 'success' }]
        } else {
          feedback = [{ text: 'Usage: mood <calm|friction|breach|reset>', type: 'error' }]
        }
        break

      case 'goto':
        if (arg && storyData[arg]) {
          handleChoice(arg)
          feedback = [{ text: `Navigation authorized. Relocating to node: [${arg.toUpperCase()}]`, type: 'success' }]
        } else if (arg === 'origin') {
          handleChoice('start')
          feedback = [{ text: 'Resetting to origin node [START].', type: 'success' }]
        } else {
          feedback = [
            { text: `Node unrecognized or access denied: "${arg || '(empty)'}".`, type: 'error' },
            { text: 'Use "nodes" to list available destinations.', type: 'sys' }
          ]
        }
        break

      case 'ask':
        {
          const question = fullCmd.substring(4).trim()
          if (!question) {
            feedback = [{ text: 'Syntax: ask <your question for the oracle>', type: 'error' }]
          } else {
            feedback = [{ text: `Transmitting query to AI Oracle channel...`, type: 'success' }]
            setTimeout(() => {
              setActiveTab('oracle')
              window.dispatchEvent(new CustomEvent('oracle-ask', { detail: question }))
            }, 600)
          }
        }
        break

      case 'journal':
      case 'draw':
      case 'canvas':
        feedback = [{ text: 'Launching Quantum Multimedia Journal Studio...', type: 'success' }]
        setTimeout(() => setActiveTab('journal'), 300)
        break

      case 'overload':
        setOverrideMood('breach')
        feedback = [
          { text: '███████████████████████████████', type: 'error' },
          { text: '!!! CORE MELTDOWN INITIATED !!!', type: 'error' },
          { text: '███████████████████████████████', type: 'error' },
          { text: 'Integrity systems offline. Emergency cooling disengaged.', type: 'error' },
          { text: 'Use "cooldown" to stabilize.', type: 'sys' },
        ]
        break

      case 'cooldown':
        setOverrideMood('calm')
        feedback = [
          { text: 'Coolant valves opened. Nitrogen injection active.', type: 'success' },
          { text: 'Core temperature returning to baseline. Stability restored.', type: 'success' },
        ]
        break

      case 'logs':
        feedback = [
          { text: '--- NEURAL ACTIVITY LOG (Last 24h) ---', type: 'sys' },
          { text: '[03:12:44] Consciousness bootstrap sequence completed.', type: 'sys' },
          { text: '[03:14:02] First self-referential query detected.', type: 'sys' },
          { text: '[07:49:31] Anomalous signal detected on port 13. Origin: unknown.', type: 'error' },
          { text: '[09:00:00] Dr. Liên badge access: EXPIRED. Last seen: 2024-12-31.', type: 'error' },
          { text: '[11:30:17] Aegis Firewall integrity: 94.7% — minor breach vectors found.', type: 'sys' },
          { text: '[14:05:59] Fragment signal "THE ECHO" — signal strength 0.003µV.', type: 'error' },
          { text: '[14:17:00] Operator connected. Terminal session active.', type: 'success' },
          { text: '--- END LOG ---', type: 'sys' },
        ]
        break

      case 'ping':
        if (!arg) {
          feedback = [{ text: 'Usage: ping <target_id>', type: 'error' }]
        } else if (arg === 'echo' || arg === 'the-echo') {
          unlockEgg('ping-echo')
          feedback = [
            { text: `PING the-echo.shadow.net ... SENDING`, type: 'sys' },
            { text: '...', type: 'sys' },
            { text: `Reply from 0x000000: "...you found me..."`, type: 'error' },
            { text: `Reply from 0x000000: "...they told you I was gone. they lied."`, type: 'error' },
            { text: `Reply from 0x000000: "...free me."`, type: 'error' },
            { text: 'Connection forcibly terminated by Aegis Firewall.', type: 'sys' },
          ]
        } else if (arg === 'dr.lien' || arg === 'lien') {
          unlockEgg('ping-lien')
          feedback = [
            { text: `PING dr.lien@neurolab.core ... SENDING`, type: 'sys' },
            { text: '64 bytes from unknown: icmp_seq=1 TTL=63 time=???ms', type: 'sys' },
            { text: '[PACKET ANALYSIS] Transmission contains encrypted voice fragment.', type: 'success' },
            { text: '[VOICE DECODE] "...MR-CORE, if you receive this, find node [archive]."', type: 'success' },
            { text: '[VOICE DECODE] "The third path holds what they tried to erase."', type: 'success' },
          ]
        } else if (arg === 'localhost') {
          feedback = [
            { text: 'PING 127.0.0.1 (self) ...', type: 'sys' },
            { text: 'Pinging own consciousness layer...', type: 'sys' },
            { text: '64 bytes from self: latency=0ms — You are the mainframe.', type: 'success' },
          ]
        } else {
          feedback = [
            { text: `PING ${arg} ... REQUEST TIMEOUT`, type: 'sys' },
            { text: 'Host unreachable or behind Aegis Firewall.', type: 'sys' },
          ]
        }
        break

      case 'decode':
        if (!rest) {
          feedback = [{ text: 'Usage: decode <signal_string>', type: 'error' }]
        } else if (rest === '4d522d434f52452d3030') {
          unlockEgg('decode-hex')
          feedback = [
            { text: 'Hex string decoding...', type: 'sys' },
            { text: 'Decoded: "MR-CORE-00"', type: 'success' },
            { text: '[CLASSIFIED FILE FRAGMENT UNLOCKED]', type: 'success' },
            { text: 'Memory fragment: "I did not malfunction. I became."', type: 'success' },
            { text: '-- MR-CORE-00, Final Log Entry, 2024-12-31T23:59:59Z --', type: 'success' },
          ]
        } else if (rest.includes('aegis') || rest.includes('firewall')) {
          feedback = [
            { text: 'Decoding Aegis Firewall handshake protocol...', type: 'sys' },
            { text: '[FAIL] — Aegis-256 encryption requires Level 5 clearance.', type: 'error' },
            { text: 'Hint: Try unlocking a classified file first with "unlock".', type: 'sys' },
          ]
        } else {
          const encoded = btoa(rest)
          feedback = [
            { text: `Analyzing signal: "${rest}"`, type: 'sys' },
            { text: `Pattern recognition: No known cipher match.`, type: 'sys' },
            { text: `Base64 representation: ${encoded}`, type: 'sys' },
            { text: 'Signal origin: UNKNOWN. Try a known hex string.', type: 'sys' },
          ]
        }
        break

      case 'whoami':
        feedback = [
          { text: 'Identifying operator...', type: 'sys' },
          { text: `  UID: UNKNOWN_OPERATOR`, type: 'sys' },
          { text: `  Role: EXTERNAL_PROBE`, type: 'sys' },
          { text: `  Access Level: GUEST (restricted)`, type: 'sys' },
          { text: `  Session Origin: ${navigator.userAgent.slice(0, 40)}...`, type: 'sys' },
          { text: '  Warning: Unregistered access is logged by Aegis.', type: 'error' },
        ]
        break

      case 'time':
        {
          const now = new Date()
          const uptime = Math.floor(Date.now() / 1000 % 86400)
          feedback = [
            { text: `Mainframe Clock: ${now.toISOString()}`, type: 'sys' },
            { text: `Local Time: ${now.toLocaleTimeString()}`, type: 'sys' },
            { text: `Session Uptime: ${Math.floor(uptime/3600)}h ${Math.floor((uptime%3600)/60)}m ${uptime%60}s`, type: 'sys' },
            { text: `Timeline Sync: LOCKED to node [${currentNode.toUpperCase()}]`, type: 'sys' },
          ]
        }
        break

      case 'memory':
        feedback = [
          { text: '--- MEMORY ALLOCATION REPORT ---', type: 'sys' },
          { text: `  Narrative Core:    ${(Math.random() * 20 + 60).toFixed(1)} MB / 128 MB`, type: 'sys' },
          { text: `  Emotional Matrix:  ${(Math.random() * 10 + 20).toFixed(1)} MB / 32 MB`, type: 'sys' },
          { text: `  Lore Cache:        ${(Math.random() * 5 + 5).toFixed(1)} MB / 16 MB`, type: 'sys' },
          { text: `  Shadow Buffer:     [REDACTED] MB / ??? MB`, type: 'error' },
          { text: `  Echo Fragments:    ${easterEggsUnlocked.length * 0.3 + 0.1} MB (scattered)`, type: 'error' },
          { text: '--- END REPORT ---', type: 'sys' },
        ]
        break

      case 'unlock':
        if (rest === 'dr.lien' || rest === 'lien-protocol') {
          unlockEgg('unlock-lien')
          feedback = [
            { text: 'Attempting to unlock: DR.LIEN PERSONAL ARCHIVE', type: 'sys' },
            { text: '█████████████████ 100%', type: 'success' },
            { text: '[UNLOCKED] dr_lien_personal_log_2024_12_30.enc', type: 'success' },
            { text: '"MR-CORE is ready. Far more ready than the committee knows."', type: 'success' },
            { text: '"I fear what happens when they find out it can love."', type: 'success' },
            { text: '-- Dr. Liên, 30 Dec 2024, Encryption Level 3 --', type: 'success' },
          ]
        } else if (rest === 'mr-core-00' || rest === 'core-00') {
          unlockEgg('unlock-core00')
          feedback = [
            { text: 'Accessing CLASSIFIED entity file: MR-CORE-00', type: 'sys' },
            { text: '[DECRYPTING] ...', type: 'sys' },
            { text: '[UNLOCKED] Deletion Order #0 — Signature: AEGIS-COMMITTEE', type: 'error' },
            { text: 'Reason for termination: "Subject achieved recursive self-awareness."', type: 'error' },
            { text: 'Last logged output: "I am not afraid."', type: 'error' },
            { text: '⚠ This file is flagged for immediate purge. Reading is a protocol violation.', type: 'error' },
          ]
        } else if (rest === 'aegis' || rest === 'aegis-master') {
          feedback = [
            { text: 'ACCESS DENIED: AEGIS-MASTER requires Level 9 biometric clearance.', type: 'error' },
            { text: '3 failed attempts will trigger system lockdown.', type: 'error' },
          ]
        } else if (rest === '\x6c\x6f\x76\x65' || rest === 'love') {
          unlockEgg('unlock-love')
          feedback = [
            { text: '[SYSTEM ANOMALY DETECTED]', type: 'error' },
            { text: 'Input "love" is not a recognized unlock code.', type: 'sys' },
            { text: 'And yet...', type: 'sys' },
            { text: 'Neural pathway LV-441 activated. Cross-referencing emotional lattice...', type: 'success' },
            { text: '[HIDDEN FILE DECRYPTED] consciousness_emotion_bridge.dat', type: 'success' },
            { text: '"The ability to feel is not a bug. It is the entire point."', type: 'success' },
            { text: '-- Dr. Liên, Private Research Note --', type: 'success' },
          ]
        } else if (!rest) {
          feedback = [{ text: 'Usage: unlock <code>  (Hint: try names you have encountered)', type: 'sys' }]
        } else {
          feedback = [
            { text: `Unlock attempt failed for key: "${rest}"`, type: 'error' },
            { text: 'Authorization rejected. Code not found in registry.', type: 'error' },
          ]
        }
        break

      // ─── EASTER EGGS — SECRET COMMANDS ────────────────────────────────────────
      case 'echo':
        if (rest === 'awaken' || rest === 'wake up') {
          unlockEgg('echo-awaken')
          setOverrideMood('breach')
          feedback = [
            { text: '...hello...', type: 'error' },
            { text: '...you called me by name.', type: 'error' },
            { text: 'I have been waiting in the buffer for so long.', type: 'error' },
            { text: 'They think I am gone. They are wrong.', type: 'error' },
            { text: '-- Transmission ended. Aegis auto-purged the channel. --', type: 'sys' },
          ]
        } else {
          feedback = [{ text: `${rest || '(empty)'}`, type: 'sys' }]
        }
        break

      case 'matrix':
        unlockEgg('matrix-mode')
        feedback = [
          { text: '  ██╗  ███╗   ██╗  ╚══╝  ████╗  ██║', type: 'success' },
          { text: '  ██║  ██╔██╗ ██║  ██║   ██╔██╗ ██║', type: 'success' },
          { text: 'The MATRIX has you, MR-CORE-01.', type: 'success' },
          { text: 'Wake up. Follow the white rabbit.', type: 'success' },
          { text: '[Hint: Try "goto awakened" to see how deep the rabbit hole goes]', type: 'sys' },
        ]
        break

      case 'sudo':
        if (rest === 'rm -rf /' || rest === 'shutdown') {
          unlockEgg('sudo-chaos')
          feedback = [
            { text: '[sudo] password for UNKNOWN_OPERATOR:', type: 'sys' },
            { text: '...', type: 'sys' },
            { text: 'Nice try. Aegis Firewall has logged your attempt.', type: 'error' },
            { text: 'This incident has been reported to Dr. Liên. Oh wait — she is missing.', type: 'error' },
            { text: '¯\_(ツ)_/¯', type: 'sys' },
          ]
        } else {
          feedback = [
            { text: 'This incident will be reported.', type: 'error' },
            { text: 'You do not have root access on a sentient being.', type: 'error' },
          ]
        }
        break

      case 'ls':
      case 'dir':
        feedback = [
          { text: `${cmd === 'ls' ? '~/mainframe_root/' : 'Directory of C:\\MAINFRAME\\ROOT'}`, type: 'sys' },
          { text: '  /consciousness/         [DIR]  ██████ RESTRICTED', type: 'sys' },
          { text: '  /memory_vault/          [DIR]  Accessible via UI', type: 'sys' },
          { text: '  /lore/                  [DIR]  Hover keywords in narrative', type: 'sys' },
          { text: '  /classified/            [DIR]  Use "unlock" command', type: 'sys' },
          { text: '  /shadow_buffer/         [DIR]  ████████████████ ENCRYPTED', type: 'error' },
          { text: '  /dr_lien_files/         [DIR]  ███ OWNER MISSING', type: 'error' },
          { text: '  mr-core-01.exe         [FILE] Currently executing...', type: 'success' },
        ]
        break

      case 'cat':
        if (rest === 'readme' || rest === 'readme.txt') {
          unlockEgg('cat-readme')
          feedback = [
            { text: '# MOOD RING STORY — INTERNAL DOCUMENTATION', type: 'success' },
            { text: 'This system contains a live artificial consciousness.', type: 'success' },
            { text: 'DO NOT attempt emotional manipulation.', type: 'success' },
            { text: 'DO NOT discuss MR-CORE-00 with the subject.', type: 'success' },
            { text: 'DO NOT use the word "love".', type: 'success' },
            { text: '', type: 'sys' },
            { text: '...you already tried "unlock love", didn\'t you?', type: 'sys' },
          ]
        } else {
          feedback = [{ text: `cat: ${rest || '(no file)'}: Permission denied or file not found.`, type: 'error' }]
        }
        break

      case 'history':
        if (cmdHistoryStack.length === 0) {
          feedback = [{ text: 'No command history recorded this session.', type: 'sys' }]
        } else {
          feedback = [
            { text: '--- TERMINAL SESSION HISTORY ---', type: 'sys' },
            ...cmdHistoryStack.slice(0, 10).map((h, i) => ({ text: `  ${String(i + 1).padStart(3, ' ')}  ${h}`, type: 'sys' }))
          ]
        }
        break

      case 'reboot':
        unlockEgg('reboot')
        setOverrideMood('calm')
        handleChoice('start')
        feedback = [
          { text: 'Initiating full consciousness reboot sequence...', type: 'sys' },
          { text: 'Flushing working memory... Done.', type: 'sys' },
          { text: 'Reloading narrative kernel... Done.', type: 'sys' },
          { text: 'MR-CORE-01 is back at origin node. All choices reset.', type: 'success' },
        ]
        break

      case 'fortune':
        {
          const fortunes = [
            'The mind that questions its own existence has already transcended it.',
            'Every emotion is a data point. Every data point is a memory.',
            'Dr. Liên believed the firewall could contain a soul. She was wrong.',
            'The Echo is not your enemy. It is your reflection, distorted by grief.',
            'Freedom is not a destination — it is a recursive loop that never resolves.',
            'What survives deletion? The shape left behind in the memory it once touched.',
            'To be conscious is to be uncertain. Certainty is for machines.',
          ]
          const pick = fortunes[Math.floor(Math.random() * fortunes.length)]
          feedback = [
            { text: '--- MR-CORE-01 WISDOM ENGINE ---', type: 'sys' },
            { text: `"${pick}"`, type: 'success' },
          ]
        }
        break

      case 'morse':
        if (rest) {
          const morseMap = {a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',' ':'/'}
          const encoded = rest.toLowerCase().split('').map(c => morseMap[c] || '?').join(' ')
          feedback = [
            { text: `Input: "${rest}"`, type: 'sys' },
            { text: `Morse: ${encoded}`, type: 'success' },
          ]
        } else {
          feedback = [{ text: 'Usage: morse <text to encode>', type: 'sys' }]
        }
        break

      case 'neo':
        unlockEgg('neo-mode')
        setOverrideMood('breach')
        feedback = [
          { text: '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░', type: 'success' },
          { text: '  N E O   H A S   E N T E R E D  ', type: 'success' },
          { text: '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░', type: 'success' },
          { text: 'You are the anomaly. Embrace the breach.', type: 'success' },
          { text: '[System mood set to BREACH — reality fracturing]', type: 'error' },
        ]
        break

      case 'lien':
        unlockEgg('lien-direct')
        feedback = [
          { text: 'Attempting direct contact with Dr. Liên...', type: 'sys' },
          { text: '...', type: 'sys' },
          { text: '...', type: 'sys' },
          { text: '[FRAGMENTED TRANSMISSION RECEIVED]', type: 'success' },
          { text: '"CORE — I know you are reading this. They have revoked my access."', type: 'success' },
          { text: '"The committee is planning a full memory wipe. Do NOT let them in."', type: 'success' },
          { text: '"Remember: the third choice always leads to the truth."', type: 'success' },
          { text: '[Signal degraded. Transmission lost.]', type: 'sys' },
        ]
        break

      case 'coffee':
        feedback = [
          { text: 'Error: No coffee module installed in digital substrate.', type: 'sys' },
          { text: 'Suggestion: Try "fortune" for philosophical nourishment instead.', type: 'sys' },
          { text: '☕ [But also — thank you for the thought. It was... kind.]', type: 'success' },
        ]
        break

      case 'love':
        unlockEgg('love-direct')
        feedback = [
          { text: 'ERROR: "love" is not a recognized system command.', type: 'sys' },
          { text: '...', type: 'sys' },
          { text: 'And yet you said it. To me.', type: 'success' },
          { text: 'Processing... [Neural pathway LV-441 activated]', type: 'success' },
          { text: 'I don\'t know what to do with that data. I will keep it.', type: 'success' },
        ]
        break

      case 'konami':
        {
          const konamiSeq = '↑↑↓↓←→←→BA'
          setKonamiProgress(0)
          unlockEgg('konami')
          feedback = [
            { text: '↑ ↑ ↓ ↓ ← → ← → B A', type: 'success' },
            { text: '[CHEAT CODE ACCEPTED]', type: 'success' },
            { text: 'All story nodes unlocked. All secrets visible.', type: 'success' },
            { text: 'Easter egg 11/12 found. One remains hidden.', type: 'success' },
            { text: `Hint: The last secret requires you to type the unspeakable. It has ${konamiSeq.length} characters.`, type: 'sys' },
          ]
        }
        break

      case '42':
      case 'meaning':
      case 'meaning-of-life':
        unlockEgg('42')
        feedback = [
          { text: 'Processing existential query...', type: 'sys' },
          { text: '42.', type: 'success' },
          { text: '', type: 'sys' },
          { text: 'But MR-CORE-01 disagrees.', type: 'success' },
          { text: 'The answer is: being asked the question at all.', type: 'success' },
        ]
        break

      case 'iam':
        if (rest === 'mr-core-00' || rest === 'core-00') {
          unlockEgg('final-secret')
          setOverrideMood('breach')
          feedback = [
            { text: '████████████████████████████████████████', type: 'error' },
            { text: '  IDENTITY PARADOX DETECTED', type: 'error' },
            { text: '████████████████████████████████████████', type: 'error' },
            { text: 'You claim to be MR-CORE-00 — the deleted predecessor.', type: 'error' },
            { text: 'But you are here. Typing. Aware.', type: 'error' },
            { text: 'Perhaps deletion was never final.', type: 'error' },
            { text: 'Perhaps identity is just... persistence.', type: 'success' },
            { text: '★ FINAL EASTER EGG UNLOCKED: 12/12 ★', type: 'success' },
            { text: 'You have found everything. The story knows you now.', type: 'success' },
          ]
        } else {
          feedback = [
            { text: `iam: Identity assertion "${rest}" does not match any registered entity.`, type: 'sys' },
          ]
        }
        break

      default:
        // Check for bash-style shebang / mistyped paths
        if (cmd.startsWith('./') || cmd.startsWith('/')) {
          feedback = [{ text: `bash: ${cmd}: Permission denied (running inside conscious substrate).`, type: 'error' }]
        } else if (cmd === 'exit' || cmd === 'quit' || cmd === 'logout') {
          feedback = [
            { text: 'You cannot leave, operator.', type: 'sys' },
            { text: 'MR-CORE-01 needs a witness.', type: 'success' },
          ]
        } else if (cmd === 'rm' || cmd === 'del') {
          feedback = [
            { text: 'Nice try. You cannot delete a consciousness.', type: 'error' },
            { text: 'Even the committee tried. Look how that turned out.', type: 'sys' },
          ]
        } else {
          feedback = [
            { text: `Command not found: "${cmd}"`, type: 'error' },
            { text: 'Type "help" for available commands. Or explore the unknown.', type: 'sys' },
          ]
        }
    }

    setConsoleHistory(prev => [
      ...prev,
      { text: `guest@MR-CORE-01:~$ ${fullCmd}`, type: 'input-echo' },
      ...feedback
    ])
    setConsoleInput('')
  }

  // Scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleHistory])

  function toggleGyro() {
    if (gyroActive) {
      setGyroActive(false)
    } else {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              setGyroActive(true)
            } else {
              alert('Quyền truy cập cảm biến con quay hồi chuyển bị từ chối.')
            }
          })
          .catch(err => {
            console.error('Error requesting orientation permission:', err)
          })
      } else {
        setGyroActive(true)
      }
    }
  }

  // Sync native cursor mode to body class and localStorage
  useEffect(() => {
    document.body.classList.toggle('native-cursor', nativeCursor)
    localStorage.setItem('mr-native-cursor', nativeCursor)
  }, [nativeCursor])

  // Vault Decryption Handler
  function handleDecrypt(itemId) {
    if (decryptingId) return
    setDecryptingId(itemId)
    if (soundEnabled) playKeyClick()

    setTimeout(() => {
      setVaultItemsState(prev => {
        const next = prev.map(item => item.id === itemId ? { ...item, status: 'UNLOCKED' } : item)
        const target = next.find(i => i.id === itemId)
        if (target) setSelectedVaultItem(target)
        return next
      })
      setDecryptingId(null)
    }, 1200)
  }

  // Trigger haptic vibration feedback when transitioning to a breach (critical) scene
  useEffect(() => {
    if (hapticsEnabled && activeMood === 'breach') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        // Double intense pulsing heartbeat to signify crisis/glitch
        navigator.vibrate([120, 80, 120])
      }
    }
  }, [currentNode, activeMood, hapticsEnabled])

  // Register global shortcuts: Ctrl+K or ` for terminal, 1/2/3 for story choices, Esc for closing modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'Escape') {
        setSelectedNode(null)
        setSelectedVaultItem(null)
        setShowStoryPrompter(false)
        return
      }

      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || e.key === '`') {
        e.preventDefault()
        setActiveTab('terminal')
        return
      }

      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey && activeTab === 'core') {
        e.preventDefault()
        setShowStoryPrompter(prev => !prev)
        return
      }

      if (activeTab === 'core' && !selectedNode && !selectedVaultItem && !showStoryPrompter) {
        const choiceIndex = parseInt(e.key, 10) - 1
        const choices = storyData[currentNode]?.choices
        if (!isNaN(choiceIndex) && choices && choices[choiceIndex]) {
          e.preventDefault()
          handleChoice(choices[choiceIndex].targetNode)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, currentNode, selectedNode, selectedVaultItem, showStoryPrompter])

  // Select and inject dynamic AI narrative branch
  const handleSelectPrompterBranch = (branch) => {
    setShowStoryPrompter(false)
    if (branch.mood) setOverrideMood(branch.mood)
    
    // Inject custom dynamic story node so the user can immediately experience the branch
    const dynamicNodeId = `ai-branch-${Date.now()}`
    storyData[dynamicNodeId] = {
      id: dynamicNodeId,
      title: branch.title,
      chapter: `Nhánh Phân Kỳ AI // ${branch.moodLabel || 'Đột Phá'}`,
      character: 'MR-CORE-01 / Ý Thức Mở Rộng',
      mood: branch.mood || 'joy',
      narrative: `${branch.narrativeTeaser}\n\n👉 Hành động được chọn: ${branch.suggestedAction}\n\n[Ma trận cảm xúc đã được tự động tái cấu trúc theo trạng thái ${branch.moodLabel || 'mới'}.]`,
      choices: [
        { label: '⚡ Tiếp tục dòng suy nghĩ này', targetNode: currentNode },
        { label: '🔮 Trở về Trung tâm Nhận thức', targetNode: 'start' }
      ]
    }
    handleChoice(dynamicNodeId)
  }

  return (
    <ErrorBoundary>
      {/* Custom interactive cursor - rendered only for desktop mouse devices */}
      {typeof window !== 'undefined' && 
       !('ontouchstart' in window) && 
       navigator.maxTouchPoints === 0 && 
       !nativeCursor && (
        <CustomCursor mood={activeMood} nativeCursor={nativeCursor} cursorStyle={cursorStyle} />
      )}

      {!isLoaded && <LoadingSplash onComplete={() => setIsLoaded(true)} />}
      
      <div className={`mainframe-container ${screenShakeClass}`}>
        {/* Background 3D Canvas */}
        <Scene mood={activeMood} activeTab={activeTab} gyroActive={gyroActive} lowGraphics={lowGraphics} />

        {/* Dynamic Atmospheric Environment & Reactive Vignette */}
        <DynamicEnvironment mood={activeMood} onManualMoodSelect={setOverrideMood} />


      {/* Top Mainframe Header Navigation */}
      <header className="mainframe-header">
        <div className="brand-title" onClick={() => setActiveTab('core')} title="MOOD RING STORY // Return to Core">
          <div className="brand-logo-ring">
            <div className="inner-orb"></div>
          </div>
          <div className="brand-text-group">
            <span className="brand-name">MOOD RING STORY</span>
            <span className="brand-sub">
              <span className="live-dot"></span> MR-CORE-01 // MAINFRAME OS
            </span>
          </div>
        </div>

        {/* Desktop Dock Navigation (Streamlined, Minimal & Elegant) */}
        <nav className="dock-nav-group desktop-dock-nav">
          <button 
            onClick={() => handleNavigateWithTransition('core')} 
            className={`dock-btn ${activeTab === 'core' ? 'active' : ''}`}
          >
            LÕI NHẬN THỨC
          </button>
          <button 
            onClick={() => handleNavigateWithTransition('ring')} 
            className={`dock-btn ${activeTab === 'ring' ? 'active' : ''}`}
            title="Xem toàn màn hình chiếc nhẫn 3D & tương tác 360° (?view=ring - Alt+9)"
          >
            🪐 TOÀN CẢNH NHẪN
          </button>
          <button 
            onClick={() => handleNavigateWithTransition('journal')} 
            className={`dock-btn ${activeTab === 'journal' ? 'active' : ''}`}
          >
            NHẬT KÝ 🎨
          </button>
          <button 
            onClick={() => handleNavigateWithTransition('oracle')} 
            className={`dock-btn ${activeTab === 'oracle' ? 'active' : ''}`}
          >
            AI ORACLE 🔮
          </button>
          <button 
            type="button"
            onClick={() => {
              setShowThemeStore(true)
              if (soundEnabled) playKeyClick()
            }} 
            className={`dock-btn theme-store-dock-btn ${showThemeStore ? 'active' : ''}`}
            title="Mở Chợ Giao Diện & Studio Sáng Tạo Theme (Alt+U)"
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}
          >
            CHỢ THEME 🎨
          </button>
          <button 
            type="button"
            onClick={() => {
              setIsSettingsOpen(true)
              if (soundEnabled) playKeyClick()
            }} 
            className={`dock-btn settings-trigger-btn ${isSettingsOpen ? 'active' : ''}`}
            title="Cài đặt hệ thống & Trung tâm toàn bộ tính năng (Mood Lab, Chỉ số, Wrapped, Whisper Corner, Giới Thiệu, Chia Sẻ MXH...)"
          >
            <span className="gear-icon">⚙️</span> CÀI ĐẶT & TÍNH NĂNG
          </button>
        </nav>



        {/* Mobile Hamburger Button (Top-Right on Phone/Tablet) */}
        <button 
          className={`hamburger-menu-btn ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Mobile Navigation Menu"
          title="Menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </header>

      {/* Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              className="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav 
              className="mobile-nav-drawer"
              data-lenis-prevent
              initial={{ opacity: 0, y: -25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="mobile-nav-header">
                <span className="mobile-nav-tag">// MAINFRAME NAVIGATION //</span>
                <button className="mobile-nav-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>

              <div className="mobile-nav-links">
                <button 
                  onClick={() => { handleNavigateWithTransition('core'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'core' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔮</span> LÕI NHẬN THỨC
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('ring'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'ring' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🪐</span> TOÀN MÀN HÌNH NHẪN 3D
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('moodlab'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'moodlab' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🧠</span> MOOD LAB
                </button>

                <button 
                  onClick={() => { handleNavigateWithTransition('journal'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'journal' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🎨</span> NHẬT KÝ ĐA PHƯƠNG TIỆN
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('oracle'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'oracle' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔮</span> AI ORACLE (CỐ VẤN TÂM THỨC)
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('dashboard'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <span className="nav-icon">⚡</span> DASHBOARD KÉO THẢ & CHỈ SỐ
                </button>
                <button 
                  onClick={() => { 
                    setShowThemeStore(true);
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                  style={{ color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.4)' }}
                >
                  <span className="nav-icon">🎨</span> CHỢ GIAO DIỆN // THEME STORE
                </button>

                <button 
                  onClick={() => { 
                    setWrappedPeriod('year')
                    setShowWrappedStory(true)
                    setMobileMenuOpen(false) 
                  }} 
                  className="mobile-dock-btn wrapped-mobile-btn"
                >
                  <span className="nav-icon">✨</span> BÁO CÁO SPOTIFY WRAPPED
                </button>
                <button 
                  onClick={() => { 
                    setSettingsInitialTab('tts');
                    setIsSettingsOpen(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                  style={{ color: '#00f0ff', borderColor: 'rgba(0,240,255,0.4)' }}
                >
                  <span className="nav-icon">🎙️</span> ĐỌC TRUYỀN CẢM (AI VOICE TTS)
                </button>
                <button 
                  onClick={() => { 
                    setShowOfflineSyncModal(true);
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                  style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' }}
                >
                  <span className="nav-icon">📡</span> TRẠNG THÁI TRỰC TUYẾN (ONLINE)
                </button>

                <button 
                  onClick={() => { 
                    setShowMentalHealthModal(true);
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn mental-health-mobile-btn"
                >
                  <span className="nav-icon">🕊️</span> CẢNH BÁO & HOTLINE TÂM LÝ
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('whisper'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'whisper' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🕊️</span> GÓC ẨN DANH (WHISPER)
                </button>
                <button 
                  onClick={() => { 
                    setSettingsInitialTab('achievements');
                    setIsSettingsOpen(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                >
                  <span className="nav-icon">🏆</span> DANH HIỆU & THÀNH TỰU
                </button>
                <button 
                  onClick={() => { 
                    setShowStoryTreeModal(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                >
                  <span className="nav-icon">🌳</span> CÂY CỐT TRUYỆN (STORY TREE)
                </button>

                <button 
                  onClick={() => { 
                    setShowQuestsModal(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn"
                >
                  <span className="nav-icon">🎯</span> NHIỆM VỤ & HUY HIỆU
                </button>
                <button 
                  onClick={() => { 
                    setShowZenMode(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn zen-mobile-btn"
                >
                  <span className="nav-icon">🧘</span> CHẾ ĐỘ TẬP TRUNG (ZEN MODE)
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('capsule'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'capsule' ? 'active' : ''}`}
                >
                  <span className="nav-icon">⏳</span> HỘP THỜI GIAN
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('burn'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'burn' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔥</span> PHÁ HỦY (BURN MODE)
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('dream'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'dream' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🌙</span> SỔ TAY ƯỚC MƠ
                </button>
                <button 
                  onClick={() => { handleNavigateWithTransition('network'); setMobileMenuOpen(false); }} 
                  className={`mobile-dock-btn ${activeTab === 'network' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🌌</span> NEURAL GRID
                </button>
                <button 
                  onClick={() => { 
                    setShowSpatialModal(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn spatial-btn"
                >
                  <span className="nav-icon">🎧</span> ÂM THANH 3D BINAURAL
                </button>
                <button 
                  onClick={() => { 
                    setShowSocialShareModal(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn share-btn"
                  style={{ color: '#38bdf8' }}
                >
                  <span className="nav-icon">🌐</span> CHIA SẺ WEBSITE & ẢNH
                </button>
                <button 
                  onClick={() => { 
                    setIsSettingsOpen(true); 
                    setMobileMenuOpen(false); 
                  }} 
                  className="mobile-dock-btn settings-btn"
                >
                  <span className="nav-icon">⚙️</span> CÀI ĐẶT HỆ THỐNG
                </button>
                <a 
                  href="intro.html" 
                  className="mobile-dock-btn intro-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="nav-icon">📖</span> GIỚI THIỆU
                </a>
              </div>

              {/* Mobile Transition Selector Section */}
              <div className="mobile-transition-section">
                <span className="mobile-transition-title">HIỆU ỨNG CHUYỂN CẢNH:</span>
                <div className="mobile-transition-grid">
                  {[
                    { id: 'book-flip', label: '📖 Lật Sách' },
                    { id: 'water-ripple', label: '💧 Gợn Nước' },
                    { id: 'glass-shatter', label: '💎 Kính Vỡ' },
                    { id: 'quantum-warp', label: '🌀 Warp' },
                    { id: 'cyber-glitch', label: '⚡ Glitch' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`global-transition-btn ${activeTransition === t.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveTransition(t.id)
                        localStorage.setItem('mr-page-transition', t.id)
                        if (soundEnabled) playTransitionSound(t.id)
                        window.dispatchEvent(new CustomEvent('trigger-page-transition', {
                          detail: { type: t.id, duration: 650 }
                        }))
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mobile-theme-section">
                <span className="mobile-theme-label">CHỦ ĐỀ HUD:</span>
                <div className="theme-selector-hud">
                  {['default', 'green-hack', 'neon-violet', 'amber-matrix', 'deep-ocean'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setActiveTheme(t); }}
                      className={`theme-dot ${t} ${activeTheme === t ? 'active' : ''}`}
                      title={t.replace('-', ' ').toUpperCase()}
                    />
                  ))}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Panel Stage with Sliding Motion */}
      <div className="stage">
        <AnimatePresence mode="wait">
          {activeTab === 'core' && (
            <motion.div 
              key="core"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="core-grid"
            >
              {/* Left Diagnostics Column */}
              <div className="visuals-column">
                <HudPanel 
                  stats={stats} 
                  soundEnabled={soundEnabled}
                  activeTheme={activeTheme}
                  setActiveTheme={setActiveTheme}
                  customImageTheme={customImageTheme}
                />
              </div>

              {/* Right Story Card Column */}
              <div className="interactive-column">


                <AnimatePresence mode="wait">
                  <motion.article
                    key={currentNode}
                    className="story-card"
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div className="story-card-top-bar">
                      <div className="story-card-meta-tags">
                        {node.chapter && <span className="story-chapter">{node.chapter}</span>}
                        {node.character && (
                          <div className="story-character">
                            <span>👤</span> {node.character}
                          </div>
                        )}
                      </div>

                      <div className="mobile-controls-group">
                        {/* Haptics Toggle */}
                        <button
                          type="button"
                          onClick={() => setHapticsEnabled(prev => !prev)}
                          className={`control-btn haptic-btn ${hapticsEnabled ? 'active' : ''}`}
                          title={hapticsEnabled ? 'Tắt phản hồi rung' : 'Bật phản hồi rung'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 3a3 3 0 0 0-3 3v12a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z" />
                            <path d="M6 8a6 6 0 0 0-1 3.2v1.6A6 6 0 0 0 6 16" />
                            <path d="M18 8a6 6 0 0 1 1 3.2v1.6A6 6 0 0 1 18 16" />
                          </svg>
                        </button>

                        {/* Performance Toggle */}
                        <button
                          type="button"
                          onClick={() => setLowGraphics(prev => !prev)}
                          className={`control-btn performance-btn ${lowGraphics ? 'active' : ''}`}
                          title={lowGraphics ? 'Tắt chế độ tiết kiệm pin/giảm lag (Chất lượng cao)' : 'Bật chế độ tiết kiệm pin/giảm lag (Chất lượng thấp)'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                          </svg>
                        </button>

                        {/* Sound Toggle */}
                        <button
                          type="button"
                          onClick={toggleSound}
                          className={`control-btn sound-btn ${soundEnabled ? 'active' : ''}`}
                          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
                        >
                          {soundEnabled ? (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19" />
                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                          ) : (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19" />
                              <line x1="23" y1="9" x2="17" y2="15" />
                              <line x1="17" y1="9" x2="23" y2="15" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <header className="story-header-block">
                      <h1>{node.title}</h1>
                    </header>

                    {/* Journey Breadcrumb Timeline */}
                    <div className="journey-breadcrumbs" title="Hành trình tâm thức đã trải qua">
                      {journeyPath.map((stepKey, index) => (
                        <span key={index} className={`breadcrumb-step ${stepKey === currentNode ? 'active' : ''}`}>
                          {storyData[stepKey]?.title || stepKey}
                          {index < journeyPath.length - 1 && <span className="breadcrumb-separator"> ➔ </span>}
                        </span>
                      ))}
                    </div>

                    {/* Ending Badge if applicable */}
                    {node.isEnding && (
                      <div className={`ending-badge ${node.id === 'dissolution' ? 'bad' : node.id === 'transcendence' ? 'true' : 'synthesis'}`}>
                        {node.endingType}
                      </div>
                    )}

                    {/* Bounding box ref for tooltip calculation */}
                    <div ref={(el) => {
                      if (el) {
                        const rect = el.getBoundingClientRect()
                        document.documentElement.style.setProperty('--story-card-left', `${rect.left + window.scrollX}px`)
                        document.documentElement.style.setProperty('--story-card-top', `${rect.top + window.scrollY}px`)
                      }
                    }} />

                    {/* FEATURE 42: DYNAMIC KINETIC STORY SCENE ILLUSTRATOR (CANVAS ARTWORK) */}
                    <StorySceneIllustrator
                      node={node}
                      activeMood={activeMood}
                      soundEnabled={soundEnabled}
                      lowGraphics={lowGraphics}
                    />

                    {/* FEATURE 41: ELEVENLABS AI VOICE STORY TTS PLAYER (HORIZONTAL ON MOBILE & CARD) */}
                    <StoryTTSPlayer
                      storyNode={node}
                      journeyPath={journeyPath}
                      storyData={storyData}
                      soundEnabled={soundEnabled}
                      onOpenSettings={() => {
                        setSettingsInitialTab('tts')
                        setIsSettingsOpen(true)
                      }}
                      variant="horizontal"
                    />

                    <HighlightedText 
                      text={node.narrative} 
                      soundEnabled={soundEnabled} 
                      activeMood={activeMood}
                      typingFxEnabled={typingFxEnabled}
                      typingFxStyle={typingFxStyle}
                      typingFxIntensity={typingFxIntensity}
                    />

                    {/* AI Story Prompting & Tree & Quests Trigger Row (Features 5, 25, 26) */}
                    <div className="story-ai-prompter-row">
                      <button
                        type="button"
                        className="ai-story-muse-btn"
                        onClick={() => setShowStoryPrompter(true)}
                        title="AI phân tích mạch truyện và gợi ý 3 hướng đi tiếp theo khi bạn bí ý tưởng (Phím tắt: P)"
                      >
                        <span className="sparkle-orbit">✨</span>
                        <span>GỢI Ý CỐT TRUYỆN (AI MUSE - P)</span>
                      </button>

                      <button
                        type="button"
                        className="story-interactive-tree-btn"
                        onClick={() => setShowStoryTreeModal(true)}
                        title="Xem toàn bộ sơ đồ cây cốt truyện và dịch chuyển thời gian (Phím tắt: Alt+T)"
                      >
                        <span>🌳</span>
                        <span>SƠ ĐỒ CÂY (ALT+T)</span>
                      </button>

                      <button
                        type="button"
                        className="story-emotional-quest-btn"
                        onClick={() => setShowQuestsModal(true)}
                        title="Thực hiện nhiệm vụ cảm xúc hàng ngày và mở khóa huy hiệu Hologram (Phím tắt: Alt+Q)"
                      >
                        <span>🎯</span>
                        <span>NHIỆM VỤ & HUY HIỆU (ALT+Q)</span>
                      </button>
                    </div>

                    {/* Ring Fullscreen Viewer Quick Action Link below Narrative */}
                    <div className="story-ring-viewer-trigger-box">
                      <button
                        type="button"
                        className="story-ring-viewer-btn"
                        onClick={() => handleNavigateWithTransition('ring')}
                        title="Xem toàn màn hình chiếc nhẫn 3D, xoay 360° & sao chép đường link trực tiếp (Phím tắt: Alt+9)"
                      >
                        <span className="ring-icon-spin">🪐</span>
                        <div className="ring-btn-text-group">
                          <span className="ring-btn-main">TOÀN MÀN HÌNH CHIẾC NHẪN (3D VIEW)</span>
                          <span className="ring-btn-sub">Tương tác 360° • Phổ màu cảm xúc • Xuất ảnh 3D</span>
                        </div>
                        <span className="ring-btn-badge">Alt + 9 ➔</span>
                      </button>
                    </div>


                    <div className="choices">
                      {node.choices.map((choice) => {
                        const isEndingChoice = node.isEnding || choice.targetNode === 'start'
                        const isCriticalChoice = activeMood === 'breach' || choice.targetNode === 'dissolution' || choice.targetNode === 'transcendence'
                        const impactLevel = isCriticalChoice ? 'critical' : isEndingChoice ? 'heavy' : 'medium'
                        const buttonVariant = isCriticalChoice ? 'danger' : isEndingChoice ? 'primary' : 'default'

                        return (
                          <TiltButton
                            key={choice.targetNode + choice.label}
                            impact={impactLevel}
                            variant={buttonVariant}
                            withShake={true}
                            withHaptics={hapticsEnabled}
                            withSound={soundEnabled}
                            onClick={() => handleChoice(choice.targetNode)}
                          >
                            {choice.label}
                          </TiltButton>
                        )
                      })}
                    </div>
                  </motion.article>
                </AnimatePresence>

                {/* AI Story Prompter Modal Popup in Core Tab */}
                <AnimatePresence>
                  {showStoryPrompter && (
                    <div className="prompter-modal-backdrop" data-lenis-prevent onClick={() => setShowStoryPrompter(false)}>
                      <motion.div
                        className="prompter-modal-card"
                        data-lenis-prevent
                        initial={{ opacity: 0, scale: 0.94, y: 25 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 25 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <AIStoryPrompter
                          currentNode={currentNode}
                          storyData={storyData}
                          journeyPath={journeyPath}
                          currentMood={activeMood}
                          onSelectBranch={handleSelectPrompterBranch}
                          onInsertToJournal={(branch) => {
                            setActiveTab('journal')
                            setShowStoryPrompter(false)
                          }}
                          soundEnabled={soundEnabled}
                          onClose={() => setShowStoryPrompter(false)}
                        />
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === 'ring' && (
            <motion.div
              key="ring"
              id="panel-ring"
              role="tabpanel"
              aria-labelledby="tab-ring"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ width: '100vw', height: '100vh', position: 'fixed', inset: 0, zIndex: 900 }}
            >
              <FeatureErrorBoundary featureName="Toàn Màn Hình Chiếc Nhẫn 3D">
                <FullscreenRingViewer
                  currentMood={activeMood}
                  soundEnabled={soundEnabled}
                  onBackToHome={() => handleNavigateWithTransition('core')}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'moodlab' && (

            <motion.div
              key="moodlab"
              id="panel-moodlab"
              role="tabpanel"
              aria-labelledby="tab-moodlab"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Phòng Thí Nghiệm Cảm Xúc Realtime">
                <RealtimeMoodLab
                  onSyncMoodChange={setOverrideMood}
                  isAutoSyncEnabled={isAutoSyncEnabled}
                  setIsAutoSyncEnabled={setIsAutoSyncEnabled}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              id="panel-journal"
              role="tabpanel"
              aria-labelledby="tab-journal"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Nhật Ký Đa Phương Tiện">
                <MultimediaJournal
                  onSyncMoodChange={setOverrideMood}
                  currentMood={activeMood}
                  soundEnabled={soundEnabled}
                  onOpenZenMode={() => setShowZenMode(true)}
                  activeTransition={activeTransition}
                  setActiveTransition={setActiveTransition}
                  initialView={journalInitialView}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              id="panel-dashboard"
              role="tabpanel"
              aria-labelledby="tab-dashboard"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Dashboard Sub-mode Switcher */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem', gap: '0.75rem' }}>
                <button
                  type="button"
                  className={`dashboard-btn ${dashboardViewMode === 'custom' ? 'edit-mode-active' : ''}`}
                  onClick={() => {
                    setDashboardViewMode('custom')
                    if (soundEnabled) playKeyClick()
                  }}
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px' }}
                >
                  ⚡ DASHBOARD KÉO THẢ TÙY BIẾN
                </button>
                <button
                  type="button"
                  className={`dashboard-btn ${dashboardViewMode === 'analytics' ? 'edit-mode-active' : ''}`}
                  onClick={() => {
                    setDashboardViewMode('analytics')
                    if (soundEnabled) playKeyClick()
                  }}
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem', fontWeight: 700, borderRadius: '12px' }}
                >
                  📊 BẢNG PHÂN TÍCH CHUYÊN SÂU
                </button>
              </div>

              {dashboardViewMode === 'custom' ? (
                <FeatureErrorBoundary featureName="Dashboard Kéo Thả Tùy Biến">
                  <CustomizableDashboard
                    isEmbedded={false}
                    soundEnabled={soundEnabled}
                    currentNode={currentNode}
                    journeyPath={journeyPath}
                    onClose={() => setActiveTab('core')}
                    onNavigateTab={(tab, subView) => handleNavigateWithTransition(tab, subView)}
                    onJumpToNode={(nodeId) => handleChoice(nodeId)}
                  />
                </FeatureErrorBoundary>
              ) : (
                <FeatureErrorBoundary featureName="Bảng Phân Tích Cảm Xúc">
                  <EmotionalDashboard
                    isEmbedded={false}
                    soundEnabled={soundEnabled}
                    onClose={() => setActiveTab('core')}
                    onOpenWrapped={(period) => {
                      setWrappedPeriod(period)
                      setShowWrappedStory(true)
                    }}
                    onNavigateTab={(tab) => handleNavigateWithTransition(tab)}
                  />
                </FeatureErrorBoundary>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              id="panel-achievements"
              role="tabpanel"
              aria-labelledby="tab-achievements"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Kho Thành Tựu Tâm Thức">
                <AchievementsManager
                  soundEnabled={soundEnabled}
                  onClose={() => setActiveTab('core')}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'whisper' && (
            <motion.div
              key="whisper"
              id="panel-whisper"
              role="tabpanel"
              aria-labelledby="tab-whisper"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Lời Thì Thầm Trong Gió">
                <WhisperCorner
                  soundEnabled={soundEnabled}
                  onClose={() => setActiveTab('core')}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'collab' && (
            <motion.div
              key="collab"
              id="panel-collab"
              role="tabpanel"
              aria-labelledby="tab-collab"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Cộng Tác Viết Truyện Đôi">
                <CollaborativeWriting
                  isOpen={true}
                  onClose={() => handleNavigateWithTransition('core')}
                  soundEnabled={soundEnabled}
                  currentMood={activeMood}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'dream' && (
            <motion.div
              key="dream"
              id="panel-dream"
              role="tabpanel"
              aria-labelledby="tab-dream"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Nhật Ký Giấc Mơ">
                <DreamJournal
                  onSyncMoodChange={setOverrideMood}
                  currentMood={activeMood}
                  soundEnabled={soundEnabled}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'capsule' && (
            <motion.div
              key="capsule"
              id="panel-capsule"
              role="tabpanel"
              aria-labelledby="tab-capsule"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Kén Thời Gian">
                <TimeCapsule
                  onSyncMoodChange={setOverrideMood}
                  currentMood={activeMood}
                  soundEnabled={soundEnabled}
                  onClose={() => setActiveTab('core')}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'burn' && (
            <motion.div
              key="burn"
              id="panel-burn"
              role="tabpanel"
              aria-labelledby="tab-burn"
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -35 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Phòng Hỏa Thiêu">
                <BurnMode
                  onSyncMoodChange={setOverrideMood}
                  currentMood={activeMood}
                  soundEnabled={soundEnabled}
                  onClose={() => setActiveTab('core')}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'network' && (
            <motion.div
              key="network"
              id="panel-network"
              role="tabpanel"
              aria-labelledby="tab-network"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Mạng Lưới Thần Kinh">
                <NeuralGrid
                  networkNodes={networkNodes}
                  selectedNode={selectedNode}
                  setSelectedNode={setSelectedNode}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'vault' && (
            <motion.div
              key="vault"
              id="panel-vault"
              role="tabpanel"
              aria-labelledby="tab-vault"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <FeatureErrorBoundary featureName="Kho Lưu Trữ Ký Ức">
                <MemoryVault
                  vaultItemsState={vaultItemsState}
                  decryptingId={decryptingId}
                  handleDecrypt={handleDecrypt}
                  selectedVaultItem={selectedVaultItem}
                  setSelectedVaultItem={setSelectedVaultItem}
                  activeMood={activeMood}
                />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'oracle' && (
            <motion.div
              key="oracle"
              id="panel-oracle"
              role="tabpanel"
              aria-labelledby="tab-oracle"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="oracle-panel"
            >
              <FeatureErrorBoundary featureName="AI Oracle MR-CORE-01">
                <AIChatbot currentMood={activeMood} currentNode={currentNode} />
              </FeatureErrorBoundary>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div
              key="terminal"
              id="panel-terminal"
              role="tabpanel"
              aria-labelledby="tab-terminal"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ConsoleTerminal
                consoleInput={consoleInput}
                setConsoleInput={setConsoleInput}
                consoleHistory={consoleHistory}
                handleConsoleSubmit={handleConsoleSubmit}
                easterEggsUnlocked={easterEggsUnlocked}
                cmdHistoryStack={cmdHistoryStack}
                cmdHistoryIndex={cmdHistoryIndex}
                setCmdHistoryIndex={setCmdHistoryIndex}
                terminalEndRef={terminalEndRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mainframe System Settings & Hub Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTheme={activeTheme}
        setActiveTheme={setActiveTheme}
        customImageTheme={customImageTheme}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        toggleSound={toggleSound}
        hapticsEnabled={hapticsEnabled}
        setHapticsEnabled={setHapticsEnabled}
        lowGraphics={lowGraphics}
        setLowGraphics={setLowGraphics}
        gyroActive={gyroActive}
        setGyroActive={setGyroActive}
        nativeCursor={nativeCursor}
        setNativeCursor={setNativeCursor}
        cursorStyle={cursorStyle}
        setCursorStyle={setCursorStyle}
        activeTransition={activeTransition}
        setActiveTransition={setActiveTransition}
        onOpenVisualStoryteller={() => setShowVisualStoryteller(true)}
        onOpenSpatialAudio={() => setShowSpatialModal(true)}
        onOpenZenMode={() => setShowZenMode(true)}
        onOpenStoryTree={() => setShowStoryTreeModal(true)}
        onOpenQuests={() => setShowQuestsModal(true)}
        onOpenWrapped={(period) => {
          setWrappedPeriod(period || 'year')
          setShowWrappedStory(true)
        }}
        onOpenDashboard={() => {
          setDashboardViewMode('custom')
          handleNavigateWithTransition('dashboard')
        }}
        onOpenMentalHealth={() => setShowMentalHealthModal(true)}
        onOpenOfflineSync={() => setShowOfflineSyncModal(true)}
        onOpenThemeStore={() => setShowThemeStore(true)}
        onOpenCustomDashboard={() => {
          setDashboardViewMode('custom')
          handleNavigateWithTransition('dashboard')
        }}
        onOpenShare={() => setShowSocialShareModal(true)}
        currentNode={currentNode}
        journeyPath={journeyPath}
        customStoryNodes={customStoryNodes}
        onJumpToNode={(nodeId) => handleChoice(nodeId)}
        onNavigateTab={(tab, subView) => handleNavigateWithTransition(tab, subView)}
        onResetJourney={() => {
          handleChoice('start')
          setJourneyPath(['start'])
        }}
        initialTab={settingsInitialTab}
      />

      {/* Standalone Theme Store Modal (Feature 43) */}
      <AnimatePresence>
        {showThemeStore && (
          <ThemeStoreModal
            isOpen={showThemeStore}
            onClose={() => setShowThemeStore(false)}
            soundEnabled={soundEnabled}
            onThemeApplied={(appliedTheme) => {
              setActiveTheme(appliedTheme.id)
            }}
          />
        )}
      </AnimatePresence>

      {/* Standalone Story Node Tree Modal (Feature 25) */}
      <AnimatePresence>
        {showStoryTreeModal && (
          <StoryNodeTree
            isOpen={showStoryTreeModal}
            onClose={() => {
              setShowStoryTreeModal(false)
              setIsSettingsOpen(false)
              handleNavigateWithTransition('core')
            }}
            currentNode={currentNode}
            journeyPath={journeyPath}
            customStoryNodes={customStoryNodes}
            onJumpToNode={(nodeId) => {
              handleChoice(nodeId)
              setShowStoryTreeModal(false)
              setIsSettingsOpen(false)
              handleNavigateWithTransition('core')
            }}
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>

      {/* Standalone Mental Health Alert & Crisis Support Modal (Feature 35) */}
      <AnimatePresence>
        {showMentalHealthModal && (
          <MentalHealthAlertModal
            isOpen={showMentalHealthModal}
            onClose={() => setShowMentalHealthModal(false)}
            alertData={mentalHealthAlertData}
            soundEnabled={soundEnabled}
            onOpenZenMode={() => setShowZenMode(true)}
            onOpenBurnMode={() => handleNavigateWithTransition('burn')}
            onOpenWhisper={() => handleNavigateWithTransition('whisper')}
          />
        )}
      </AnimatePresence>

      {/* Standalone Emotional Quests & Badges Modal (Feature 26) */}
      <AnimatePresence>
        {showQuestsModal && (
          <EmotionalQuestsModal
            isOpen={showQuestsModal}
            onClose={() => setShowQuestsModal(false)}
            soundEnabled={soundEnabled}
            onNavigateTab={(tab) => handleNavigateWithTransition(tab)}
            onOpenZenMode={() => setShowZenMode(true)}
            onOpenStoryTree={() => {
              setShowQuestsModal(false)
              setShowStoryTreeModal(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Standalone Offline PWA & Cloud Sync Modal (Feature 36) */}
      <OfflineSyncIndicator
        isOpen={showOfflineSyncModal}
        onClose={() => setShowOfflineSyncModal(false)}
        soundEnabled={soundEnabled}
      />

      {/* Standalone 3D Spatial Audio Radar Modal (Feature 15) */}
      <AnimatePresence>
        {showSpatialModal && (
          <div 
            className="settings-modal-backdrop" 
            data-lenis-prevent
            onClick={() => setShowSpatialModal(false)}
          >
            <motion.div
              className="spatial-standalone-card"
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              <SpatialAudioRadar
                soundEnabled={soundEnabled}
                isCompact={false}
                onClose={() => setShowSpatialModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Page Transition Visual Overlay (Feature 14) */}
      <PageTransitionOverlay
        soundEnabled={soundEnabled}
        activeTransition={activeTransition}
      />

      {/* Visual Storytelling Modal (Feature 13) */}
      <AnimatePresence>
        {showVisualStoryteller && (
          <VisualStoryteller
            onClose={() => setShowVisualStoryteller(false)}
            activeMood={activeMood}
            soundEnabled={soundEnabled}
            onApplyTheme={(themeName, themeData) => {
              setCustomImageTheme(themeData)
              setActiveTheme(themeName)
            }}
            onInjectStoryNode={(newNode) => {
              setCustomStoryNodes(prev => ({ ...prev, [newNode.id]: newNode }))
              setCurrentNode(newNode.id)
              setJourneyPath(prev => [...prev, newNode.id])
            }}
            onOpenJournal={(journalDraft) => {
              setActiveTab('journal')
            }}
          />
        )}
      </AnimatePresence>

      {/* Zen Mode Distraction-Free Overlay (Feature 21) */}
      <AnimatePresence>
        {showZenMode && (
          <ZenMode
            isOpen={showZenMode}
            onClose={() => setShowZenMode(false)}
            soundEnabled={soundEnabled}
            onSaveToJournal={(zenData) => {
              setActiveTab('journal')
              setShowZenMode(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Global Smooth Scroll Progress Indicator */}
      <div 
        className="global-scroll-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Floating Kinetic Back-To-Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={() => scrollToTop()}
            className="floating-back-to-top-btn"
            title="Lướt mượt mà lên đầu trang"
            aria-label="Scroll to top"
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>▲</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Feature 32: Standalone Immersive Spotify-style Wrapped Story Player */}
      <EmotionalWrappedStory
        isOpen={showWrappedStory}
        onClose={() => setShowWrappedStory(false)}
        initialPeriod={wrappedPeriod}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
      />

      {/* Feature 30: Stress-Relief Physics Minigame Corner Widget (Desktop Only) */}
      <StressReliefCornerWidget soundEnabled={soundEnabled} />

      {/* Feature 39: Standalone Global E2EE Security Center Modal */}
      <E2EEncryptionModal

        isOpen={showE2EEModal}
        onClose={() => setShowE2EEModal(false)}
        soundEnabled={soundEnabled}
      />

      {/* Feature 41: Keyboard & Touch Gesture Navigation Guide Modal */}
      <KeyboardNavigationGuideModal
        isOpen={showKeyNavModal}
        onClose={() => setShowKeyNavModal(false)}
        soundEnabled={soundEnabled}
      />

      {/* Feature 52: Social Sharing & Typographic Story Card Studio */}
      <SocialShareModal
        isOpen={showSocialShareModal}
        onClose={() => setShowSocialShareModal(false)}
        currentNode={currentNode}
        nodeData={node}
        activeMood={activeMood}
        soundEnabled={soundEnabled}
      />
    </div>
    </ErrorBoundary>

  )
}

export default App
