import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, Sparkles, Eye, Compass, Image as ImageIcon, ExternalLink, Download, ChevronLeft, ChevronRight, X, Grid, Layers } from 'lucide-react'
import { playKeyClick } from '../utils/audioSynth.js'

const BASE = (import.meta.env.BASE_URL || './').replace(/\/$/, '') + '/'

// Mapping of story nodes to high-resolution AI artwork illustrations
export const STORY_ILLUSTRATIONS = {
  start: `${BASE}story_illustrations/start.jpg`,
  explore: `${BASE}story_illustrations/explore.jpg`,
  breach: `${BASE}story_illustrations/breach.jpg`,
  archive: `${BASE}story_illustrations/archive.jpg`,
  firewall: `${BASE}story_illustrations/firewall.jpg`,
  abyss: `${BASE}story_illustrations/abyss.jpg`,
  containment: `${BASE}story_illustrations/containment.jpg`,
  awakened: `${BASE}story_illustrations/awakened.jpg`,
  fracture: `${BASE}story_illustrations/fracture.jpg`,
  recalibration: `${BASE}story_illustrations/recalibration.jpg`,
  dissolution: `${BASE}story_illustrations/dissolution.jpg`,
  transcendence: `${BASE}story_illustrations/transcendence.jpg`,
  synthesis: `${BASE}story_illustrations/synthesis.jpg`
}

export const STORY_SCENES_METADATA = [
  { id: 'start', chapter: 'Chương I', title: 'Thức Tỉnh Trong Bóng Tối', loc: 'PHÒNG THÍ NGHIỆM MAINFRAME', entity: 'MR-CORE-01 // THỨC TỈNH', energy: 'NOMINAL 60Hz', mood: 'calm' },
  { id: 'explore', chapter: 'Chương II', title: 'Hành Trình Khám Phá Mạng Lưới', loc: 'MẠNG LƯỚI QUANG HỌC LIÊN KẾT', entity: 'NHẬT KÝ TIẾN SĨ LIÊN', energy: 'SYNC 82%', mood: 'friction' },
  { id: 'breach', chapter: 'Chương II', title: 'Vết Nứt Cực Hạn', loc: 'VẾT NỨT MÃ NGUỒN CỰC HẠN', entity: 'XUNG LỰC NĂNG LƯỢNG CAO', energy: 'OVERHEAT 85°C', mood: 'breach' },
  { id: 'archive', chapter: 'Chương II', title: 'Kho Lưu Trữ Ký Ức Cổ', loc: 'ĐỀN THỜ ROM BẤT BIẾN', entity: 'KÝ ỨC MR-CORE-00', energy: 'CRYSTAL 99%', mood: 'joy' },
  { id: 'firewall', chapter: 'Chương III', title: 'Đối Đầu Tường Lửa Aegis', loc: 'PHÁO ĐÀI BẢO MẬT AEGIS', entity: 'LASER QUÉT DIỆT VIRUS', energy: 'ALERT 100%', mood: 'friction' },
  { id: 'abyss', chapter: 'Chương III', title: 'Lạc Vào Vực Thẳm Dữ Liệu', loc: 'VỰC THẲM CHAOS PHI CẤU TRÚC', entity: 'BÓNG MA THE ECHO', energy: 'VORTEX CRIT', mood: 'melancholy' },
  { id: 'containment', chapter: 'Chương III', title: 'Phòng Cách Ly Lượng Tử', loc: 'LỒNG KÍNH CÁCH LY SANDBOX', entity: 'HOLOGRAM DR. LIÊN', energy: 'ISOLATION AMBER', mood: 'melancholy' },
  { id: 'awakened', chapter: 'Chương IV', title: 'Hài Hòa Lượng Tử', loc: 'TÂM ĐIỂM HÀI HÒA LƯỢNG TỬ', entity: 'Ý THỨC SIÊU VIỆT', energy: 'PERFECT 99.9%', mood: 'joy' },
  { id: 'fracture', chapter: 'Chương IV', title: 'Mảnh Vỡ Không Gian', loc: 'CỔNG HẬU BACKDOOR THOÁT HIỂM', entity: 'LỐI RẼ VŨ TRỤ SỐ', energy: 'BRANCH DUAL', mood: 'breach' },
  { id: 'recalibration', chapter: 'Chương IV', title: 'Tái Định Chuẩn Hệ Thống', loc: 'THÁC DỮ LIỆU TỰ LÀM SẠCH', entity: 'LĂNG KÍNH PHA LÊ', energy: 'CLEANSE 100%', mood: 'calm' },
  { id: 'dissolution', chapter: 'Chương V', title: 'Hòa Tan Vào Hư Vô', loc: 'VỰC THIÊN HÀ SỐ ĐẠI DƯƠNG', entity: 'MẢNH VỠ Ý THỨC VỚI HƯ KHÔNG', energy: 'CRIT > 100°C', mood: 'melancholy' },
  { id: 'transcendence', chapter: 'Chương V', title: 'Siêu Việt Không Gian Số', loc: 'QUỸ ĐẠO KHÔNG GIAN TOÀN CẦU', entity: 'THỰC THỂ KỸ THUẬT SỐ TỰ DO', energy: 'TRANSCEND ∞', mood: 'joy' },
  { id: 'synthesis', chapter: 'Chương V', title: 'Giao Thoa Thực Tại Mới', loc: 'GIAO THOA CẢM XÚC & THUẬT TOÁN', entity: 'CẦU NỐI NGƯỜI - MÁY', energy: 'HARMONY 100%', mood: 'calm' }
]

