/**
 * EMOTIONAL ANALYTICS ENGINE (Tính năng 31 & 32)
 * Thu thập, chuẩn hóa và phân tích dữ liệu đa chiều cảm xúc:
 * - Time Series: 7 Ngày (Tuần), 30 Ngày (Tháng), 1 Năm (12 Tháng)
 * - Resonance Index (0-100), Intensity, Balance & Stability Score
 * - 5-Axis Mood Radar (Joy, Calm, Melancholy, Friction, Breach)
 * - Mood Contribution Heatmap
 * - Peak Writing Hours & Habit Rhythm
 * - Emotional Archetype Generator ("Nhà Chiêm Tinh Tĩnh Lặng", "Kẻ Du Hành Ánh Sáng", ...)
 * - Personalized AI Insights & Mental Health Observations
 * - Spotify Wrapped Data Package Generator (Weekly & Yearly)
 * - Smart Demo Data Seeder (1-click seed 30 days or 1 year)
 */

export const MOOD_DEFINITIONS = {
  joy: {
    id: 'joy',
    name: 'Hân Hoan',
    icon: '⚡',
    color: '#00f0ff',
    glow: 'rgba(0, 240, 255, 0.45)',
    valence: 95,
    description: 'Năng lượng bừng sáng, tràn đầy hy vọng và động lực.'
  },
  calm: {
    id: 'calm',
    name: 'Bình Yên',
    icon: '🌿',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    valence: 80,
    description: 'Tâm trí tĩnh lặng, thư thái, hòa hợp với chính mình.'
  },
  melancholy: {
    id: 'melancholy',
    name: 'Trầm Mặc',
    icon: '🌌',
    color: '#60a5fa',
    glow: 'rgba(96, 165, 250, 0.45)',
    valence: 45,
    description: 'Chiều sâu lắng đọng, suy tư triết lý và hồi ức dịu êm.'
  },
  friction: {
    id: 'friction',
    name: 'Trăn Trở',
    icon: '⚙️',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    valence: 35,
    description: 'Sự xung đột nội tâm, tìm kiếm câu trả lời giữa ngã rẽ.'
  },
  breach: {
    id: 'breach',
    name: 'Bùng Nổ',
    icon: '🔥',
    color: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.45)',
    valence: 55,
    description: 'Cao trào cảm xúc mãnh liệt, đột phá mọi giới hạn.'
  }
}

// 12 Archetypes dựa trên phân bố cảm xúc & thói quen
export const EMOTIONAL_ARCHETYPES = [
  {
    id: 'serene-astrologer',
    name: 'Nhà Chiêm Tinh Tĩnh Lặng',
    title: 'THE SERENE COSMOLOGIST',
    icon: '🌌',
    color: '#60a5fa',
    badge: 'TÂM TRÍ VŨ TRỤ',
    quote: 'Bạn tìm thấy sự bình an giữa biển sao trời bao la và những chiêm nghiệm sâu sắc.',
    traits: ['Tĩnh tại', 'Thấu thị', 'Sâu sắc', 'Giàu lòng trắc ẩn'],
    condition: (stats) => stats.calmPercent + stats.melancholyPercent >= 55
  },
  {
    id: 'light-traveler',
    name: 'Kẻ Du Hành Ánh Sáng',
    title: 'THE RADIANT VOYAGER',
    icon: '⚡',
    color: '#00f0ff',
    badge: 'NGUỒN NĂNG LƯỢNG',
    quote: 'Ánh sáng của bạn xua tan mọi bóng tối, mang lại cảm hứng mãnh liệt cho người xung quanh.',
    traits: ['Lạc quan', 'Tiên phong', 'Tràn đầy sức sống', 'Truyền cảm hứng'],
    condition: (stats) => stats.joyPercent >= 40
  },
  {
    id: 'soul-alchemist',
    name: 'Nhà Giả Kim Cảm Xúc',
    title: 'THE EMOTIONAL ALCHEMIST',
    icon: '✨',
    color: '#a855f7',
    badge: 'CHUYỂN HÓA NỘI TÂM',
    quote: 'Bạn có khả năng chuyển hóa những nỗi buồn và trăn trở thành nguồn chất liệu nghệ thuật vô giá.',
    traits: ['Sáng tạo', 'Biến hóa', 'Cân bằng', 'Nghệ sĩ tính'],
    condition: (stats) => stats.frictionPercent + stats.melancholyPercent >= 40 && stats.joyPercent >= 20
  },
  {
    id: 'dreamy-night-owl',
    name: 'Cú Đêm Mộng Mơ',
    title: 'THE NOCTURNAL DREAMER',
    icon: '🌙',
    color: '#c084fc',
    badge: 'TÂM HỒN DẠ THƯƠNG',
    quote: 'Đêm khuya là thánh đường của những giấc mơ và những dòng nhật ký chân thật nhất của bạn.',
    traits: ['Thơ mộng', 'Trực giác cao', 'Kín đáo', 'Giàu xúc cảm'],
    condition: (stats) => stats.peakTimeCategory === 'night' || stats.peakTimeCategory === 'late-night'
  },
  {
    id: 'phoenix-warrior',
    name: 'Chiến Binh Phượng Hoàng',
    title: 'THE PHOENIX REBORN',
    icon: '🔥',
    color: '#ef4444',
    badge: 'BẤT KHUẤT TÁI SINH',
    quote: 'Mỗi thử thách hay cảm xúc bùng nổ đều là ngọn lửa tôi luyện ý chí kiên cường bất khuất trong bạn.',
    traits: ['Dũng cảm', 'Đột phá', 'Chân thực', 'Kiên cường'],
    condition: (stats) => stats.breachPercent >= 30 || stats.burnCount >= 3
  },
  {
    id: 'zen-gardener',
    name: 'Người Làm Vườn Tĩnh Lặng',
    title: 'THE ZEN HARMONIZER',
    icon: '🌿',
    color: '#10b981',
    badge: 'CÂN BẰNG TUYỆT ĐỐI',
    quote: 'Như một khu vườn thiền xanh mướt, tâm thức bạn là bến đỗ an yên cho mọi tâm sự.',
    traits: ['Ôn hòa', 'Vững chãi', 'Biết ơn', 'Chữa lành'],
    condition: () => true // Fallback
  }
]

