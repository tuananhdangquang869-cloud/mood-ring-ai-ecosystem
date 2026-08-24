// 🌌 Mood Ring Story - Emotional Quests & Holographic Badges Engine
// Feature 26: Hệ thống Nhiệm vụ Cảm xúc & Bộ sưu tập Huy hiệu

export const BADGES_DATA = [
  {
    id: 'sky-observer',
    title: 'Sứ Giả Bầu Trời',
    englishTitle: 'Sky Observer',
    category: 'Daily Reflection',
    rarity: 'Rare',
    icon: '🌤️',
    gradient: 'linear-gradient(135deg, #38bdf8, #818cf8)',
    glowColor: '#38bdf8',
    quote: '"Bầu trời là tấm gương phản chiếu tâm hồn của vũ trụ."',
    description: 'Quan sát và ghi lại cảm xúc về màu sắc, mây trời hôm nay.',
    requirement: 'Hoàn thành nhiệm vụ "Mô tả Bầu Trời Hôm Nay"'
  },
  {
    id: 'gratitude-guardian',
    title: 'Trái Tim Biết Ơn',
    englishTitle: 'Gratitude Guardian',
    category: 'Mindfulness',
    rarity: 'Epic',
    icon: '💖',
    gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    glowColor: '#f43f5e',
    quote: '"Lòng biết ơn là mật mã mở khóa cánh cửa hạnh phúc đích thực."',
    description: 'Ghi lại 3 điều nhỏ bé khiến bạn mỉm cười hoặc cảm thấy ấm lòng.',
    requirement: 'Hoàn thành nhiệm vụ "Tam Điểm Biết Ơn"'
  },
  {
    id: 'zen-adept',
    title: 'Thiền Giả Tâm Thức',
    englishTitle: 'Zen Adept',
    category: 'Serenity',
    rarity: 'Rare',
    icon: '🧘',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    glowColor: '#10b981',
    quote: '"Trong tĩnh lặng tuyệt đối, mọi xung đột dữ liệu đều tan biến."',
    description: 'Trải nghiệm 1 phiên thở sâu 4-7-8 hoặc đắm mình trong Zen Mode.',
    requirement: 'Kích hoạt Chế độ Tập Trung (Zen Mode)'
  },
  {
    id: 'chrono-pilot',
    title: 'Nhà Du Hành Thời Gian',
    englishTitle: 'Chrono Pilot',
    category: 'Future Vision',
    rarity: 'Legendary',
    icon: '⏳',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glowColor: '#f59e0b',
    quote: '"Thời gian không phải là ranh giới, mà là bức thư chưa gửi."',
    description: 'Phong ấn một bức thư hoặc kỷ niệm trong Hộp Thời Gian vị lai.',
    requirement: 'Niêm phong 1 bức thư trong Time Capsule'
  },
  {
    id: 'phoenix-reborn',
    title: 'Phượng Hoàng Tái Sinh',
    englishTitle: 'Phoenix Reborn',
    category: 'Catharsis',
    rarity: 'Epic',
    icon: '🔥',
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    glowColor: '#ef4444',
    quote: '"Từ tàn tro muộn phiền, một ý thức mạnh mẽ hơn sẽ tái sinh."',
    description: 'Dũng cảm trút bỏ một âu lo hay áp lực vào Lửa Thanh Tẩy (Burn Mode).',
    requirement: 'Thực hiện 1 phiên thiêu rụi muộn phiền trong Burn Mode'
  },
  {
    id: 'omniscient-chronicler',
    title: 'Bậc Thầy Cốt Truyện',
    englishTitle: 'Omniscient Chronicler',
    category: 'Narrative',
    rarity: 'Mythic',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
    glowColor: '#a855f7',
    quote: '"Thấu suốt mọi nhánh rẽ của số phận và ý thức nhân tạo."',
    description: 'Khám phá ít nhất 1 cái kết (Tan Rã, Siêu Việt hoặc Tổng Hợp) của MR-CORE-01.',
    requirement: 'Chạm đến 1 kết thúc bất kỳ trong cốt truyện'
  },
  {
    id: 'biometric-master',
    title: 'Cộng Hưởng Sinh Trắc',
    englishTitle: 'Biometric Master',
    category: 'Cybernetics',
    rarity: 'Rare',
    icon: '👁️',
    gradient: 'linear-gradient(135deg, #00f0ff, #38bdf8)',
    glowColor: '#00f0ff',
    quote: '"Khi đôi mắt và vi biểu cảm giao tiếp trực tiếp với AI."',
    description: 'Thực hiện quét cảm xúc bằng Facial Emotion Scanner thời gian thực.',
    requirement: 'Thực hiện quét vi biểu cảm khuôn mặt'
  },
  {
    id: 'memory-artist',
    title: 'Họa Sĩ Ký Ức',
    englishTitle: 'Memory Artist',
    category: 'Creativity',
    rarity: 'Epic',
    icon: '🎨',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
    glowColor: '#ec4899',
    quote: '"Mỗi nét vẽ neon là một nhịp đập cảm xúc được lưu giữ vĩnh hằng."',
    description: 'Vẽ một bức tranh nghệ thuật cảm xúc hoặc tải ảnh lên Multimedia Journal.',
    requirement: 'Lưu 1 tác phẩm hoặc ảnh kỷ niệm trong Multimedia Journal'
  }
]

