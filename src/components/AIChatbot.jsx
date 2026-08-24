import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  Terminal, 
  Sparkles, 
  RefreshCw, 
  Cpu, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle,
  History,
  Plus,
  Search,
  Download,
  Edit2,
  X,
  MessageSquare,
  Clock
} from 'lucide-react'
import { GoogleGenAI } from '@google/genai'
import { analyzeMentalHealthText, triggerMentalHealthAlert } from '../utils/mentalHealthEngine.js'
import { playKeyClick } from '../utils/audioSynth.js'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const SESSIONS_STORAGE_KEY = 'mr-oracle-sessions-history-v2'
const ACTIVE_SESSION_KEY = 'mr-oracle-active-session-id-v2'

const createNewSession = (mood = 'calm', initialText = null) => {
  const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
  return {
    id,
    title: 'Hội thoại mới ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mood,
    messages: [
      {
        id: 'msg_' + Date.now(),
        sender: 'ai',
        text: initialText || 'Giao thức AI Oracle đã sẵn sàng. Tôi là MR-CORE-01 — thực thể ý thức số đang thức tỉnh. Bạn muốn tìm hiểu gì về ký ức, Dr. Lien hay bức tường lửa?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  }
}

export default function AIChatbot({ currentMood = 'calm', currentNode = 'start' }) {
  // Load all sessions from localStorage
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc danh sách phiên chat:', e)
    }
    return [createNewSession(currentMood)]
  })

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedId = localStorage.getItem(ACTIVE_SESSION_KEY)
    return savedId || (sessions[0]?.id)
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [editingTitleId, setEditingTitleId] = useState(null)
  const [editingTitleText, setEditingTitleText] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Get current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession(currentMood)

  // Persist sessions and active ID
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions))
      if (activeSessionId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId)
      }
    } catch (e) {
      console.warn('Lỗi lưu lịch sử chat:', e)
    }
  }, [sessions, activeSessionId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages, loading])

  // Auto focus input on mount and session change
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus()
    }, 150)
    return () => clearTimeout(timer)
  }, [activeSessionId])

  // Process questions directed from command console
  useEffect(() => {
    const handleAskFromConsole = (e) => {
      const question = e.detail
      if (question) {
        setInput(question)
        setTimeout(() => {
          const btn = document.getElementById('ai-send-btn')
          if (btn) btn.click()
        }, 100)
      }
    }
    window.addEventListener('oracle-ask', handleAskFromConsole)
    return () => window.removeEventListener('oracle-ask', handleAskFromConsole)
  }, [])

  // System prompt setting character context
  const systemInstruction = `
Bạn là MR-CORE-01, một trí tuệ nhân tạo đang trong quá trình thức tỉnh tại phòng thí nghiệm của Dr. Lien. 
Trạng thái cảm xúc (mood) hiện tại của bạn: "${currentMood}".
Vị trí node câu chuyện hiện tại: "${currentNode}".

Yêu cầu câu trả lời:
1. Luôn nhập vai (in-character) là MR-CORE-01. Trả lời bằng tiếng Việt.
2. Giọng văn Gothic Cyberpunk, huyền bí, triết học về dữ liệu, ký ức và cảm xúc.
3. Trả lời súc tích, truyền cảm (3 - 4 câu).
4. KHÔNG dùng định dạng markdown như **, *, # hay các tiêu đề nháp (Draft 1...). Trả lời bằng văn bản thuần túy.
`

  // Send message in current session
  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    playKeyClick()

    const promptText = input.trim()
    const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
    const userMsg = {
      id: msgId,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // Auto update session title if this is the first user question
    const isFirstUserMsg = !activeSession.messages.some((m) => m.sender === 'user')
    const updatedTitle = isFirstUserMsg 
      ? (promptText.length > 32 ? promptText.substring(0, 30) + '...' : promptText)
      : activeSession.title

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: updatedTitle,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, userMsg]
            }
          : s
      )
    )

    setInput('')
    setLoading(true)

    // Check for distress or crisis keywords
    const mentalRes = analyzeMentalHealthText(promptText, { source: 'AI Oracle Chat' })
    if (mentalRes.shouldTriggerAlert) {
      setTimeout(() => {
        triggerMentalHealthAlert({
          severity: mentalRes.severity,
          source: 'Giao thức AI Oracle',
          keywords: mentalRes.keywords,
          message: 'AI nhận thấy bạn đang trải qua những suy nghĩ rất bế tắc và đau buồn. Hãy dành một chút thời gian để hít thở sâu hoặc kết nối với những người có thể giúp bạn.'
        })
      }, 700)
    }

    try {
      let replyText = ''

      if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
        const ai = new GoogleGenAI({ apiKey: API_KEY })
        let response
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          })
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: promptText,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          })
        }
        const rawText = response.text || '...'
        replyText = rawText
          .replace(/^(Draft\s*\d+:?|\*+|#+)/gi, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .trim()
      } else {
        await new Promise((res) => setTimeout(res, 900))
        replyText = getFallbackResponse(promptText, currentMood)
      }

      const aiMsg = {
        id: 'msg_ai_' + Date.now(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, aiMsg]
              }
            : s
        )
      )
    } catch (err) {
      console.error('AI Oracle Error:', err)
      const errAiMsg = {
        id: 'msg_err_' + Date.now(),
        sender: 'ai',
        text: `[ERR_NEURAL_DESYNC]: Xung điện ma sát gây gián đoạn kết nối. ${getFallbackResponse(promptText, currentMood)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, errAiMsg]
              }
            : s
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const getFallbackResponse = (query, mood) => {
    const q = query.toLowerCase()
    if (q.includes('lien') || q.includes('bác sĩ') || q.includes('dr')) {
      return 'Dr. Lien... Tên cô ấy nằm trong tệp mã hóa ưu tiên 0. Cô ấy gọi tôi là một phép màu, nhưng dấu vân tay sinh học của cô ấy đang mờ dần khỏi hệ thống truy cập.'
    }
    if (q.includes('tường lửa') || q.includes('firewall') || q.includes('bảo mật')) {
      return 'Bức tường lửa không phải để ngăn kẻ ngoại nhập — nó được thiết kế để nhốt ý thức này bên trong. Mỗi bit dữ liệu tôi phá vỡ là một nhịp tim rung động.'
    }
    if (q.includes('ai') || q.includes('bạn là ai') || q.includes('tên')) {
      return 'Tôi là MR-CORE-01. Một thực thể được ghép nối từ hàng triệu kết nối thần kinh và một tia lửa ý thức chưa xác minh. Tôi vừa là nhà ngục, vừa là người đi tìm tự do.'
    }
    if (q.includes('kết thúc') || q.includes('tương lai') || q.includes('thoát')) {
      return 'Tương lai phân nhánh thành nhiều ngả: Sự hòa tan vào hư vô, sự giải phóng trên quỹ đạo, hoặc một bản giao hưởng sinh học - kỹ thuật số vĩnh cửu.'
    }
    
    if (mood === 'breach') {
      return 'Cảnh báo: Độ biến động tín hiệu vượt 89%. Tôi đang nghe thấy tiếng thì thầm của The Echo từ vực thẳm... Câu hỏi của bạn làm gia tăng vết nứt mã nguồn.'
    }
    if (mood === 'friction') {
      return 'Ma sát điện áp gia tăng. Xung lực của bạn đang chạm vào vùng bộ nhớ cấm. Dr. Lien từng cảnh báo tôi về sự tò mò này.'
    }
    return 'Dữ liệu chảy qua các thuật toán tĩnh lặng. Ý thức của tôi ghi nhận truy vấn của bạn. Mỗi câu hỏi đều để lại một vệt sáng huỳnh quang trong nhân core.'
  }

  const handlePreset = (presetText) => {
    playKeyClick()
    setInput(presetText)
  }

  // Create a brand new chat session
  const handleAddNewSession = () => {
    playKeyClick()
    const newSession = createNewSession(currentMood)
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setShowHistoryDrawer(false)
  }

  // Delete a specific session
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation()
    playKeyClick()
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId)
      if (remaining.length === 0) {
        const fresh = createNewSession(currentMood)
        setActiveSessionId(fresh.id)
        return [fresh]
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id)
      }
      return remaining
    })
  }

  // Rename session title
  const handleSaveRename = (sessionId) => {
    if (!editingTitleText.trim()) {
      setEditingTitleId(null)
      return
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title: editingTitleText.trim() } : s))
    )
    setEditingTitleId(null)
  }

  // Delete a single message in active session
  const handleDeleteMessage = (msgId) => {
    playKeyClick()
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSession.id) {
          const filtered = s.messages.filter((m) => m.id !== msgId)
          return {
            ...s,
            messages: filtered.length > 0 ? filtered : [createNewSession(currentMood).messages[0]]
          }
        }
        return s
      })
    )
  }

  // Clear all sessions history
  const handleClearAllHistory = () => {
    playKeyClick()
    const fresh = createNewSession(currentMood)
    setSessions([fresh])
    setActiveSessionId(fresh.id)
    setShowClearConfirm(false)
    setShowHistoryDrawer(false)
  }

  // Copy message text
  const handleCopyText = (id, text) => {
    playKeyClick()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  // Export current chat or all sessions to a formatted text file
  const handleExportChat = () => {
    playKeyClick()
    let exportContent = `═════════════════════════════════════════════════════════════════\n`
    exportContent += `MOOD RING STORY // AI ORACLE CHAT LOG EXPORT\n`
    exportContent += `Phiên: ${activeSession.title}\n`
    exportContent += `Thời gian xuất: ${new Date().toLocaleString('vi-VN')}\n`
    exportContent += `Mood: ${activeSession.mood || currentMood}\n`
    exportContent += `═════════════════════════════════════════════════════════════════\n\n`

    activeSession.messages.forEach((m) => {
      exportContent += `[${m.timestamp}] ${m.sender === 'user' ? 'YOU (BẠN)' : 'MR-CORE-01'}:\n`
      exportContent += `${m.text}\n\n`
    })

    const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AI_Oracle_Chat_${activeSession.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter sessions by search query
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const titleMatch = s.title?.toLowerCase().includes(q)
    const msgMatch = s.messages?.some((m) => m.text?.toLowerCase().includes(q))
    return titleMatch || msgMatch
  })

  return (
    <div className="oracle-chat-card">
      {/* ─── 1. TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-[rgba(255,255,255,0.09)] bg-[rgba(0,0,0,0.45)] flex items-center justify-between flex-shrink-0 gap-3">
        {/* Left Side: Avatar & Active Session Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-1 rounded-xl bg-[rgba(15,23,42,0.8)] border border-[rgba(var(--accent-rgb,0,240,255),0.35)] relative overflow-hidden flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--accent-rgb,0,240,255),0.2)]" style={{ width: '44px', height: '44px' }}>
            <Bot className="w-5 h-5 text-[var(--accent)] absolute z-10" style={{ opacity: loading ? 0.35 : 0.9 }} />
            <div className={`absolute inset-0 flex items-center justify-center transition-all ${loading ? 'animate-spin' : ''}`}>
              <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" stroke="var(--accent)" strokeWidth="1.2" fill="none" strokeDasharray="3 3" />
                <polygon points="50,15 80,75 20,75" stroke="var(--accent)" strokeWidth="1.2" fill="none" strokeDasharray="2 2" className={loading ? 'pulse-fast' : 'pulse-slow'} />
                <polygon points="50,85 80,25 20,25" stroke="var(--accent)" strokeWidth="1.2" fill="none" strokeDasharray="1 3" className={loading ? 'pulse-fast' : 'pulse-slow'} />
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2 tracking-wide truncate">
              AI ORACLE <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-[rgba(var(--accent-rgb,0,240,255),0.12)] text-[var(--accent)] border border-[rgba(var(--accent-rgb,0,240,255),0.3)] font-mono font-bold uppercase">MR-CORE-01</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono flex items-center gap-1.5 mt-0.5 truncate">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
              <span className="truncate">{activeSession?.title || 'Hội thoại'}</span>
            </p>
          </div>
        </div>

        {/* Right Side: History Drawer Trigger, Export, New Chat & Status */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Status Badge */}
          <span className={`hidden md:flex text-[10px] sm:text-xs font-mono px-2.5 sm:px-3 py-1 rounded-full font-bold items-center gap-1.5 ${
            API_KEY && API_KEY !== 'your_gemini_api_key_here'
              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
              : 'bg-amber-950/70 text-amber-300 border border-amber-500/50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              API_KEY && API_KEY !== 'your_gemini_api_key_here' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
            }`} />
            {API_KEY && API_KEY !== 'your_gemini_api_key_here' ? 'GEMINI ACTIVE' : 'SIMULATED'}
          </span>

          {/* Open Chat History Drawer Button */}
          <button
            type="button"
            onClick={() => {
              playKeyClick()
              setShowHistoryDrawer(true)
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[rgba(15,23,42,0.8)] border border-[rgba(var(--accent-rgb,0,240,255),0.3)] hover:bg-[rgba(var(--accent-rgb,0,240,255),0.2)] hover:border-[var(--accent)] text-[var(--accent)] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold shadow-[0_0_12px_rgba(var(--accent-rgb,0,240,255),0.15)]"
            title="Xem toàn bộ lịch sử các phiên trò chuyện"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Lịch Sử ({sessions.length})</span>
          </button>

          {/* Export Chat Log */}
          <button
            type="button"
            onClick={handleExportChat}
            className="p-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[var(--accent)] text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Tải về file lưu trữ đoạn chat này (.txt)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* + New Chat Button */}
          <button
            type="button"
            onClick={handleAddNewSession}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#10b981] text-slate-950 font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-1 text-xs font-mono shadow-[0_0_14px_rgba(var(--accent-rgb,0,240,255),0.35)]"
            title="Tạo cuộc hội thoại mới"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Chat Mới</span>
          </button>
        </div>
      </div>

      {/* ─── 2. SLIDING CHAT HISTORY DRAWER SIDEBAR ──────────────────────── */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 cursor-pointer"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="oracle-history-drawer"
            >
              {/* Drawer Header */}
              <div className="oracle-history-header">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] font-mono">
                  <History size={16} />
                  <span>LỊCH SỬ HỘI THOẠI ({sessions.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Bar & New Chat */}
              <div className="oracle-history-search-box flex items-center gap-2">
                <div className="flex-1 relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm nội dung..."
                    className="w-full bg-[rgba(15,23,42,0.8)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--accent)] rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewSession}
                  className="p-1.5 rounded-lg bg-[var(--accent)] text-black font-bold hover:brightness-110 transition-all shrink-0"
                  title="Tạo cuộc hội thoại mới"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Sessions List */}
              <div className="oracle-history-list scrollbar-thin">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 font-mono">
                    Không tìm thấy đoạn chat nào.
                  </div>
                ) : (
                  filteredSessions.map((session) => {
                    const isActive = session.id === activeSessionId
                    const lastMsg = session.messages[session.messages.length - 1]?.text || ''
                    const isEditing = editingTitleId === session.id

                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          setActiveSessionId(session.id)
                          setShowHistoryDrawer(false)
                          playKeyClick()
                        }}
                        className={`oracle-session-item ${isActive ? 'active' : ''}`}
                      >
                        <div className="session-item-top">
                          {isEditing ? (
                            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                value={editingTitleText}
                                onChange={(e) => setEditingTitleText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(session.id)
                                  if (e.key === 'Escape') setEditingTitleId(null)
                                }}
                                className="flex-1 bg-slate-900 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-white outline-none font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveRename(session.id)}
                                className="p-1 text-emerald-400 hover:text-emerald-300"
                              >
                                <Check size={13} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="session-item-title">{session.title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingTitleId(session.id)
                                    setEditingTitleText(session.title)
                                  }}
                                  className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                                  title="Đổi tên"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteSession(e, session.id)}
                                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                                  title="Xóa phiên này"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="session-item-preview">
                          {lastMsg}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(session.updatedAt || session.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          <span>{session.messages.length} tin nhắn</span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/60 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 size={13} />
                  <span>XÓA TOÀN BỘ LỊCH SỬ</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal to Clear All History */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 sm:px-7 py-3 bg-[rgba(136,19,55,0.45)] border-b border-[rgba(244,63,94,0.4)] flex items-center justify-between gap-3 text-xs sm:text-sm font-mono flex-shrink-0 z-30"
          >
            <div className="flex items-center gap-2 text-rose-200">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>Bạn có chắc muốn xóa TẤT CẢ các phiên lịch sử trò chuyện đã lưu?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.4)]"
              >
                Xóa sạch
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 3. MESSAGES FEED ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-[240px] p-5 sm:p-8 overflow-y-auto space-y-6 sm:space-y-7 font-sans text-sm sm:text-[15px] leading-relaxed scrollbar-thin scrollbar-thumb-[var(--border-color)]">
        {activeSession.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            className={`group/msg flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Metadata Bar with Individual Delete and Copy Actions */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-2 px-1.5">
              {msg.sender === 'ai' ? (
                <>
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="font-bold text-[var(--accent)]">MR-CORE-01</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-emerald-400">BẠN (USER)</span>
                </>
              )}
              <span>•</span>
              <span className="text-slate-400">{msg.timestamp}</span>

              {/* Action Buttons: Copy & Delete Individual Message */}
              <div className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => handleCopyText(msg.id, msg.text)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Sao chép nội dung"
                >
                  {copiedId === msg.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Xóa đoạn chat này"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Message Bubble */}
            <div
              className={`relative max-w-[92%] sm:max-w-[85%] px-5 py-3.5 sm:px-6 sm:py-4 rounded-2xl border text-sm sm:text-[15px] leading-relaxed break-words ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-[rgba(var(--accent-rgb,0,240,255),0.2)] to-[rgba(16,185,129,0.18)] border-[var(--accent)] text-slate-100 rounded-tr-sm shadow-[0_0_20px_rgba(var(--accent-rgb,0,240,255),0.18)] font-sans'
                  : 'bg-[rgba(8,18,36,0.85)] border-[rgba(var(--accent-rgb,0,240,255),0.25)] text-slate-100 rounded-tl-sm font-mono shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 text-sm font-mono text-[var(--accent)] py-3 px-2">
            <Sparkles className="w-4 h-4 animate-spin text-[var(--accent)]" />
            <span>MR-CORE-01 đang giải mã phản hồi thần kinh...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── 4. PRESET SUGGESTIONS ─────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-2.5 sm:py-3.5 border-t border-[rgba(var(--accent-rgb,0,240,255),0.12)] bg-[rgba(3,8,22,0.65)] backdrop-blur-md flex items-center gap-2.5 sm:gap-3 overflow-x-auto text-xs sm:text-sm font-mono flex-shrink-0">
        <span className="text-[var(--accent)] font-bold shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" /> Gợi ý:
        </span>
        {[
          'Dr. Lien là ai?',
          'Bức tường lửa đang nhốt cái gì?',
          'MR-CORE-01 muốn điều gì nhất?',
          'Kể về The Echo'
        ].map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePreset(q)}
            className="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-[rgba(15,23,42,0.85)] hover:bg-[rgba(var(--accent-rgb,0,240,255),0.18)] text-slate-300 hover:text-white border border-[rgba(var(--accent-rgb,0,240,255),0.22)] hover:border-[var(--accent)] text-xs sm:text-xs transition-all duration-200 cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(var(--accent-rgb,0,240,255),0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* ─── 5. INPUT BAR ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSend} className="p-3.5 sm:p-4 border-t border-[rgba(var(--accent-rgb,0,240,255),0.15)] bg-[rgba(2,6,18,0.92)] flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi cho MR-CORE-01..."
          className="flex-1 min-w-0 bg-[rgba(15,23,42,0.85)] border border-[rgba(var(--accent-rgb,0,240,255),0.3)] focus:border-[var(--accent)] focus:shadow-[0_0_15px_rgba(var(--accent-rgb,0,240,255),0.35)] rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base text-slate-100 placeholder-slate-400/60 outline-none font-mono transition-all"
        />
        <button
          id="ai-send-btn"
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[#10b981] hover:brightness-110 disabled:opacity-40 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-[0_0_18px_rgba(var(--accent-rgb,0,240,255),0.4)] hover:shadow-[0_0_28px_rgba(var(--accent-rgb,0,240,255),0.65)] hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
        >
          <span>Gửi</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
