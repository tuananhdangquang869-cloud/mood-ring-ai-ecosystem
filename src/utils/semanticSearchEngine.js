/**
 * 🔍 SEMANTIC SEARCH & NATURAL LANGUAGE QUERY ENGINE
 * Mood Ring Story - Feature 22
 * 
 * Provides intelligent semantic search across all memory stores (Multimedia Journal, Dream Journal, Time Capsules).
 * Understands Vietnamese & English natural language questions, sentiments, temporal intent, and contextual topics.
 */

// Vietnamese diacritics removal for fuzzy lexical matching
export function removeVietnameseTones(str = '') {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

// Mood lexicon dictionary for intent detection
const MOOD_LEXICON = {
  joy: [
    'vui', 'vui ve', 'han hoan', 'hanh phuc', 'yeu doi', 'phan khoi', 'nang luong', 'cuoi', 
    'sang khoai', 'tuyet voi', 'thang hoa', 'tu do', 'hy vong', 'yeu thuong', 'tu hao', 'happy', 'joy'
  ],
  calm: [
    'binh yen', 'tinh lang', 'thu gian', 'nhe nhang', 'an nhien', 'thanh than', 'em dem', 
    'lang dong', 'khoang lang', 'chua lanh', 'can bang', 'thien', 'sau lang', 'calm', 'peace', 'zen'
  ],
  melancholy: [
    'buon', 'tram mac', 'hoai niem', 'co don', 'lang le', 'man mac', 'sau lang', 'nho', 
    'ky niem', 'qua khu', 'lac long', 'troi dat', 'melancholy', 'sad'
  ],
  friction: [
    'tran tro', 'suy nghi', 'ap luc', 'phan van', 'boi roi', 'lo lang', 'cang thang', 
    'stress', 'kho khan', 'be tac', 'do du', 'dau tranh', 'friction', 'anxious'
  ],
  breach: [
    'gian', 'tuc gian', 'bung no', 'pha vo', 'buc boi', 'phan no', 'chay', 'hoa thieu', 
    'bao to', 'xung dot', 'breach', 'anger', 'furious'
  ]
}

// Topic / Tag Lexicon
const TOPIC_LEXICON = {
  '#Công_việc': ['cong viec', 'du an', 'deadline', 'cong ty', 'sep', 'dong nghiep', 'luong', 'work', 'job', 'task'],
  '#Gia_đình': ['gia dinh', 'bo', 'me', 'ba', 'me', 'anh', 'chi', 'em', 'nha', 'que', 'family', 'home'],
  '#Tình_yêu': ['tinh yeu', 'nguoi yeu', 'crush', 'hen ho', 'chia tay', 'nho nhung', 'love', 'romantic'],
  '#Áp_lực': ['ap luc', 'stress', 'met moi', 'kiet que', 'g ganh nang', 'burnout', 'overwhelmed'],
  '#Bản_thân': ['ban than', 'chinh minh', 'noi tam', 'tu duy', 'phat trien', 'tu do', 'self', 'soul'],
  '#Sức_khỏe': ['suc khoe', 'the duc', 'chay bo', 'an uong', 'ngu', 'benh', 'hoi phuc', 'health'],
  '#Bạn_bè': ['ban be', 'tri ky', 'hoi ban', 'gap go', 'tro chuyen', 'friends'],
  '#Ước_mơ': ['uoc mo', 'hoai bao', 'khat vong', 'tuong lai', 'muc tieu', 'dream', 'aspiration'],
  '#Chữa_lành': ['chua lanh', 'phuc hoi', 'yeu thuong', 'binh an', 'tha thu', 'healing']
}

// Temporal cues
const TEMPORAL_CUES = {
  last_time: ['lan truoc', 'lan gan nhat', 'moi day', 'gan day', 'vua qua', 'last time', 'recent'],
  first_time: ['lan dau', 'dau tien', 'khoi dau', 'first time'],
  yesterday: ['hom qua', 'ngay hom qua', 'yesterday'],
  last_month: ['thang truoc', 'thang vua roi', 'last month'],
  dream: ['giac mo', 'nam mo', 'mo thay', 'chiem bao', 'dream']
}

/**
 * Parses user query into semantic intents
 */
export function analyzeQueryIntent(query = '') {
  const norm = removeVietnameseTones(query)
  
  // 1. Detect target emotions
  const detectedMoods = []
  for (const [mood, keywords] of Object.entries(MOOD_LEXICON)) {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        detectedMoods.push(mood)
        break
      }
    }
  }

  // 2. Detect target topics
  const detectedTopics = []
  for (const [topic, keywords] of Object.entries(TOPIC_LEXICON)) {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        detectedTopics.push(topic)
        break
      }
    }
  }

  // 3. Detect temporal intent
  let temporalIntent = 'all'
  if (TEMPORAL_CUES.last_time.some(c => norm.includes(c))) temporalIntent = 'most_recent'
  else if (TEMPORAL_CUES.first_time.some(c => norm.includes(c))) temporalIntent = 'earliest'
  else if (TEMPORAL_CUES.dream.some(c => norm.includes(c))) temporalIntent = 'dream'

  // 4. Check if question asking for reason/cause ("vì điều gì", "tại sao", "lý do")
  const isCausalQuestion = /vi dieu gi|tai sao|ly do|vi sao|nguyen nhan|khi nao|lam gi/i.test(norm)

  return {
    rawQuery: query,
    normalizedQuery: norm,
    detectedMoods: detectedMoods.length > 0 ? detectedMoods : null,
    detectedTopics,
    temporalIntent,
    isCausalQuestion,
    tokens: norm.split(/\s+/).filter(t => t.length > 1)
  }
}

