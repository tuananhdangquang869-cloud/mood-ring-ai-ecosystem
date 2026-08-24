import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Compass, 
  X, 
  Layers, 
  ArrowUpToLine, 
  ArrowDownToLine, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react'
import { scrollToTop, scrollToBottom, scrollByAmount } from '../utils/smoothScroll.js'
import { playKeyClick } from '../utils/audioSynth.js'

export const NAV_TABS = [
  { id: 'core', label: 'Lõi Nhận Thức', short: 'LÕI', icon: '🔮' },
  { id: 'journal', label: 'Nhật Ký', short: 'NHẬT KÝ', icon: '🎨' },
  { id: 'oracle', label: 'AI Oracle', short: 'ORACLE', icon: '✨' },
  { id: 'moodlab', label: 'Mood Lab', short: 'LAB', icon: '🧠' },
  { id: 'dashboard', label: 'Chỉ Số', short: 'CHỈ SỐ', icon: '📊' },
  { id: 'whisper', label: 'Góc Ẩn Danh', short: 'WHISPER', icon: '🕊️' },
  { id: 'capsule', label: 'Hộp Thời Gian', short: 'CAPSULE', icon: '⏳' },
  { id: 'burn', label: 'Phá Hủy', short: 'BURN', icon: '🔥' },
  { id: 'dream', label: 'Sổ Ước Mơ', short: 'DREAM', icon: '🌙' },
  { id: 'network', label: 'Mạng Lưới', short: 'MẠNG', icon: '🌐' }
]

