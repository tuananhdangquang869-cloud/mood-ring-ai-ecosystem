// ─── Achievements & Titles Engine (Feature 27) ─────────────────────────────────
// System for tracking dynamic milestones, rarity levels, title equipping, and auto-unlocking

export const ACHIEVEMENTS_DATA = [
  {
    id: 'night-owl',
    title: '🦉 Cú Đêm (Night Owl)',
    tagline: 'Master of the Midnight Chamber',
    description: 'Thực hiện ghi chép nhật ký, đọc truyện hoặc tương tác trong khung giờ tĩnh mịch từ 00:00 đến 04:30 sáng.',
    category: 'time',
    rarity: 'epic', // common | rare | epic | legendary
    points: 150,
    icon: '🦉',
    accentColor: '#a855f7',
    badgeGlow: 'rgba(168, 85, 247, 0.45)',
    targetValue: 1,
    unit: 'lần',
    isSecret: false,
    titleReward: 'Cú Đêm Tĩnh Mịch'
  },
  {
    id: 'romantic-soul',
    title: '🌹 Tâm Hồn Lãng Mạn (Romantic Soul)',
    tagline: 'Poet of Starlight & Serenade',
    description: 'Viết nhật ký chứa các từ vựng thơ mộng (hoàng hôn, ánh trăng, hoa hồng, nụ cười, tình yêu, trái tim, thơ, mơ mộng) hoặc gắn tag #Tình_yêu.',
    category: 'writing',
    rarity: 'rare',
    points: 100,
    icon: '🌹',
    accentColor: '#ec4899',
    badgeGlow: 'rgba(236, 72, 153, 0.45)',
    targetValue: 1,
    unit: 'lần',
    isSecret: false,
    titleReward: 'Tâm Hồn Lãng Mạn'
  },
  {
    id: 'steadfast-will',
    title: '🧗 Người Kiên Trì (Steadfast Will)',
    tagline: 'Unyielding Mind of Continuity',
    description: 'Duy trì chuỗi ghi chép hoặc làm nhiệm vụ 3 ngày liên tiếp, hoặc khám phá qua ít nhất 5 phân nhánh cốt truyện.',
    category: 'journey',
    rarity: 'rare',
    points: 120,
    icon: '🧗',
    accentColor: '#10b981',
    badgeGlow: 'rgba(16, 185, 129, 0.45)',
    targetValue: 3,
    unit: 'ngày/bước',
    isSecret: false,
    titleReward: 'Ý Chí Sắt Đá'
  },
  {
    id: 'velocity-mind',
    title: '⚡ Tốc Độ Tia Chớp (Velocity Mind)',
    tagline: 'Synaptic Hyper-Speed Flow',
    description: 'Đạt tốc độ gõ phím từ 60 WPM trở lên trong Realtime Mood Lab hoặc Multimedia Journal.',
    category: 'skills',
    rarity: 'epic',
    points: 180,
    icon: '⚡',
    accentColor: '#f59e0b',
    badgeGlow: 'rgba(245, 158, 11, 0.45)',
    targetValue: 60,
    unit: 'WPM',
    isSecret: false,
    titleReward: 'Tia Chớp Nhận Thức'
  },
  {
    id: 'phoenix-catharsis',
    title: '🕊️ Thanh Tẩy Tâm Hồn (Phoenix of Catharsis)',
    tagline: 'Ashes of Grief, Wings of Rebirth',
    description: 'Hoàn tất trọn vẹn một nghi thức hỏa thiêu muộn phiền và thở sâu phục hồi trong Chế độ Phá Hủy (Burn Mode).',
    category: 'healing',
    rarity: 'rare',
    points: 100,
    icon: '🔥',
    accentColor: '#ef4444',
    badgeGlow: 'rgba(239, 68, 68, 0.45)',
    targetValue: 1,
    unit: 'phiên',
    isSecret: false,
    titleReward: 'Phượng Hoàng Tái Sinh'
  },
  {
    id: 'chrono-navigator',
    title: '🔮 Nhà Du Hành Không Gian (Chrono Pioneer)',
    tagline: 'Guardian of Encrypted Futures',
    description: 'Niêm phong một lá thư gửi tới tương lai trong Hộp Thời Gian (Chrono Stasis Vault).',
    category: 'vault',
    rarity: 'rare',
    points: 100,
    icon: '⏳',
    accentColor: '#00f0ff',
    badgeGlow: 'rgba(0, 240, 255, 0.45)',
    targetValue: 1,
    unit: 'lá thư',
    isSecret: false,
    titleReward: 'Kẻ Gác Đền Thời Gian'
  },
  {
    id: 'zen-master',
    title: '🧘 Tâm Tĩnh Như Nước (Zen Master)',
    tagline: 'Stillness Beyond the Digital Storm',
    description: 'Thực hiện một phiên viết tĩnh tâm hoặc điều hòa nhịp thở sâu 4-7-8 trong Zen Mode ít nhất 3 phút.',
    category: 'healing',
    rarity: 'common',
    points: 80,
    icon: '🧘',
    accentColor: '#38bdf8',
    badgeGlow: 'rgba(56, 189, 248, 0.45)',
    targetValue: 1,
    unit: 'phiên',
    isSecret: false,
    titleReward: 'Tâm Tĩnh Như Nước'
  },
  {
    id: 'memory-luminary',
    title: '🎨 Họa Sĩ Ký Ức Đa Sắc (Memory Luminary)',
    tagline: 'Synthesizer of Visual Emotions',
    description: 'Vẽ tranh canvas, tải tác phẩm nghệ thuật hoặc trích xuất bảng màu lượng tử trong Multimedia Journal.',
    category: 'creativity',
    rarity: 'common',
    points: 80,
    icon: '🎨',
    accentColor: '#8b5cf6',
    badgeGlow: 'rgba(139, 92, 246, 0.45)',
    targetValue: 1,
    unit: 'tác phẩm',
    isSecret: false,
    titleReward: 'Họa Sĩ Ký Ức'
  },
  {
    id: 'omniscient-pathfinder',
    title: '🌌 Nhà Thám Hiểm Đa Thực Tại (Omniscient Pathfinder)',
    tagline: 'Weaver of All Destiny Timelines',
    description: 'Khám phá trọn vẹn cả 3 Đại Kết Cục trên Sơ đồ Cây Cốt Truyện (Dissolution, Transcendence, Synthesis).',
    category: 'journey',
    rarity: 'legendary',
    points: 300,
    icon: '👑',
    accentColor: '#fbbf24',
    badgeGlow: 'rgba(251, 191, 36, 0.65)',
    targetValue: 3,
    unit: 'kết cục',
    isSecret: true,
    titleReward: 'Chúa Tể Mạng Lưới Nhận Thức'
  },
  {
    id: 'emotional-alchemist',
    title: '🎭 Lăng Kính Cảm Xúc (Emotional Alchemist)',
    tagline: 'Prism of Quintessential Moods',
    description: 'Trải nghiệm đầy đủ 5 sắc thái cảm xúc (Hân hoan, Tĩnh lặng, Trầm mặc, Trăn trở, Bùng nổ) trong Mood Ring.',
    category: 'skills',
    rarity: 'rare',
    points: 120,
    icon: '🎭',
    accentColor: '#06b6d4',
    badgeGlow: 'rgba(6, 182, 212, 0.45)',
    targetValue: 5,
    unit: 'sắc thái',
    isSecret: false,
    titleReward: 'Giả Kim Thuật Cảm Xúc'
  },
  {
    id: 'echo-in-the-dark',
    title: '🤫 Lời Thì Thầm Đồng Điệu (Echo in the Dark)',
    tagline: 'A Voice Sent Into the Safe Void',
    description: 'Gửi ít nhất 1 dòng cảm xúc ẩn danh lên Góc Chia Sẻ Ẩn Danh (Whisper Corner).',
    category: 'social',
    rarity: 'common',
    points: 80,
    icon: '🕊️',
    accentColor: '#93c5fd',
    badgeGlow: 'rgba(147, 197, 253, 0.45)',
    targetValue: 1,
    unit: 'lời nhắn',
    isSecret: false,
    titleReward: 'Lời Thì Thầm Trong Gió'
  },
  {
    id: 'warm-empathy',
    title: '💖 Trái Tim Ấm Áp (Warm Empathy)',
    tagline: 'Beacon of Unconditional Kindness',
    description: 'Trao tặng 5 lượt biểu tượng động viên (Ôm 🤗, Thả tim 💖, Động viên ✨, Đồng cảm 🫂, Thắp nến 🕯️) cho người khác tại Whisper Corner.',
    category: 'social',
    rarity: 'rare',
    points: 120,
    icon: '💖',
    accentColor: '#f43f5e',
    badgeGlow: 'rgba(244, 63, 94, 0.45)',
    targetValue: 5,
    unit: 'cái ôm/tim',
    isSecret: false,
    titleReward: 'Sứ Giả Yêu Thương'
  }
]

