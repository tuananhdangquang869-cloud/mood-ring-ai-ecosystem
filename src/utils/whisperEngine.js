// ─── Whisper Corner Engine (Feature 28) ────────────────────────────────────────
// Safe anonymous sharing wall with non-toxic emote-only reactions (Hug, Heart, Sparkle, Empathy, Candle)

import { recordAchievementProgress } from './achievementsEngine.js'

const STORAGE_WHISPERS_KEY = 'mr-anonymous-whispers'
const STORAGE_USER_REACTIONS_KEY = 'mr-user-reacted-whispers'
const STORAGE_MY_WHISPERS_KEY = 'mr-my-whispers-ids'

export const MOOD_AURAS = [
  { id: 'calm', name: 'Bình Yên', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', icon: '🌊' },
  { id: 'warmth', name: 'Ấm Áp & Yêu Thương', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', icon: '💖' },
  { id: 'melancholy', name: 'Trầm Mặc & Nhớ Nhung', color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)', icon: '🌧️' },
  { id: 'hope', name: 'Hy Vọng & Động Lực', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', icon: '🌱' },
  { id: 'heavy', name: 'Áp Lực Cần Cái Ôm', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', icon: '🫂' },
  { id: 'passion', name: 'Khát Vọng Rực Lửa', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', icon: '🔥' }
]

export const REACTION_TYPES = [
  { id: 'hug', emoji: '🤗', label: 'Ôm một cái', sound: 'hug', color: '#38bdf8' },
  { id: 'heart', emoji: '💖', label: 'Thả tim', sound: 'heart', color: '#f43f5e' },
  { id: 'sparkle', emoji: '✨', label: 'Động viên', sound: 'sparkle', color: '#fbbf24' },
  { id: 'empathy', emoji: '🫂', label: 'Đồng cảm', sound: 'empathy', color: '#a855f7' },
  { id: 'candle', emoji: '🕯️', label: 'Bình an', sound: 'candle', color: '#34d399' }
]

const ALIAS_PREFIXES = [
  'Kẻ Ngắm Sao', 'Cánh Bướm Đêm', 'Mưa Rào Tháng Sáu', 'Tia Nắng Mùa Đông', 
  'Chiếc Lá Mùa Thu', 'Gió Đêm Cyberpunk', 'Một Tâm Hồn Mộng Mơ', 'Người Đi Tìm Bình Yên', 
  'Cốc Trà Hoa Cúc', 'Ngọn Hải Đăng Cô Đơn', 'Bản Nhạc Lofi', 'Mây Trắng Lãng Du',
  'Chú Mèo Bên Cửa Sổ', 'Kẻ Gác Đêm Không Gian', 'Sóng Biển Rì Rào'
]

export function generateRandomAlias() {
  const prefix = ALIAS_PREFIXES[Math.floor(Math.random() * ALIAS_PREFIXES.length)]
  const num = Math.floor(100 + Math.random() * 900)
  return `${prefix} #${num}`
}

// Initial seed whispers from anonymous kind souls
export const INITIAL_SEED_WHISPERS = [
  {
    id: 'w-seed-1',
    text: 'Hôm nay trời mưa to quá, nhưng tự dưng thấy lòng nhẹ bẫng sau khi khóc một trận. Mọi muộn phiền rồi cũng sẽ trôi theo dòng nước thôi.',
    mood: 'melancholy',
    alias: 'Kẻ Ngắm Mưa #204',
    avatarHue: '#60a5fa',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    reactions: { hug: 42, heart: 28, sparkle: 19, empathy: 35, candle: 14 }
  },
  {
    id: 'w-seed-2',
    text: 'Vừa vượt qua buổi phỏng vấn áp lực nhất năm. Chưa biết kết quả ra sao nhưng tự hào vì bản thân đã không bỏ cuộc giữa chừng! ✨',
    mood: 'hope',
    alias: 'Tia Sáng Nhỏ #512',
    avatarHue: '#10b981',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    reactions: { hug: 18, heart: 65, sparkle: 83, empathy: 12, candle: 9 }
  },
  {
    id: 'w-seed-3',
    text: 'Ước gì có một cái ôm thật chặt lúc này. Trưởng thành đôi khi cô đơn và mệt mỏi hơn mình từng tưởng tượng rất nhiều...',
    mood: 'heavy',
    alias: 'Chiếc Lá Mùa Thu #089',
    avatarHue: '#a855f7',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    reactions: { hug: 96, heart: 44, sparkle: 27, empathy: 78, candle: 31 }
  },
  {
    id: 'w-seed-4',
    text: 'Gửi bạn đang đọc dòng này lúc nửa đêm: Hãy thở sâu một hơi, thả lỏng đôi vai và ngủ một giấc thật ngon nhé. Ngày mai sẽ là một ngày dịu dàng hơn.',
    mood: 'warmth',
    alias: 'Người Bạn Nửa Đêm #777',
    avatarHue: '#f43f5e',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    reactions: { hug: 112, heart: 145, sparkle: 68, empathy: 54, candle: 89 }
  },
  {
    id: 'w-seed-5',
    text: 'Bình minh ngoài ban công hôm nay đẹp đến ngỡ ngàng. Cuộc sống này dù có xô bồ đến đâu thì những khoảnh khắc tĩnh lặng vẫn luôn có giá trị chữa lành.',
    mood: 'calm',
    alias: 'Sóng Biển Bình Minh #331',
    avatarHue: '#00f0ff',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    reactions: { hug: 25, heart: 58, sparkle: 46, empathy: 19, candle: 37 }
  }
]

// Get all whispers from localStorage or seed
export function getStoredWhispers() {
  try {
    const raw = localStorage.getItem(STORAGE_WHISPERS_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_WHISPERS_KEY, JSON.stringify(INITIAL_SEED_WHISPERS))
      return INITIAL_SEED_WHISPERS
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SEED_WHISPERS
  } catch {
    return INITIAL_SEED_WHISPERS
  }
}

// Get user reacted list to show user's active reactions
export function getUserReactions() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_REACTIONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Get IDs of whispers created on this device
export function getMyWhisperIds() {
  try {
    const raw = localStorage.getItem(STORAGE_MY_WHISPERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Gentle client-side anti-toxic profanity filter
const TOXIC_PATTERNS = [
  /địt/i, /đụ/i, /lồn/i, /cặc/i, /chó chết/i, /đĩ/i, /mẹ mày/i, /fuck/i, /bitch/i, /asshole/i, /chết đi/i
]

export function validateWhisperSafety(text) {
  if (!text || text.trim().length === 0) {
    return { isValid: false, reason: 'Vui lòng nhập nội dung cảm xúc của bạn.' }
  }
  if (text.trim().length > 180) {
    return { isValid: false, reason: 'Lời thì thầm tối đa 180 ký tự để giữ sự cô đọng, nhẹ nhàng.' }
  }
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(text)) {
      return { 
        isValid: false, 
        reason: 'Góc Chia Sẻ Ẩn Danh chỉ đón nhận những lời tâm sự nhân văn và tích cực. Vui lòng điều chỉnh lại ngôn từ.' 
      }
    }
  }
  return { isValid: true }
}

// Add a new anonymous whisper
export function submitWhisper({ text, mood = 'calm', alias }) {
  const safety = validateWhisperSafety(text)
  if (!safety.isValid) {
    return { success: false, error: safety.reason }
  }

  const currentWhispers = getStoredWhispers()
  const aura = MOOD_AURAS.find(a => a.id === mood) || MOOD_AURAS[0]
  const chosenAlias = alias && alias.trim() ? alias.trim() : generateRandomAlias()

  const newWhisper = {
    id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    text: text.trim(),
    mood,
    alias: chosenAlias,
    avatarHue: aura.color,
    createdAt: new Date().toISOString(),
    reactions: { hug: 0, heart: 0, sparkle: 0, empathy: 0, candle: 0 }
  }

  const updatedList = [newWhisper, ...currentWhispers]
  try {
    localStorage.setItem(STORAGE_WHISPERS_KEY, JSON.stringify(updatedList))
    
    // Save to my whispers list
    const myIds = getMyWhisperIds()
    localStorage.setItem(STORAGE_MY_WHISPERS_KEY, JSON.stringify([newWhisper.id, ...myIds]))
  } catch (err) {
    console.error('Failed to save whisper', err)
  }

  // Trigger achievement: Echo in the dark (Feature 27)
  recordAchievementProgress('echo-in-the-dark', 1)

  // Dispatch custom event for real-time reactivity
  window.dispatchEvent(new CustomEvent('mr-whisper-added', { detail: { whisper: newWhisper } }))

  return { success: true, whisper: newWhisper }
}

// React to a whisper with an emoji
export function reactToWhisper(whisperId, reactionType) {
  const allWhispers = getStoredWhispers()
  const userReactions = getUserReactions()

  const targetIndex = allWhispers.findIndex(w => w.id === whisperId)
  if (targetIndex === -1) return { success: false }

  const whisper = { ...allWhispers[targetIndex] }
  const currentReactions = whisper.reactions || { hug: 0, heart: 0, sparkle: 0, empathy: 0, candle: 0 }
  
  // Update count
  currentReactions[reactionType] = (currentReactions[reactionType] || 0) + 1
  whisper.reactions = currentReactions
  allWhispers[targetIndex] = whisper

  // Record user reaction
  if (!userReactions[whisperId]) {
    userReactions[whisperId] = {}
  }
  userReactions[whisperId][reactionType] = true

  try {
    localStorage.setItem(STORAGE_WHISPERS_KEY, JSON.stringify(allWhispers))
    localStorage.setItem(STORAGE_USER_REACTIONS_KEY, JSON.stringify(userReactions))
  } catch (err) {
    console.error('Failed to update reactions', err)
  }

  // Count total user reactions to trigger Warm Empathy achievement (Feature 27)
  let totalUserEmpathyGiven = 0
  Object.values(userReactions).forEach(wReactions => {
    totalUserEmpathyGiven += Object.keys(wReactions).length
  })
  recordAchievementProgress('warm-empathy', 0, totalUserEmpathyGiven)

  window.dispatchEvent(new CustomEvent('mr-whisper-reacted', { 
    detail: { whisperId, reactionType, newCount: currentReactions[reactionType] } 
  }))

  return { success: true, updatedWhisper: whisper }
}

// Delete a whisper by ID
export function deleteWhisper(whisperId) {
  if (!whisperId) return { success: false }
  const allWhispers = getStoredWhispers()
  const filtered = allWhispers.filter(w => w.id !== whisperId)
  
  const myIds = getMyWhisperIds()
  const updatedMyIds = myIds.filter(id => id !== whisperId)

  const userReactions = getUserReactions()
  if (userReactions[whisperId]) {
    delete userReactions[whisperId]
  }

  try {
    localStorage.setItem(STORAGE_WHISPERS_KEY, JSON.stringify(filtered))
    localStorage.setItem(STORAGE_MY_WHISPERS_KEY, JSON.stringify(updatedMyIds))
    localStorage.setItem(STORAGE_USER_REACTIONS_KEY, JSON.stringify(userReactions))
  } catch (err) {
    console.error('Failed to delete whisper', err)
  }

  window.dispatchEvent(new CustomEvent('mr-whisper-deleted', { detail: { whisperId } }))
  return { success: true }
}

// Get relative time in Vietnamese
export function formatRelativeTime(isoString) {
  if (!isoString) return 'Vừa xong'
  const now = Date.now()
  const time = new Date(isoString).getTime()
  const diffSec = Math.floor((now - time) / 1000)

  if (diffSec < 60) return 'Vừa xong'
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`
  return new Date(isoString).toLocaleDateString('vi-VN')
}