/**
 * Thu thập toàn bộ bản ghi cảm xúc từ tất cả storage keys
 */
export function getAllRawEmotionalRecords() {
  const records = []

  // 1. Multimedia Journal
  try {
    const saved = localStorage.getItem('mr-multimedia-journal-entries')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.forEach(e => {
        records.push({
          id: e.id,
          source: 'journal',
          sourceName: 'Nhật Ký Đa Phương Tiện',
          icon: '🎨',
          title: e.title || 'Khoảnh khắc nhật ký',
          date: new Date(e.date || e.createdAt || Date.now()),
          mood: e.mood || 'calm',
          intensity: typeof e.intensity === 'number' ? e.intensity : 80,
          tags: e.tags || [],
          text: (e.title || '') + ' ' + (e.blocks?.map(b => b.content || '').join(' ') || e.note || ''),
          wordCount: (e.blocks?.map(b => b.content || '').join(' ') || '').split(/\s+/).filter(Boolean).length || 20
        })
      })
    }
  } catch (err) {
    console.warn('Error reading journal records:', err)
  }

  // 2. Dream Journal
  try {
    const saved = localStorage.getItem('mr-dream-journal-entries')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.forEach(e => {
        records.push({
          id: e.id,
          source: 'dream',
          sourceName: 'Sổ Tay Ước Mơ',
          icon: '🌙',
          title: e.title || 'Giấc mơ vô thực',
          date: new Date(e.date || e.createdAt || Date.now()),
          mood: e.mood || 'calm',
          intensity: 75,
          tags: e.tags || ['#dream'],
          text: (e.title || '') + ' ' + (e.content || e.note || ''),
          wordCount: (e.content || '').split(/\s+/).filter(Boolean).length || 15
        })
      })
    }
  } catch (err) {
    console.warn('Error reading dream records:', err)
  }

  // 3. Time Capsules
  try {
    const saved = localStorage.getItem('mr-time-capsules')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.forEach(e => {
        records.push({
          id: e.id,
          source: 'capsule',
          sourceName: 'Hộp Thời Gian',
          icon: '⏳',
          title: e.title || 'Hộp thời gian gửi tương lai',
          date: new Date(e.createdAt || Date.now()),
          mood: e.mood || 'calm',
          intensity: 85,
          tags: ['#thời_gian'],
          text: e.message || '',
          wordCount: (e.message || '').split(/\s+/).filter(Boolean).length || 25
        })
      })
    }
  } catch (err) {
    console.warn('Error reading capsule records:', err)
  }

  // 4. Burn Mode Records
  try {
    const saved = localStorage.getItem('mr-burn-history')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.forEach(e => {
        records.push({
          id: e.id || Math.random().toString(),
          source: 'burn',
          sourceName: 'Thanh Tẩy Muộn Phiền',
          icon: '🔥',
          title: 'Ý niệm đã thanh tẩy',
          date: new Date(e.timestamp || Date.now()),
          mood: 'breach',
          intensity: 90,
          tags: ['#thanh_tẩy'],
          text: '',
          wordCount: e.charCount ? Math.ceil(e.charCount / 5) : 30
        })
      })
    }
  } catch (err) {
    console.warn('Error reading burn records:', err)
  }

  // 5. Whisper Corner Records
  try {
    const saved = localStorage.getItem('mr-whispers')
    if (saved) {
      const parsed = JSON.parse(saved)
      parsed.forEach(e => {
        if (e.isUserCreated) {
          records.push({
            id: e.id,
            source: 'whisper',
            sourceName: 'Góc Ẩn Danh',
            icon: '🕊️',
            title: 'Lời thì thầm đồng điệu',
            date: new Date(e.createdAt || Date.now()),
            mood: e.auraMood || 'calm',
            intensity: 70,
            tags: ['#thì_thầm'],
            text: e.content || '',
            wordCount: (e.content || '').split(/\s+/).filter(Boolean).length || 15
          })
        }
      })
    }
  } catch (err) {
    console.warn('Error reading whisper records:', err)
  }

  // Sort chronological ascending
  records.sort((a, b) => a.date.getTime() - b.date.getTime())

  return records
}