const STORAGE_PROGRESS_KEY = 'mr-achievements-progress'
const STORAGE_EQUIPPED_TITLE_KEY = 'mr-equipped-title'

// Get raw stored achievements progress
export function getStoredAchievementsProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Get equipped title
export function getEquippedTitle() {
  try {
    const raw = localStorage.getItem(STORAGE_EQUIPPED_TITLE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// Equip a title
export function setEquippedTitle(titleObj) {
  try {
    if (!titleObj) {
      localStorage.removeItem(STORAGE_EQUIPPED_TITLE_KEY)
    } else {
      localStorage.setItem(STORAGE_EQUIPPED_TITLE_KEY, JSON.stringify(titleObj))
    }
    window.dispatchEvent(new CustomEvent('mr-title-changed', { detail: { equippedTitle: titleObj } }))
    return true
  } catch {
    return false
  }
}

// Get full achievements state with computed status
export function getAchievementsState() {
  const progressMap = getStoredAchievementsProgress()
  const equipped = getEquippedTitle()

  const list = ACHIEVEMENTS_DATA.map(item => {
    const itemProg = progressMap[item.id] || { currentValue: 0, isUnlocked: false, unlockedAt: null }
    const isUnlocked = itemProg.isUnlocked || (itemProg.currentValue >= item.targetValue)
    const progressPercent = Math.min(100, Math.round(((itemProg.currentValue || 0) / item.targetValue) * 100))

    return {
      ...item,
      currentValue: itemProg.currentValue || 0,
      isUnlocked,
      unlockedAt: itemProg.unlockedAt,
      progressPercent,
      isEquipped: equipped?.id === item.id
    }
  })

  const totalPoints = list.reduce((acc, curr) => curr.isUnlocked ? acc + curr.points : acc, 0)
  const maxPoints = list.reduce((acc, curr) => acc + curr.points, 0)
  const unlockedCount = list.filter(item => item.isUnlocked).length
  const totalCount = list.length

  return {
    achievements: list,
    totalPoints,
    maxPoints,
    unlockedCount,
    totalCount,
    equippedTitle: equipped
  }
}

// Check and trigger unlock for a specific achievement
export function recordAchievementProgress(achievementId, valueToAdd = 1, forceSetValue = null) {
  const itemDef = ACHIEVEMENTS_DATA.find(a => a.id === achievementId)
  if (!itemDef) return null

  const progressMap = getStoredAchievementsProgress()
  const currentProg = progressMap[achievementId] || { currentValue: 0, isUnlocked: false, unlockedAt: null }

  if (currentProg.isUnlocked) {
    return null // Already unlocked
  }

  const newValue = forceSetValue !== null ? forceSetValue : (currentProg.currentValue + valueToAdd)
  const reached = newValue >= itemDef.targetValue

  const updatedProg = {
    currentValue: newValue,
    isUnlocked: reached,
    unlockedAt: reached ? new Date().toISOString() : null
  }

  progressMap[achievementId] = updatedProg
  try {
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progressMap))
  } catch (err) {
    console.error('Failed to save achievements progress', err)
  }

  if (reached) {
    // If no equipped title yet, auto equip first unlocked title
    const currentEquipped = getEquippedTitle()
    if (!currentEquipped) {
      setEquippedTitle({
        id: itemDef.id,
        title: itemDef.titleReward,
        icon: itemDef.icon,
        rarity: itemDef.rarity,
        accentColor: itemDef.accentColor
      })
    }

    // Fire global event for celebration
    window.dispatchEvent(new CustomEvent('mr-achievement-unlocked', {
      detail: {
        achievement: {
          ...itemDef,
          ...updatedProg
        }
      }
    }))
    return { newlyUnlocked: true, achievement: itemDef }
  }

  return { newlyUnlocked: false, currentValue: newValue }
}

// Check time-of-day condition for Night Owl
export function checkNightOwlCondition() {
  const currentHour = new Date().getHours()
  // Night hours: 00:00 to 04:30 (0, 1, 2, 3, 4)
  if (currentHour >= 0 && currentHour < 5) {
    recordAchievementProgress('night-owl', 1)
  }
}

// Check text for romantic poetry
export function checkRomanticSoulCondition(text = '', tags = []) {
  if (!text && !tags) return
  const isTagged = Array.isArray(tags) && (tags.includes('Tình_yêu') || tags.includes('#Tình_yêu'))
  const romanticKeywords = ['hoàng hôn', 'ánh trăng', 'hoa hồng', 'nụ cười', 'tình yêu', 'trái tim', 'thơ', 'mơ mộng', 'lãng mạn', 'nguyện ước', 'bên nhau', 'say đắm']
  const lowerText = text.toLowerCase()
  const containsKeyword = romanticKeywords.some(kw => lowerText.includes(kw))

  if (isTagged || containsKeyword) {
    recordAchievementProgress('romantic-soul', 1)
  }
}

// Check WPM speed condition
export function checkVelocityMindCondition(wpm) {
  if (typeof wpm === 'number' && wpm >= 60) {
    recordAchievementProgress('velocity-mind', 0, wpm)
  }
}

// Check endings visited
export function checkEndingCondition(visitedEndings = []) {
  const uniqueEndings = new Set(visitedEndings.filter(e => ['dissolution', 'transcendence', 'synthesis'].includes(e)))
  if (uniqueEndings.size > 0) {
    recordAchievementProgress('omniscient-pathfinder', 0, uniqueEndings.size)
  }
}

// Check mood diversity
export function checkMoodDiversityCondition(moodHistory = []) {
  const uniqueMoods = new Set(moodHistory)
  if (uniqueMoods.size > 0) {
    recordAchievementProgress('emotional-alchemist', 0, uniqueMoods.size)
  }
}

// Reset achievements (useful for debug)
export function resetAchievements() {
  localStorage.removeItem(STORAGE_PROGRESS_KEY)
  localStorage.removeItem(STORAGE_EQUIPPED_TITLE_KEY)
  window.dispatchEvent(new CustomEvent('mr-achievements-reset'))
}
