import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Sparkles, 
  Heart, 
  Flame, 
  Shuffle, 
  ShieldCheck, 
  Filter, 
  MessageSquareOff, 
  Clock, 
  Smile, 
  Check, 
  X, 
  Lock, 
  Layers, 
  ChevronDown, 
  Info, 
  Users, 
  Feather, 
  Compass, 
  Share2, 
  Copy, 
  Download, 
  ExternalLink,
  MessageCircle,
  QrCode,
  Trash2,
  Eye
} from 'lucide-react'
import { FacebookIcon, XIcon, TelegramIcon } from './SocialIcons.jsx'
import { 
  MOOD_AURAS, 
  REACTION_TYPES, 
  getStoredWhispers, 
  getUserReactions, 
  getMyWhisperIds,
  submitWhisper, 
  reactToWhisper, 
  deleteWhisper,
  generateRandomAlias, 
  formatRelativeTime 
} from '../utils/whisperEngine.js'
import { playKeyClick, playWhisperSendSound, playWhisperReactionSound } from '../utils/audioSynth.js'
import { analyzeMentalHealthText, triggerMentalHealthAlert } from '../utils/mentalHealthEngine.js'
import { scrollToTop } from '../utils/smoothScroll.js'
import CollaborativeWriting from './CollaborativeWriting.jsx'

// Helper to export a stylized Quote Card PNG image from HTML5 Canvas
function generateQuoteImage(whisper, aura) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 1200
  const height = 630
  canvas.width = width
  canvas.height = height

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height)
  bgGrad.addColorStop(0, '#040914')
  bgGrad.addColorStop(0.5, '#0b1329')
  bgGrad.addColorStop(1, '#020617')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, width, height)

  // Outer Border with Glow
  ctx.strokeStyle = aura?.color || '#00f0ff'
  ctx.lineWidth = 4
  ctx.strokeRect(30, 30, width - 60, height - 60)

  // Top Tag
  ctx.fillStyle = aura?.color || '#00f0ff'
  ctx.font = 'bold 22px monospace'
  ctx.fillText(`// MOOD RING STORY // GÓC CHIA SẺ ẨN DANH • ${aura?.name?.toUpperCase() || 'BÌNH YÊN'}`, 60, 90)

  // Big Quote Mark
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.font = 'bold 130px Georgia, serif'
  ctx.fillText('“', 50, 210)

  // Quote text wrapping
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'italic 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  const text = `${whisper.text}`
  const maxWidth = width - 140
  const words = text.split(' ')
  let line = ''
  let y = 220
  const lineHeight = 46

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 65, y)
      line = words[n] + ' '
      y += lineHeight
      if (y > 470) {
        ctx.fillText(line.trim() + '...', 65, y)
        line = ''
        break
      }
    } else {
      line = testLine
    }
  }
  if (line) {
    ctx.fillText(line, 65, y)
  }

  // Author / Alias
  ctx.fillStyle = aura?.color || '#38bdf8'
  ctx.font = 'bold 26px monospace'
  ctx.fillText(`— ${whisper.alias}`, 65, Math.min(y + 60, 520))

  // Footer / Watermark
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'
  ctx.font = '18px monospace'
  ctx.fillText('🪐 Mood Ring Story • Lời thì thầm từ tâm hồn', 60, height - 55)

  return canvas.toDataURL('image/png')
}

