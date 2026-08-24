import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  X, 
  Smartphone, 
  Square, 
  Tv, 
  Palette, 
  Send, 
  ExternalLink 
} from 'lucide-react'
import { 
  DEFAULT_SHARE_DATA, 
  SOCIAL_PLATFORMS, 
  triggerNativeShare, 
  drawQRCodeToCanvas, 
  CARD_ASPECT_RATIOS, 
  CARD_STYLES, 
  renderStoryQuoteCard 
} from '../utils/socialShareEngine.js'
import { SOCIAL_ICON_MAP } from './SocialIcons.jsx'
import { playKeyClick, playCloudSyncSound } from '../utils/audioSynth.js'

export default function SocialShareModal({
  isOpen = false,
  onClose = () => {},
  currentNode = 'start',
  nodeData = null,
  activeMood = 'calm',
  soundEnabled = true
}) {
  const [activeTab, setActiveTab] = useState('quick') // 'quick' | 'studio'
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareText, setShareText] = useState('')

  // Studio Settings
  const [selectedRatio, setSelectedRatio] = useState('story') // 'story' | 'square' | 'landscape'
  const [selectedStyle, setSelectedStyle] = useState('cyberpunk') // 'cyberpunk' | 'minimalist' | 'holographic' | 'matrix'
  const [customQuote, setCustomQuote] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const qrCanvasRef = useRef(null)
  const studioCanvasRef = useRef(null)

  // Initialize share info on open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }

    const defaultQuote = nodeData?.text 
      ? (typeof nodeData.text === 'string' ? nodeData.text.replace(/<[^>]*>?/gm, '').slice(0, 140) : 'Mọi tâm thức đều để lại dấu vết trong không gian số...')
      : 'Khám phá thế giới tương tác Cyberpunk 3D sống động cùng tâm thức AI MR-CORE-01 tại Mood Ring Story!'
    
    setCustomQuote(defaultQuote)
    setShareText(defaultQuote)
  }, [isOpen, nodeData])

  // Render QR Code on canvas
  useEffect(() => {
    if (isOpen && activeTab === 'quick' && qrCanvasRef.current && shareUrl) {
      drawQRCodeToCanvas(qrCanvasRef.current, shareUrl, {
        size: 160,
        color: '#00f0ff',
        bgColor: '#030814'
      })
    }
  }, [isOpen, activeTab, shareUrl])

  // Render Typographic Story Card Studio Canvas
  useEffect(() => {
    if (isOpen && activeTab === 'studio' && studioCanvasRef.current) {
      renderStoryQuoteCard(studioCanvasRef.current, {
        quote: customQuote || 'Mọi tâm thức đều để lại dấu vết trong không gian số...',
        chapter: nodeData?.chapter || 'CHƯƠNG I: KHỞI NGUYÊN',
        character: nodeData?.character || 'MR-CORE-01 // TÂM THỨC AI',
        mood: activeMood,
        aspectRatio: selectedRatio,
        styleId: selectedStyle,
        url: typeof window !== 'undefined' ? window.location.host : 'mood-ring-story.web.app'
      })
    }
  }, [isOpen, activeTab, selectedRatio, selectedStyle, customQuote, nodeData, activeMood])

  if (!isOpen) return null

  // Copy URL with clipboard API & visual feedback
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      if (soundEnabled) playCloudSyncSound()
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  // Trigger Native Share for Link
  const handleQuickNativeShare = async () => {
    if (soundEnabled) playKeyClick()
    const res = await triggerNativeShare({
      title: DEFAULT_SHARE_DATA.title,
      text: shareText,
      url: shareUrl
    })
    if (res.fallback) {
      handleCopyLink()
    }
  }

  // Download QR Code PNG
  const handleDownloadQR = () => {
    if (!qrCanvasRef.current) return
    if (soundEnabled) playCloudSyncSound()
    const link = document.createElement('a')
    link.download = `mood-ring-story-qr-${Date.now()}.png`
    link.href = qrCanvasRef.current.toDataURL('image/png')
    link.click()
  }

  // Download High-Res Story Card PNG
  const handleDownloadStoryCard = () => {
    if (!studioCanvasRef.current) return
    setIsExporting(true)
    if (soundEnabled) playCloudSyncSound()
    
    setTimeout(() => {
      const link = document.createElement('a')
      link.download = `mood-ring-quote-card-${selectedRatio}-${Date.now()}.png`
      link.href = studioCanvasRef.current.toDataURL('image/png', 1.0)
      link.click()
      setIsExporting(false)
    }, 150)
  }

  // Native Share Image Blob
  const handleShareStoryCardImage = async () => {
    if (!studioCanvasRef.current) return
    if (soundEnabled) playKeyClick()

    studioCanvasRef.current.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `mood-ring-card-${Date.now()}.png`, { type: 'image/png' })
      
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mood Ring Story // Trích Dẫn Tâm Thức',
            text: customQuote
          })
        } catch {
          handleDownloadStoryCard()
        }
      } else {
        // Fallback to direct download
        handleDownloadStoryCard()
      }
    }, 'image/png')
  }

  return (
    <div className="social-share-backdrop" onClick={onClose} data-lenis-prevent>
      <motion.div 
        className="social-share-modal" 
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      >
        {/* Header */}
        <div className="social-share-header">
          <div className="social-share-title-group">
            <div className="social-share-icon-badge">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="social-share-title">
                CHIA SẺ LAN TỎA // SOCIAL HUB
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  v52.0
                </span>
              </h2>
              <p className="social-share-sub">Lan tỏa tâm thức AI và tạo ảnh trích dẫn Typographic nghệ thuật</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="social-share-close-btn"
            title="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="social-share-tabs">
          <button
            type="button"
            className={`social-share-tab-btn ${activeTab === 'quick' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('quick')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Share2 size={15} /> CHIA SẺ NHANH & MÃ QR
          </button>
          <button
            type="button"
            className={`social-share-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('studio')
              if (soundEnabled) playKeyClick()
            }}
          >
            <ImageIcon size={15} /> STUDIO ẢNH TRÍCH DẪN (STORY CARD)
          </button>
        </div>

        {/* Modal Body */}
        <div className="social-share-body">
          {activeTab === 'quick' && (
            <>
              {/* Link Copy Box */}
              <div className="social-link-preview-box">
                <span className="social-link-label">LIÊN KẾT TRẢI NGHIỆM TRỰC TIẾP:</span>
                <div className="social-link-input-row">
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl} 
                    className="social-link-input" 
                    onClick={e => e.target.select()}
                  />
                  <button 
                    type="button" 
                    onClick={handleCopyLink} 
                    className={`social-copy-btn ${copied ? 'copied' : ''}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP'}</span>
                  </button>
                </div>
              </div>

              {/* Social Platforms 1-Click Grid */}
              <div className="social-platforms-grid">
                {SOCIAL_PLATFORMS.map((p) => {
                  const IconComponent = SOCIAL_ICON_MAP[p.id]
                  return (
                    <a
                      key={p.id}
                      href={p.getUrl(shareUrl, shareText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-platform-card"
                      style={{ '--brand-color': p.brandColor, '--brand-glow': `${p.brandColor}40` }}
                      onClick={() => { if (soundEnabled) playKeyClick() }}
                      title={`Chia sẻ lên ${p.name}`}
                    >
                      <span className="social-platform-icon">
                        {IconComponent ? <IconComponent size={26} /> : p.icon}
                      </span>
                      <span className="social-platform-name">{p.name}</span>
                    </a>
                  )
                })}
              </div>

              {/* QR Code Dynamic Generator Section */}
              <div className="social-qr-section">
                <div className="social-qr-canvas-wrapper">
                  <canvas ref={qrCanvasRef} width="160" height="160" />
                </div>
                <div className="social-qr-info">
                  <span className="social-qr-title">📱 QUÉT MÃ QR NHANH TRÊN DI ĐỘNG</span>
                  <p className="social-qr-desc">
                    Mở camera điện thoại hoặc ứng dụng Zalo/Ngân hàng để quét mã truy cập tức thì vào hành trình tâm thức AI mà không cần gõ địa chỉ web.
                  </p>
                  <div className="flex gap-2.5 mt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="social-native-share-btn"
                      title="Lưu mã QR về máy"
                    >
                      <Download size={14} /> TẢI ẢNH MÃ QR
                    </button>
                    {typeof navigator !== 'undefined' && navigator.share && (
                      <button
                        type="button"
                        onClick={handleQuickNativeShare}
                        className="social-native-share-btn"
                        style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6', background: 'rgba(236, 72, 153, 0.1)' }}
                      >
                        <Send size={14} /> CHIA SẺ HỆ THỐNG (AIRDROP / ZALO)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'studio' && (
            <div className="story-card-studio-layout">
              {/* Left Canvas Preview */}
              <div className="story-card-preview-column">
                <canvas ref={studioCanvasRef} className="story-card-canvas" />
                <span className="text-[11px] text-slate-400 mt-2 font-mono">
                  {CARD_ASPECT_RATIOS.find(r => r.id === selectedRatio)?.width} x {CARD_ASPECT_RATIOS.find(r => r.id === selectedRatio)?.height} px // High-Res 2X DPI
                </span>
              </div>

              {/* Right Customization Controls */}
              <div className="story-card-controls-column">
                {/* Ratio Picker */}
                <div className="story-card-control-group">
                  <span className="story-card-control-label">1. TỈ LỆ KHUNG HÌNH (ASPECT RATIO):</span>
                  <div className="story-card-chips-grid">
                    {CARD_ASPECT_RATIOS.map(r => (
                      <button
                        key={r.id}
                        type="button"
                        className={`story-card-chip ${selectedRatio === r.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedRatio(r.id)
                          if (soundEnabled) playKeyClick()
                        }}
                      >
                        {r.id === 'story' && <Smartphone size={12} className="inline mr-1" />}
                        {r.id === 'square' && <Square size={12} className="inline mr-1" />}
                        {r.id === 'landscape' && <Tv size={12} className="inline mr-1" />}
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Picker */}
                <div className="story-card-control-group">
                  <span className="story-card-control-label">2. PHONG CÁCH NGHỆ THUẬT (ART STYLE):</span>
                  <div className="story-card-chips-grid">
                    {CARD_STYLES.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className={`story-card-chip ${selectedStyle === s.id ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedStyle(s.id)
                          if (soundEnabled) playKeyClick()
                        }}
                      >
                        <Palette size={12} className="inline mr-1" />
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Quote Textarea */}
                <div className="story-card-control-group">
                  <span className="story-card-control-label">3. NỘI DUNG ĐOẠN TRÍCH (CUSTOM QUOTE):</span>
                  <textarea
                    value={customQuote}
                    onChange={e => setCustomQuote(e.target.value)}
                    className="story-card-textarea"
                    placeholder="Nhập câu trích dẫn hoặc cảm xúc của bạn..."
                    maxLength={220}
                  />
                  <span className="text-[11px] text-slate-500 text-right">{customQuote.length}/220 ký tự</span>
                </div>

                {/* Action Buttons */}
                <div className="story-card-action-row">
                  <button
                    type="button"
                    onClick={handleDownloadStoryCard}
                    disabled={isExporting}
                    className="story-card-download-btn"
                  >
                    <Download size={16} />
                    <span>{isExporting ? 'ĐANG XUẤT ẢNH...' : 'TẢI ẢNH PNG'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareStoryCardImage}
                    className="story-card-share-btn"
                    title="Chia sẻ trực tiếp ảnh qua Web Share API"
                  >
                    <Send size={15} />
                    <span>CHIA SẺ</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