/**
 * Tạo hình ảnh Vector nghệ thuật cảm xúc dự phòng cho các mục nhật ký
 */
export function getMoodArtSvg(mood = 'calm', title = '', intensity = 75) {
  if (mood === 'joy') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23021b29"/><stop offset="100%" stop-color="%23050c18"/></linearGradient><radialGradient id="r" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="%2300f0ff" stop-opacity="0.8"/><stop offset="50%" stop-color="%23ec4899" stop-opacity="0.4"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="120" fill="url(%23r)"/><circle cx="300" cy="180" r="70" fill="none" stroke="%2300f0ff" stroke-width="3" stroke-dasharray="8 6"/><polygon points="300,100 360,240 240,240" fill="none" stroke="%2339ff14" stroke-width="2" opacity="0.8"/><circle cx="210" cy="130" r="4" fill="%23ffffff"/><circle cx="390" cy="220" r="5" fill="%23ff00ea"/><circle cx="330" cy="90" r="3" fill="%23ffb000"/><text x="300" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="%2300f0ff" text-anchor="middle" letter-spacing="1">⚡ HÂN HOAN // ${intensity}%</text></svg>`
  }
  if (mood === 'breach') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2326030c"/><stop offset="100%" stop-color="%23090104"/></linearGradient><radialGradient id="r" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="%23ef4444" stop-opacity="0.9"/><stop offset="60%" stop-color="%23f43f5e" stop-opacity="0.3"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="110" fill="url(%23r)"/><path d="M120,310 L240,110 L300,240 L380,80 L440,260 L520,130" fill="none" stroke="%23ef4444" stroke-width="5"/><path d="M160,330 L270,140 L330,280 L420,110 L490,300" fill="none" stroke="%23f59e0b" stroke-width="2.5" opacity="0.8"/><circle cx="380" cy="80" r="14" fill="%23ef4444" opacity="0.7"/><text x="300" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="%23f43f5e" text-anchor="middle" letter-spacing="1">🔥 BÙNG NỔ // ${intensity}%</text></svg>`
  }
  if (mood === 'friction') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23221303"/><stop offset="100%" stop-color="%230b0601"/></linearGradient><radialGradient id="r" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="%23f59e0b" stop-opacity="0.85"/><stop offset="60%" stop-color="%23d97706" stop-opacity="0.35"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="105" fill="url(%23r)"/><polygon points="300,90 380,180 300,270 220,180" fill="none" stroke="%23fbbf24" stroke-width="3.5"/><circle cx="300" cy="180" r="35" fill="none" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="6 4"/><text x="300" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="%23fbbf24" text-anchor="middle" letter-spacing="1">⚙️ TRĂN TRỞ // ${intensity}%</text></svg>`
  }
  if (mood === 'melancholy') {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23041026"/><stop offset="100%" stop-color="%23020612"/></linearGradient><radialGradient id="r" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="%2360a5fa" stop-opacity="0.75"/><stop offset="60%" stop-color="%233b82f6" stop-opacity="0.3"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="115" fill="url(%23r)"/><ellipse cx="300" cy="190" rx="140" ry="50" fill="none" stroke="%2360a5fa" stroke-width="2" stroke-dasharray="4 4"/><circle cx="300" cy="180" r="28" fill="%2393c5fd" opacity="0.8"/><text x="300" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="%2393c5fd" text-anchor="middle" letter-spacing="1">🌌 TRẦM MẶC // ${intensity}%</text></svg>`
  }
  // Default 'calm'
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23021813"/><stop offset="100%" stop-color="%23010c09"/></linearGradient><radialGradient id="r" cx="50%" cy="45%" r="50%"><stop offset="0%" stop-color="%2310b981" stop-opacity="0.85"/><stop offset="60%" stop-color="%23059669" stop-opacity="0.35"/><stop offset="100%" stop-color="transparent"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><circle cx="300" cy="180" r="110" fill="url(%23r)"/><path d="M80,260 C180,210 280,310 380,250 C480,190 540,280 620,240" fill="none" stroke="%2334d399" stroke-width="4"/><circle cx="300" cy="170" r="38" fill="none" stroke="%2310b981" stroke-width="3"/><circle cx="300" cy="170" r="14" fill="%23ecfdf5"/><text x="300" y="340" font-family="monospace" font-size="16" font-weight="bold" fill="%2334d399" text-anchor="middle" letter-spacing="1">🌿 BÌNH YÊN // ${intensity}%</text></svg>`
}

