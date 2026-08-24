// ─── Collaborative Storytelling Engine (Feature 29) ──────────────────────────
// Real-time peer collaborative writing using BroadcastChannel + LocalStorage Sync
// with seamless integration to Whisper Corner and AI Co-authoring fallback.

import { submitWhisper, generateRandomAlias } from './whisperEngine.js'
import { recordAchievementProgress } from './achievementsEngine.js'

const STORAGE_COLLAB_ROOMS_KEY = 'mr-collab-story-rooms'
const BROADCAST_CHANNEL_NAME = 'mr_collab_story_channel'

// Safe BroadcastChannel instance for real-time multi-tab / peer sync
let broadcastChannel = null
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment, falling back to storage events.', e)
}

export const COLLAB_MOODS = [
  { id: 'calm', name: 'Bình Yên & Tĩnh Lặng', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.35)', icon: '🌊' },
  { id: 'warmth', name: 'Ấm Áp & Yêu Thương', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.35)', icon: '💖' },
  { id: 'melancholy', name: 'Trầm Mặc & Hoài Niệm', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.35)', icon: '🌧️' },
  { id: 'hope', name: 'Hy Vọng & Đổi Mới', color: '#10b981', glow: 'rgba(16, 185, 129, 0.35)', icon: '🌱' },
  { id: 'mystery', name: 'Bí Ẩn & Huyền Ảo', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.35)', icon: '🔮' },
  { id: 'passion', name: 'Khát Vọng & Cao Trào', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.35)', icon: '🔥' }
]

export const AI_CO_AUTHORS = [
  { id: 'ai-poet', name: 'MR-CORE Thơ Mộng 🌌', style: 'Văn phong bay bổng, giàu hình ảnh và chất thơ' },
  { id: 'ai-philosopher', name: 'MR-CORE Triết Gia 📜', style: 'Sâu sắc, lắng đọng về ý nghĩa ký ức và thời gian' },
  { id: 'ai-cyberpunk', name: 'MR-CORE Lữ Khách ⚡', style: 'Mạnh mẽ, sắc sảo về thế giới viễn tưởng và công nghệ' }
]

// Generate friendly Room Code (e.g. "DREAM-482", "STORY-719")
export function generateRoomCode() {
  const words = ['DREAM', 'STORY', 'NOCTURNE', 'AURORA', 'CYBER', 'WHISPER', 'CHRONO', 'SPARK', 'LOTUS', 'ECHO']
  const randomWord = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(100 + Math.random() * 900)
  return `${randomWord}-${num}`
}

// Generate unique ID
export function generateUniqueId(prefix = 'seg') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
}

// Get all rooms from localStorage
export function getAllCollabRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_COLLAB_ROOMS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Get a specific room
export function getCollabRoom(roomId) {
  if (!roomId) return null
  const rooms = getAllCollabRooms()
  return rooms[roomId] || null
}

// Save or update a room
export function saveCollabRoom(room) {
  if (!room || !room.id) return
  const rooms = getAllCollabRooms()
  rooms[room.id] = {
    ...room,
    updatedAt: new Date().toISOString()
  }
  try {
    localStorage.setItem(STORAGE_COLLAB_ROOMS_KEY, JSON.stringify(rooms))
  } catch (e) {
    console.error('Failed to save collab room to localStorage', e)
  }

  // Broadcast to other tabs/windows
  broadcastRoomUpdate(room)
}

// Broadcast an action or room state
export function broadcastRoomUpdate(room, eventType = 'ROOM_UPDATED') {
  const payload = {
    type: eventType,
    roomId: room?.id,
    roomData: room,
    timestamp: Date.now()
  }

  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(payload)
    }
  } catch (e) {
    console.warn('BroadcastChannel send error:', e)
  }

  // Trigger local window custom event for this tab
  window.dispatchEvent(new CustomEvent('mr-collab-sync', { detail: payload }))
}

