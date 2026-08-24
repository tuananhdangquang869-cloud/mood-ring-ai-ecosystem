import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette,
  ShoppingBag,
  Sparkles,
  Heart,
  Download,
  Upload,
  Check,
  Star,
  Layers,
  Wand2,
  Plus,
  Trash2,
  Share2,
  X,
  Search,
  Eye,
  Sliders,
  Type,
  Maximize2,
  RefreshCw,
  FolderDown,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import {
  getAllStoreThemes,
  getActiveThemeData,
  applyStoreTheme,
  getInstalledThemeIds,
  installTheme,
  getFavoriteThemeIds,
  toggleFavoriteTheme,
  saveCustomCreatedTheme,
  deleteCustomCreatedTheme,
  exportThemeToJson,
  importThemeFromJson,
  SUPPORTED_GOOGLE_FONTS,
  hexToRgb
} from '../utils/themeStoreEngine.js'
import { playKeyClick, playInsightChimeSound } from '../utils/audioSynth.js'

export default function ThemeStoreModal({
  isOpen = false,
  onClose = () => {},
  soundEnabled = true,
  onThemeApplied = () => {}
}) {
  const [activeTab, setActiveTab] = useState('browse') // 'browse' | 'installed' | 'favorites' | 'studio'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [themeVersion, setThemeVersion] = useState(0)
  const [toastMessage, setToastMessage] = useState(null)
  const [previewTheme, setPreviewTheme] = useState(null)
  const bodyRef = useRef(null)

  // Creator Studio State
  const [studioName, setStudioName] = useState('Chủ Đề Của Tôi')
  const [studioCategory, setStudioCategory] = useState('cyberpunk')
  const [studioDesc, setStudioDesc] = useState('Giao diện tùy biến theo phong cách riêng của bạn.')
  const [studioAccent, setStudioAccent] = useState('#00f0ff')
  const [studioDarkBg, setStudioDarkBg] = useState('#05070f')
  const [studioCardBg, setStudioCardBg] = useState('rgba(10, 16, 32, 0.85)')
  const [studioBorderColor, setStudioBorderColor] = useState('rgba(0, 240, 255, 0.35)')
  const [studioTextPrimary, setStudioTextPrimary] = useState('#f8fafc')
  const [studioFontPrimary, setStudioFontPrimary] = useState('Plus Jakarta Sans')
  const [studioRadius, setStudioRadius] = useState('16px')
  const [studioWallpaperUrl, setStudioWallpaperUrl] = useState('')

  // Keyboard navigation & Smooth Scrolling for Modal
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        bodyRef.current?.scrollBy({ top: 140, behavior: 'smooth' })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        bodyRef.current?.scrollBy({ top: -140, behavior: 'smooth' })
      } else if (e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        bodyRef.current?.scrollBy({ top: 450, behavior: 'smooth' })
      } else if (e.key === 'PageUp') {
        e.preventDefault()
        bodyRef.current?.scrollBy({ top: -450, behavior: 'smooth' })
      } else if (e.key === 'Home') {
        e.preventDefault()
        bodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      } else if (e.key === 'End') {
        e.preventDefault()
        bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Mouse wheel scroll handler directly attached to body container
  useEffect(() => {
    const el = bodyRef.current
    if (!el || !isOpen) return

    const handleWheel = (e) => {
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [isOpen, activeTab])

  // Listen to engine updates
  useEffect(() => {
    const handleUpdate = () => setThemeVersion(v => v + 1)
    window.addEventListener('mr-theme-store-updated', handleUpdate)
    window.addEventListener('mr-theme-applied', handleUpdate)
    return () => {
      window.removeEventListener('mr-theme-store-updated', handleUpdate)
      window.removeEventListener('mr-theme-applied', handleUpdate)
    }
  }, [])

  // All Themes, Installed & Favs
  const allThemes = useMemo(() => {
    void themeVersion
    return getAllStoreThemes()
  }, [themeVersion])

  const installedIds = useMemo(() => {
    void themeVersion
    return getInstalledThemeIds()
  }, [themeVersion])

  const favoriteIds = useMemo(() => {
    void themeVersion
    return getFavoriteThemeIds()
  }, [themeVersion])

  const activeTheme = useMemo(() => {
    void themeVersion
    return getActiveThemeData()
  }, [themeVersion])

  // Filtered Themes
  const filteredThemes = useMemo(() => {
    let list = allThemes
    if (activeTab === 'installed') {
      list = list.filter(t => installedIds.includes(t.id))
    } else if (activeTab === 'favorites') {
      list = list.filter(t => favoriteIds.includes(t.id))
    }

    if (selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q))) ||
        (t.desc && t.desc.toLowerCase().includes(q))
      )
    }

    return list
  }, [allThemes, installedIds, favoriteIds, activeTab, selectedCategory, searchQuery])

  const showToast = (msg) => {
    setToastMessage(msg)
    if (soundEnabled) playInsightChimeSound()
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Handle Apply Theme
  const handleApply = (theme) => {
    if (soundEnabled) playKeyClick()
    applyStoreTheme(theme)
    setPreviewTheme(null)
    showToast(`Đã áp dụng giao diện "${theme.name}" thành công!`)
    onThemeApplied(theme)
  }

  // Handle Favorite Toggle
  const handleToggleFavorite = (e, themeId) => {
    e.stopPropagation()
    if (soundEnabled) playKeyClick()
    const isFav = toggleFavoriteTheme(themeId)
    showToast(isFav ? 'Đã thêm vào danh sách Yêu thích ❤️' : 'Đã bỏ khỏi danh sách Yêu thích')
  }

  // Handle Save Custom Studio Theme
  const handleSaveStudioTheme = (e) => {
    e.preventDefault()
    if (!studioName.trim()) {
      showToast('Vui lòng nhập tên giao diện!')
      return
    }

    const rgb = hexToRgb(studioAccent)
    const newTheme = {
      name: studioName.trim(),
      category: studioCategory,
      desc: studioDesc.trim(),
      dominantAccent: studioAccent,
      accentRgb: rgb,
      darkBg: studioDarkBg,
      cardBg: studioCardBg,
      borderColor: studioBorderColor,
      borderGlow: `0 0 22px rgba(${rgb}, 0.35)`,
      btnBg: `linear-gradient(135deg, rgba(${rgb}, 0.25), rgba(${rgb}, 0.15))`,
      btnHoverBg: `linear-gradient(135deg, rgba(${rgb}, 0.48), rgba(${rgb}, 0.3))`,
      textPrimary: studioTextPrimary,
      textSecondary: `rgba(248, 250, 252, 0.75)`,
      fontPrimary: studioFontPrimary,
      fontMono: 'Space Mono',
      borderRadius: studioRadius,
      bgPattern: `radial-gradient(circle at 50% 20%, rgba(${rgb}, 0.1) 0%, transparent 60%)`,
      bgWallpaperUrl: studioWallpaperUrl.trim()
    }

    try {
      const saved = saveCustomCreatedTheme(newTheme)
      applyStoreTheme(saved)
      showToast(`Đã lưu & xuất bản giao diện "${saved.name}" thành công! 🎨`)
      setActiveTab('installed')
    } catch (err) {
      showToast('Có lỗi khi lưu giao diện.')
    }
  }

  // Handle Delete Theme
  const handleDeleteCustom = (e, themeId) => {
    e.stopPropagation()
    if (window.confirm('Bạn có chắc chắn muốn xóa giao diện tùy biến này?')) {
      if (soundEnabled) playKeyClick()
      deleteCustomCreatedTheme(themeId)
      showToast('Đã xóa giao diện tùy biến.')
    }
  }

  // Handle JSON Import
  const handleImportJson = () => {
    const input = prompt('Dán chuỗi mã JSON Theme vào đây để nhập:')
    if (!input) return
    try {
      const imported = importThemeFromJson(input)
      applyStoreTheme(imported)
      showToast(`Nhập giao diện "${imported.name}" thành công!`)
      setActiveTab('installed')
    } catch (err) {
      alert('Mã JSON Theme không hợp lệ. Vui lòng kiểm tra lại cấu trúc.')
    }
  }

  if (!isOpen) return null

  const CATEGORIES = [
    { id: 'all', label: 'Tất Cả' },
    { id: 'cyberpunk', label: 'Cyberpunk' },
    { id: 'retro', label: 'Retro 80s' },
    { id: 'nature', label: 'Thiên Nhiên & Zen' },
    { id: 'dark', label: 'Hacker & Dark' },
    { id: 'pastel', label: 'Pastel Lo-Fi' },
    { id: 'luxury', label: 'Sang Trọng' }
  ]

  return (
    <div className="theme-store-overlay" data-lenis-prevent onClick={onClose}>
      <motion.div
        className="theme-store-modal"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="theme-store-header">
          <div className="theme-store-title-group">
            <div className="theme-store-icon-box">
              <ShoppingBag size={22} />
            </div>
            <div>
              <h2 className="theme-store-title">CHỢ GIAO DIỆN // THEME STORE 🎨</h2>
              <p className="theme-store-subtitle">Khám phá, tùy biến và tải các bộ theme sắc màu độc đáo từ cộng đồng</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              className="theme-cat-pill"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={handleImportJson}
              title="Nhập Theme từ tệp hoặc mã JSON"
            >
              <Upload size={14} /> Nhập JSON
            </button>
            <button className="theme-store-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="theme-store-nav">
          <button
            className={`theme-store-nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => { setActiveTab('browse'); if (soundEnabled) playKeyClick(); }}
          >
            <ShoppingBag size={16} />
            <span>Khám Phá Cửa Hàng</span>
            <span className="theme-store-badge-count">{allThemes.length}</span>
          </button>

          <button
            className={`theme-store-nav-btn ${activeTab === 'installed' ? 'active' : ''}`}
            onClick={() => { setActiveTab('installed'); if (soundEnabled) playKeyClick(); }}
          >
            <FolderDown size={16} />
            <span>Đã Cài Đặt</span>
            <span className="theme-store-badge-count">{installedIds.length}</span>
          </button>

          <button
            className={`theme-store-nav-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => { setActiveTab('favorites'); if (soundEnabled) playKeyClick(); }}
          >
            <Heart size={16} />
            <span>Yêu Thích</span>
            <span className="theme-store-badge-count">{favoriteIds.length}</span>
          </button>

          <button
            className={`theme-store-nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => { setActiveTab('studio'); if (soundEnabled) playKeyClick(); }}
          >
            <Wand2 size={16} />
            <span>Studio Sáng Tạo Theme 🎨</span>
          </button>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '75px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.95), rgba(168, 85, 247, 0.95))',
                color: '#000',
                padding: '8px 18px',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)',
                zIndex: 100
              }}
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Category Filter Toolbar (Only for Browse/Installed/Favorites) */}
        {activeTab !== 'studio' && (
          <div className="theme-store-toolbar">
            <div className="theme-search-box">
              <Search size={16} className="theme-search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theme, tác giả, màu sắc, tag..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="theme-category-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`theme-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat.id); if (soundEnabled) playKeyClick(); }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="theme-store-body" data-lenis-prevent ref={bodyRef} tabIndex={0}>
          {activeTab === 'studio' ? (
            /* 🎨 THEME CREATOR STUDIO */
            <div className="theme-studio-layout">
              <form className="theme-studio-form" onSubmit={handleSaveStudioTheme}>
                <div className="studio-input-group">
                  <label className="studio-label">Tên Giao Diện (Theme Name)</label>
                  <input
                    type="text"
                    className="studio-input"
                    value={studioName}
                    onChange={e => setStudioName(e.target.value)}
                    placeholder="Ví dụ: Neon Sunset Overdrive"
                    required
                  />
                </div>

                <div className="studio-input-group">
                  <label className="studio-label">Danh Mục (Category)</label>
                  <select
                    className="studio-input"
                    value={studioCategory}
                    onChange={e => setStudioCategory(e.target.value)}
                  >
                    <option value="cyberpunk">Cyberpunk</option>
                    <option value="retro">Retro 80s</option>
                    <option value="nature">Thiên Nhiên & Zen</option>
                    <option value="dark">Hacker & Dark</option>
                    <option value="pastel">Pastel Lo-Fi</option>
                    <option value="luxury">Sang Trọng</option>
                  </select>
                </div>

                <div className="studio-input-group">
                  <label className="studio-label">Mô Tả Chủ Đề</label>
                  <textarea
                    className="studio-input"
                    rows={2}
                    value={studioDesc}
                    onChange={e => setStudioDesc(e.target.value)}
                    placeholder="Mô tả cảm xúc và điểm nhấn của giao diện này..."
                  />
                </div>

                {/* Color Pickers */}
                <div className="studio-input-group">
                  <label className="studio-label">Bảng Phối Màu Chủ Đạo (Palette)</label>
                  <div className="studio-color-pickers-grid">
                    <div className="studio-color-item">
                      <input
                        type="color"
                        value={studioAccent.startsWith('#') ? studioAccent : '#00f0ff'}
                        onChange={e => {
                          setStudioAccent(e.target.value)
                          setStudioBorderColor(`rgba(${hexToRgb(e.target.value)}, 0.4)`)
                        }}
                      />
                      <div className="studio-color-info">
                        <span className="studio-color-title">Điểm Nhấn (Accent)</span>
                        <span className="studio-color-hex">{studioAccent}</span>
                      </div>
                    </div>

                    <div className="studio-color-item">
                      <input
                        type="color"
                        value={studioDarkBg.startsWith('#') ? studioDarkBg : '#05070f'}
                        onChange={e => setStudioDarkBg(e.target.value)}
                      />
                      <div className="studio-color-info">
                        <span className="studio-color-title">Nền Chính (Dark BG)</span>
                        <span className="studio-color-hex">{studioDarkBg}</span>
                      </div>
                    </div>

                    <div className="studio-color-item">
                      <input
                        type="color"
                        value={studioTextPrimary.startsWith('#') ? studioTextPrimary : '#f8fafc'}
                        onChange={e => setStudioTextPrimary(e.target.value)}
                      />
                      <div className="studio-color-info">
                        <span className="studio-color-title">Chữ Chính (Text)</span>
                        <span className="studio-color-hex">{studioTextPrimary}</span>
                      </div>
                    </div>

                    <div className="studio-color-item">
                      <input
                        type="color"
                        value={studioBorderColor.startsWith('#') ? studioBorderColor : '#00f0ff'}
                        onChange={e => setStudioBorderColor(e.target.value)}
                      />
                      <div className="studio-color-info">
                        <span className="studio-color-title">Viền Phát Sáng</span>
                        <span className="studio-color-hex">{studioBorderColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Font & Radius */}
                <div className="studio-input-group">
                  <label className="studio-label">Phông Chữ (Google Fonts)</label>
                  <select
                    className="studio-input"
                    value={studioFontPrimary}
                    onChange={e => setStudioFontPrimary(e.target.value)}
                  >
                    {SUPPORTED_GOOGLE_FONTS.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="studio-input-group">
                  <label className="studio-label">Bo Góc Thẻ (Border Radius)</label>
                  <select
                    className="studio-input"
                    value={studioRadius}
                    onChange={e => setStudioRadius(e.target.value)}
                  >
                    <option value="6px">Sắc Cạnh Hacker (6px)</option>
                    <option value="12px">Cyberpunk Chuẩn (12px)</option>
                    <option value="18px">Mềm Mại Tinh Tế (18px)</option>
                    <option value="26px">Bo Tròn Hiện Đại (26px)</option>
                  </select>
                </div>

                <div className="studio-input-group">
                  <label className="studio-label">Ảnh Nền / Wallpaper URL (Tùy chọn)</label>
                  <input
                    type="url"
                    className="studio-input"
                    value={studioWallpaperUrl}
                    onChange={e => setStudioWallpaperUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="theme-studio-actions">
                  <button type="submit" className="studio-save-btn">
                    <Sparkles size={18} /> Lưu & Áp Dụng Theme Này
                  </button>
                </div>
              </form>

              {/* Studio Live Preview Box */}
              <div className="theme-studio-live-preview">
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  👁️ XEM TRƯỚC THỜI GIAN THỰC (LIVE PREVIEW)
                </h4>
                <div
                  className="studio-canvas-preview-box"
                  style={{
                    background: studioDarkBg,
                    borderColor: studioBorderColor,
                    borderRadius: studioRadius,
                    boxShadow: `0 0 25px rgba(${hexToRgb(studioAccent)}, 0.35)`,
                    fontFamily: `'${studioFontPrimary}', sans-serif`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: studioAccent, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>
                      {studioName || 'Theme Preview'}
                    </span>
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: studioAccent, color: '#000', fontWeight: 700 }}>
                      PREVIEW
                    </span>
                  </div>

                  <div
                    className="studio-mockup-card"
                    style={{
                      background: studioCardBg,
                      borderColor: studioBorderColor,
                      color: studioTextPrimary
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: '1rem', color: studioAccent }}>
                      TRUNG TÂM NHẬN THỨC MR-CORE-01
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.5 }}>
                      Đây là đoạn văn bản minh họa để bạn kiểm tra độ tương phản, phông chữ và sắc thái của bộ giao diện vừa tạo tác.
                    </p>
                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                      <div
                        className="studio-mockup-btn"
                        style={{
                          background: `linear-gradient(135deg, rgba(${hexToRgb(studioAccent)}, 0.3), rgba(${hexToRgb(studioAccent)}, 0.1))`,
                          borderColor: studioAccent,
                          color: studioTextPrimary
                        }}
                      >
                        ⚡ Khởi Động Lõi
                      </div>
                      <div
                        className="studio-mockup-btn"
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          color: studioTextPrimary
                        }}
                      >
                        🔮 Tra Cứu AI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 🛒 THEME CARDS GRID */
            <div className="theme-cards-grid">
              {filteredThemes.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                  <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                  <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Không tìm thấy bộ giao diện nào phù hợp.</p>
                  <p style={{ fontSize: '0.85rem' }}>Hãy thử từ khóa khác hoặc tạo bộ theme độc quyền của riêng bạn trong tab Studio!</p>
                </div>
              ) : (
                filteredThemes.map(theme => {
                  const isCurrent = activeTheme?.id === theme.id
                  const isFav = favoriteIds.includes(theme.id)
                  const isInstalled = installedIds.includes(theme.id)

                  return (
                    <div
                      key={theme.id}
                      className={`theme-card ${isCurrent ? 'is-active' : ''}`}
                      style={{
                        '--accent': theme.dominantAccent,
                        '--border-color': theme.borderColor,
                        '--border-glow': theme.borderGlow,
                        '--btn-bg': theme.btnBg,
                        '--btn-hover-bg': theme.btnHoverBg
                      }}
                    >
                      {/* Visual Header Banner */}
                      <div
                        className="theme-card-visual-banner"
                        style={{
                          background: theme.darkBg,
                          backgroundImage: theme.bgPattern || undefined
                        }}
                      >
                        <div className="theme-palette-dots">
                          <div className="palette-dot" style={{ background: theme.dominantAccent }} title="Accent Color" />
                          <div className="palette-dot" style={{ background: theme.darkBg }} title="Dark BG" />
                          <div className="palette-dot" style={{ background: theme.borderColor || theme.dominantAccent }} title="Border Glow" />
                        </div>

                        <div className="theme-card-badges">
                          {theme.previewBadge && (
                            <span className="theme-card-tag-pill" style={{ borderColor: theme.dominantAccent, color: theme.dominantAccent }}>
                              {theme.previewBadge}
                            </span>
                          )}
                          {isCurrent && (
                            <span className="theme-card-tag-pill" style={{ background: '#22c55e', color: '#000', fontWeight: 800 }}>
                              ĐANG DÙNG
                            </span>
                          )}
                        </div>

                        {/* Font and UI preview specimen */}
                        <div className="theme-preview-ui-mockup">
                          <span className="mockup-font-specimen" style={{ color: theme.dominantAccent, fontFamily: `'${theme.fontPrimary}', sans-serif` }}>
                            Aa {theme.fontPrimary || 'Sans'}
                          </span>
                          <span
                            className="mockup-btn-mini"
                            style={{
                              background: theme.btnBg,
                              border: `1px solid ${theme.dominantAccent}`,
                              color: theme.textPrimary
                            }}
                          >
                            Live UI
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="theme-card-content">
                        <div className="theme-card-title-row">
                          <h3 className="theme-card-name">{theme.name}</h3>
                        </div>

                        <div className="theme-card-author">
                          <span>bởi {theme.author}</span>
                          {theme.authorBadge && (
                            <span className="author-badge">{theme.authorBadge}</span>
                          )}
                        </div>

                        <p className="theme-card-desc">{theme.desc}</p>

                        <div className="theme-card-meta-row">
                          <div className="theme-meta-item">
                            <Star size={13} color="#f59e0b" fill="#f59e0b" />
                            <span>{theme.rating || 5.0} ({theme.ratingCount || 100})</span>
                          </div>
                          <div className="theme-meta-item">
                            <Download size={13} />
                            <span>{theme.downloads ? theme.downloads.toLocaleString() : '1,000+'} lượt tải</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="theme-card-actions">
                          <button
                            className={`theme-apply-btn ${isCurrent ? 'active-theme' : ''}`}
                            onClick={() => handleApply(theme)}
                          >
                            {isCurrent ? (
                              <>
                                <Check size={16} /> Đang Áp Dụng
                              </>
                            ) : (
                              <>
                                <Sparkles size={16} /> Áp Dụng Ngay
                              </>
                            )}
                          </button>

                          <button
                            className={`theme-icon-action-btn ${isFav ? 'is-fav' : ''}`}
                            onClick={(e) => handleToggleFavorite(e, theme.id)}
                            title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                          >
                            <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
                          </button>

                          <button
                            className="theme-icon-action-btn"
                            onClick={() => {
                              exportThemeToJson(theme)
                              showToast(`Đã xuất file JSON cho "${theme.name}"`)
                            }}
                            title="Xuất / Tải mã JSON"
                          >
                            <Download size={16} />
                          </button>

                          {theme.isCustomUserTheme && (
                            <button
                              className="theme-icon-action-btn"
                              style={{ color: '#ef4444' }}
                              onClick={(e) => handleDeleteCustom(e, theme.id)}
                              title="Xóa theme tự tạo"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Floating Quick Scroll Helper Pill (Bottom-Right) */}
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(10, 16, 32, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '4px 8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 240, 255, 0.2)',
            zIndex: 10
          }}
        >
          <button
            type="button"
            className="theme-icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            onClick={() => {
              bodyRef.current?.scrollBy({ top: -350, behavior: 'smooth' })
              if (soundEnabled) playKeyClick()
            }}
            title="Cuộn Lên (Phím Mũi Tên Lên / PageUp)"
          >
            <ChevronUp size={16} />
          </button>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '0 4px', fontWeight: 600 }}>
            Cuộn Trang
          </span>
          <button
            type="button"
            className="theme-icon-action-btn"
            style={{ width: '28px', height: '28px', borderRadius: '50%' }}
            onClick={() => {
              bodyRef.current?.scrollBy({ top: 350, behavior: 'smooth' })
              if (soundEnabled) playKeyClick()
            }}
            title="Cuộn Xuống (Phím Mũi Tên Xuống / PageDown / Space)"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