/**
 * Tạo dữ liệu mẫu 30 ngày hoặc 1 năm (Seed Demo Data)
 */
export function seedDemoEmotionalData(type = 'month') {
  const daysToSeed = type === 'year' ? 365 : 30
  const now = new Date(2026, 7, 17, 14, 30) // Current simulated anchor
  const dummyEntries = []

  const sampleTitles = [
    'Bình minh rực rỡ và tách cà phê thơm ngát',
    'Tìm thấy nốt nhạc trầm trong chiều mưa rào',
    'Đột phá ý tưởng cho dự án sáng tạo mới',
    'Nhìn lại những biến cố và học cách buông bỏ',
    'Cơn gió mùa thu và trang sách mở dở',
    'Trăn trở trước một ngã rẽ quan trọng',
    'Một ngày đầy ắp tiếng cười cùng bạn bè',
    'Tĩnh lặng ngắm nhìn thành phố lên đèn',
    'Cảm giác bùng nổ khi vượt qua giới hạn',
    'Khoảnh khắc biết ơn vì những điều nhỏ bé'
  ]

  const moods = ['joy', 'calm', 'melancholy', 'friction', 'breach']
  const tagPool = ['#biết_ơn', '#sáng_tạo', '#tĩnh_tại', '#chữa_lành', '#tình_yêu', '#đột_phá', '#hồi_ức', '#thiên_nhiên']

  for (let i = daysToSeed; i >= 0; i--) {
    // 70% chance of an entry each day
    if (Math.random() < 0.75 || i === 0) {
      const entryDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      // Random hour
      const hour = Math.floor(Math.random() * 24)
      entryDate.setHours(hour, Math.floor(Math.random() * 60))

      const chosenMood = moods[Math.floor(Math.random() * moods.length)]
      const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)]
      const tags = [
        tagPool[Math.floor(Math.random() * tagPool.length)],
        tagPool[Math.floor(Math.random() * tagPool.length)]
      ]

      const intensity = Math.floor(60 + Math.random() * 38)
      dummyEntries.push({
        id: `demo-${i}-${Date.now()}`,
        title,
        date: entryDate.toISOString(),
        mood: chosenMood,
        intensity,
        type: 'drawing',
        mediaUrl: getMoodArtSvg(chosenMood, title, intensity),
        tags: Array.from(new Set(tags)),
        blocks: [
          { id: 'b1', type: 'text', content: `${title}. Cuộc hành trình luôn có những thăng trầm, và mỗi khoảnh khắc đều đáng trân quý.` }
        ],
        createdAt: entryDate.toISOString()
      })
    }
  }

  // Merge into mr-multimedia-journal-entries
  try {
    const existing = JSON.parse(localStorage.getItem('mr-multimedia-journal-entries') || '[]')
    const combined = [...existing, ...dummyEntries]
    localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(combined))
    window.dispatchEvent(new CustomEvent('mr-emotional-data-updated'))
    return dummyEntries.length
  } catch (err) {
    console.error('Error seeding demo data:', err)
    return 0
  }
}

/**
 * Xóa dữ liệu mẫu nếu cần
 */
export function clearDemoEmotionalData() {
  try {
    const existing = JSON.parse(localStorage.getItem('mr-multimedia-journal-entries') || '[]')
    const filtered = existing.filter(e => !e.id?.startsWith('demo-'))
    localStorage.setItem('mr-multimedia-journal-entries', JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('mr-emotional-data-updated'))
  } catch (err) {
    console.error('Error clearing demo data:', err)
  }
}

/**
 * Tính toán số liệu phân tích Dashboard theo khung thời gian (7d, 30d, 1y, all)
 */
