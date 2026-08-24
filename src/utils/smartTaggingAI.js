/**
 * Smart AI Tagging Engine (Tự Động Gắn Thẻ Thông Minh)
 * Quét nội dung văn bản tiếng Việt & tiếng Anh, phân tích từ khóa, ngữ cảnh và cảm xúc
 * Tự động phân loại: #Gia_đình, #Công_việc, #Tình_yêu, #Áp_lực, #Bản_thân, #Sức_khỏe, #Bạn_bè, #Tài_chính, #Học_tập, #Chữa_lành, #Ước_mơ
 */

export const SMART_TAG_CATEGORIES = [
  {
    tag: '#Gia_đình',
    name: 'Gia Đình & Người Thân',
    icon: '🏡',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)',
    keywords: [
      'gia đình', 'bố', 'mẹ', 'ba', 'má', 'cha', 'ông', 'bà', 'con', 'anh', 'chị', 'em', 
      'người thân', 'nhà', 'về quê', 'sum họp', 'tổ ấm', 'bữa cơm', 'ruột thịt', 'cháu', 
      'dòng họ', 'cha mẹ', 'con cái', 'anh em', 'chị em', 'family', 'parents', 'mother', 
      'father', 'home', 'sibling', 'relatives', 'mom', 'dad'
    ],
    weight: 1.2
  },
  {
    tag: '#Công_việc',
    name: 'Công Việc & Sự Nghiệp',
    icon: '💼',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    keywords: [
      'công việc', 'dự án', 'deadline', 'sếp', 'đồng nghiệp', 'công ty', 'họp', 'meeting', 
      'task', 'kpi', 'báo cáo', 'văn phòng', 'lương', 'tăng ca', 'ot', 'sự nghiệp', 'phỏng vấn', 
      'thăng tiến', 'kinh doanh', 'khách hàng', 'đối tác', 'work', 'job', 'career', 'boss', 
      'colleague', 'office', 'project', 'client', 'salary', 'workflow'
    ],
    weight: 1.2
  },
  {
    tag: '#Tình_yêu',
    name: 'Tình Yêu & Cảm Xúc',
    icon: '💖',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
    keywords: [
      'tình yêu', 'yêu', 'thương', 'crush', 'người yêu', 'bạn gái', 'bạn trai', 'hẹn hò', 
      'tỏ tình', 'nắm tay', 'nụ hôn', 'nhớ', 'chia tay', 'tổn thương', 'trái tim', 'rung động', 
      'kết hôn', 'vợ', 'chồng', 'tâm đầu ý hợp', 'tình cảm', 'ngọt ngào', 'love', 'crush', 
      'dating', 'heart', 'kiss', 'relationship', 'romance', 'couple', 'miss you'
    ],
    weight: 1.25
  },
  {
    tag: '#Áp_lực',
    name: 'Áp Lực & Quá Tải',
    icon: '⚡',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    keywords: [
      'áp lực', 'mệt mỏi', 'kiệt sức', 'lo âu', 'bế tắc', 'đau đầu', 'quá tải', 'burn out', 
      'stress', 'bất an', 'khủng hoảng', 'thức khuya', 'thất vọng', 'tuyệt vọng', 'nghẹt thở', 
      'gánh nặng', 'chán nản', 'chới với', 'sụp đổ', 'bất lực', 'anxious', 'tired', 'overwhelmed', 
      'pressure', 'panic', 'exhausted', 'hopeless'
    ],
    weight: 1.3
  },
  {
    tag: '#Bản_thân',
    name: 'Phát Triển Bản Thân',
    icon: '🌱',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    keywords: [
      'bản thân', 'nội tâm', 'thấu hiểu', 'trưởng thành', 'soi chiếu', 'tự vấn', 'bài học', 
      'thay đổi', 'cải thiện', 'tỉnh thức', 'một mình', 'cô đơn', 'chiêm nghiệm', 'tự do', 
      'tự chủ', 'chính mình', 'tâm trí', 'ý thức', 'self', 'growth', 'mindfulness', 'alone', 
      'reflection', 'myself', 'identity', 'solitude'
    ],
    weight: 1.15
  },
  {
    tag: '#Sức_khỏe',
    name: 'Sức Khỏe & Thể Chất',
    icon: '🍎',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.4)',
    keywords: [
      'sức khỏe', 'thể dục', 'gym', 'chạy bộ', 'yoga', 'giấc ngủ', 'mất ngủ', 'ngủ ngon', 
      'thiền', 'ăn uống', 'dinh dưỡng', 'hồi phục', 'cơ thể', 'bệnh', 'khỏe mạnh', 'uống nước', 
      'thở sâu', 'sức bền', 'health', 'fitness', 'workout', 'sleep', 'insomnia', 'meditation', 
      'body', 'wellness'
    ],
    weight: 1.1
  },
  {
    tag: '#Bạn_bè',
    name: 'Bạn Bè & Tri Kỷ',
    icon: '👥',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    keywords: [
      'bạn bè', 'bạn thân', 'tri kỷ', 'tâm sự', 'cà phê', 'tụ tập', 'trò chuyện', 'lắng nghe', 
      'đồng hành', 'hội bạn', 'chơi chung', 'tình bạn', 'đồng môn', 'friends', 'bestie', 
      'gathering', 'hangout', 'friendship', 'buddies'
    ],
    weight: 1.15
  },
  {
    tag: '#Tài_chính',
    name: 'Tài Chính & Chi Tiêu',
    icon: '💰',
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.4)',
    keywords: [
      'tiền', 'tài chính', 'đầu tư', 'tiết kiệm', 'chi tiêu', 'nợ', 'mua sắm', 'thu nhập', 
      'ngân sách', 'hóa đơn', 'chứng khoán', 'kinh tế', 'giàu', 'nghèo', 'money', 'finance', 
      'invest', 'saving', 'expense', 'income', 'budget', 'debt'
    ],
    weight: 1.1
  },
  {
    tag: '#Học_tập',
    name: 'Học Tập & Tri Thức',
    icon: '📚',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)',
    keywords: [
      'học tập', 'nghiên cứu', 'sách', 'đọc sách', 'thi cử', 'bằng cấp', 'đại học', 'khóa học', 
      'kiến thức', 'bài tập', 'kỹ năng', 'điểm số', 'thầy cô', 'lớp học', 'study', 'learn', 
      'book', 'exam', 'university', 'course', 'knowledge', 'skill'
    ],
    weight: 1.1
  },
  {
    tag: '#Chữa_lành',
    name: 'Chữa Lành & Bình Yên',
    icon: '🕊️',
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.15)',
    border: 'rgba(20, 184, 166, 0.4)',
    keywords: [
      'chữa lành', 'an yên', 'tha thứ', 'giải tỏa', 'bình yên', 'buông bỏ', 'dịu dàng', 
      'chấp nhận', 'tĩnh lặng', 'thanh thản', 'nhẹ nhõm', 'an nhiên', 'vỗ về', 'healing', 
      'peace', 'forgive', 'calm', 'serenity', 'release', 'gentle', 'tranquility'
    ],
    weight: 1.2
  },
  {
    tag: '#Ước_mơ',
    name: 'Ước Mơ & Hoài Bão',
    icon: '✨',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    keywords: [
      'ước mơ', 'hoài bão', 'mục tiêu', 'tương lai', 'hy vọng', 'khát vọng', 'hành trình', 
      'thành công', 'phấn đấu', 'đam mê', 'chinh phục', 'niềm tin', 'vươn lên', 'dream', 
      'goal', 'future', 'hope', 'passion', 'ambition', 'success', 'aspiration'
    ],
    weight: 1.2
  }
]