export default function DirectionalNavigator({
  activeTab = 'core',
  onNavigateTab = () => {},
  soundEnabled = true
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQuickStrip, setShowQuickStrip] = useState(false)
  const [pressAction, setPressAction] = useState(null)
  const longPressTimerRef = useRef(null)

  // Current tab index
  const currentIndex = NAV_TABS.findIndex((t) => t.id === activeTab)
  const currentTabInfo = NAV_TABS[currentIndex >= 0 ? currentIndex : 0]

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(15) } catch {}
    }
  }

  // Go to previous tab (Trái)
  const handlePrevTab = () => {
    if (soundEnabled) playKeyClick()
    triggerHaptic()
    const prevIndex = (currentIndex - 1 + NAV_TABS.length) % NAV_TABS.length
    onNavigateTab(NAV_TABS[prevIndex].id)
  }

  // Go to next tab (Phải)
  const handleNextTab = () => {
    if (soundEnabled) playKeyClick()
    triggerHaptic()
    const nextIndex = (currentIndex + 1) % NAV_TABS.length
    onNavigateTab(NAV_TABS[nextIndex].id)
  }

  // Scroll Up (Lên)
  const handleScrollUp = (full = false) => {
    if (soundEnabled) playKeyClick()
    triggerHaptic()
    if (full) {
      scrollToTop()
    } else {
      scrollByAmount(-450, 0)
    }
  }

  // Scroll Down (Xuống)
  const handleScrollDown = (full = false) => {
    if (soundEnabled) playKeyClick()
    triggerHaptic()
    if (full) {
      scrollToBottom()
    } else {
      scrollByAmount(450, 0)
    }
  }

  // Keyboard shortcut listener for 4 directions
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return
      }

      if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevTab()
      } else if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextTab()
      } else if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault()
        handleScrollUp(true)
      } else if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault()
        handleScrollDown(true)
      }
    }

    const handleOpenNav = () => setIsExpanded(true)
    window.addEventListener('open-directional-nav', handleOpenNav)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('open-directional-nav', handleOpenNav)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentIndex, soundEnabled])

  return (
    <div className={`directional-navigator-root ${isExpanded ? 'is-expanded' : ''}`}>
      {/* Minimized Floating Pill when closed */}
      {!isExpanded && (
        <motion.button
          type="button"
          className="dpad-minimized-pill"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => {
            setIsExpanded(true)
            if (soundEnabled) playKeyClick()
          }}
          title="Mở thanh điều khiển 4 hướng Lên - Xuống - Trái - Phải"
        >
          <Compass size={14} className="compass-icon" />
          <span>ĐIỀU HƯỚNG</span>
          <span className="active-tab-tag">{currentTabInfo.icon} {currentTabInfo.short}</span>
        </motion.button>
      )}

      {/* Expanded D-Pad Controller */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="dpad-container"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            {/* Header with Title and Minimize */}
            <div className="dpad-header-bar">
              <span className="dpad-title-label">
                <Compass size={13} />
                <span>ĐIỀU HƯỚNG 4 CHIỀU</span>
              </span>
              <button
                type="button"
                className="dpad-toggle-close-btn"
                onClick={() => {
                  setIsExpanded(false)
                  if (soundEnabled) playKeyClick()
                }}
                title="Thu gọn"
              >
                ✕
              </button>
            </div>

            {/* Quick Strip Tabs Bar (if opened) */}
            <AnimatePresence>
              {showQuickStrip && (
                <motion.div
                  className="dpad-quick-tabs-strip scroll-x-auto"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {NAV_TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`quick-tab-chip ${activeTab === t.id ? 'active' : ''}`}
                      onClick={() => {
                        onNavigateTab(t.id)
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.short}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 4-Way Cross D-Pad */}
            <div className="dpad-cross-grid">
              {/* UP BUTTON (LÊN) */}
              <button
                type="button"
                className="dpad-btn dpad-up"
                onClick={() => handleScrollUp(false)}
                onDoubleClick={() => handleScrollUp(true)}
                title="LÊN // Cuộn lên trên (Nháy đúp: Lên đầu trang)"
                aria-label="Cuộn lên"
              >
                <ChevronUp size={18} />
                <span className="dpad-subtext">LÊN</span>
              </button>

              {/* LEFT BUTTON (TRÁI) */}
              <button
                type="button"
                className="dpad-btn dpad-left"
                onClick={handlePrevTab}
                title="TRÁI // Chuyển sang phần trước (Shift + ←)"
                aria-label="Tính năng trước"
              >
                <ChevronLeft size={18} />
                <span className="dpad-subtext">TRÁI</span>
              </button>

              {/* CENTER BUTTON (TÂM / QUICK MENU) */}
              <button
                type="button"
                className="dpad-btn dpad-center"
                onClick={() => {
                  setShowQuickStrip(!showQuickStrip)
                  if (soundEnabled) playKeyClick()
                }}
                title={`Đang ở: ${currentTabInfo.label} // Nhấn để chọn nhanh tính năng`}
                aria-label="Chọn nhanh tính năng"
              >
                <span className="dpad-icon">{currentTabInfo.icon}</span>
                <span className="dpad-subtext">{currentTabInfo.short}</span>
              </button>

              {/* RIGHT BUTTON (PHẢI) */}
              <button
                type="button"
                className="dpad-btn dpad-right"
                onClick={handleNextTab}
                title="PHẢI // Chuyển sang phần kế tiếp (Shift + →)"
                aria-label="Tính năng tiếp theo"
              >
                <ChevronRight size={18} />
                <span className="dpad-subtext">PHẢI</span>
              </button>

              {/* DOWN BUTTON (XUỐNG) */}
              <button
                type="button"
                className="dpad-btn dpad-down"
                onClick={() => handleScrollDown(false)}
                onDoubleClick={() => handleScrollDown(true)}
                title="XUỐNG // Cuộn xuống dưới (Nháy đúp: Xuống đáy trang)"
                aria-label="Cuộn xuống"
              >
                <ChevronDown size={18} />
                <span className="dpad-subtext">XUỐNG</span>
              </button>
            </div>

            {/* Helper Hint Footer */}
            <div className="dpad-hint-footer">
              Shift + Mũi tên: Điều hướng nhanh
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