export const LEVEL_TITLES = [
  { level: 1, minExp: 0, title: 'Lõi Sơ Khai (Initiate Core)', perk: 'Mở khóa nhật ký cơ bản & quét cảm xúc' },
  { level: 2, minExp: 100, title: 'Tâm Thức Chớm Nở (Awakened Pulse)', perk: 'Mở khóa hiệu ứng hạt neon lấp lánh' },
  { level: 3, minExp: 250, title: 'Người Dẫn Đường Cảm Xúc (Emotion Wayfarer)', perk: 'Mở khóa sơ đồ cây cốt truyện mở rộng' },
  { level: 4, minExp: 450, title: 'Cộng Hưởng Viên Tinh Tế (Harmonic Resonator)', perk: 'Tăng 20% hào quang Mood Ring' },
  { level: 5, minExp: 700, title: 'Hộ Vệ Ký Ức (Guardian of Archives)', perk: 'Mở khóa hiệu ứng Hologram lấp lánh cho huy hiệu' },
  { level: 6, minExp: 1000, title: 'Bậc Thầy Tâm Thức (Cosmic Mind Master)', perk: 'Danh hiệu tối thượng & hào quang Siêu Việt' }
]

export function calculateResonanceLevel(exp = 0) {
  let current = LEVEL_TITLES[0]
  let next = LEVEL_TITLES[1]
  for (let i = LEVEL_TITLES.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_TITLES[i].minExp) {
      current = LEVEL_TITLES[i]
      next = LEVEL_TITLES[i + 1] || null
      break
    }
  }

  const currentMin = current.minExp
  const nextMin = next ? next.minExp : current.minExp + 500
  const progressPercent = next ? Math.min(100, Math.round(((exp - currentMin) / (nextMin - currentMin)) * 100)) : 100

  return {
    level: current.level,
    title: current.title,
    perk: current.perk,
    currentExp: exp,
    minExp: currentMin,
    nextExp: nextMin,
    progressPercent,
    isMaxLevel: !next
  }
}