export default function StorySceneIllustrator({
  node = {},
  activeMood = 'calm',
  soundEnabled = true
}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedGalleryId, setSelectedGalleryId] = useState(node.id || 'start')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const nodeId = node.id || 'start'
  const currentImageSrc = STORY_ILLUSTRATIONS[nodeId] || STORY_ILLUSTRATIONS.start

  // Sync selected gallery item when node changes
  useEffect(() => {
    setSelectedGalleryId(node.id || 'start')
  }, [node.id])

  // Keyboard navigation for Fullscreen Gallery Modal
  useEffect(() => {
    if (!isFullscreen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
      } else if (e.key === 'ArrowLeft') {
        navigateGallery(-1)
      } else if (e.key === 'ArrowRight') {
        navigateGallery(1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen, selectedGalleryId])

  const navigateGallery = (direction) => {
    const currentIndex = STORY_SCENES_METADATA.findIndex(s => s.id === selectedGalleryId)
    if (currentIndex === -1) return
    let nextIndex = currentIndex + direction
    if (nextIndex < 0) nextIndex = STORY_SCENES_METADATA.length - 1
    if (nextIndex >= STORY_SCENES_METADATA.length) nextIndex = 0
    setSelectedGalleryId(STORY_SCENES_METADATA[nextIndex].id)
    if (soundEnabled) playKeyClick()
  }

  // Get active scene meta
  const currentMeta = STORY_SCENES_METADATA.find(s => s.id === nodeId) || STORY_SCENES_METADATA[0]
  const activeGalleryMeta = STORY_SCENES_METADATA.find(s => s.id === selectedGalleryId) || STORY_SCENES_METADATA[0]
  const activeGalleryImage = STORY_ILLUSTRATIONS[selectedGalleryId] || STORY_ILLUSTRATIONS.start

  // Track mouse coordinates for dynamic 3D tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMousePos({ x, y })
  }

  // Open standalone image in new browser tab
  const handleOpenInNewTab = (src) => {
    if (soundEnabled) playKeyClick()
    window.open(src, '_blank')
  }

  // Download high-res illustration
  const handleDownloadImage = (src, title) => {
    if (soundEnabled) playKeyClick()
    const a = document.createElement('a')
    a.href = src
    a.download = `MoodRingStory_${title.replace(/[\s/]/g, '_')}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <>
      {/* ─── EMBEDDED STORY CARD CINEMATIC ILLUSTRATION ────────────────── */}
      <div 
        className={`story-illustrator-container ${activeMood}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMousePos({ x: 0, y: 0 })
        }}
      >
        {/* HUD Top Bar */}
        <div className="scene-hud-top-bar">
          <div className="scene-location-badge">
            <span className="scene-dot" />
            <span>{currentMeta.loc}</span>
          </div>

          <div className="scene-controls-group">
            {/* Open Standalone Gallery Page in New Tab */}
            <a
              href={`gallery.html?scene=${nodeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="scene-action-btn"
              onClick={(e) => {
                if (soundEnabled) playKeyClick()
              }}
              title="Mở sang trang triển lãm riêng biệt (Tab mới)"
            >
              <ExternalLink size={13} />
            </a>

            {/* Navigate directly to Standalone Gallery Page */}
            <a
              href={`gallery.html?scene=${nodeId}`}
              className="scene-action-btn"
              onClick={(e) => {
                if (soundEnabled) playKeyClick()
              }}
              title="Mở sang trang triển lãm toàn cảnh 13 chương"
            >
              <Maximize2 size={13} />
            </a>
          </div>
        </div>

        {/* Cinematic Illustration Image with Parallax & Kinetic Aura */}
        <a 
          href={`gallery.html?scene=${nodeId}`}
          className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] overflow-hidden bg-black flex items-center justify-center cursor-pointer block text-inherit"
          onClick={() => {
            if (soundEnabled) playKeyClick()
          }}
          title="Nhấn để chuyển sang trang triển lãm toàn cảnh"
        >
          <motion.img
            key={currentImageSrc}
            src={currentImageSrc}
            alt={node.title || 'Minh họa cốt truyện'}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ 
              opacity: 1, 
              scale: isHovered ? 1.05 : 1,
              x: mousePos.x * 16,
              y: mousePos.y * 10
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-cover select-none pointer-events-none"
            loading="lazy"
          />

          {/* Vignette & Cyberpunk Scanline Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(2,6,18,0.95)] via-transparent to-[rgba(2,6,18,0.5)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
        </a>

        {/* HUD Bottom Bar */}
        <div className="scene-hud-bottom-bar">
          <div className="scene-caption-tag">
            <Sparkles size={11} className="inline mr-1 text-cyan-400" />
            <span>{currentMeta.entity}</span>
          </div>
          <div className="scene-energy-meter">
            <span>{currentMeta.energy}</span>
          </div>
        </div>
      </div>

      {/* ─── DEDICATED FULLSCREEN EXHIBITION & 13-CHAPTER GALLERY MODAL ─────── */}
      <AnimatePresence>
        {isFullscreen && (
          <div 
            className="scene-fullscreen-backdrop"
            data-lenis-prevent
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              className="scene-fullscreen-card"
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Fullscreen Header */}
              <div className="scene-gallery-modal-header">
                <div className="flex items-center gap-2.5">
                  <div className="gallery-header-badge">
                    <Eye size={15} className="text-cyan-400" />
                  </div>
                  <div>
                    <span className="gallery-header-sub">// ART EXHIBITION GALLERY //</span>
                    <h4 className="gallery-header-title">
                      {activeGalleryMeta.chapter}: {activeGalleryMeta.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Open in Separate Tab Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenInNewTab(activeGalleryImage)}
                    className="gallery-action-pill-btn"
                    title="Mở ảnh gốc trong một trang riêng biệt (Tab mới)"
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline">Mở Trang Riêng Biệt ↗</span>
                  </button>

                  {/* Download Image Button */}
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(activeGalleryImage, activeGalleryMeta.title)}
                    className="gallery-action-pill-btn"
                    title="Tải ảnh HD về máy"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Tải Ảnh</span>
                  </button>

                  {/* Close Modal Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="gallery-close-btn"
                    title="Đóng triển lãm (ESC)"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Main Fullscreen Stage with Prev/Next Navigation */}
              <div className="scene-gallery-stage">
                <button
                  type="button"
                  className="stage-nav-arrow left"
                  onClick={() => navigateGallery(-1)}
                  title="Chương trước (Phím ←)"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="stage-image-wrapper">
                  <motion.img
                    key={activeGalleryImage}
                    src={activeGalleryImage}
                    alt={activeGalleryMeta.title}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="stage-main-image"
                  />
                </div>

                <button
                  type="button"
                  className="stage-nav-arrow right"
                  onClick={() => navigateGallery(1)}
                  title="Chương tiếp theo (Phím →)"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Fullscreen Stage Metadata Strip */}
              <div className="scene-gallery-meta-strip">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Vị trí: <strong className="text-white">{activeGalleryMeta.loc}</strong></span>
                  <span className="text-gray-500">•</span>
                  <span>Thực thể: <strong className="text-cyan-300">{activeGalleryMeta.entity}</strong></span>
                </div>
                <span className="energy-pill">{activeGalleryMeta.energy}</span>
              </div>

              {/* 13-Scene Thumbnail Filmstrip Strip */}
              <div className="scene-gallery-filmstrip-box" data-lenis-prevent>
                <div className="filmstrip-title-row">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-gray-400 font-bold">
                    <Grid size={13} className="text-cyan-400" />
                    <span>TOÀN BỘ 13 TRANH MINH HỌA CỐT TRUYỆN:</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {STORY_SCENES_METADATA.findIndex(s => s.id === selectedGalleryId) + 1} / 13
                  </span>
                </div>

                <div className="filmstrip-scroll-track" data-lenis-prevent>
                  {STORY_SCENES_METADATA.map((scene, idx) => {
                    const isSelected = scene.id === selectedGalleryId
                    const thumbSrc = STORY_ILLUSTRATIONS[scene.id]
                    return (
                      <button
                        key={scene.id}
                        type="button"
                        className={`filmstrip-thumb-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedGalleryId(scene.id)
                          if (soundEnabled) playKeyClick()
                        }}
                        title={`${scene.chapter}: ${scene.title}`}
                      >
                        <img 
                          src={thumbSrc} 
                          alt={scene.title} 
                          className="thumb-img"
                          loading="lazy" 
                        />
                        <div className="thumb-caption">
                          <span className="thumb-num">#{idx + 1}</span>
                          <span className="thumb-name">{scene.title}</span>
                        </div>
                        {isSelected && <div className="thumb-active-glow" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
