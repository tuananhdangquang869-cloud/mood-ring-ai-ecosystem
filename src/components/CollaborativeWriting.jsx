import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Send,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  RotateCcw,
  Bot,
  Flame,
  Heart,
  Globe,
  BookOpen,
  Share2,
  Lock,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  MessageSquare,
  X,
  HelpCircle,
  Trash2
} from 'lucide-react'
import {
  COLLAB_MOODS,
  AI_CO_AUTHORS,
  getAllCollabRooms,
  getCollabRoom,
  createCollabRoom,
  addStorySegment,
  reactToSegment,
  completeStoryRoom,
  publishCollabStoryToWhisper,
  generateAICoAuthorSegment,
  getCollabShareLink,
  deleteCollabRoom
} from '../utils/collabStoryEngine.js'
import {
  playKeyClick,
  playCollabSendSound,
  playCollabTurnSound,
  playCollabJoinSound,
  playCollabFinishSound
} from '../utils/audioSynth.js'
import { generateRandomAlias } from '../utils/whisperEngine.js'

export default function CollaborativeWriting({
  soundEnabled = true,
  onClose = () => {},
  initialRoomId = null,
  initialSeedWhisper = null,
  onNavigateToWhisper = () => {}
}) {
  // Navigation / View State
  const [activeRoomId, setActiveRoomId] = useState(initialRoomId)
  const [room, setRoom] = useState(() => (initialRoomId ? getCollabRoom(initialRoomId) : null))
  const [savedRooms, setSavedRooms] = useState(() => getAllCollabRooms())

  // New Room Form State
  const [newTitle, setNewTitle] = useState('')
  const [newPrompt, setNewPrompt] = useState(initialSeedWhisper ? initialSeedWhisper.text : '')
  const [selectedMood, setSelectedMood] = useState(initialSeedWhisper ? initialSeedWhisper.mood : 'calm')
  const [hostAlias, setHostAlias] = useState(() => generateRandomAlias())
  const [targetSegments, setTargetSegments] = useState(6)
  const [isAIMode, setIsAIMode] = useState(false)
  const [selectedAICoAuthor, setSelectedAICoAuthor] = useState('ai-poet')
  const [joinCodeInput, setJoinCodeInput] = useState('')

  // Story Canvas Composer State
  const [segmentText, setSegmentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAITyping, setIsAITyping] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedStory, setCopiedStory] = useState(false)
  const [publishFeedback, setPublishFeedback] = useState(null)
  const [activeTab, setActiveTab] = useState(initialRoomId ? 'write' : 'lobby') // 'lobby' | 'write' | 'history'

  const scrollAnchorRef = useRef(null)

  // Sync rooms on events & BroadcastChannel
  const reloadRoomData = (roomId) => {
    const currentRooms = getAllCollabRooms()
    setSavedRooms(currentRooms)
    if (roomId) {
      const current = currentRooms[roomId] || getCollabRoom(roomId)
      setRoom(current)
    }
  }

  // Handle incoming broadcast messages & storage sync
  useEffect(() => {
    const handleCollabSync = (e) => {
      const detail = e.detail
      if (detail && detail.roomId) {
        reloadRoomData(detail.roomId)
        if (soundEnabled && detail.type === 'SEGMENT_ADDED') {
          playCollabTurnSound()
        }
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'mr-collab-story-rooms') {
        reloadRoomData(activeRoomId)
      }
    }

    window.addEventListener('mr-collab-sync', handleCollabSync)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('mr-collab-sync', handleCollabSync)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [activeRoomId, soundEnabled])

  // Sync initial props
  useEffect(() => {
    if (initialRoomId) {
      setActiveRoomId(initialRoomId)
      const found = getCollabRoom(initialRoomId)
      if (found) {
        setRoom(found)
        setActiveTab('write')
      }
    }
  }, [initialRoomId])

  useEffect(() => {
    if (initialSeedWhisper) {
      setNewPrompt(initialSeedWhisper.text || '')
      if (initialSeedWhisper.mood) setSelectedMood(initialSeedWhisper.mood)
      setActiveTab('lobby')
    }
  }, [initialSeedWhisper])

  // Auto-scroll story canvas on new segment
  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [room?.segments?.length, isAITyping])

  // Handle Create Room
  const handleCreateRoom = (e) => {
    e?.preventDefault()
    if (soundEnabled) playKeyClick()

    const created = createCollabRoom({
      title: newTitle || `Bản Hòa Tấu Ký Ức #${Math.floor(100 + Math.random() * 900)}`,
      seedPrompt: newPrompt,
      mood: selectedMood,
      hostAlias: hostAlias,
      targetSegments: Number(targetSegments),
      isAIMode: isAIMode,
      aiCoAuthorId: selectedAICoAuthor
    })

    setActiveRoomId(created.id)
    setRoom(created)
    setActiveTab('write')
    setSavedRooms(getAllCollabRooms())

    if (soundEnabled) playCollabJoinSound()
  }

  // Handle Join Room by Code
  const handleJoinByCode = (e) => {
    e?.preventDefault()
    const cleanCode = joinCodeInput.trim().toUpperCase()
    if (!cleanCode) return

    const targetRoom = getCollabRoom(cleanCode)
    if (targetRoom) {
      setActiveRoomId(targetRoom.id)
      setRoom(targetRoom)
      setActiveTab('write')
      if (soundEnabled) playCollabJoinSound()
    } else {
      alert(`Không tìm thấy phòng với mã "${cleanCode}". Hãy kiểm tra lại mã hoặc tạo phòng mới!`)
    }
  }

  // Handle Submit Story Segment
  const handleSubmitSegment = () => {
    if (!segmentText.trim() || !room || isSubmitting) return
    setIsSubmitting(true)

    if (soundEnabled) playCollabSendSound()

    // Determine current user author role
    const currentSegments = room.segments || []
    const isHost = currentSegments.length % 2 === 0
    const authorName = isHost ? room.hostAlias : (room.partnerAlias || 'Đồng Tác Giả ✍️')

    const result = addStorySegment(room.id, {
      author: authorName,
      role: isHost ? 'host' : 'guest',
      text: segmentText.trim(),
      avatarHue: isHost ? '#00f0ff' : '#f43f5e'
    })

    if (result.success) {
      setRoom(result.room)
      setSegmentText('')
      setIsSubmitting(false)

      if (result.room.isCompleted) {
        if (soundEnabled) playCollabFinishSound()
      } else if (result.room.isAIMode) {
        // Trigger simulated AI Co-author response after realistic typing pause
        triggerAICoAuthorTurn(result.room)
      }
    } else {
      setIsSubmitting(false)
    }
  }

  // Handle AI Co-author turn
  const triggerAICoAuthorTurn = (currentRoom) => {
    setIsAITyping(true)
    const delay = 1800 + Math.random() * 1200

    setTimeout(() => {
      const aiText = generateAICoAuthorSegment(currentRoom)
      const aiAuthorObj = AI_CO_AUTHORS.find(a => a.id === currentRoom.aiCoAuthorId)
      const aiName = aiAuthorObj ? aiAuthorObj.name : 'MR-CORE AI 🤖'

      const aiResult = addStorySegment(currentRoom.id, {
        author: aiName,
        role: 'guest',
        text: aiText,
        avatarHue: '#a855f7'
      })

      if (aiResult.success) {
        setRoom(aiResult.room)
        if (soundEnabled) {
          if (aiResult.room.isCompleted) {
            playCollabFinishSound()
          } else {
            playCollabTurnSound()
          }
        }
      }
      setIsAITyping(false)
    }, delay)
  }

  // Copy room link
  const handleCopyLink = () => {
    if (!room) return
    const link = getCollabShareLink(room.id)
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => setCopiedLink(false), 2500)
  }

  // Copy full story text
  const handleCopyFullStory = () => {
    if (!room || !room.segments) return
    const storyContent = `📖 ${room.title.toUpperCase()}\n` +
      `Tác giả: ${room.hostAlias} & ${room.partnerAlias}\n` +
      `Sắc thái: ${room.mood}\n` +
      `───────────────────────────────\n\n` +
      room.segments.map((s, i) => `[Đoạn ${i + 1} - ${s.author}]:\n${s.text}`).join('\n\n')

    navigator.clipboard.writeText(storyContent)
    setCopiedStory(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => setCopiedStory(false), 2500)
  }

  // Publish to Whisper Corner
  const handlePublishToWhisper = () => {
    if (!room) return
    const res = publishCollabStoryToWhisper(room.id)
    if (res.success) {
      setPublishFeedback('Đã xuất bản thành công lên Góc Chia Sẻ Ẩn Danh! 🕊️✨')
      setRoom(getCollabRoom(room.id))
      if (soundEnabled) playCollabFinishSound()
    } else {
      setPublishFeedback(res.error || 'Có lỗi xảy ra khi xuất bản')
    }
  }

  // Get active mood object
  const currentMoodObj = COLLAB_MOODS.find(m => m.id === (room?.mood || selectedMood)) || COLLAB_MOODS[0]

  return (
    <div className="collab-writing-container">
      {/* Modal / Header Tabs */}
      <div className="collab-header-bar">
        <div className="collab-title-area">
          <div className="collab-icon-halo" style={{ borderColor: currentMoodObj.color, color: currentMoodObj.color }}>
            <Users size={22} />
          </div>
          <div>
            <div className="collab-badge">
              <Sparkles size={12} className="text-cyan-400 mr-1" />
              TÍNH NĂNG 29: CỘNG TÁC THỜI GIAN THỰC
            </div>
            <h3 className="collab-main-title">Cộng Tác Viết Truyện Đôi</h3>
          </div>
        </div>

        <div className="collab-header-nav">
          <button
            type="button"
            className={`collab-nav-pill ${activeTab === 'lobby' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('lobby')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Sparkles size={14} />
            <span>Tạo Phòng & Ghép Bạn</span>
          </button>

          {room && (
            <button
              type="button"
              className={`collab-nav-pill ${activeTab === 'write' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('write')
                if (soundEnabled) playKeyClick()
              }}
            >
              <BookOpen size={14} />
              <span>Phòng Viết: {room.id}</span>
            </button>
          )}

          <button
            type="button"
            className={`collab-nav-pill ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('history')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Layers size={14} />
            <span>Tác Phẩm Của Tôi ({Object.keys(savedRooms).length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LOBBY & ROOM CREATION */}
      {activeTab === 'lobby' && (
        <motion.div
          key="lobby"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="collab-lobby-grid"
        >
          {/* Create Room Form */}
          <div className="collab-card lobby-creator">
            <div className="card-heading">
              <Sparkles size={18} className="text-cyan-400" />
              <h4>Tạo Phòng Viết Truyện Mới</h4>
            </div>
            <p className="card-desc">
              Khởi tạo không gian viết nối tiếp, nhận liên kết mời gửi cho bạn bè hoặc cộng tác cùng AI Co-Author.
            </p>

            <form onSubmit={handleCreateRoom} className="collab-form">
              {/* Title */}
              <div className="form-group">
                <label>Tựa Đề Câu Chuyện</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ánh Sáng Nơi Cuối Ký Ức..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="collab-input"
                />
              </div>

              {/* Seed Prompt */}
              <div className="form-group">
                <div className="label-with-action">
                  <label>Mầm Mống Đoạn Mở Đầu (Seed Prompt)</label>
                  {initialSeedWhisper && (
                    <span className="badge-seed">Lấy từ Lời Thì Thầm 🕊️</span>
                  )}
                </div>
                <textarea
                  rows={3}
                  placeholder="Nhập 1-2 câu mở đầu để người bạn tiếp theo viết nối tiếp..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="collab-textarea"
                />
              </div>

              {/* Mood Aura Selection */}
              <div className="form-group">
                <label>Sắc Thái Cảm Xúc (Aura Mood)</label>
                <div className="mood-chip-grid">
                  {COLLAB_MOODS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className={`mood-chip ${selectedMood === m.id ? 'selected' : ''}`}
                      style={{
                        borderColor: selectedMood === m.id ? m.color : 'rgba(255,255,255,0.1)',
                        boxShadow: selectedMood === m.id ? `0 0 14px ${m.glow}` : 'none'
                      }}
                      onClick={() => {
                        setSelectedMood(m.id)
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <span className="chip-icon">{m.icon}</span>
                      <span className="chip-name">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Alias & Target Segments */}
              <div className="form-row-2">
                <div className="form-group">
                  <div className="label-with-action">
                    <label>Bí Danh Của Bạn</label>
                    <button
                      type="button"
                      className="text-btn"
                      onClick={() => {
                        setHostAlias(generateRandomAlias())
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <RefreshCw size={11} /> Đổi Tên
                    </button>
                  </div>
                  <input
                    type="text"
                    value={hostAlias}
                    onChange={(e) => setHostAlias(e.target.value)}
                    className="collab-input"
                  />
                </div>

                <div className="form-group">
                  <label>Số Đoạn Nối Tiếp Dự Kiến</label>
                  <select
                    value={targetSegments}
                    onChange={(e) => setTargetSegments(Number(e.target.value))}
                    className="collab-select"
                  >
                    <option value={4}>4 Đoạn (Ngắn gọn & sâu sắc)</option>
                    <option value={6}>6 Đoạn (Chuẩn mực 3 hồi)</option>
                    <option value={8}>8 Đoạn (Trường thiên ký ức)</option>
                    <option value={12}>12 Đoạn (Đại thiên tiểu thuyết)</option>
                  </select>
                </div>
              </div>

              {/* AI Co-author Mode Toggle */}
              <div className="ai-mode-card">
                <div className="ai-mode-header">
                  <div className="ai-mode-title">
                    <Bot size={18} className="text-purple-400" />
                    <div>
                      <strong>Cộng tác Cùng AI Co-Author</strong>
                      <div className="text-xs text-gray-400">Nếu bạn chưa có bạn cùng chơi, AI sẽ đối đáp từng đoạn theo thời gian thực</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAIMode}
                    onChange={(e) => setIsAIMode(e.target.checked)}
                    className="collab-checkbox"
                  />
                </div>

                {isAIMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ai-author-picker"
                  >
                    {AI_CO_AUTHORS.map(ai => (
                      <div
                        key={ai.id}
                        className={`ai-author-option ${selectedAICoAuthor === ai.id ? 'active' : ''}`}
                        onClick={() => setSelectedAICoAuthor(ai.id)}
                      >
                        <div className="font-semibold text-sm text-cyan-300">{ai.name}</div>
                        <div className="text-xs text-gray-400">{ai.style}</div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Submit Create */}
              <button type="submit" className="collab-submit-btn">
                <Sparkles size={16} />
                <span>Khởi Tạo Phòng Viết Ngay</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          {/* Join Room & Quick Whisper Hub */}
          <div className="collab-lobby-sidebar">
            {/* Join Room by Code */}
            <div className="collab-card join-box">
              <div className="card-heading">
                <LinkIcon size={18} className="text-emerald-400" />
                <h4>Nhập Mã Phòng / Link</h4>
              </div>
              <p className="card-desc">Bạn được bạn bè gửi mã phòng? Hãy nhập mã vào đây để tham gia ngay.</p>
              
              <form onSubmit={handleJoinByCode} className="join-form">
                <input
                  type="text"
                  placeholder="Ví dụ: DREAM-482..."
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="collab-input join-input"
                />
                <button type="submit" className="join-btn">
                  <span>Tham Gia</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            </div>

            {/* Whisper Corner Bridge Banner */}
            <div className="collab-card whisper-bridge-box">
              <div className="card-heading">
                <MessageSquare size={18} className="text-rose-400" />
                <h4>Cầu Nối Lời Thì Thầm Ẩn Danh</h4>
              </div>
              <p className="card-desc">
                Khám phá hàng trăm tâm sự tại <strong>Góc Chia Sẻ Ẩn Danh</strong> và biến những lời thì thầm xúc động thành tác phẩm truyện đôi chữa lành.
              </p>
              <button
                type="button"
                className="bridge-action-btn"
                onClick={() => {
                  if (typeof onNavigateToWhisper === 'function') onNavigateToWhisper()
                  if (soundEnabled) playKeyClick()
                }}
              >
                <span>Khám Phá Góc Ẩn Danh</span>
                <span>🕊️ ➔</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: LIVE COLLABORATIVE WRITING CANVAS */}
      {activeTab === 'write' && room && (
        <motion.div
          key="write"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="collab-canvas-container"
        >
          {/* Room Banner */}
          <div className="canvas-header-card" style={{ borderColor: currentMoodObj.color }}>
            <div className="canvas-header-left">
              <div className="room-code-tag">
                <Globe size={13} />
                <span>PHÒNG: <strong>{room.id}</strong></span>
              </div>
              <h3 className="room-title">{room.title}</h3>
              <div className="room-meta-tags">
                <span className="meta-tag">
                  {currentMoodObj.icon} {currentMoodObj.name}
                </span>
                <span className="meta-tag">
                  👤 Tác giả 1: <strong>{room.hostAlias}</strong>
                </span>
                <span className="meta-tag">
                  ✍️ Tác giả 2: <strong>{room.partnerAlias}</strong>
                </span>
                <span className="meta-tag segments-counter">
                  📚 Tiến độ: {room.segments?.length || 0} / {room.targetSegments} đoạn
                </span>
              </div>
            </div>

            <div className="canvas-header-actions">
              <button
                type="button"
                className="share-link-btn"
                onClick={handleCopyLink}
                title="Sao chép link mời bạn bè"
              >
                {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Đã Sao Chép Link!' : 'Gửi Link Cho Bạn'}</span>
              </button>

              <button
                type="button"
                className="action-icon-btn"
                onClick={handleCopyFullStory}
                title="Sao chép toàn bộ truyện"
              >
                {copiedStory ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedStory ? 'Đã Lưu Văn Bản' : 'Sao Chép'}</span>
              </button>

              <button
                type="button"
                className="action-icon-btn delete-room-btn"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa phòng viết "${room.title}" (#${room.id}) không?`)) {
                    deleteCollabRoom(room.id)
                    setActiveRoomId(null)
                    setRoom(null)
                    setActiveTab('history')
                    reloadRoomData()
                    if (soundEnabled) playKeyClick()
                  }
                }}
                title="Xóa phòng viết này"
              >
                <Trash2 size={14} className="text-red-400" />
                <span>Xóa Phòng</span>
              </button>
            </div>
          </div>

          {/* Turn Status Banner */}
          <div className={`turn-status-banner ${room.isCompleted ? 'completed' : room.currentTurn === 'host' ? 'host-turn' : 'guest-turn'}`}>
            {room.isCompleted ? (
              <div className="turn-banner-content">
                <Award size={18} className="text-amber-400" />
                <span>🎉 <strong>TÁC PHẨM ĐÃ HOÀN TẤT!</strong> Cả hai tác giả đã cùng nhau hoàn thành một tuyệt phẩm ký ức trọn vẹn.</span>
              </div>
            ) : isAITyping ? (
              <div className="turn-banner-content">
                <Sparkles size={18} className="text-purple-400 animate-spin" />
                <span>🤖 <strong>{room.partnerAlias}</strong> đang chắp bút viết nối tiếp đoạn tiếp theo...</span>
              </div>
            ) : (
              <div className="turn-banner-content">
                <Sparkles size={18} className="text-cyan-400" />
                <span>✍️ <strong>Đến lượt viết tiếp:</strong> Hãy thêm một đoạn văn để tiếp tục dòng chảy ký ức!</span>
              </div>
            )}
          </div>

          {/* Story Segments Feed */}
          <div className="story-segments-scroll">
            {(!room.segments || room.segments.length === 0) ? (
              <div className="empty-story-state">
                <BookOpen size={36} className="text-gray-500 mb-2" />
                <p>Câu chuyện chưa có đoạn mở đầu. Hãy viết đoạn văn đầu tiên ở khung bên dưới để bắt đầu!</p>
              </div>
            ) : (
              room.segments.map((seg, idx) => (
                <motion.div
                  key={seg.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`story-segment-bubble ${seg.role === 'host' ? 'host-bubble' : 'guest-bubble'}`}
                >
                  <div className="segment-top">
                    <div className="segment-author-badge">
                      <span className="author-avatar-dot" style={{ backgroundColor: seg.avatarHue || '#00f0ff' }}></span>
                      <strong className="author-name">{seg.author}</strong>
                      <span className="segment-index">Đoạn {idx + 1}</span>
                    </div>
                    <span className="segment-time">
                      {new Date(seg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="segment-body-text">
                    {seg.text}
                  </div>

                  <div className="segment-reactions">
                    {['💖', '✨', '🔥', '🫂'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="reaction-mini-btn"
                        onClick={() => {
                          reactToSegment(room.id, seg.id, emoji)
                          if (soundEnabled) playKeyClick()
                        }}
                      >
                        <span>{emoji}</span>
                        <span className="reaction-count">{(seg.reactions && seg.reactions[emoji]) || 0}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))
            )}

            {isAITyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="story-segment-bubble guest-bubble ai-typing-bubble"
              >
                <div className="ai-typing-indicator">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="text-xs text-purple-300 ml-2">Đang liên kết sóng cảm xúc...</span>
                </div>
              </motion.div>
            )}

            <div ref={scrollAnchorRef} />
          </div>

          {/* Canvas Composer Bar or Completion Actions */}
          {!room.isCompleted ? (
            <div className="collab-composer-box">
              <textarea
                rows={3}
                placeholder="Viết đoạn văn nối tiếp mạch truyện của người bạn đồng hành..."
                value={segmentText}
                onChange={(e) => setSegmentText(e.target.value)}
                disabled={isSubmitting || isAITyping}
                className="collab-composer-textarea"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSubmitSegment()
                  }
                }}
              />

              <div className="composer-actions-bar">
                <div className="composer-hints">
                  <span>{segmentText.length} ký tự</span>
                  <span className="hint-sep">•</span>
                  <span className="text-xs text-gray-400">Nhấn <strong>Ctrl+Enter</strong> để gửi nhanh</span>
                </div>

                <div className="composer-buttons">
                  <button
                    type="button"
                    className="finish-early-btn"
                    onClick={() => {
                      if (confirm('Bạn có chắc muốn đóng và hoàn thành câu chuyện sớm?')) {
                        completeStoryRoom(room.id)
                        if (soundEnabled) playCollabFinishSound()
                      }
                    }}
                  >
                    <span>Hoàn Tất Câu Chuyện</span>
                  </button>

                  <button
                    type="button"
                    className="collab-send-btn"
                    disabled={!segmentText.trim() || isSubmitting || isAITyping}
                    onClick={handleSubmitSegment}
                  >
                    <Send size={15} />
                    <span>Gửi Đoạn Viết</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="collab-completion-panel">
              <div className="completion-headline">
                <Award size={24} className="text-amber-400 mr-2" />
                <h4>Tuyệt Tác Đồng Tác Giả Đã Hoàn Thành!</h4>
              </div>
              <p className="completion-desc">
                Bạn có thể sao chép văn bản hoàn chỉnh hoặc xuất bản trực tiếp lên <strong>Góc Chia Sẻ Ẩn Danh (Whisper Corner)</strong> để lan tỏa năng lượng chữa lành tới cộng đồng.
              </p>

              {publishFeedback && (
                <div className="publish-feedback-alert">
                  <Sparkles size={16} className="text-emerald-400" />
                  <span>{publishFeedback}</span>
                </div>
              )}

              <div className="completion-actions-grid">
                <button
                  type="button"
                  className="completion-btn whisper-publish"
                  onClick={handlePublishToWhisper}
                  disabled={room.publishedToWhisper}
                >
                  <MessageSquare size={16} />
                  <span>{room.publishedToWhisper ? 'Đã Xuất Bản Lên Góc Ẩn Danh ✓' : 'Xuất Bản Lên Góc Ẩn Danh 🕊️'}</span>
                </button>

                <button
                  type="button"
                  className="completion-btn copy-full"
                  onClick={handleCopyFullStory}
                >
                  <Copy size={16} />
                  <span>Sao Chép Toàn Bộ Truyện 📋</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* TAB 3: SAVED COLLAB STORIES HISTORY */}
      {activeTab === 'history' && (
        <motion.div
          key="history"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="collab-history-grid"
        >
          {Object.keys(savedRooms).length === 0 ? (
            <div className="empty-history-box">
              <BookOpen size={40} className="text-gray-500 mb-2" />
              <h4>Chưa có tác phẩm cộng tác nào</h4>
              <p>Hãy tạo phòng hoặc tham gia cùng bạn bè để bắt đầu câu chuyện đầu tiên!</p>
              <button
                type="button"
                className="collab-submit-btn"
                style={{ width: 'auto', marginTop: '1rem' }}
                onClick={() => setActiveTab('lobby')}
              >
                <Sparkles size={16} />
                <span>Tạo Phòng Mới</span>
              </button>
            </div>
          ) : (
            Object.values(savedRooms).map(r => {
              const moodItem = COLLAB_MOODS.find(m => m.id === r.mood) || COLLAB_MOODS[0]
              return (
                <div key={r.id} className="collab-history-card">
                  <div className="history-top">
                    <span className="room-id-badge">#{r.id}</span>
                    <span className="mood-tag" style={{ borderColor: moodItem.color, color: moodItem.color }}>
                      {moodItem.icon} {moodItem.name}
                    </span>
                  </div>

                  <h4 className="history-title">{r.title}</h4>
                  <div className="history-authors">
                    <span>✍️ {r.hostAlias} & {r.partnerAlias}</span>
                  </div>
                  <div className="history-progress">
                    Đoạn viết: {r.segments?.length || 0} / {r.targetSegments} {r.isCompleted && '• Đã Hoàn Tất 🎉'}
                  </div>

                  <div className="history-actions">
                    <button
                      type="button"
                      className="history-open-btn"
                      onClick={() => {
                        setActiveRoomId(r.id)
                        setRoom(r)
                        setActiveTab('write')
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <span>Mở Phòng Viết</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      type="button"
                      className="history-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (window.confirm(`Bạn có chắc chắn muốn xóa tác phẩm cộng tác "${r.title}" (#${r.id}) không?`)) {
                          deleteCollabRoom(r.id)
                          reloadRoomData()
                          if (soundEnabled) playKeyClick()
                        }
                      }}
                      title="Xóa tác phẩm này"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </motion.div>
      )}
    </div>
  )
}