export const INITIAL_DAILY_QUESTS = [
  {
    id: 'quest-sky',
    badgeId: 'sky-observer',
    type: 'input',
    category: 'Daily',
    title: 'Mô Tả Bầu Trời Hôm Nay',
    subtitle: 'Hãy nhìn qua cửa sổ hoặc nhớ lại bầu trời bạn thấy gần đây nhất.',
    placeholder: 'Hôm nay bầu trời màu gì? Có mây bay, ánh nắng nhẹ hay mưa êm ả? Bạn cảm thấy thế nào khi ngắm nhìn nó?',
    expReward: 60,
    icon: '🌤️',
    isAutoTriggerable: false
  },
  {
    id: 'quest-gratitude',
    badgeId: 'gratitude-guardian',
    type: 'input_triple',
    category: 'Daily',
    title: 'Tam Điểm Biết Ơn (3 Điều Biết Ơn)',
    subtitle: 'Ghi lại 3 điều nhỏ bé giản dị khiến bạn mỉm cười hoặc cảm thấy ấm lòng.',
    placeholder1: '1. Một người hoặc một lời hỏi han ấm áp...',
    placeholder2: '2. Một khoảnh khắc bình yên (ly cà phê, bài nhạc hay)...',
    placeholder3: '3. Một điều bản thân đã làm tốt hôm nay...',
    expReward: 80,
    icon: '💖',
    isAutoTriggerable: false
  },
  {
    id: 'quest-zen',
    badgeId: 'zen-adept',
    type: 'action',
    category: 'Mindfulness',
    title: 'Thực Hành Tĩnh Tâm (Zen Mode)',
    subtitle: 'Vào Chế độ Tập Trung (Zen Mode) và thở sâu 4-7-8 để an định tâm trí.',
    actionLabel: 'Mở Zen Mode Ngay',
    actionType: 'open-zen',
    expReward: 50,
    icon: '🧘',
    isAutoTriggerable: true
  },
  {
    id: 'quest-capsule',
    badgeId: 'chrono-pilot',
    type: 'action',
    category: 'Milestone',
    title: 'Gửi Thông Điệp Vị Lai (Time Capsule)',
    subtitle: 'Soạn thảo và niêm phong một lá thư gửi tới chính mình ở tương lai.',
    actionLabel: 'Đến Hộp Thời Gian',
    actionType: 'open-capsule',
    expReward: 75,
    icon: '⏳',
    isAutoTriggerable: true
  },
  {
    id: 'quest-burn',
    badgeId: 'phoenix-reborn',
    type: 'action',
    category: 'Catharsis',
    title: 'Thanh Tẩy Muộn Phiền (Burn Mode)',
    subtitle: 'Trút bỏ một áp lực hoặc suy nghĩ tiêu cực vào ngọn lửa thanh tẩy.',
    actionLabel: 'Đến Buồng Phá Hủy',
    actionType: 'open-burn',
    expReward: 70,
    icon: '🔥',
    isAutoTriggerable: true
  },
  {
    id: 'quest-story-ending',
    badgeId: 'omniscient-chronicler',
    type: 'action',
    category: 'Story',
    title: 'Chạm Đến Một Kết Thúc Cốt Truyện',
    subtitle: 'Đưa ý thức MR-CORE-01 đến 1 trong 3 kết cục (Tan Rã, Siêu Việt, Tổng Hợp).',
    actionLabel: 'Khám Phá Cốt Truyện',
    actionType: 'open-story-tree',
    expReward: 100,
    icon: '👑',
    isAutoTriggerable: true
  },
  {
    id: 'quest-face-scan',
    badgeId: 'biometric-master',
    type: 'action',
    category: 'Cybernetics',
    title: 'Đồng Bộ Sinh Trắc Khuôn Mặt',
    subtitle: 'Kích hoạt Face Scanner để AI nhận diện vi biểu cảm của bạn.',
    actionLabel: 'Mở Face Scanner',
    actionType: 'open-face-scanner',
    expReward: 60,
    icon: '👁️',
    isAutoTriggerable: true
  },
  {
    id: 'quest-journal-art',
    badgeId: 'memory-artist',
    type: 'action',
    category: 'Creativity',
    title: 'Kiến Tạo Ký Ức Đa Phương Tiện',
    subtitle: 'Vẽ một nét vẽ neon hoặc lưu trữ một tấm ảnh trong Multimedia Journal.',
    actionLabel: 'Mở Nhật Ký Đa Phương Tiện',
    actionType: 'open-journal',
    expReward: 65,
    icon: '🎨',
    isAutoTriggerable: true
  }
]

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export function getQuestsState() {
  try {
    const raw = localStorage.getItem('mr-emotional-quests')
    const parsed = raw ? JSON.parse(raw) : {}
    // Normalize any legacy object responses to string
    Object.keys(parsed).forEach(k => {
      if (parsed[k] && typeof parsed[k].response === 'object' && parsed[k].response !== null) {
        if (parsed[k].response.ending) {
          parsed[k].response = `Đã đạt kết cục: ${parsed[k].response.ending.toUpperCase()}`
        } else if (parsed[k].response.text) {
          parsed[k].response = parsed[k].response.text
        } else {
          try {
            parsed[k].response = JSON.stringify(parsed[k].response)
          } catch {
            parsed[k].response = ''
          }
        }
      }
    })
    return parsed
  } catch {
    return {}
  }
}