export default function WhisperCorner({
  soundEnabled = true,
  onClose = () => {},
  isCompact = false,
  initialView = 'whispers' // 'whispers' | 'collab'
}) {
  const [activeView, setActiveView] = useState(initialView || 'whispers')
  const [collabSeed, setCollabSeed] = useState(null)
  const [whispers, setWhispers] = useState(() => getStoredWhispers())
  const [userReactions, setUserReactions] = useState(() => getUserReactions())
  const [myWhisperIds, setMyWhisperIds] = useState(() => getMyWhisperIds())

  // New Whisper Composer State
  const [inputText, setInputText] = useState('')
  const [selectedMood, setSelectedMood] = useState('calm')
  const [currentAlias, setCurrentAlias] = useState(() => generateRandomAlias())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [composerFeedback, setComposerFeedback] = useState(null)

  // Filters & Sorting
  const [filterMood, setFilterMood] = useState('all') // 'all' | 'calm' | 'warmth' | 'melancholy' | 'hope' | 'heavy' | 'passion'
  const [sortBy, setSortBy] = useState('latest') // 'latest' | 'most-reactions' | 'my-whispers'

  // Share Dialog State
  const [sharingWhisper, setSharingWhisper] = useState(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const [shareToast, setShareToast] = useState(null)

  // Floating Emoji Particles for live reactions
  const [floatingParticles, setFloatingParticles] = useState([])
  const nextParticleId = useRef(0)

  // Auto scroll to top when toggling views inside WhisperCorner
  useEffect(() => {
    scrollToTop({ immediate: true })
  }, [activeView])

  // Sync state on events
  const reloadData = () => {
    setWhispers(getStoredWhispers())
    setUserReactions(getUserReactions())
    setMyWhisperIds(getMyWhisperIds())
  }

  useEffect(() => {
    const handleAdded = () => reloadData()
    const handleReacted = () => reloadData()
    const handleDeleted = () => reloadData()

    window.addEventListener('mr-whisper-added', handleAdded)
    window.addEventListener('mr-whisper-reacted', handleReacted)
    window.addEventListener('mr-whisper-deleted', handleDeleted)

    return () => {
      window.removeEventListener('mr-whisper-added', handleAdded)
      window.removeEventListener('mr-whisper-reacted', handleReacted)
      window.removeEventListener('mr-whisper-deleted', handleDeleted)
    }
  }, [])

  // Delete a whisper with confirmation
  const handleDeleteWhisper = (whisperId) => {
    if (soundEnabled) playKeyClick()
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết ẩn danh này không? Hành động này sẽ gỡ bỏ vĩnh viễn.')) {
      deleteWhisper(whisperId)
      setShareToast('🗑️ Đã xóa bài viết thành công!')
      reloadData()
    }
  }

  // Clear toast after 3.5s
  useEffect(() => {
    if (!shareToast) return
    const timer = setTimeout(() => setShareToast(null), 3500)
    return () => clearTimeout(timer)
  }, [shareToast])

  // Handle generating new random alias
  const handleRandomizeAlias = () => {
    if (soundEnabled) playKeyClick()
    setCurrentAlias(generateRandomAlias())
  }

  // Open Share Dialog
  const handleOpenShare = (whisper) => {
    if (soundEnabled) playKeyClick()
    setSharingWhisper(whisper)
    setCopiedShare(false)
  }

  // Copy text & link
  const handleCopyQuoteText = (whisper) => {
    if (soundEnabled) playKeyClick()
    const url = window.location.href.split('?')[0] + '?view=whisper'
    const shareText = `“${whisper.text}”\n— ${whisper.alias} [Góc Chia Sẻ Ẩn Danh - Mood Ring Story]\n🔗 ${url}`
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true)
        setShareToast('📋 Đã sao chép trích dẫn & liên kết!')
        setTimeout(() => setCopiedShare(false), 2500)
      }).catch(() => {
        setShareToast('📋 Đã sao chép nội dung!')
      })
    } else {
      setShareToast('📋 Đã sao chép nội dung!')
    }
  }

  // Native Web Share
  const handleNativeShare = async (whisper) => {
    if (soundEnabled) playKeyClick()
    const url = window.location.href.split('?')[0] + '?view=whisper'
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Lời thì thầm ẩn danh - Mood Ring Story',
          text: `“${whisper.text}” — ${whisper.alias}`,
          url: url
        })
        setShareToast('✨ Đã mở chia sẻ thành công!')
      } catch (e) {
        if (e.name !== 'AbortError') {
          handleCopyQuoteText(whisper)
        }
      }
    } else {
      handleCopyQuoteText(whisper)
    }
  }

  // Download Quote Image PNG
  const handleDownloadQuote = (whisper) => {
    if (soundEnabled) playKeyClick()
    const aura = MOOD_AURAS.find(a => a.id === whisper.mood) || MOOD_AURAS[0]
    const dataUrl = generateQuoteImage(whisper, aura)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `whisper-quote-${whisper.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setShareToast('📸 Đã xuất ảnh trích dẫn tải về máy!')
  }

  // Handle submit whisper
  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!inputText.trim()) return

    setIsSubmitting(true)
    const result = submitWhisper({
      text: inputText,
      mood: selectedMood,
      alias: currentAlias
    })

    if (result.success) {
      if (soundEnabled) playWhisperSendSound()
      const sentText = inputText
      setInputText('')
      setCurrentAlias(generateRandomAlias())
      setComposerFeedback({ type: 'success', message: 'Lời thì thầm ẩn danh của bạn đã hòa vào không gian số bình yên! ✨' })
      reloadData()
      setTimeout(() => setComposerFeedback(null), 4000)

      // Mental health analysis
      const mentalRes = analyzeMentalHealthText(sentText, { source: 'Góc Ẩn Danh' })
      if (mentalRes.shouldTriggerAlert) {
        setTimeout(() => {
          triggerMentalHealthAlert({
            severity: mentalRes.severity,
            source: 'Góc Chia Sẻ Ẩn Danh (Whisper Corner)',
            keywords: mentalRes.keywords,
            message: 'AI nhận thấy lời thì thầm của bạn mang nỗi niềm bế tắc hoặc áp lực lớn. Bạn xứng đáng được lắng nghe và hỗ trợ.'
          })
        }, 1200)
      }
    } else {
      setComposerFeedback({ type: 'error', message: result.error })
    }
    setIsSubmitting(false)
  }

  // Handle emote reaction click
  const handleReactionClick = (whisperId, reactionType, e) => {
    if (soundEnabled) playWhisperReactionSound(reactionType)
    
    // Spawn floating particle at click position
    const rect = e.currentTarget.getBoundingClientRect()
    const emoji = REACTION_TYPES.find(r => r.id === reactionType)?.emoji || '✨'
    
    const newParticle = {
      id: nextParticleId.current++,
      x: rect.left + rect.width / 2 + (Math.random() * 20 - 10),
      y: rect.top - 10,
      emoji
    }

    setFloatingParticles(prev => [...prev.slice(-15), newParticle])
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== newParticle.id))
    }, 1400)

    reactToWhisper(whisperId, reactionType)
  }

  // Filter & Sort computation
  const filteredWhispers = whispers
    .filter(w => {
      if (sortBy === 'my-whispers') {
        return myWhisperIds.includes(w.id)
      }
      if (filterMood !== 'all') {
        return w.mood === filterMood
      }
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'most-reactions') {
        const totalA = Object.values(a.reactions || {}).reduce((sum, n) => sum + n, 0)
        const totalB = Object.values(b.reactions || {}).reduce((sum, n) => sum + n, 0)
        return totalB - totalA
      }
      // default: latest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const currentAura = MOOD_AURAS.find(a => a.id === selectedMood) || MOOD_AURAS[0]

  if (activeView === 'collab') {
    return (
      <div className="whisper-corner-wrapper">
        <div className="whisper-mode-toggle-bar">
          <button
            type="button"
            className="mode-toggle-btn"
            onClick={() => {
              setActiveView('whispers')
              setCollabSeed(null)
              if (soundEnabled) playKeyClick()
            }}
          >
            <span>🕊️ Góc Chia Sẻ Ẩn Danh</span>
          </button>
          <button
            type="button"
            className="mode-toggle-btn active"
          >
            <Users size={14} className="text-cyan-400" />
            <span>✍️ Viết Truyện Đôi (Cộng Tác)</span>
          </button>
        </div>

        <CollaborativeWriting
          soundEnabled={soundEnabled}
          onClose={onClose}
          initialSeedWhisper={collabSeed}
          onNavigateToWhisper={() => {
            setActiveView('whispers')
            setCollabSeed(null)
          }}
        />
      </div>
    )
  }

  return (
    <div className="whisper-corner-container">
      {/* Floating Emoji Particles Layer */}
      <div className="floating-emojis-layer pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {floatingParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -70, scale: 1.4 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="floating-reaction-emoji"
            style={{ left: p.x, top: p.y }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* View Switcher Top Bar */}
      <div className="whisper-mode-toggle-bar">
        <button
          type="button"
          className={`mode-toggle-btn ${activeView === 'whispers' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('whispers')
            if (soundEnabled) playKeyClick()
          }}
        >
          <span>🕊️ Góc Chia Sẻ Ẩn Danh</span>
        </button>
        <button
          type="button"
          className={`mode-toggle-btn ${activeView === 'collab' ? 'active' : ''}`}
          onClick={() => {
            setActiveView('collab')
            if (soundEnabled) playKeyClick()
          }}
        >
          <Users size={14} className="text-cyan-400" />
          <span>✍️ Viết Truyện Đôi (Cộng Tác)</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="whisper-header-banner">
        <div className="whisper-header-left">
          <div className="whisper-banner-icon">
            <span className="text-2xl">🕊️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="whisper-tag">// WHISPER CORNER //</span>
              <span className="whisper-safe-chip">
                <ShieldCheck size={12} className="text-emerald-400" /> Không Gian An Toàn
              </span>
            </div>
            <h3 className="whisper-title">GÓC CHIA SẺ ẨN DANH</h3>
            <p className="whisper-desc">
              Gửi gắm tâm tư ngắn lên tường chung ẩn danh. Nơi chỉ có những cái ôm, đồng cảm và yêu thương.
            </p>
          </div>
        </div>

        {/* Anti-Toxic Policy Highlight */}
        <div className="anti-toxic-notice-badge">
          <MessageSquareOff size={16} className="text-amber-400 flex-shrink-0" />
          <span>
            <strong>Chống Toxic Tuyệt Đối:</strong> Không có bình luận bằng chữ. Chỉ có 5 biểu tượng thấu cảm để bảo vệ trọn vẹn tâm trí bạn.
          </span>
        </div>
      </div>

      {/* Whisper Composer Card */}
      <div className="whisper-composer-card" style={{ borderColor: currentAura.color, boxShadow: `0 0 25px ${currentAura.glow}` }}>
        <div className="composer-header">
          <div className="flex items-center gap-2">
            <span className="composer-avatar" style={{ background: currentAura.color }}>
              {currentAura.icon}
            </span>
            <div className="alias-container">
              <span className="alias-label">BÍ DANH CỦA BẠN:</span>
              <div className="flex items-center gap-1.5">
                <span className="alias-text" style={{ color: currentAura.color }}>
                  {currentAlias}
                </span>
                <button
                  type="button"
                  className="shuffle-alias-btn"
                  onClick={handleRandomizeAlias}
                  title="Đổi bí danh ngẫu nhiên khác"
                >
                  <Shuffle size={13} />
                </button>
              </div>
            </div>
          </div>

          <div className="aura-picker-group">
            <span className="aura-picker-label">SẮC THÁI TÂM TRẠNG:</span>
            <div className="aura-dots">
              {MOOD_AURAS.map(aura => (
                <button
                  key={aura.id}
                  type="button"
                  className={`aura-dot-btn ${selectedMood === aura.id ? 'active' : ''}`}
                  style={{ '--aura-color': aura.color }}
                  onClick={() => {
                    setSelectedMood(aura.id)
                    if (soundEnabled) playKeyClick()
                  }}
                  title={aura.name}
                >
                  <span>{aura.icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Input Area */}
        <form onSubmit={handleSubmit} className="composer-form">
          <textarea
            className="whisper-textarea"
            placeholder="Bạn đang cảm thấy thế nào lúc này? Hãy thì thầm một đôi dòng thật lòng..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={180}
            rows={3}
          />

          <div className="composer-footer">
            <div className="flex items-center gap-2">
              <span className={`char-counter ${inputText.length >= 170 ? 'warning' : ''}`}>
                {inputText.length}/180 ký tự
              </span>
              {composerFeedback && (
                <span className={`feedback-msg ${composerFeedback.type}`}>
                  {composerFeedback.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !inputText.trim()}
              className="whisper-send-btn"
              style={{ background: currentAura.color }}
            >
              <Send size={15} />
              <span>Gửi Lời Thì Thầm</span>
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="whisper-toolbar">
        {/* Mood Filter Chips */}
        <div className="whisper-filter-chips">
          <button
            type="button"
            className={`filter-chip ${filterMood === 'all' && sortBy !== 'my-whispers' ? 'active' : ''}`}
            onClick={() => {
              setFilterMood('all')
              if (sortBy === 'my-whispers') setSortBy('latest')
              if (soundEnabled) playKeyClick()
            }}
          >
            Tất Cả ({whispers.length})
          </button>

          {MOOD_AURAS.map(aura => {
            const count = whispers.filter(w => w.mood === aura.id).length
            return (
              <button
                key={aura.id}
                type="button"
                className={`filter-chip ${filterMood === aura.id && sortBy !== 'my-whispers' ? 'active' : ''}`}
                style={{ '--chip-color': aura.color }}
                onClick={() => {
                  setFilterMood(aura.id)
                  if (sortBy === 'my-whispers') setSortBy('latest')
                  if (soundEnabled) playKeyClick()
                }}
              >
                <span>{aura.icon}</span> {aura.name} ({count})
              </button>
            )
          })}
        </div>

        {/* Sort Switcher */}
        <div className="whisper-sort-group">
          <button
            type="button"
            className={`sort-tab-btn ${sortBy === 'latest' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('latest')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Clock size={13} /> Mới Nhất
          </button>
          <button
            type="button"
            className={`sort-tab-btn ${sortBy === 'most-reactions' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('most-reactions')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Heart size={13} className="text-pink-400" /> Cần Nhiều Cái Ôm
          </button>
          <button
            type="button"
            className={`sort-tab-btn ${sortBy === 'my-whispers' ? 'active' : ''}`}
            onClick={() => {
              setSortBy('my-whispers')
              if (soundEnabled) playKeyClick()
            }}
          >
            <span>👤</span> Của Tôi ({myWhisperIds.length})
          </button>
        </div>
      </div>

      {/* Whispers Masonry Wall */}
      <div className="whisper-wall-grid">
        <AnimatePresence>
          {filteredWhispers.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whisper-empty-state"
            >
              <span className="empty-icon">🍃</span>
              <h4>Chưa có lời thì thầm nào ở danh mục này</h4>
              <p>Hãy là người đầu tiên gửi gắm một dòng tâm tư vào vũ trụ tĩnh mịch này nhé!</p>
            </motion.div>
          ) : (
            filteredWhispers.map((item) => {
              const aura = MOOD_AURAS.find(a => a.id === item.mood) || MOOD_AURAS[0]
              const isMine = myWhisperIds.includes(item.id)
              const reactionsMap = item.reactions || { hug: 0, heart: 0, sparkle: 0, empathy: 0, candle: 0 }
              const userReactedForThis = userReactions[item.id] || {}

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.28 }}
                  className={`whisper-card mood-${item.mood} ${isMine ? 'is-mine' : ''}`}
                  style={{
                    '--card-accent': aura.color,
                    '--card-glow': aura.glow
                  }}
                >
                  {/* Card Header */}
                  <div className="whisper-card-header">
                    <div className="flex items-center gap-2">
                      <span className="whisper-card-avatar" style={{ borderColor: aura.color }}>
                        {aura.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="whisper-card-alias" style={{ color: aura.color }}>
                            {item.alias}
                          </span>
                          {isMine && <span className="my-whisper-badge">BẠN</span>}
                        </div>
                        <span className="whisper-card-time">{formatRelativeTime(item.createdAt)}</span>
                      </div>
                    </div>

                    <span className="whisper-mood-tag" style={{ color: aura.color, borderColor: aura.color }}>
                      {aura.name}
                    </span>
                  </div>

                  {/* Card Quote Body */}
                  <div className="whisper-card-body">
                    <span className="quote-mark-open">“</span>
                    <p className="whisper-quote-text">{item.text}</p>
                    <span className="quote-mark-close">”</span>
                  </div>

                  {/* Non-toxic Pure Reaction Bar, Share & Collab Action */}
                  <div className="whisper-reactions-bar">
                    <div className="whisper-reactions-left">
                      {REACTION_TYPES.map((react) => {
                        const count = reactionsMap[react.id] || 0
                        const hasReacted = !!userReactedForThis[react.id]

                        return (
                          <button
                            key={react.id}
                            type="button"
                            className={`reaction-pill-btn ${hasReacted ? 'has-reacted' : ''}`}
                            onClick={(e) => handleReactionClick(item.id, react.id, e)}
                            title={`${react.label} (+1)`}
                          >
                            <span className="reaction-emoji">{react.emoji}</span>
                            <span className="reaction-count">{count}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div className="whisper-card-actions-right">
                      <button
                        type="button"
                        className="whisper-share-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenShare(item)
                        }}
                        title="Chia sẻ lời thì thầm này"
                      >
                        <Share2 size={13} />
                        <span className="share-btn-text">Chia sẻ</span>
                      </button>

                      <button
                        type="button"
                        className="whisper-seed-collab-btn"
                        onClick={() => {
                          setCollabSeed(item)
                          setActiveView('collab')
                          if (soundEnabled) playKeyClick()
                        }}
                        title="Dùng lời thì thầm này làm mầm mống viết truyện đôi"
                      >
                        <Feather size={12} />
                        <span className="collab-btn-text">Viết Tiếp ✍️</span>
                      </button>

                      <button
                        type="button"
                        className="whisper-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteWhisper(item.id)
                        }}
                        title="Xóa bài viết ẩn danh này"
                      >
                        <Trash2 size={13} />
                        <span className="delete-btn-text">Xóa</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* Cyberpunk Toast Notification */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            className="cyber-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <Check size={18} color="#00f0ff" />
            <span>{shareToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Cyberpunk Share Dialog Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {sharingWhisper && (
          <div 
            className="whisper-share-backdrop"
            onClick={() => setSharingWhisper(null)}
          >
            <motion.div
              className="whisper-share-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="share-modal-header">
                <div className="flex items-center gap-2">
                  <Share2 size={18} className="text-cyan-400" />
                  <h4 className="share-modal-title">CHIA SẺ LỜI THÌ THẦM</h4>
                </div>
                <button 
                  type="button" 
                  className="share-close-btn"
                  onClick={() => setSharingWhisper(null)}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Card Preview */}
              <div 
                className="share-preview-card"
                style={{
                  borderColor: (MOOD_AURAS.find(a => a.id === sharingWhisper.mood) || MOOD_AURAS[0]).color,
                  boxShadow: `0 0 25px ${(MOOD_AURAS.find(a => a.id === sharingWhisper.mood) || MOOD_AURAS[0]).glow}`
                }}
              >
                <div className="share-preview-meta">
                  <span className="share-preview-alias">
                    {(MOOD_AURAS.find(a => a.id === sharingWhisper.mood) || MOOD_AURAS[0]).icon} {sharingWhisper.alias}
                  </span>
                  <span className="share-preview-tag">
                    {(MOOD_AURAS.find(a => a.id === sharingWhisper.mood) || MOOD_AURAS[0]).name}
                  </span>
                </div>
                <p className="share-preview-quote">“{sharingWhisper.text}”</p>
                <div className="share-preview-footer">
                  <span>🪐 Mood Ring Story // Góc Ẩn Danh</span>
                </div>
              </div>

              {/* Share Options Grid */}
              <div className="share-options-grid">
                <button
                  type="button"
                  className="share-opt-btn primary"
                  onClick={() => handleCopyQuoteText(sharingWhisper)}
                >
                  {copiedShare ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  <span>{copiedShare ? 'Đã Sao Chép!' : 'Sao Chép Trích Dẫn & Link'}</span>
                </button>

                <button
                  type="button"
                  className="share-opt-btn"
                  onClick={() => handleDownloadQuote(sharingWhisper)}
                >
                  <Download size={16} className="text-cyan-400" />
                  <span>Xuất Ảnh Trích Dẫn (PNG)</span>
                </button>

                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    type="button"
                    className="share-opt-btn highlight"
                    onClick={() => handleNativeShare(sharingWhisper)}
                  >
                    <Share2 size={16} className="text-purple-400" />
                    <span>Chia Sẻ Nhanh Thiết Bị (Share Sheet)</span>
                  </button>
                )}
              </div>

              {/* Social Quick Links */}
              <div className="share-social-row">
                <span className="share-social-label">Hoặc chia sẻ trực tiếp lên:</span>
                <div className="share-social-buttons">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(`“${sharingWhisper.text}” — ${sharingWhisper.alias}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-share-pill fb"
                  >
                    <FacebookIcon size={16} />
                    <span>Facebook</span>
                  </a>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`“${sharingWhisper.text}” — ${sharingWhisper.alias} #MoodRingStory`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-share-pill tw"
                  >
                    <XIcon size={16} />
                    <span>X</span>
                  </a>

                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`“${sharingWhisper.text}” — ${sharingWhisper.alias}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-share-pill tg"
                  >
                    <TelegramIcon size={16} />
                    <span>Telegram</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