export function calculateDashboardAnalytics(timeframe = '30d') {
  const records = getAllRawEmotionalRecords()
  const now = new Date(2026, 7, 17, 23, 59, 59) // Simulated base date

  let cutoff = new Date(now)
  if (timeframe === '7d') {
    cutoff.setDate(now.getDate() - 7)
  } else if (timeframe === '30d') {
    cutoff.setDate(now.getDate() - 30)
  } else if (timeframe === '1y') {
    cutoff.setFullYear(now.getFullYear() - 1)
  } else {
    cutoff = new Date(2000, 0, 1)
  }

  const filteredRecords = records.filter(r => r.date >= cutoff && r.date <= now)

  // 1. Phân phối 5 Moods
  const moodCounts = { joy: 0, calm: 0, melancholy: 0, friction: 0, breach: 0 }
  let totalIntensity = 0
  let totalWords = 0
  const tagFrequency = {}
  const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 } // 5-11, 12-17, 18-22, 23-4

  filteredRecords.forEach(r => {
    const m = r.mood || 'calm'
    if (moodCounts[m] !== undefined) moodCounts[m]++
    totalIntensity += (r.intensity || 75)
    totalWords += (r.wordCount || 20)

    // Tags
    if (Array.isArray(r.tags)) {
      r.tags.forEach(t => {
        tagFrequency[t] = (tagFrequency[t] || 0) + 1
      })
    }

    // Hours
    const h = r.date.getHours()
    if (h >= 5 && h < 12) hourCounts.morning++
    else if (h >= 12 && h < 18) hourCounts.afternoon++
    else if (h >= 18 && h < 23) hourCounts.evening++
    else hourCounts.night++
  })

  const totalEntries = filteredRecords.length
  const joyPercent = totalEntries ? Math.round((moodCounts.joy / totalEntries) * 100) : 0
  const calmPercent = totalEntries ? Math.round((moodCounts.calm / totalEntries) * 100) : 0
  const melancholyPercent = totalEntries ? Math.round((moodCounts.melancholy / totalEntries) * 100) : 0
  const frictionPercent = totalEntries ? Math.round((moodCounts.friction / totalEntries) * 100) : 0
  const breachPercent = totalEntries ? Math.round((moodCounts.breach / totalEntries) * 100) : 0

  // Dominant Mood
  let dominantMoodKey = 'calm'
  let maxCount = -1
  Object.entries(moodCounts).forEach(([k, v]) => {
    if (v > maxCount) {
      maxCount = v
      dominantMoodKey = k
    }
  })

  // Resonance Index (Chỉ số Tích cực & Hài hòa 0-100)
  const weightedValence = totalEntries
    ? (moodCounts.joy * 95 + moodCounts.calm * 85 + moodCounts.melancholy * 55 + moodCounts.friction * 40 + moodCounts.breach * 60) / totalEntries
    : 78

  // Stability Index (Tính ổn định cảm xúc 0-100)
  const variance = totalEntries > 1
    ? (Math.pow(moodCounts.joy - totalEntries / 5, 2) +
       Math.pow(moodCounts.calm - totalEntries / 5, 2) +
       Math.pow(moodCounts.melancholy - totalEntries / 5, 2) +
       Math.pow(moodCounts.friction - totalEntries / 5, 2) +
       Math.pow(moodCounts.breach - totalEntries / 5, 2)) / 5
    : 10
  const stabilityScore = Math.max(45, Math.min(98, Math.round(100 - Math.sqrt(variance) * 4)))

  // Peak Writing Time
  let peakTimeCategory = 'evening'
  let maxHourCount = hourCounts.evening
  if (hourCounts.morning > maxHourCount) { maxHourCount = hourCounts.morning; peakTimeCategory = 'morning'; }
  if (hourCounts.afternoon > maxHourCount) { maxHourCount = hourCounts.afternoon; peakTimeCategory = 'afternoon'; }
  if (hourCounts.night > maxHourCount) { maxHourCount = hourCounts.night; peakTimeCategory = 'night'; }

  const peakTimeLabels = {
    morning: { label: 'Bình Minh / Sáng Sớm (05:00 - 11:59)', icon: '🌅', desc: 'Bạn thường bắt đầu ngày mới bằng việc suy ngẫm và hoạch định.' },
    afternoon: { label: 'Buổi Trưa & Chiều (12:00 - 17:59)', icon: '☀️', desc: 'Bạn ghi lại những suy nghĩ khi ngày làm việc đang diễn ra sôi nổi.' },
    evening: { label: 'Hoàng Hôn & Tối (18:00 - 22:59)', icon: '🌆', desc: 'Thời điểm vàng để bạn lắng đọng và tổng kết cảm xúc trong ngày.' },
    night: { label: 'Đêm Khuya / Cú Đêm (23:00 - 04:59)', icon: '🌙', desc: 'Không gian tĩnh lặng của màn đêm là nơi tâm hồn bạn cất lời chân thật nhất.' }
  }

  // 2. Time Series Points (Line Chart Data)
  const timeSeries = generateTimeSeriesData(filteredRecords, timeframe, now)

  // 3. Bar Chart Series Data (Phân bổ cảm xúc theo từng mốc)
  const barSeries = generateBarSeriesData(filteredRecords, timeframe, now)

  // 4. Radar Polygon Points
  const radarData = [
    { mood: 'joy', name: 'Hân Hoan', value: joyPercent || 20, color: '#00f0ff', icon: '⚡' },
    { mood: 'calm', name: 'Bình Yên', value: calmPercent || 35, color: '#10b981', icon: '🌿' },
    { mood: 'melancholy', name: 'Trầm Mặc', value: melancholyPercent || 25, color: '#60a5fa', icon: '🌌' },
    { mood: 'friction', name: 'Trăn Trở', value: frictionPercent || 15, color: '#f59e0b', icon: '⚙️' },
    { mood: 'breach', name: 'Bùng Nổ', value: breachPercent || 10, color: '#ef4444', icon: '🔥' }
  ]

  // Top Tags
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag, count]) => ({ tag, count }))

  // Archetype
  const archetypeStats = {
    joyPercent,
    calmPercent,
    melancholyPercent,
    frictionPercent,
    breachPercent,
    peakTimeCategory,
    burnCount: filteredRecords.filter(r => r.source === 'burn').length
  }
  const matchedArchetype = EMOTIONAL_ARCHETYPES.find(a => a.condition(archetypeStats)) || EMOTIONAL_ARCHETYPES[0]

  // AI Personalized Health Diagnostic & Advice
  const aiDiagnostics = generateAIEmotionalAdvice(dominantMoodKey, weightedValence, stabilityScore, topTags)

  return {
    timeframe,
    totalEntries,
    totalWords,
    averageIntensity: totalEntries ? Math.round(totalIntensity / totalEntries) : 75,
    resonanceIndex: Math.round(weightedValence),
    stabilityScore,
    dominantMood: MOOD_DEFINITIONS[dominantMoodKey] || MOOD_DEFINITIONS.calm,
    moodCounts,
    percentages: { joy: joyPercent, calm: calmPercent, melancholy: melancholyPercent, friction: frictionPercent, breach: breachPercent },
    peakTime: { category: peakTimeCategory, ...peakTimeLabels[peakTimeCategory] },
    timeSeries,
    barSeries,
    radarData,
    topTags,
    archetype: matchedArchetype,
    aiDiagnostics,
    records: filteredRecords
  }
}

