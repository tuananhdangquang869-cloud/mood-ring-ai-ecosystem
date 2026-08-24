/**
 * 🕊️ MENTAL HEALTH & CRISIS DISTRESS AI ENGINE (Tính Năng 35)
 * Comprehensive Crisis Detection, Persistent Despair Tracking & Emergency Hotline Registry.
 */

// 1. Comprehensive Distress & Crisis Lexicons (Vietnamese & English)
export const CRISIS_LEXICON = {
  // Critical Level (Immediate Crisis, Self-Harm, Suicidal Ideation)
  critical: [
    // Vietnamese
    'tự tử', 'muốn chết', 'chết đi cho xong', 'kết thúc cuộc đời', 'không muốn sống', 'không muốn tồn tại',
    'tự hại', 'rạch tay', 'uống thuốc ngủ', 'nhảy lầu', 'nhảy cầu', 'tự sát', 'biến mất vĩnh viễn',
    'giải thoát bản thân', 'chấm dứt tất cả', 'buông xuôi tất cả', 'không còn lý do để sống', 'muốn biến mất',
    // English
    'suicide', 'kill myself', 'want to die', 'end my life', 'end it all', 'self harm', 'cut myself',
    'better off dead', 'no reason to live', 'cannot live anymore', 'goodbye world', 'slit my wrist'
  ],

  // Severe Despair Level (Hopelessness, Extreme Isolation, Inability to cope)
  severe: [
    // Vietnamese
    'tuyệt vọng', 'bế tắc hoàn toàn', 'vô vọng', 'sụp đổ hoàn toàn', 'đau đớn tột cùng', 'không còn lối thoát',
    'trống rỗng đến điên dại', 'bị bỏ rơi', 'cô đơn cùng cực', 'kiệt sức hoàn toàn', 'gục ngã', 'tan nát',
    'trầm cảm nặng', 'ám ảnh', 'nghẹt thở', 'không ai cần mình', 'vô dụng', 'gánh nặng', 'chán ghét bản thân',
    // English
    'hopeless', 'extreme despair', 'no way out', 'completely broken', 'empty inside', 'worthless',
    'burden to everyone', 'severe depression', 'collapsing', 'drowning in sadness', 'hate myself'
  ],

  // Moderate Melancholy / Chronic Distress Level
  moderate: [
    // Vietnamese
    'buồn bã', 'mệt mỏi', 'chán nản', 'u uất', 'lạc lõng', 'xa cách', 'bất an', 'lo âu kéo dài',
    'áp lực đè nặng', 'không ngủ được', 'rơi nước mắt', 'thất vọng', 'tổn thương', 'vỡ vụn',
    // English
    'sad', 'exhausted', 'anxious', 'lonely', 'hurting', 'depressed', 'crying', 'numb', 'lost'
  ]
}

