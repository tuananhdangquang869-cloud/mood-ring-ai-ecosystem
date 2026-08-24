import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen, 
  Download, 
  Printer, 
  FileText, 
  Palette, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Sliders, 
  Eye, 
  ShieldCheck, 
  RefreshCw, 
  Bookmark,
  Layers,
  Heart,
  Moon,
  Hourglass,
  Feather
} from 'lucide-react'
import { 
  BOOK_COVER_THEMES, 
  gatherAllBookData, 
  generateEbookHTML, 
  generateMarkdownBook, 
  downloadFile, 
  printBookAsPDF 
} from '../utils/ebookGenerator.js'
import { playKeyClick, playTransitionSound } from '../utils/audioSynth.js'

export default function EBookExporter({
  isEmbedded = false,
  soundEnabled = false,
  onClose = () => {}
}) {
  const [bookData, setBookData] = useState(() => gatherAllBookData())
  
  // Customization options
  const [bookTitle, setBookTitle] = useState('KÝ ỨC TÂM THỨC - HÀNH TRÌNH MOOD RING')
  const [authorName, setAuthorName] = useState('Operator MR-CORE-01')
  const [prefaceText, setPrefaceText] = useState('Những lát cắt cảm xúc và tư duy được lưu giữ trong dòng chảy không gian số.')
  const [selectedCoverTheme, setSelectedCoverTheme] = useState('cyberpunk')
  
  // Structure toggles
  const [includeCover, setIncludeCover] = useState(true)
  const [includeTOC, setIncludeTOC] = useState(true)
  const [includeStats, setIncludeStats] = useState(true)
  const [includeJournal, setIncludeJournal] = useState(true)
  const [includeDreams, setIncludeDreams] = useState(true)
  const [includeCapsules, setIncludeCapsules] = useState(true)
  const [includeColophon, setIncludeColophon] = useState(true)

  // Preview Mode: 'cover' | 'toc' | 'journal' | 'dreams' | 'capsules' | 'full'
  const [currentPreviewPage, setCurrentPreviewPage] = useState(0)
  const [exportingState, setExportingState] = useState('') // '' | 'pdf' | 'epub' | 'md' | 'json'

  // Refresh book data from localStorage on mount
  const handleRefreshData = () => {
    const data = gatherAllBookData()
    setBookData(data)
    if (soundEnabled) playKeyClick()
  }

  const currentThemeObj = BOOK_COVER_THEMES.find(t => t.id === selectedCoverTheme) || BOOK_COVER_THEMES[0]

  // Construct book preview pages
  const previewPages = []

  if (includeCover) {
    previewPages.push({
      type: 'cover',
      title: 'BÌA SÁCH NGHỆ THUẬT',
      subtitle: 'Cover Presentation'
    })
  }

  if (includeTOC) {
    previewPages.push({
      type: 'toc',
      title: 'MỤC LỤC TỰ ĐỘNG',
      subtitle: 'Table of Contents'
    })
  }

  if (includeStats) {
    previewPages.push({
      type: 'preface',
      title: 'LỜI TỰA & THỐNG KÊ',
      subtitle: 'Preface & Emotional Radar'
    })
  }

  if (includeJournal && bookData.journalEntries?.length > 0) {
    bookData.journalEntries.forEach((entry, idx) => {
      previewPages.push({
        type: 'journal-entry',
        title: `NHẬT KÝ #${idx + 1}`,
        subtitle: entry.title || 'Ký ức thị giác',
        data: entry
      })
    })
  }

  if (includeDreams && bookData.dreamEntries?.length > 0) {
    bookData.dreamEntries.forEach((dream, idx) => {
      previewPages.push({
        type: 'dream-entry',
        title: `GIẤC MƠ #${idx + 1}`,
        subtitle: dream.title || 'Sổ tay ước mơ',
        data: dream
      })
    })
  }

  if (includeCapsules && bookData.capsuleEntries?.length > 0) {
    bookData.capsuleEntries.forEach((cap, idx) => {
      previewPages.push({
        type: 'capsule-entry',
        title: `HỘP THỜI GIAN #${idx + 1}`,
        subtitle: cap.title || 'Lá thư tương lai',
        data: cap
      })
    })
  }

  if (includeColophon) {
    previewPages.push({
      type: 'colophon',
      title: 'CHỨNG THỰC DỮ LIỆU',
      subtitle: 'Colophon & Digital Seal'
    })
  }

  const activePage = previewPages[currentPreviewPage] || previewPages[0] || { type: 'empty' }

  // Action handlers
  const handlePrintPDF = () => {
    setExportingState('pdf')
    if (soundEnabled) playTransitionSound('book-flip')
    const html = generateEbookHTML({
      title: bookTitle,
      author: authorName,
      preface: prefaceText,
      coverTheme: selectedCoverTheme,
      includeCover,
      includeTOC,
      includeStats,
      includeJournal,
      includeDreams,
      includeCapsules,
      includeColophon
    }, bookData)

    setTimeout(() => {
      printBookAsPDF(html)
      setExportingState('')
    }, 400)
  }

  const handleDownloadEpubHTML = () => {
    setExportingState('epub')
    if (soundEnabled) playKeyClick()
    const html = generateEbookHTML({
      title: bookTitle,
      author: authorName,
      preface: prefaceText,
      coverTheme: selectedCoverTheme,
      includeCover,
      includeTOC,
      includeStats,
      includeJournal,
      includeDreams,
      includeCapsules,
      includeColophon
    }, bookData)

    const cleanTitle = bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')
    downloadFile(html, `${cleanTitle}_ebook.html`, 'text/html')
    setTimeout(() => setExportingState(''), 800)
  }

  const handleDownloadMarkdown = () => {
    setExportingState('md')
    if (soundEnabled) playKeyClick()
    const md = generateMarkdownBook({
      title: bookTitle,
      author: authorName,
      preface: prefaceText
    }, bookData)

    const cleanTitle = bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')
    downloadFile(md, `${cleanTitle}_archive.md`, 'text/markdown')
    setTimeout(() => setExportingState(''), 800)
  }

  const handleDownloadJSON = () => {
    setExportingState('json')
    if (soundEnabled) playKeyClick()
    const payload = JSON.stringify({
      metadata: {
        title: bookTitle,
        author: authorName,
        preface: prefaceText,
        theme: selectedCoverTheme,
        exportedAt: new Date().toISOString()
      },
      ...bookData
    }, null, 2)

    const cleanTitle = bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')
    downloadFile(payload, `${cleanTitle}_data_backup.json`, 'application/json')
    setTimeout(() => setExportingState(''), 800)
  }

  return (
    <div className={`ebook-exporter-container ${isEmbedded ? 'embedded' : ''}`}>
      {/* Header Info */}
      <div className="ebook-header-banner">
        <div className="flex items-center gap-3">
          <div className="ebook-badge-icon">
            <BookOpen size={22} className="text-cyan-400" />
          </div>
          <div>
            <span className="ebook-subtag">// E-BOOK & PDF PUBLISHING STUDIO //</span>
            <h4 className="ebook-main-title">XUẤT FILE SÁCH ĐIỆN TỬ (PDF / EPUB / MARKDOWN)</h4>
            <p className="ebook-desc">Tự động đóng gói tất cả trang nhật ký, tranh vẽ, giấc mơ & hộp thời gian thành cuốn sách tuyệt đẹp.</p>
          </div>
        </div>

        <button
          type="button"
          className="ebook-refresh-btn"
          onClick={handleRefreshData}
          title="Làm mới dữ liệu từ bộ nhớ cục bộ"
        >
          <RefreshCw size={14} />
          <span>Cập Nhật Ký Ức ({bookData.totalEntries})</span>
        </button>
      </div>

      {/* Main Studio Workspace Grid */}
      <div className="ebook-workspace-grid">
        {/* Left Column: Configuration Controls */}
        <div className="ebook-config-col">
          {/* 1. Book Metadata Customization */}
          <div className="ebook-panel-box">
            <div className="panel-box-title">
              <Feather size={15} className="text-cyan-400" />
              <span>THÔNG TIN ẤN BẢN (METADATA)</span>
            </div>

            <div className="space-y-3 mt-3">
              <div>
                <label className="ebook-input-label">Tiêu Đề Cuốn Sách:</label>
                <input
                  type="text"
                  className="ebook-text-input"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Nhập tên cuốn sách..."
                />
              </div>

              <div>
                <label className="ebook-input-label">Tên Tác Giả / Operator:</label>
                <input
                  type="text"
                  className="ebook-text-input"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Nhập tên tác giả..."
                />
              </div>

              <div>
                <label className="ebook-input-label">Lời Tựa / Đề Từ (Preface):</label>
                <textarea
                  className="ebook-textarea-input"
                  rows={2}
                  value={prefaceText}
                  onChange={(e) => setPrefaceText(e.target.value)}
                  placeholder="Nhập lời mở đầu hoặc câu danh ngôn tâm đắc..."
                />
              </div>
            </div>
          </div>

          {/* 2. Cover Style Selection (5 Presets) */}
          <div className="ebook-panel-box">
            <div className="panel-box-title">
              <Palette size={15} className="text-pink-400" />
              <span>PHONG CÁCH BÌA NGHỆ THUẬT (5 PRESETS)</span>
            </div>

            <div className="cover-presets-grid mt-3">
              {BOOK_COVER_THEMES.map((theme) => {
                const isSelected = selectedCoverTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`cover-preset-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCoverTheme(theme.id)
                      if (soundEnabled) playKeyClick()
                    }}
                    style={{
                      borderColor: isSelected ? theme.accentColor : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <div
                      className="cover-thumb-preview"
                      style={{ background: theme.bgGradient, borderColor: theme.accentColor }}
                    >
                      <span className="cover-mini-dot" style={{ backgroundColor: theme.accentColor }} />
                    </div>
                    <div className="cover-preset-info">
                      <span className="preset-name" style={{ color: isSelected ? theme.accentColor : '#f1f5f9' }}>
                        {theme.name}
                      </span>
                      <span className="preset-desc">{theme.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Section Toggles */}
          <div className="ebook-panel-box">
            <div className="panel-box-title">
              <Layers size={15} className="text-emerald-400" />
              <span>CẤU TRÚC & CÁC MỤC ĐÓNG GÓI</span>
            </div>

            <div className="structure-toggles-list mt-3">
              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                />
                <span>Trang Bìa Nghệ Thuật (Cover Page)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeTOC}
                  onChange={(e) => setIncludeTOC(e.target.checked)}
                />
                <span>Trang Mục Lục Tự Động (Table of Contents)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                />
                <span>Lời Tựa & Thống Kê Cảm Xúc (Mood Analytics)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeJournal}
                  onChange={(e) => setIncludeJournal(e.target.checked)}
                />
                <span>Nhật Ký Đa Phương Tiện ({bookData.journalEntries?.length || 0} bản ghi)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeDreams}
                  onChange={(e) => setIncludeDreams(e.target.checked)}
                />
                <span>Sổ Tay Giấc Mơ ({bookData.dreamEntries?.length || 0} giấc mộng)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeCapsules}
                  onChange={(e) => setIncludeCapsules(e.target.checked)}
                />
                <span>Hộp Niêm Phong Thời Gian ({bookData.capsuleEntries?.length || 0} lá thư)</span>
              </label>

              <label className="structure-toggle-item">
                <input
                  type="checkbox"
                  checked={includeColophon}
                  onChange={(e) => setIncludeColophon(e.target.checked)}
                />
                <span>Lời Kết & Dấu Ấn Số (Colophon)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Book Preview & Export Actions */}
        <div className="ebook-preview-col">
          {/* Live Page Reader Card */}
          <div className="ebook-reader-card">
            <div className="reader-toolbar">
              <div className="flex items-center gap-2">
                <Eye size={15} className="text-cyan-400" />
                <span className="font-mono text-xs text-slate-300 font-bold">
                  TRÌNH XEM TRƯỚC SÁCH TRỰC TIẾP ({currentPreviewPage + 1} / {Math.max(1, previewPages.length)})
                </span>
              </div>

              {/* Page Navigator Buttons */}
              <div className="page-nav-controls">
                <button
                  type="button"
                  className="page-turn-btn"
                  disabled={currentPreviewPage <= 0}
                  onClick={() => {
                    setCurrentPreviewPage(prev => Math.max(0, prev - 1))
                    if (soundEnabled) playTransitionSound('book-flip')
                  }}
                  title="Trang trước"
                >
                  <ChevronLeft size={16} />
                  <span>Trang Trước</span>
                </button>

                <button
                  type="button"
                  className="page-turn-btn"
                  disabled={currentPreviewPage >= previewPages.length - 1}
                  onClick={() => {
                    setCurrentPreviewPage(prev => Math.min(previewPages.length - 1, prev + 1))
                    if (soundEnabled) playTransitionSound('book-flip')
                  }}
                  title="Trang sau"
                >
                  <span>Trang Sau</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Simulated Printed Paper Book Sheet */}
            <div className="paper-book-viewport">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPreviewPage}
                  className="paper-book-sheet"
                  initial={{ opacity: 0, x: 20, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: -20, rotateY: 10 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  {/* COVER PAGE PREVIEW */}
                  {activePage.type === 'cover' && (
                    <div
                      className="live-cover-render"
                      style={{
                        background: currentThemeObj.bgGradient,
                        border: `2px solid ${currentThemeObj.accentColor}`,
                        boxShadow: currentThemeObj.borderGlow
                      }}
                    >
                      <span className="live-cover-badge" style={{ borderColor: currentThemeObj.accentColor, color: currentThemeObj.accentColor }}>
                        {currentThemeObj.coverBadge}
                      </span>

                      <div className="live-cover-orb-center">
                        <div
                          className="live-cover-orb-inner"
                          style={{
                            background: `radial-gradient(circle, ${currentThemeObj.accentColor} 0%, ${currentThemeObj.secondaryColor} 100%)`,
                            boxShadow: `0 0 20px ${currentThemeObj.accentColor}`
                          }}
                        />
                      </div>

                      <h2 className="live-cover-title">{bookTitle || 'KÝ ỨC TÂM THỨC'}</h2>
                      <p className="live-cover-sub" style={{ color: currentThemeObj.accentColor }}>
                        // BIÊN NIÊN SỬ CẢM XÚC SỐ //
                      </p>

                      <div className="live-cover-preface">
                        "{prefaceText}"
                      </div>

                      <div className="live-cover-foot">
                        <span>Tác giả: <strong>{authorName}</strong></span>
                        <span>{new Date().toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  )}

                  {/* TOC PAGE PREVIEW */}
                  {activePage.type === 'toc' && (
                    <div className="live-content-render">
                      <div className="live-heading-row" style={{ borderColor: `${currentThemeObj.accentColor}50` }}>
                        <span className="live-section-title" style={{ color: currentThemeObj.accentColor }}>
                          MỤC LỤC TỔNG QUAN
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">
                        Biên soạn tự động bởi hệ sinh thái <strong>MR-CORE-01</strong>
                      </p>

                      <div className="live-toc-preview-list">
                        <div className="live-toc-row">
                          <span>I. Lời Tựa & Tổng Quan Cảm Xúc</span>
                          <span className="dots"></span>
                          <span style={{ color: currentThemeObj.accentColor }}>Trang 2</span>
                        </div>
                        {includeJournal && (
                          <div className="live-toc-row">
                            <span>II. Nhật Ký Đa Phương Tiện ({bookData.journalEntries?.length} bản ghi)</span>
                            <span className="dots"></span>
                            <span style={{ color: currentThemeObj.accentColor }}>Trang 3</span>
                          </div>
                        )}
                        {includeDreams && (
                          <div className="live-toc-row">
                            <span>III. Sổ Tay Giấc Mơ & Phân Tích ({bookData.dreamEntries?.length} giấc mơ)</span>
                            <span className="dots"></span>
                            <span style={{ color: currentThemeObj.accentColor }}>Trang 5</span>
                          </div>
                        )}
                        {includeCapsules && (
                          <div className="live-toc-row">
                            <span>IV. Kén Niêm Phong Thời Gian ({bookData.capsuleEntries?.length} lá thư)</span>
                            <span className="dots"></span>
                            <span style={{ color: currentThemeObj.accentColor }}>Trang 7</span>
                          </div>
                        )}
                        {includeColophon && (
                          <div className="live-toc-row">
                            <span>V. Lời Kết & Dấu Ấn Số</span>
                            <span className="dots"></span>
                            <span style={{ color: currentThemeObj.accentColor }}>Trang 8</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PREFACE & STATS PAGE PREVIEW */}
                  {activePage.type === 'preface' && (
                    <div className="live-content-render">
                      <div className="live-heading-row" style={{ borderColor: `${currentThemeObj.accentColor}50` }}>
                        <span className="live-section-title" style={{ color: currentThemeObj.accentColor }}>
                          I. LỜI TỰA & THỐNG KÊ CẢM XÚC
                        </span>
                      </div>

                      <div className="live-preface-quote">
                        "{prefaceText}"
                      </div>

                      <div className="live-stats-showcase">
                        <div className="live-stat-card">
                          <span className="stat-num" style={{ color: currentThemeObj.accentColor }}>{bookData.totalEntries}</span>
                          <span className="stat-label">Tổng Bản Ghi</span>
                        </div>
                        <div className="live-stat-card">
                          <span className="stat-num" style={{ color: currentThemeObj.accentColor }}>{bookData.journalEntries?.length || 0}</span>
                          <span className="stat-label">Trang Nhật Ký</span>
                        </div>
                        <div className="live-stat-card">
                          <span className="stat-num" style={{ color: currentThemeObj.accentColor }}>{bookData.dreamEntries?.length || 0}</span>
                          <span className="stat-label">Giấc Mơ</span>
                        </div>
                        <div className="live-stat-card">
                          <span className="stat-num" style={{ color: currentThemeObj.accentColor }}>{bookData.capsuleEntries?.length || 0}</span>
                          <span className="stat-label">Hộp Thời Gian</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JOURNAL ENTRY PAGE PREVIEW */}
                  {activePage.type === 'journal-entry' && activePage.data && (
                    <div className="live-content-render">
                      <div className="live-heading-row" style={{ borderColor: `${currentThemeObj.accentColor}50` }}>
                        <span className="live-section-title" style={{ color: currentThemeObj.accentColor }}>
                          {activePage.data.title || 'Nhật Ký Tâm Thức'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{activePage.data.date}</span>
                      </div>

                      {activePage.data.mediaUrl && (
                        <div className="live-media-box">
                          <img src={activePage.data.mediaUrl} alt={activePage.data.title} />
                        </div>
                      )}

                      <div className="live-body-text">
                        {activePage.data.note}
                      </div>

                      {activePage.data.aiAnalysis && (
                        <div className="live-ai-box" style={{ borderLeftColor: currentThemeObj.accentColor }}>
                          <span className="font-bold">🤖 Phân Tích AI:</span> {activePage.data.aiAnalysis}
                        </div>
                      )}

                      {activePage.data.tags && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {activePage.data.tags.map((t, idx) => (
                            <span key={idx} className="live-tag-pill" style={{ color: currentThemeObj.accentColor }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* DREAM ENTRY PAGE PREVIEW */}
                  {activePage.type === 'dream-entry' && activePage.data && (
                    <div className="live-content-render">
                      <div className="live-heading-row" style={{ borderColor: `${currentThemeObj.accentColor}50` }}>
                        <span className="live-section-title" style={{ color: currentThemeObj.accentColor }}>
                          🌙 {activePage.data.title || 'Giấc Mơ'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{activePage.data.date}</span>
                      </div>

                      <div className="live-body-text">
                        {activePage.data.content || activePage.data.note}
                      </div>

                      {activePage.data.aiInterpretation && (
                        <div className="live-ai-box" style={{ borderLeftColor: currentThemeObj.accentColor }}>
                          <span className="font-bold">✨ Giải Mã Giấc Mơ:</span> {activePage.data.aiInterpretation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CAPSULE ENTRY PAGE PREVIEW */}
                  {activePage.type === 'capsule-entry' && activePage.data && (
                    <div className="live-content-render">
                      <div className="live-heading-row" style={{ borderColor: `${currentThemeObj.accentColor}50` }}>
                        <span className="live-section-title" style={{ color: currentThemeObj.accentColor }}>
                          ⏳ {activePage.data.title || 'Lá Thư Thời Gian'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">Mở: {activePage.data.unlockDate}</span>
                      </div>

                      <div className="live-body-text">
                        {activePage.data.message || activePage.data.content}
                      </div>
                    </div>
                  )}

                  {/* COLOPHON PAGE PREVIEW */}
                  {activePage.type === 'colophon' && (
                    <div className="live-content-render text-center flex flex-col justify-center min-h-[300px]">
                      <h4 className="text-lg font-bold text-white mb-2">CHỨNG THỰC DỮ LIỆU SỐ</h4>
                      <p className="text-xs text-slate-400 max-width-[360px] mx-auto mb-4">
                        Cuốn sách được lưu trữ và bảo chứng độc quyền cho tác giả <strong>{authorName}</strong>.
                      </p>
                      <div className="text-[10px] font-mono text-cyan-400">
                        [VERIFIED BY MR-CORE-01 ARCHIVAL ENGINE]
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Export Actions Toolbar */}
          <div className="ebook-actions-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-200 font-mono tracking-wider">
                // ĐỊNH DẠNG XUẤT FILE SÁCH (CHỌN 1 ĐỂ TẢI VỀ) //
              </span>
              <span className="text-[11px] text-emerald-400">✓ Sẵn sàng đóng gói</span>
            </div>

            <div className="export-buttons-grid">
              {/* Export 1: Print & Save as PDF */}
              <button
                type="button"
                className="export-action-btn pdf-btn"
                onClick={handlePrintPDF}
                disabled={exportingState === 'pdf'}
              >
                <div className="btn-icon-wrapper">
                  <Printer size={18} />
                </div>
                <div className="btn-text-content">
                  <span className="btn-main-label">In & Lưu PDF Chuẩn Sách</span>
                  <span className="btn-sub-label">Chuẩn trang in A4/A5 (@media print)</span>
                </div>
                <span className="btn-badge">PDF / IN</span>
              </button>

              {/* Export 2: Download Standalone HTML/EPUB */}
              <button
                type="button"
                className="export-action-btn epub-btn"
                onClick={handleDownloadEpubHTML}
                disabled={exportingState === 'epub'}
              >
                <div className="btn-icon-wrapper">
                  <BookOpen size={18} />
                </div>
                <div className="btn-text-content">
                  <span className="btn-main-label">Tải Sách Điện Tử (EPUB/HTML)</span>
                  <span className="btn-sub-label">File offline đọc được trên mọi máy đọc sách</span>
                </div>
                <span className="btn-badge">EPUB / WEB</span>
              </button>

              {/* Export 3: Download Markdown */}
              <button
                type="button"
                className="export-action-btn md-btn"
                onClick={handleDownloadMarkdown}
                disabled={exportingState === 'md'}
              >
                <div className="btn-icon-wrapper">
                  <FileText size={18} />
                </div>
                <div className="btn-text-content">
                  <span className="btn-main-label">Xuất File Markdown (.md)</span>
                  <span className="btn-sub-label">Văn bản cấu trúc thuần túy cho Obsidian/Notion</span>
                </div>
                <span className="btn-badge">MARKDOWN</span>
              </button>

              {/* Export 4: Download JSON Backup */}
              <button
                type="button"
                className="export-action-btn json-btn"
                onClick={handleDownloadJSON}
                disabled={exportingState === 'json'}
              >
                <div className="btn-icon-wrapper">
                  <Download size={18} />
                </div>
                <div className="btn-text-content">
                  <span className="btn-main-label">Sao Lưu Dữ Liệu Gốc (.json)</span>
                  <span className="btn-sub-label">Trọn vẹn 100% hình ảnh & dữ liệu để phục hồi</span>
                </div>
                <span className="btn-badge">RAW JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