/**
 * Gathers all entries across localStorage stores
 */
export function getAllSearchableEntries() {
  const all = []

  // 1. Multimedia Journal Entries
  try {
    const savedJournal = localStorage.getItem('mr-multimedia-journal-entries')
    if (savedJournal) {
      const parsed = JSON.parse(savedJournal)
      parsed.forEach(item => {
        all.push({
          id: item.id || `journal-${Math.random()}`,
          source: 'journal',
          sourceLabel: 'Nhật Ký Đa Phương Tiện',
          sourceIcon: '🎨',
          title: item.title || 'Ghi chép cảm xúc',
          date: item.date || new Date().toISOString(),
          mood: item.mood || 'calm',
          intensity: item.intensity || 70,
          note: item.note || '',
          tags: item.tags || [],
          palette: item.palette || [],
          mediaUrl: item.mediaUrl || null,
          aiAnalysis: item.aiAnalysis || ''
        })
      })
    }
  } catch (e) {
    console.warn('Error reading journal entries for semantic search:', e)
  }

  // 2. Dream Journal Entries
  try {
    const savedDream = localStorage.getItem('mr-dream-journal-entries')
    if (savedDream) {
      const parsed = JSON.parse(savedDream)
      parsed.forEach(item => {
        all.push({
          id: item.id || `dream-${Math.random()}`,
          source: 'dream',
          sourceLabel: 'Sổ Tay Ước Mơ',
          sourceIcon: '🌙',
          title: item.title || 'Giấc mơ vô thực',
          date: item.date || item.createdAt || new Date().toISOString(),
          mood: 'calm',
          intensity: 80,
          note: item.content || item.note || '',
          tags: item.tags || ['#dream'],
          palette: ['#a855f7', '#6366f1', '#0f172a'],
          mediaUrl: item.sketchUrl || null,
          aiAnalysis: item.aiAnalysis || ''
        })
      })
    }
  } catch (e) {
    console.warn('Error reading dream entries for semantic search:', e)
  }

  // 3. Time Capsules
  try {
    const savedCapsules = localStorage.getItem('mr-time-capsules')
    if (savedCapsules) {
      const parsed = JSON.parse(savedCapsules)
      parsed.forEach(item => {
        all.push({
          id: item.id || `capsule-${Math.random()}`,
          source: 'capsule',
          sourceLabel: 'Hộp Thời Gian',
          sourceIcon: '⏳',
          title: item.title || 'Lá thư gửi tương lai',
          date: item.createdAt || item.unlockDate || new Date().toISOString(),
          mood: item.mood || 'calm',
          intensity: 85,
          note: item.isLocked ? '(Nội dung đang được niêm phong trong Stasis Vault)' : (item.message || item.note || ''),
          tags: ['#thời_gian', '#kỷ_niệm', '#tương_lai'],
          palette: ['#f59e0b', '#00f0ff', '#020617'],
          mediaUrl: item.attachment || null,
          aiAnalysis: item.isLocked ? 'Đang niêm phong' : 'Bức thư thời gian'
        })
      })
    }
  } catch (e) {
    console.warn('Error reading time capsules for semantic search:', e)
  }

  return all
}