/**
 * Sinh chuỗi dữ liệu Time Series cho Line Chart
 */
function generateTimeSeriesData(records, timeframe, now) {
  const points = []

  if (timeframe === '7d') {
    // 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`

      const dayRecords = records.filter(r => {
        const rd = r.date
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate()
      })

      const avgValence = dayRecords.length
        ? Math.round(dayRecords.reduce((acc, r) => acc + (MOOD_DEFINITIONS[r.mood]?.valence || 70), 0) / dayRecords.length)
        : 75 + Math.sin(i * 0.8) * 8
      const avgIntensity = dayRecords.length
        ? Math.round(dayRecords.reduce((acc, r) => acc + (r.intensity || 75), 0) / dayRecords.length)
        : 70 + Math.cos(i * 0.9) * 10

      points.push({
        dateKey,
        label: dayLabel,
        valence: Math.min(100, Math.max(10, Math.round(avgValence))),
        intensity: Math.min(100, Math.max(10, Math.round(avgIntensity))),
        count: dayRecords.length,
        entries: dayRecords
      })
    }
  } else if (timeframe === '30d') {
    // 30 days (10 steps or 30 days)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`

      const dayRecords = records.filter(r => {
        const rd = r.date
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate()
      })

      const baseValence = 75 + Math.sin(i * 0.4) * 12 + Math.cos(i * 0.2) * 5
      const avgValence = dayRecords.length
        ? Math.round(dayRecords.reduce((acc, r) => acc + (MOOD_DEFINITIONS[r.mood]?.valence || 70), 0) / dayRecords.length)
        : Math.round(baseValence)

      const avgIntensity = dayRecords.length
        ? Math.round(dayRecords.reduce((acc, r) => acc + (r.intensity || 75), 0) / dayRecords.length)
        : 72 + Math.round(Math.sin(i * 0.6) * 10)

      points.push({
        dateKey,
        label: dayLabel,
        valence: Math.min(100, Math.max(10, avgValence)),
        intensity: Math.min(100, Math.max(10, avgIntensity)),
        count: dayRecords.length,
        entries: dayRecords
      })
    }
  } else {
    // 1y: 12 months
    for (let m = 11; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const monthLabel = `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`

      const monthRecords = records.filter(r => {
        const rd = r.date
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      })

      const baseValence = 74 + Math.sin(m * 0.6) * 14
      const avgValence = monthRecords.length
        ? Math.round(monthRecords.reduce((acc, r) => acc + (MOOD_DEFINITIONS[r.mood]?.valence || 70), 0) / monthRecords.length)
        : Math.round(baseValence)

      const avgIntensity = monthRecords.length
        ? Math.round(monthRecords.reduce((acc, r) => acc + (r.intensity || 75), 0) / monthRecords.length)
        : 70 + Math.round(Math.cos(m * 0.5) * 12)

      points.push({
        dateKey: `${d.getFullYear()}-${d.getMonth() + 1}`,
        label: monthLabel,
        valence: Math.min(100, Math.max(10, avgValence)),
        intensity: Math.min(100, Math.max(10, avgIntensity)),
        count: monthRecords.length,
        entries: monthRecords
      })
    }
  }

  return points
}

