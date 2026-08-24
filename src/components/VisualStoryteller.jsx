import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Palette,
  Check,
  Copy,
  BookOpen,
  Edit3,
  RefreshCw,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  Sun,
  X
} from 'lucide-react'
import {
  extractPaletteFromImage,
  applyCustomThemeToDocument,
  generateVisualStoryHook,
  hexToRgb
} from '../utils/paletteExtractor.js'
import { playKeyClick, playSynthTone } from '../utils/audioSynth.js'

// High-fidelity embedded artistic preset canvases
const PRESET_ARTWORKS = [
  {
    id: 'cyber-tokyo',
    name: 'Cyberpunk Metropolis 2099',
    category: 'Cyberpunk',
    mood: 'transcendence',
    accent: '#00f0ff',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    desc: 'Thành phố tương lai rực rỡ ánh đèn neon xanh tím phản chiếu trên mặt đường ướt mưa.'
  },
  {
    id: 'crimson-nexus',
    name: 'Crimson Core Breach',
    category: 'Intense',
    mood: 'breach',
    accent: '#ff003c',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    desc: 'Lõi năng lượng rực lửa cảnh báo quá tải với xung động điện từ đỏ thẫm.'
  },
  {
    id: 'golden-solitude',
    name: 'Hoàng Hôn Cát Vàng',
    category: 'Warmth',
    mood: 'joy',
    accent: '#fbbf24',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    desc: 'Bình minh và hoàng hôn chan hòa năng lượng ấm áp, mở ra chân trời mới.'
  },
  {
    id: 'mystic-forest',
    name: 'Rừng Sinh Thái Neon',
    category: 'Nature Synth',
    mood: 'serenity',
    accent: '#10b981',
    url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=600&q=80',
    desc: 'Khu rừng nguyên sinh công nghệ với thảm thực vật phát quang lục bảo chữa lành.'
  },
  {
    id: 'deep-cosmos',
    name: 'Hải Trình Tinh Vân',
    category: 'Cosmic',
    mood: 'calm',
    accent: '#38bdf8',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    desc: 'Chiều sâu vô tận của vũ trụ và các vì sao xanh lam huyền ảo bao la.'
  }
]