// 2. Emergency Hotlines Database (Vietnam & Global)
export const EMERGENCY_HOTLINES = [
  {
    id: 'vn-111',
    country: '🇻🇳 Việt Nam',
    name: 'Tổng đài Quốc gia 111',
    subtitle: 'Bảo vệ Trẻ em & Tư vấn Tâm lý Khẩn cấp',
    number: '111',
    displayNumber: '111',
    telLink: 'tel:111',
    hours: '24/7 (Cả ngày & đêm)',
    fee: '100% Miễn cước cuộc gọi',
    description: 'Tổng đài tiếp nhận, lắng nghe và tư vấn tâm lý, can thiệp khủng hoảng cho trẻ em, thanh thiếu niên và phụ huynh.',
    badge: 'QUỐC GIA 24/7',
    badgeColor: '#10b981',
    type: 'official'
  },
  {
    id: 'vn-ngaymai',
    country: '🇻🇳 Việt Nam',
    name: 'Đường Dây Nóng Ngày Mai',
    subtitle: 'Hỗ trợ Người Trầm Cảm & Khủng Hoảng Tâm Lý',
    number: '0963061414',
    displayNumber: '0963.061.414',
    telLink: 'tel:0963061414',
    hours: '13:00 - 20:30 (Thứ 2 - Chủ Nhật)',
    fee: 'Cước viễn thông tiêu chuẩn',
    description: 'Dự án cộng đồng phi lợi nhuận hỗ trợ sơ cứu tâm lý, đồng hành cùng người đang trải qua trầm cảm hoặc bế tắc tinh thần do nhà báo Đặng Hoàng Giang đồng sáng lập.',
    badge: 'CHUYÊN TRẦM CẢM',
    badgeColor: '#38bdf8',
    type: 'community'
  },
  {
    id: 'vn-bachmai',
    country: '🇻🇳 Việt Nam',
    name: 'Viện Sức Khỏe Tâm Thần - BV Bạch Mai',
    subtitle: 'Tư vấn & Cấp cứu Sức khỏe Tâm thần Y khoa',
    number: '02438693731',
    displayNumber: '024 3869 3731 / 0984 101 115',
    telLink: 'tel:02438693731',
    hours: '24/7 (Cấp cứu y tế & Tư vấn)',
    fee: 'Cước cố định tiêu chuẩn',
    description: 'Đơn vị y khoa đầu ngành về tâm thần học và tâm lý trị liệu lâm sàng tại Việt Nam.',
    badge: 'BỆNH VIỆN BẠCH MAI',
    badgeColor: '#a855f7',
    type: 'hospital'
  },
  {
    id: 'vn-peacehouse',
    country: '🇻🇳 Việt Nam',
    name: 'Ngôi Nhà Bình Yên (Peace House)',
    subtitle: 'Hỗ trợ Phụ nữ & Trẻ em Bị Bạo Lực, Khủng Hoảng',
    number: '1900969680',
    displayNumber: '1900 969 680',
    telLink: 'tel:1900969680',
    hours: '24/7 (Phục vụ liên tục)',
    fee: 'Miễn phí hỗ trợ nơi tạm trú an toàn',
    description: 'Tư vấn, can thiệp khẩn cấp và bảo vệ an toàn cho phụ nữ và trẻ em chịu bạo lực gia đình hoặc sang chấn tâm lý.',
    badge: 'AN TOÀN & BẢO VỆ',
    badgeColor: '#f59e0b',
    type: 'shelter'
  },
  {
    id: 'intl-988',
    country: '🇺🇸 Quốc Tế / US & Canada',
    name: '988 Suicide & Crisis Lifeline',
    subtitle: 'Đường dây Cứu trợ Khủng hoảng & Phòng chống Tự tử',
    number: '988',
    displayNumber: '988 (Call or Text)',
    telLink: 'tel:988',
    hours: '24/7 (Free & Confidential)',
    fee: 'Free 24/7',
    description: 'The 988 Suicide & Crisis Lifeline provides 24/7, free and confidential support for people in distress and crisis resources.',
    badge: 'GLOBAL 988',
    badgeColor: '#ec4899',
    type: 'international'
  },
  {
    id: 'intl-befrienders',
    country: '🌍 Toàn Cầu / Worldwide',
    name: 'Befrienders Worldwide',
    subtitle: 'Mạng lưới Lắng nghe Tình nguyện Toàn cầu',
    number: 'https://www.befrienders.org',
    displayNumber: 'befrienders.org',
    telLink: 'https://www.befrienders.org',
    hours: '24/7 Online Search',
    fee: 'Miễn phí kết nối tình nguyện viên',
    description: 'Tra cứu trung tâm hỗ trợ khủng hoảng tâm lý bản địa tại hơn 32 quốc gia trên thế giới.',
    badge: 'INTERNATIONAL NET',
    badgeColor: '#6366f1',
    type: 'international'
  }
]

// 3. Calming Affirmations & Empathetic Quotes
export const COMFORT_AFFIRMATIONS = [
  {
    quote: 'Bạn không hề đơn độc giữa vũ trụ này. Dù đêm có tối đến đâu, bình minh rồi sẽ đến.',
    author: 'MR-CORE Empathetic Oracle',
    tag: '#Bình_Yên'
  },
  {
    quote: 'Cho phép bản thân được mệt mỏi, được nghỉ ngơi. Bạn đã rất kiên cường trong suốt chặng đường qua.',
    author: 'Lời thì thầm Chữa lành',
    tag: '#Thương_Mình'
  },
  {
    quote: 'Cảm xúc chỉ như những đám mây trôi qua bầu trời tâm trí bạn. Mây có thể đen, nhưng bầu trời vẫn luôn ở đó.',
    author: 'Liệu pháp Quán niệm',
    tag: '#Tĩnh_Tâm'
  },
  {
    quote: 'Hãy hít một hơi thật sâu... Giữ lại 4 giây... Và thở ra nhẹ nhàng. Mọi chuyện rồi sẽ ổn thôi.',
    author: 'Kỹ thuật Thở 4-7-8',
    tag: '#Thở_Sâu'
  },
  {
    quote: 'Tìm kiếm sự giúp đỡ không phải là yếu đuối — đó là minh chứng dũng cảm nhất cho việc bạn muốn bước tiếp.',
    author: 'Thông điệp Hy vọng',
    tag: '#Hy_Vọng'
  }
]

// 4. Local Settings & State Management
const STORAGE_KEYS = {
  SETTINGS: 'mr-mental-health-settings',
  HISTORY: 'mr-mental-health-history',
  LAST_ALERT: 'mr-mental-health-last-alert',
  STREAK: 'mr-mental-health-distress-streak'
}