/**
 * Executes Semantic Search across memory entries
 */
export function performSemanticSearch(query = '', filterSource = 'all') {
  if (!query || !query.trim()) {
    return {
      results: [],
      intent: null,
      aiSummary: 'Vui lòng nhập câu hỏi hoặc suy nghĩ bạn muốn tìm kiếm.',
      totalCount: 0
    }
  }

  const intent = analyzeQueryIntent(query)
  let entries = getAllSearchableEntries()

  if (filterSource !== 'all') {
    entries = entries.filter(e => e.source === filterSource)
  }

  if (entries.length === 0) {
    return {
      results: [],
      intent,
      aiSummary: 'Chưa có bản ghi nào trong hệ thống bộ nhớ.',
      totalCount: 0
    }
  }

  // Score each entry
  const scoredEntries = entries.map(entry => {
    let score = 0
    const matchedAspects = []

    const normTitle = removeVietnameseTones(entry.title || '')
    const normNote = removeVietnameseTones(entry.note || '')
    const normTags = (entry.tags || []).map(t => removeVietnameseTones(t || '')).join(' ')
    const normAnalysis = removeVietnameseTones(entry.aiAnalysis || '')
    const fullText = `${normTitle} ${normNote} ${normTags} ${normAnalysis}`

    // 1. Mood match bonus (High semantic weight)
    if (intent.detectedMoods && intent.detectedMoods.includes(entry.mood)) {
      score += 45
      matchedAspects.push(`Tâm trạng trùng khớp (${(entry.mood || 'CALM').toUpperCase()})`)
    }

    // 2. Keyword / Token semantic overlap
    intent.tokens.forEach(token => {
      if (normTitle.includes(token)) {
        score += 25
        matchedAspects.push(`Tiêu đề: "${token}"`)
      } else if (normTags.includes(token)) {
        score += 20
        matchedAspects.push(`Thẻ liên quan: #${token}`)
      } else if (normNote.includes(token)) {
        score += 15
      } else if (normAnalysis.includes(token)) {
        score += 10
      }
    })

    // 3. Topic Tag match
    if (intent.detectedTopics.length > 0) {
      entry.tags.forEach(t => {
        if (intent.detectedTopics.includes(t)) {
          score += 30
          matchedAspects.push(`Chủ đề: ${t}`)
        }
      })
    }

    // 4. Causal match: if question asks "vì điều gì / tại sao" and note contains causal keywords
    if (intent.isCausalQuestion) {
      if (/boi vi|vi|khi|do|nho|cam thay|nhan thay|nhin thay|sau khi/i.test(normNote)) {
        score += 18
      }
    }

    // 5. Recency / Temporal Weighting
    try {
      const entryTime = new Date(entry.date).getTime()
      if (!isNaN(entryTime)) {
        const now = Date.now()
        const daysAgo = (now - entryTime) / (1000 * 60 * 60 * 24)
        if (intent.temporalIntent === 'most_recent') {
          // Boost recent entries
          const recencyBonus = Math.max(0, 30 - Math.min(30, daysAgo * 0.5))
          score += recencyBonus
        }
      }
    } catch {
      // ignore
    }

    // Calculate percentage match (normalized between 30% and 99%)
    const matchPercentage = Math.min(99, Math.max(15, Math.round(score * 1.1 + 10)))

    // Extract best excerpt / answer snippet
    const excerpt = extractRelevantExcerpt(entry.note, intent.tokens, intent.rawQuery)

    return {
      ...entry,
      score,
      matchPercentage,
      matchedAspects: [...new Set(matchedAspects)],
      excerpt
    }
  })

  // Filter items that have meaningful score and sort descending
  const results = scoredEntries
    .filter(item => item.score > 10 || item.matchPercentage > 35)
    .sort((a, b) => b.score - a.score)

  // Generate AI Answer Synthesis
  const aiSummary = generateAiAnswerSynthesis(query, intent, results)

  return {
    results,
    intent,
    aiSummary,
    totalCount: results.length
  }
}