export default function VisualStoryteller({
  onClose,
  activeMood,
  soundEnabled,
  onApplyTheme,
  onInjectStoryNode,
  onOpenJournal
}) {
  const [selectedImage, setSelectedImage] = useState(PRESET_ARTWORKS[0].url)
  const [selectedImageName, setSelectedImageName] = useState(PRESET_ARTWORKS[0].name)
  const [extractedTheme, setExtractedTheme] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [storyHook, setStoryHook] = useState(null)
  const [copiedCss, setCopiedCss] = useState(false)
  const [appliedNotification, setAppliedNotification] = useState(false)
  const [activeSwatchIndex, setActiveSwatchIndex] = useState(0)

  const fileInputRef = useRef(null)

  // Process image on selection change
  useEffect(() => {
    let isCancelled = false
    setIsProcessing(true)

    extractPaletteFromImage(selectedImage, 6)
      .then((themeData) => {
        if (isCancelled) return
        setExtractedTheme(themeData)
        const hook = generateVisualStoryHook(themeData, selectedImageName)
        setStoryHook(hook)
        setIsProcessing(false)
        setActiveSwatchIndex(0)
      })
      .catch((err) => {
        if (isCancelled) return
        console.warn('[VisualStoryteller] Error extracting palette:', err)
        setIsProcessing(false)
      })

    return () => {
      isCancelled = true
    }
  }, [selectedImage, selectedImageName])

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WebP, SVG).')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setSelectedImage(event.target.result)
      setSelectedImageName(file.name.replace(/\.[^/.]+$/, ''))
      if (soundEnabled) playSynthTone(580, 'sine', 0.15)
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setSelectedImage(event.target.result)
        setSelectedImageName(file.name.replace(/\.[^/.]+$/, ''))
        if (soundEnabled) playSynthTone(580, 'sine', 0.15)
      }
      reader.readAsDataURL(file)
    }
  }

  // Apply as system theme
  const handleApplyAsTheme = (customOverrideAccent = null) => {
    if (!extractedTheme) return

    let finalTheme = extractedTheme
    if (customOverrideAccent) {
      const { r, g, b } = hexToRgb(customOverrideAccent)
      finalTheme = {
        ...extractedTheme,
        dominantAccent: customOverrideAccent,
        accentRgb: `${r}, ${g}, ${b}`,
        borderColor: `rgba(${r}, ${g}, ${b}, 0.45)`,
        borderGlow: `rgba(${r}, ${g}, ${b}, 0.22)`,
        btnBg: `rgba(${r}, ${g}, ${b}, 0.12)`,
        btnHoverBg: `rgba(${r}, ${g}, ${b}, 0.28)`
      }
    }

    applyCustomThemeToDocument(finalTheme)
    if (onApplyTheme) onApplyTheme('custom-image', finalTheme)

    setAppliedNotification(true)
    setTimeout(() => setAppliedNotification(false), 2400)

    if (soundEnabled) {
      playSynthTone(523.25, 'triangle', 0.2, 0.2)
      setTimeout(() => playSynthTone(659.25, 'sine', 0.3, 0.2), 120)
    }
  }

  // Copy CSS Variables to clipboard
  const handleCopyCss = () => {
    if (!extractedTheme) return
    const cssText = `
:root[data-theme="custom-image"] {
  --accent: ${extractedTheme.dominantAccent};
  --accent-rgb: ${extractedTheme.accentRgb};
  --bg-main: ${extractedTheme.darkBg};
  --card-bg: ${extractedTheme.cardBg};
  --border-color: ${extractedTheme.borderColor};
  --border-glow: ${extractedTheme.borderGlow};
  --btn-bg: ${extractedTheme.btnBg};
  --btn-hover-bg: ${extractedTheme.btnHoverBg};
  --text-primary: #f8fafc;
  --text-secondary: rgba(248, 250, 252, 0.75);
}
    `.trim()

    navigator.clipboard.writeText(cssText)
    setCopiedCss(true)
    setTimeout(() => setCopiedCss(false), 2000)
    if (soundEnabled) playKeyClick()
  }

  // Insert generated story into current journey
  const handleInjectIntoJourney = () => {
    if (!storyHook) return
    if (onInjectStoryNode) {
      onInjectStoryNode({
        id: `visual_story_${Date.now()}`,
        title: `KÝ ỨC THỊ GIÁC: ${storyHook.title}`,
        narrative: `${storyHook.prompt}\n\n[Trích xuất từ hình ảnh: ${storyHook.imageName} - Bảng màu chủ đạo: ${storyHook.accent}]`,
        mood: storyHook.mood,
        choices: [
          { text: 'Tiếp tục khám phá tín hiệu bí ẩn ➔', target: 'start' }
        ]
      })
    }
    if (soundEnabled) playSynthTone(440, 'triangle', 0.2)
    if (onClose) onClose()
  }

  return (
    <div className="visual-storyteller-modal-overlay">
      <motion.div
        className="visual-storyteller-container"
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      >
        {/* Header Bar */}
        <div className="vs-header">
          <div className="vs-title-box">
            <div className="vs-icon-badge">
              <ImageIcon size={20} className="text-cyan-400" />
            </div>
            <div>
              <h3>CHẾ ĐỘ KỂ CHUYỆN TRỰC QUAN</h3>
              <p className="vs-subtitle">Trích xuất bảng màu ảnh thành Theme website & gợi ý mạch truyện theo thị giác</p>
            </div>
          </div>

          <div className="vs-header-actions">
            {appliedNotification && (
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="vs-applied-badge"
              >
                <Check size={14} /> ĐÃ ÁP DỤNG THEME!
              </motion.span>
            )}

            <button
              className="vs-close-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                if (onClose) onClose()
              }}
              title="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="vs-body-grid">
          {/* Left Column: Image Canvas & Palette Showcase */}
          <div className="vs-left-panel">
            {/* Image Preview & Upload Dropzone */}
            <div
              className="vs-image-dropzone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              title="Nhấn để tải lên ảnh mới từ máy tính của bạn"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <div className="vs-preview-wrapper">
                <img
                  src={selectedImage}
                  alt={selectedImageName}
                  className="vs-preview-img"
                />

                <div className="vs-dropzone-hover-overlay">
                  <Upload size={28} className="mb-2" />
                  <span>KÉO THẢ HOẶC CLICK ĐỂ TẢI ẢNH MỚI</span>
                  <small>Hỗ trợ JPG, PNG, WebP, SVG</small>
                </div>

                {isProcessing && (
                  <div className="vs-processing-overlay">
                    <RefreshCw className="animate-spin text-cyan-400 mb-2" size={32} />
                    <span>Đang lượng tử hóa bảng màu ảnh...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Color Palette Showcase Bar */}
            {extractedTheme && (
              <div className="vs-palette-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-cyan-400" />
                    <span className="vs-section-label">BẢNG MÀU ĐÃ TRÍCH XUẤT ({extractedTheme.palette.length} MÀU)</span>
                  </div>
                  <span className="text-xs text-slate-400">Click vào ô màu để chọn làm Accent</span>
                </div>

                <div className="vs-palette-chips-grid">
                  {extractedTheme.palette.map((hex, idx) => {
                    const isSelected = activeSwatchIndex === idx
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`vs-swatch-chip ${isSelected ? 'active' : ''}`}
                        style={{
                          backgroundColor: hex,
                          borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.2)'
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveSwatchIndex(idx)
                          handleApplyAsTheme(hex)
                          if (soundEnabled) playKeyClick()
                        }}
                        title={`Màu ${hex} - Nhấn để đặt làm điểm nhấn chính`}
                      >
                        <span className="vs-swatch-code">{hex}</span>
                        {isSelected && <Check size={12} className="vs-swatch-check" />}
                      </button>
                    )
                  })}
                </div>

                {/* Mood Tag & Analysis Summary */}
                <div className="vs-mood-analysis-box">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase text-slate-400">Tâm Trạng Thị Giác Nhận Diện:</span>
                    <span
                      className="vs-mood-badge"
                      style={{
                        borderColor: extractedTheme.dominantAccent,
                        color: extractedTheme.dominantAccent
                      }}
                    >
                      {extractedTheme.detectedMood.toUpperCase()} ({extractedTheme.moodConfidence}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 m-0">{extractedTheme.moodReason}</p>
                </div>

                {/* Main Action: Apply Theme */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    className="vs-action-btn primary"
                    style={{
                      background: `linear-gradient(135deg, ${extractedTheme.dominantAccent}44, ${extractedTheme.dominantAccent}15)`,
                      borderColor: extractedTheme.dominantAccent
                    }}
                    onClick={() => handleApplyAsTheme(extractedTheme.dominantAccent)}
                  >
                    <Sparkles size={16} />
                    <span>ÁP DỤNG LÀM THEME TOÀN BỘ WEB</span>
                  </button>

                  <button
                    type="button"
                    className="vs-action-btn secondary"
                    onClick={handleCopyCss}
                    title="Sao chép CSS Variables vào bộ nhớ tạm"
                  >
                    {copiedCss ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    <span>{copiedCss ? 'ĐÃ COPY CSS' : 'COPY CSS'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Presets Selector Carousel */}
            <div className="vs-presets-section">
              <span className="vs-section-label mb-2 block">HOẶC CHỌN ẢNH NGHỆ THUẬT CÓ SẴN:</span>
              <div className="vs-presets-row">
                {PRESET_ARTWORKS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`vs-preset-btn ${selectedImage === item.url ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedImage(item.url)
                      setSelectedImageName(item.name)
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <img src={item.url} alt={item.name} className="vs-preset-thumb" />
                    <span className="vs-preset-title">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Visual Story Hook & Integration */}
          <div className="vs-right-panel">
            <div className="vs-story-card">
              <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-400" />
                  <h4>GỢI Ý CỐT TRUYỆN THEO THỊ GIÁC</h4>
                </div>
                <span className="vs-node-tag">AI STORY HOOK</span>
              </div>

              {storyHook ? (
                <div className="vs-story-content">
                  <h5 className="vs-story-title" style={{ color: extractedTheme?.dominantAccent || '#38bdf8' }}>
                    {storyHook.title}
                  </h5>

                  <p className="vs-story-text">{storyHook.prompt}</p>

                  <div className="vs-reflection-quote">
                    <span className="vs-quote-icon">💭</span>
                    <em>{storyHook.reflection}</em>
                  </div>

                  <div className="vs-story-meta">
                    <div className="meta-item">
                      <span className="meta-k">Tác phẩm nguồn:</span>
                      <span className="meta-v">{selectedImageName}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-k">Màu sắc chủ đạo:</span>
                      <span className="meta-v flex items-center gap-1">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ background: storyHook.accent }}
                        />
                        {storyHook.accent}
                      </span>
                    </div>
                  </div>

                  {/* Integration Buttons */}
                  <div className="vs-story-actions">
                    <button
                      type="button"
                      className="vs-story-btn branch"
                      onClick={handleInjectIntoJourney}
                    >
                      <BookOpen size={15} />
                      <span>Ghim Mảnh Ghép Này Vào Cốt Truyện</span>
                      <ArrowRight size={14} />
                    </button>

                    {onOpenJournal && (
                      <button
                        type="button"
                        className="vs-story-btn journal"
                        onClick={() => {
                          if (onOpenJournal) {
                            onOpenJournal({
                              image: selectedImage,
                              palette: extractedTheme?.palette || [],
                              title: storyHook.title,
                              prompt: storyHook.prompt
                            })
                          }
                          if (onClose) onClose()
                        }}
                      >
                        <Edit3 size={15} />
                        <span>Mở Trong Nhật Ký Đa Phương Tiện</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                  <RefreshCw className="animate-spin mb-2" size={24} />
                  <span>Đang dệt mạch truyện từ hình ảnh...</span>
                </div>
              )}
            </div>

            {/* Live Theme Preview HUD Mini-Card */}
            <div className="vs-live-preview-box">
              <span className="vs-section-label mb-2 block">MÔ PHỎNG THỊ GIÁC GIAO DIỆN (LIVE PREVIEW)</span>
              <div
                className="vs-mockup-window"
                style={{
                  background: extractedTheme?.darkBg || '#050c18',
                  borderColor: extractedTheme?.borderColor || 'rgba(0, 240, 255, 0.4)'
                }}
              >
                <div className="vs-mockup-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="mockup-title">COGNITIVE CORE // THEME PREVIEW</span>
                </div>
                <div className="vs-mockup-content">
                  <div
                    className="mockup-chip"
                    style={{
                      color: extractedTheme?.dominantAccent || '#00f0ff',
                      border: `1px solid ${extractedTheme?.dominantAccent || '#00f0ff'}44`,
                      background: `${extractedTheme?.dominantAccent || '#00f0ff'}15`
                    }}
                  >
                    ● MOOD RING ACTIVE
                  </div>
                  <h6 style={{ color: extractedTheme?.textPrimary || '#f8fafc' }}>
                    Giao diện được đồng bộ theo sắc thái hình ảnh
                  </h6>
                  <p style={{ color: extractedTheme?.textSecondary || 'rgba(248, 250, 252, 0.7)' }}>
                    Mọi thành phần UI, đường viền neon và thanh điều khiển sẽ khoác lên mình bảng màu này.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