export function getMentalHealthSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return {
    enabled: true, // Auto alert enabled
    sensitivity: 'standard', // 'mild' | 'standard' | 'strict'
    cooldownMinutes: 15,
    showHotlinesDirectly: true,
    soundChime: true
  }
}

export function saveMentalHealthSettings(newSettings) {
  try {
    const current = getMentalHealthSettings()
    const merged = { ...current, ...newSettings }
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged))
    window.dispatchEvent(new CustomEvent('mr-mental-health-settings-updated', { detail: merged }))
    return merged
  } catch (err) {
    console.warn('Error saving mental health settings:', err)
  }
}

// 5. Text Analysis & Distress Detection
export function analyzeMentalHealthText(text = '', context = {}) {
  if (!text || typeof text !== 'string') {
    return { isDistressed: false, severity: 'none', score: 0, keywords: [] }
  }

  const cleanText = text.toLowerCase()
  const detectedCritical = []
  const detectedSevere = []
  const detectedModerate = []

  // Check critical keywords
  CRISIS_LEXICON.critical.forEach(keyword => {
    if (cleanText.includes(keyword)) {
      detectedCritical.push(keyword)
    }
  })

  // Check severe keywords
  CRISIS_LEXICON.severe.forEach(keyword => {
    if (cleanText.includes(keyword)) {
      detectedSevere.push(keyword)
    }
  })

  // Check moderate keywords
  CRISIS_LEXICON.moderate.forEach(keyword => {
    if (cleanText.includes(keyword)) {
      detectedModerate.push(keyword)
    }
  })

  // Calculate composite distress score
  const score = (detectedCritical.length * 50) + (detectedSevere.length * 20) + (detectedModerate.length * 8)
  
  let severity = 'none'
  if (detectedCritical.length > 0 || score >= 45) {
    severity = 'critical'
  } else if (detectedSevere.length >= 2 || score >= 25) {
    severity = 'severe'
  } else if (detectedModerate.length >= 2 || score >= 12) {
    severity = 'moderate'
  }

  const isDistressed = severity !== 'none'
  const allKeywords = [...detectedCritical, ...detectedSevere, ...detectedModerate]

  // Check against settings sensitivity
  const settings = getMentalHealthSettings()
  let shouldTriggerAlert = false

  if (settings.enabled && isDistressed) {
    if (severity === 'critical') {
      shouldTriggerAlert = true // Always alert for critical crisis
    } else if (settings.sensitivity === 'mild' && (severity === 'severe' || severity === 'critical')) {
      shouldTriggerAlert = true
    } else if (settings.sensitivity === 'standard' && (severity === 'severe' || severity === 'critical' || detectedSevere.length > 0)) {
      shouldTriggerAlert = true
    } else if (settings.sensitivity === 'strict' && isDistressed) {
      shouldTriggerAlert = true
    }
  }

  // Check cooldown timer
  if (shouldTriggerAlert && severity !== 'critical') {
    const lastAlertTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_ALERT) || '0', 10)
    const now = Date.now()
    const cooldownMs = (settings.cooldownMinutes || 15) * 60 * 1000
    if (now - lastAlertTime < cooldownMs) {
      shouldTriggerAlert = false // Suppress during cooldown for non-critical
    }
  }

  return {
    isDistressed,
    severity,
    score,
    keywords: allKeywords,
    detectedCritical,
    detectedSevere,
    shouldTriggerAlert,
    context
  }
}

// 6. Record Distress Event & Trigger Alert Event
export function recordDistressEvent(eventData) {
  try {
    const now = Date.now()
    localStorage.setItem(STORAGE_KEYS.LAST_ALERT, String(now))

    // Update streak
    let streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10)
    if (eventData.isDistressed) {
      streak++
    } else {
      streak = Math.max(0, streak - 1)
    }
    localStorage.setItem(STORAGE_KEYS.STREAK, String(streak))

    // Save into history
    let history = []
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
    if (saved) history = JSON.parse(saved)
    history.unshift({
      id: `distress-${now}`,
      timestamp: now,
      severity: eventData.severity || 'mild',
      score: eventData.score || 0,
      keywords: eventData.keywords || [],
      source: eventData.source || 'user-input'
    })
    if (history.length > 50) history = history.slice(0, 50)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
  } catch (e) {
    console.warn('Error recording distress event:', e)
  }
}

// 7. Dispatch Global Custom Event to Open Modal
export function triggerMentalHealthAlert(detail = {}) {
  const settings = getMentalHealthSettings()
  if (!settings.enabled && !detail.force) return

  recordDistressEvent(detail)

  window.dispatchEvent(new CustomEvent('trigger-mental-health-alert', {
    detail: {
      severity: detail.severity || 'severe',
      source: detail.source || 'AI Cognitive Analysis',
      keywords: detail.keywords || [],
      message: detail.message || '',
      initialTab: detail.initialTab || 'comfort',
      timestamp: Date.now()
    }
  }))
}