/**
 * Phân tích toàn diện đoạn văn bản để trích xuất danh sách thẻ thông minh
 * @param {string} text - Nội dung người dùng viết
 * @param {object} options - Tùy chọn ngưỡng tin cậy và số lượng tag tối đa
 * @returns {object} Kết quả phân tích chi tiết
 */
export function analyzeSmartTags(text = '', options = {}) {
  const {
    minConfidence = 15, // Ngưỡng điểm phần trăm tối thiểu
    maxTags = 5,
    boostCategories = []
  } = options

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      tags: [],
      rawMatches: [],
      primaryCategory: null,
      predictedMood: 'calm',
      confidenceSummary: 'Chưa có nội dung để phân tích.',
      wordCount: 0,
      readingTimeSec: 0
    }
  }

  const cleanText = text.toLowerCase()
  const words = cleanText.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  const matches = []

  for (const cat of SMART_TAG_CATEGORIES) {
    let score = 0
    const matchedKeywords = []

    for (const kw of cat.keywords) {
      // Tìm từ khóa nguyên cụm
      if (cleanText.includes(kw.toLowerCase())) {
        // Càng dài điểm càng cao
        const kwLengthWeight = kw.includes(' ') ? 2.2 : 1.2
        score += 10 * kwLengthWeight * (cat.weight || 1.0)
        matchedKeywords.push(kw)
      }
    }

    if (boostCategories.includes(cat.tag)) {
      score += 15
    }

    if (score > 0) {
      // Chuẩn hóa confidence thành phần trăm 0 - 100
      const confidence = Math.min(Math.round((score / (wordCount > 20 ? 40 : 25)) * 100), 98)
      if (confidence >= minConfidence) {
        matches.push({
          tag: cat.tag,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          bg: cat.bg,
          border: cat.border,
          score,
          confidence,
          matchedKeywords: [...new Set(matchedKeywords)]
        })
      }
    }
  }

  // Sắp xếp theo độ tin cậy giảm dần
  matches.sort((a, b) => b.score - a.score)

  const topTags = matches.slice(0, maxTags)

  // Dự đoán Mood tương ứng
  let predictedMood = 'calm'
  const tagNames = topTags.map(t => t.tag)

  if (tagNames.includes('#Áp_lực')) {
    predictedMood = 'breach'
  } else if (tagNames.includes('#Tình_yêu') || tagNames.includes('#Ước_mơ')) {
    predictedMood = 'joy'
  } else if (tagNames.includes('#Chữa_lành') || tagNames.includes('#Bản_thân')) {
    predictedMood = 'calm'
  } else if (tagNames.includes('#Công_việc')) {
    predictedMood = 'friction'
  }

  const primaryCategory = topTags.length > 0 ? topTags[0] : null
  const readingTimeSec = Math.max(1, Math.round(wordCount / 3.5)) // ~210 wpm

  return {
    tags: topTags.map(t => t.tag),
    detailedTags: topTags,
    rawMatches: matches,
    primaryCategory,
    predictedMood,
    wordCount,
    readingTimeSec,
    confidenceSummary: topTags.length > 0 
      ? `AI nhận diện chủ đề trọng tâm: ${topTags.map(t => `${t.tag} (${t.confidence}%)`).join(', ')}`
      : 'Chưa phát hiện từ khóa đặc trưng. Tiếp tục viết để AI tự động phân loại.'
  }
}

/**
 * Phân loại nhanh trả về mảng tag strings
 */
export function quickClassifyTags(text) {
  const result = analyzeSmartTags(text, { minConfidence: 12, maxTags: 4 })
  return result.tags
}