/**
 * Extracts a concise excerpt from the entry note answering the query
 */
function extractRelevantExcerpt(note = '', tokens = [], rawQuery = '') {
  if (!note) return 'Không có ghi chú văn bản.'
  
  // Split into sentences
  const sentences = note.split(/(?<=[.?!])\s+/)
  if (sentences.length <= 1) return note

  let bestSentence = sentences[0]
  let maxScore = -1

  sentences.forEach(sentence => {
    const norm = removeVietnameseTones(sentence)
    let sScore = 0
    tokens.forEach(token => {
      if (norm.includes(token)) sScore += 10
    })
    if (/khi|vi|boi vi|cam thay|nhan thay|nhin thay|chieu|sang|toi/i.test(norm)) {
      sScore += 5
    }
    if (sScore > maxScore) {
      maxScore = sScore
      bestSentence = sentence
    }
  })

  return bestSentence
}

/**
 * Synthesizes an empathetic AI Answer based on the top semantic match
 */
function generateAiAnswerSynthesis(query, intent, results) {
  if (!results || results.length === 0) {
    return `MR-CORE-01 đã phân tích hệ thống nhưng chưa tìm thấy ký ức nào phù hợp với câu hỏi: "${query}". Bạn có thể thử diễn đạt theo cách khác hoặc tạo thêm trang nhật ký mới.`
  }

  const top = results[0]
  const dateStr = top.date ? new Date(top.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'gần đây'

  if (intent.detectedMoods && intent.detectedMoods.includes('joy')) {
    return `🎯 **Ký Ức Tìm Thấy:** Dựa trên phân tích ngữ nghĩa, lần gần nhất bạn cảm thấy hân hoan, vui vẻ là vào ngày **${dateStr}** trong bài viết *" ${top.title} "* (${top.intensity}% năng lượng). Lý do ghi nhận: *"${top.excerpt}"*`
  }

  if (intent.detectedMoods && intent.detectedMoods.includes('calm')) {
    return `🌿 **Khoảnh Khắc Bình Yên:** Hệ thống tìm thấy khoảng lặng tĩnh tại sâu sắc nhất của bạn vào ngày **${dateStr}** với bài viết *" ${top.title} "*. Bạn đã ghi chú: *"${top.excerpt}"*`
  }

  if (intent.detectedMoods && intent.detectedMoods.includes('breach')) {
    return `🔥 **Cảm Xúc Bùng Nổ:** Ký ức về sự căng thẳng / bùng nổ được ghi nhận vào ngày **${dateStr}** trong *" ${top.title} "*. Bạn đã viết: *"${top.excerpt}"*`
  }

  return `✨ **Kết Quả AI:** Tìm thấy **${results.length} ký ức** có liên kết mật thiết với câu hỏi của bạn. Ký ức khớp nhất là *" ${top.title} "* (${dateStr}) với độ tương đồng **${top.matchPercentage}%**.`
}

// Preset questions for quick suggestion
export const PRESET_SEMANTIC_QUESTIONS = [
  { text: 'Lần trước mình cảm thấy vui vì điều gì?', icon: '⚡', category: 'joy' },
  { text: 'Những khoảnh khắc tìm thấy sự bình yên sâu lắng', icon: '🌿', category: 'calm' },
  { text: 'Những lúc nào mình cảm thấy áp lực công việc nhất?', icon: '⚙️', category: 'friction' },
  { text: 'Lúc nào cảm xúc bùng nổ và cách giải tỏa?', icon: '🔥', category: 'breach' },
  { text: 'Giấc mơ kỳ lạ nhất được ghi lại gần đây', icon: '🌙', category: 'dream' },
  { text: 'Những lời hứa và tâm sự gửi tới tương lai', icon: '⏳', category: 'capsule' }
]