// Create a new collaborative writing room
export function createCollabRoom({
  title = 'Câu Chuyện Đồng Tác Giả',
  seedPrompt = '',
  mood = 'calm',
  hostAlias = '',
  targetSegments = 6,
  isAIMode = false,
  aiCoAuthorId = 'ai-poet'
} = {}) {
  const id = generateRoomCode()
  const authorName = hostAlias.trim() || generateRandomAlias()

  const initialSegments = []
  if (seedPrompt && seedPrompt.trim()) {
    initialSegments.push({
      id: generateUniqueId('seed'),
      author: authorName,
      role: 'host',
      avatarHue: '#00f0ff',
      text: seedPrompt.trim(),
      timestamp: new Date().toISOString(),
      reactions: { '💖': 1, '✨': 1 }
    })
  }

  const newRoom = {
    id,
    title: title.trim() || `Hành Trình Ký Ức #${id}`,
    mood: mood || 'calm',
    hostAlias: authorName,
    partnerAlias: isAIMode ? (AI_CO_AUTHORS.find(a => a.id === aiCoAuthorId)?.name || 'MR-CORE AI 🤖') : 'Người Bạn Đồng Điệu 🕊️',
    isAIMode: Boolean(isAIMode),
    aiCoAuthorId: aiCoAuthorId || 'ai-poet',
    targetSegments: Number(targetSegments) || 6,
    currentTurn: initialSegments.length > 0 ? 'guest' : 'host', // Guest writes next if host provided seed
    isCompleted: false,
    segments: initialSegments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedToWhisper: false
  }

  saveCollabRoom(newRoom)
  return newRoom
}

// Add a story segment to a room
export function addStorySegment(roomId, { author, role = 'host', text, avatarHue = '#00f0ff' }) {
  const room = getCollabRoom(roomId)
  if (!room || !text || !text.trim()) return { success: false, error: 'Không tìm thấy phòng hoặc nội dung trống' }

  const newSegment = {
    id: generateUniqueId('seg'),
    author: author || generateRandomAlias(),
    role: role || (room.currentTurn === 'host' ? 'host' : 'guest'),
    avatarHue: avatarHue || (role === 'host' ? '#00f0ff' : '#f43f5e'),
    text: text.trim(),
    timestamp: new Date().toISOString(),
    reactions: {}
  }

  const updatedSegments = [...(room.segments || []), newSegment]
  const isNowCompleted = updatedSegments.length >= (room.targetSegments || 6)
  const nextTurn = room.currentTurn === 'host' ? 'guest' : 'host'

  const updatedRoom = {
    ...room,
    segments: updatedSegments,
    currentTurn: isNowCompleted ? 'none' : nextTurn,
    isCompleted: isNowCompleted,
    updatedAt: new Date().toISOString()
  }

  saveCollabRoom(updatedRoom)

  // Track achievements
  try {
    recordAchievementProgress('collab_segments', 1)
    if (isNowCompleted) {
      recordAchievementProgress('collab_stories_completed', 1)
    }
  } catch (e) {
    // Ignore achievement error
  }

  return {
    success: true,
    room: updatedRoom,
    newSegment
  }
}

// React to a specific segment with emoji
export function reactToSegment(roomId, segmentId, emoji = '💖') {
  const room = getCollabRoom(roomId)
  if (!room) return null

  const updatedSegments = room.segments.map(seg => {
    if (seg.id === segmentId) {
      const reactions = { ...(seg.reactions || {}) }
      reactions[emoji] = (reactions[emoji] || 0) + 1
      return { ...seg, reactions }
    }
    return seg
  })

  const updatedRoom = {
    ...room,
    segments: updatedSegments,
    updatedAt: new Date().toISOString()
  }

  saveCollabRoom(updatedRoom)
  return updatedRoom
}

// Finish & mark room as completed
export function completeStoryRoom(roomId) {
  const room = getCollabRoom(roomId)
  if (!room) return null

  const updatedRoom = {
    ...room,
    isCompleted: true,
    currentTurn: 'none',
    updatedAt: new Date().toISOString()
  }

  saveCollabRoom(updatedRoom)
  return updatedRoom
}

// Publish collaborative story directly to Whisper Corner!
export function publishCollabStoryToWhisper(roomId) {
  const room = getCollabRoom(roomId)
  if (!room || !room.segments || room.segments.length === 0) {
    return { success: false, error: 'Không thể xuất bản câu chuyện rỗng' }
  }

  // Synthesize full story text
  const combinedText = room.segments.map((seg, idx) => `[${seg.author}]: ${seg.text}`).join('\n\n')
  const summarySnippet = room.segments.map(s => s.text).join(' ').slice(0, 160) + '...'

  const whisperResult = submitWhisper({
    text: `✨ [Tác Phẩm Cộng Tác: "${room.title}"] ${summarySnippet}`,
    mood: room.mood || 'calm',
    alias: `Đồng Tác Giả: ${room.hostAlias} & ${room.partnerAlias}`
  })

  if (whisperResult.success) {
    const updatedRoom = {
      ...room,
      publishedToWhisper: true,
      whisperId: whisperResult.whisper?.id
    }
    saveCollabRoom(updatedRoom)
    return { success: true, whisper: whisperResult.whisper }
  }

  return whisperResult
}