/**
 * Sinh dữ liệu Bar Chart so sánh phân phối cảm xúc
 */
function generateBarSeriesData(records, timeframe, now) {
  const bars = []

  if (timeframe === '7d') {
    // 7 Days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`

      const dayRecords = records.filter(r => {
        const rd = r.date
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth() && rd.getDate() === d.getDate()
      })

      const counts = { joy: 0, calm: 0, melancholy: 0, friction: 0, breach: 0 }
      dayRecords.forEach(r => { if (counts[r.mood] !== undefined) counts[r.mood]++ })

      bars.push({
        label: dayLabel,
        total: dayRecords.length || 1,
        counts: dayRecords.length ? counts : { joy: (i % 3 === 0 ? 1 : 0), calm: 1, melancholy: (i % 2 === 0 ? 1 : 0), friction: 0, breach: 0 }
      })
    }
  } else if (timeframe === '30d') {
    // 4 Weeks
    for (let w = 3; w >= 0; w--) {
      const weekLabel = `Tuần ${4 - w}`
      const startDay = new Date(now)
      startDay.setDate(now.getDate() - (w + 1) * 7)
      const endDay = new Date(now)
      endDay.setDate(now.getDate() - w * 7)

      const weekRecords = records.filter(r => r.date >= startDay && r.date <= endDay)
      const counts = { joy: 0, calm: 0, melancholy: 0, friction: 0, breach: 0 }
      weekRecords.forEach(r => { if (counts[r.mood] !== undefined) counts[r.mood]++ })

      bars.push({
        label: weekLabel,
        total: weekRecords.length || 4,
        counts: weekRecords.length ? counts : { joy: 2, calm: 4, melancholy: 1, friction: 1, breach: 0 }
      })
    }
  } else {
    // 12 Months
    for (let m = 11; m >= 0; m--) {
      const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
      const monthLabel = `T${d.getMonth() + 1}`

      const monthRecords = records.filter(r => {
        const rd = r.date
        return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth()
      })

      const counts = { joy: 0, calm: 0, melancholy: 0, friction: 0, breach: 0 }
      monthRecords.forEach(r => { if (counts[r.mood] !== undefined) counts[r.mood]++ })

      bars.push({
        label: monthLabel,
        total: monthRecords.length || 5,
        counts: monthRecords.length ? counts : { joy: 2, calm: 3, melancholy: 2, friction: 1, breach: 0 }
      })
    }
  }

  return bars
}

/**
 * Sinh chẩn đoán AI và lời khuyên tâm lý
 */