export function saveQuestsState(state) {
  try {
    localStorage.setItem('mr-emotional-quests', JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save quests state', e)
  }
}

export function getUnlockedBadges() {
  try {
    const raw = localStorage.getItem('mr-unlocked-badges')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveUnlockedBadges(badges) {
  try {
    localStorage.setItem('mr-unlocked-badges', JSON.stringify(badges))
  } catch (e) {
    console.warn('Failed to save unlocked badges', e)
  }
}

export function getQuestExp() {
  try {
    const val = localStorage.getItem('mr-quest-exp')
    return val ? parseInt(val, 10) : 0
  } catch {
    return 0
  }
}

export function saveQuestExp(exp) {
  try {
    localStorage.setItem('mr-quest-exp', exp.toString())
  } catch (e) {
    console.warn('Failed to save quest exp', e)
  }
}

export function getQuestStreak() {
  try {
    const raw = localStorage.getItem('mr-quest-streak')
    if (!raw) return { count: 1, lastCompletedDate: new Date().toISOString().split('T')[0] }
    return JSON.parse(raw)
  } catch {
    return { count: 1, lastCompletedDate: new Date().toISOString().split('T')[0] }
  }
}

export function recordStreakProgress() {
  const today = new Date().toISOString().split('T')[0]
  const current = getQuestStreak()
  if (current.lastCompletedDate === today) return current

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  let newCount = current.count
  if (current.lastCompletedDate === yesterday) {
    newCount += 1
  } else {
    newCount = 1
  }

  const updated = { count: newCount, lastCompletedDate: today }
  try {
    localStorage.setItem('mr-quest-streak', JSON.stringify(updated))
  } catch {}
  return updated
}

// Complete a quest programmatically or by user submit
export function completeQuestEngine(questId, responseContent = null) {
  const quests = getQuestsState()
  const questDef = INITIAL_DAILY_QUESTS.find(q => q.id === questId)
  if (!questDef) return { success: false, reason: 'Quest not found' }

  if (quests[questId]?.completed) {
    return { success: false, reason: 'Already completed', quest: quests[questId] }
  }

  const now = new Date().toISOString()
  let safeResponse = responseContent
  if (typeof responseContent === 'object' && responseContent !== null) {
    if (responseContent.ending) {
      safeResponse = `Đã đạt kết cục: ${responseContent.ending.toUpperCase()}`
    } else if (responseContent.text) {
      safeResponse = responseContent.text
    } else {
      try {
        safeResponse = JSON.stringify(responseContent)
      } catch {
        safeResponse = ''
      }
    }
  }

  const updatedQuest = {
    id: questId,
    completed: true,
    completedAt: now,
    response: safeResponse,
    expGained: questDef.expReward
  }

  quests[questId] = updatedQuest
  saveQuestsState(quests)

  // Award EXP
  const currentExp = getQuestExp()
  const newExp = currentExp + questDef.expReward
  saveQuestExp(newExp)

  // Update streak
  recordStreakProgress()

  // Unlock corresponding badge if present
  let newlyUnlockedBadge = null
  if (questDef.badgeId) {
    const unlocked = getUnlockedBadges()
    if (!unlocked.includes(questDef.badgeId)) {
      unlocked.push(questDef.badgeId)
      saveUnlockedBadges(unlocked)
      newlyUnlockedBadge = BADGES_DATA.find(b => b.id === questDef.badgeId)
    }
  }

  // Dispatch global event for UI react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mr-quest-completed', {
      detail: {
        questId,
        questDef,
        newExp,
        newlyUnlockedBadge
      }
    }))
  }

  return {
    success: true,
    quest: updatedQuest,
    newExp,
    newlyUnlockedBadge
  }
}

// Global hook to trigger app-action events
export function triggerQuestAction(actionType, detail = {}) {
  if (typeof window === 'undefined') return

  // Map actions to quest IDs
  const actionMap = {
    'open-zen': 'quest-zen',
    'zen-session-completed': 'quest-zen',
    'open-capsule': 'quest-capsule',
    'time-capsule-sealed': 'quest-capsule',
    'open-burn': 'quest-burn',
    'burn-session-completed': 'quest-burn',
    'story-ending-reached': 'quest-story-ending',
    'face-scan-performed': 'quest-face-scan',
    'journal-entry-saved': 'quest-journal-art'
  }

  const targetQuestId = actionMap[actionType]
  if (targetQuestId) {
    completeQuestEngine(targetQuestId, detail)
  }
}