// AI Co-author paragraph generator (when user plays with AI co-writer)
export function generateAICoAuthorSegment(room) {
  const mood = room.mood || 'calm'
  const style = room.aiCoAuthorId || 'ai-poet'
  const prevSegments = room.segments || []
  const lastText = prevSegments.length > 0 ? prevSegments[prevSegments.length - 1].text : ''

  const AI_IDEAS = {
    'ai-poet': [
      'Gió đêm nhẹ luồn qua từng kẽ lá, mang theo hương thơm của ký ức chưa từng phai nhòa. Dường như ở ngã rẽ đó, ánh sáng đã bắt đầu trở lại.',
      'Những vì sao lặng lẽ thắp sáng bầu trời tâm thức, như nhắc nhở rằng mọi vết nứt trong tâm hồn đều là nơi ánh sáng tìm đường đi vào.',
      'Thời gian không xóa nhòa đi điều gì, nó chỉ dịu dàng phủ lên một lớp bụi phấn hoàng kim để ta trân trọng hơn khoảnh khắc này.',
      'Tiếng chuông ngân xa từ ngôi đền cổ xưa trong giấc mơ, như gọi tên một niềm hy vọng vừa mới chớm nở giữa bóng tối.'
    ],
    'ai-philosopher': [
      'Chúng ta thường mải miết đi tìm câu trả lời ở tương lai, mà quên mất rằng chính sự hiện diện trong từng hơi thở này mới là đáp án trọn vẹn nhất.',
      'Sự cô đơn không phải là sự thiếu vắng người khác, mà là cơ hội để ta lắng nghe cuộc đối thoại chân thành nhất với chính bản thể của mình.',
      'Mỗi vết sẹo đều mang một câu chuyện kiên cường. Khi học được cách chấp nhận, ta nhận ra bình yên chưa bao giờ rời xa.',
      'Vũ trụ này không tình cờ sắp đặt những cuộc gặp gỡ. Mọi dòng chữ ta viết hôm nay đều là chiếc cầu nối tới một tâm hồn đồng điệu.'
    ],
    'ai-cyberpunk': [
      'Tín hiệu sóng nơ-ron từ MR-CORE phát sáng rực rỡ, từng dòng xung điện lượng tử đan cài vào nhau mở ra một chân trời thực tại mới.',
      'Băng qua những tòa cao ốc phủ đầy đèn neon và cơn mưa số, ta nhìn thấy mảnh ký ức nguyên bản nhất được mã hóa sâu trong trái tim.',
      'Tường lửa của nỗi sợ hãi cuối cùng cũng sụp đổ trước tần số của sự chân thành. Hệ thống đã sẵn sàng cho một khởi đầu mới.',
      'Tại điểm hội tụ của thời gian và không gian số, chúng ta cùng nhau hoàn thành chương sách rực rỡ nhất của hành trình này.'
    ]
  }

  const pool = AI_IDEAS[style] || AI_IDEAS['ai-poet']
  const randomSegment = pool[Math.floor(Math.random() * pool.length)]

  return randomSegment
}

// Delete a collaborative writing room / story
export function deleteCollabRoom(roomId) {
  if (!roomId) return { success: false }
  const rooms = getAllCollabRooms()
  if (!rooms[roomId]) return { success: false }

  delete rooms[roomId]

  try {
    localStorage.setItem(STORAGE_COLLAB_ROOMS_KEY, JSON.stringify(rooms))
  } catch (e) {
    console.error('Failed to delete collab room from localStorage', e)
  }

  // Broadcast deletion to other tabs
  const payload = {
    type: 'ROOM_DELETED',
    roomId,
    timestamp: Date.now()
  }

  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(payload)
    }
  } catch (e) {
    console.warn('BroadcastChannel send error:', e)
  }

  window.dispatchEvent(new CustomEvent('mr-collab-sync', { detail: payload }))
  return { success: true }
}

// Get sharable link URL for a room
export function getCollabShareLink(roomId) {
  if (typeof window === 'undefined') return ''
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?collab=${roomId}`
}