function generateAIEmotionalAdvice(dominantMood, resonance, stability, topTags) {
  let diagnosis = ''
  let prescription = ''
  let healingTip = ''

  if (dominantMood === 'joy') {
    diagnosis = 'Tâm thức của bạn đang ở trạng thái Cực Quang Tích Cực. Năng lượng Hân Hoan lan tỏa mạnh mẽ, giúp bạn mở rộng tầm nhìn sáng tạo và kết nối sâu sắc với thế giới.'
    prescription = 'Hãy tận dụng thời điểm vàng này để thực hiện những dự án ấp ủ, viết nên những ý tưởng táo bạo hoặc sẻ chia năng lượng tích cực này lên Góc Ẩn Danh (Whisper Corner).'
    healingTip = 'Đừng quên duy trì sự điều độ. Một vài phút tĩnh lặng trong Zen Mode sẽ giúp nguồn năng lượng này bền bỉ dài lâu.'
  } else if (dominantMood === 'calm') {
    diagnosis = 'Tâm trí bạn như mặt hồ phẳng lặng, đạt sự Cân Bằng & An Yên lý tưởng. Chỉ số ổn định của bạn rất cao, phản ánh một nội tâm vững vàng.'
    prescription = 'Duy trì thói quen ghi nhật ký và hít thở nhịp nhàng. Đây là thời điểm tuyệt vời để niêm phong một Hộp Thời Gian (Time Capsule) gửi thông điệp an lành tới tương lai.'
    healingTip = 'Hãy tiếp tục nuôi dưỡng hạt mầm biết ơn qua nhiệm vụ Tam Điểm Biết Ơn mỗi sáng.'
  } else if (dominantMood === 'melancholy') {
    diagnosis = 'Bạn đang trải qua một giai đoạn Lắng Đọng Triết Lý. Nỗi buồn hay sự trầm mặc không phải điều tiêu cực — đó là mảnh đất màu mỡ cho sự thấu hiểu bản thân và nghệ thuật.'
    prescription = 'Hãy chuyển hóa những hoài niệm thành những trang nhật ký đa phương tiện giàu chất thơ hoặc lắng nghe giai điệu Ambient 3D trong Radar Âm Thanh.'
    healingTip = 'Hãy tự ôm lấy chính mình. Bạn luôn có thể tìm kiếm những cái ôm đồng cảm vô danh tại Whisper Corner.'
  } else if (dominantMood === 'friction') {
    diagnosis = 'Hệ thống ghi nhận sự Xung Đột & Trăn Trở Nội Tâm. Bạn có thể đang đứng trước những lựa chọn phức tạp hoặc áp lực cuộc sống.'
    prescription = 'Hãy thử tách nhỏ vấn đề và viết ra từng luồng suy nghĩ. Sử dụng tính năng Thanh Tẩy (Burn Mode) để hóa tro những áp lực không thuộc về tầm kiểm soát của bạn.'
    healingTip = 'Cho phép bản thân nghỉ ngơi. Đi dạo ngoài thiên nhiên hoặc hít thở sâu 3 chu kỳ cùng Zen Mode.'
  } else {
    diagnosis = 'Một làn sóng Bùng Nổ Năng Lượng & Cao Trào Xúc Cảm. Bạn đang ở đỉnh điểm của một bước ngoặt lớn hoặc sự giải phóng cảm xúc mãnh liệt.'
    prescription = 'Khai phóng năng lượng này vào các nhánh cốt truyện mới, hoặc giải tỏa căng thẳng với minigame Bong Bóng Khí / Nam Châm Ngân Hà.'
    healingTip = 'Sau mỗi cơn bão luôn là bầu trời quang đãng. Hãy uống một ngụm nước ấm và thả lỏng cơ thể.'
  }

  return { diagnosis, prescription, healingTip }
}

/**
 * Sinh gói dữ liệu Báo cáo Cá nhân hóa Spotify Wrapped (Tính năng 32)
 */
export function generateSpotifyWrappedData(periodType = 'year') {
  const analytics = calculateDashboardAnalytics(periodType === 'week' ? '7d' : '1y')
  const records = analytics.records

  // Highlight quotes or memorable entries
  const highlightEntry = records.length > 0
    ? records[Math.floor(Math.random() * records.length)]
    : {
        title: 'Hành trình vượt qua đêm dài',
        text: 'Mỗi vết nứt đều là nơi ánh sáng tìm đường rọi vào tâm hồn bạn.',
        date: new Date(2026, 7, 16),
        mood: 'calm'
      }

  // Peak day
  const peakDay = analytics.timeSeries.length > 0
    ? analytics.timeSeries.reduce((prev, current) => (prev.valence > current.valence) ? prev : current)
    : { label: '16/08', valence: 92 }

  // Unique soul color
  const soulColorMap = {
    joy: '#00f0ff',
    calm: '#10b981',
    melancholy: '#60a5fa',
    friction: '#f59e0b',
    breach: '#ef4444'
  }

  const soulColor = soulColorMap[analytics.dominantMood.id] || '#00f0ff'

  return {
    year: 2026,
    periodType, // 'year' | 'week'
    periodTitle: periodType === 'week' ? 'BÁO CÁO CẢM XÚC CUỐI TUẦN' : 'BẢN GIAO HƯỞNG CẢM XÚC 2026',
    userName: 'Nhà Thám Hiểm Tâm Thức',
    totalEntries: analytics.totalEntries || 12,
    totalWords: analytics.totalWords || 1850,
    dominantMood: analytics.dominantMood,
    dominantPercent: analytics.percentages[analytics.dominantMood.id] || 45,
    soulColor,
    resonanceIndex: analytics.resonanceIndex,
    stabilityScore: analytics.stabilityScore,
    peakTime: analytics.peakTime,
    peakDay,
    archetype: analytics.archetype,
    topTags: analytics.topTags.length ? analytics.topTags : [{ tag: '#biết_ơn', count: 8 }, { tag: '#chữa_lành', count: 6 }, { tag: '#sáng_tạo', count: 5 }],
    highlightEntry,
    radarData: analytics.radarData,
    aiOracleBlessing: `Hành trình tâm thức 2026 của bạn rực rỡ như một dải ngân hà đa sắc. Chúc bạn luôn giữ vững tâm tĩnh như gương và trái tim nồng ấm trong mọi nẻo đường tương lai.`
  }
}
