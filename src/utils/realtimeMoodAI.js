/**
 * 🧠 REAL-TIME MULTIMODAL BIOMETRIC & SEMANTIC MOOD AI ENGINE
 * Analyzes Keystroke Dynamics, Mouse Kinetics, and Vietnamese/English Sentiment Lexicons.
 */

// Comprehensive sentiment lexicons (Vietnamese & English)
const EMOTION_LEXICON = {
  joy: [
    // Vietnamese
    'vui', 'hạnh phúc', 'sướng', 'tuyệt vời', 'yêu', 'thích', 'cười', 'tự do', 'hi vọng', 'rạng rỡ',
    'bình minh', 'hào hứng', 'phấn khởi', 'tươi đẹp', 'ngọt ngào', 'say mê', 'tuyệt đỉnh', 'may mắn',
    'rực rỡ', 'lấp lánh', 'thăng hoa', 'hân hoan', 'ấm áp', 'yêu đời', 'hài lòng', 'thành công',
    // English
    'happy', 'joy', 'love', 'excited', 'wonderful', 'great', 'awesome', 'bright', 'delight', 'bliss',
    'radiant', 'laugh', 'smile', 'ecstatic', 'cheerful', 'hope', 'victory', 'euphoria', 'magic'
  ],
  melancholy: [
    // Vietnamese
    'buồn', 'cô đơn', 'khóc', 'rơi lệ', 'mất mát', 'tan vỡ', 'tăm tối', 'lạnh lẽo', 'chia ly', 'tuyệt vọng',
    'nuối tiếc', 'vỡ vụn', 'đau đớn', 'trầm cảm', 'u uất', 'bế tắc', 'chơ vơ', 'trống rỗng', 'thất vọng',
    'xa cách', 'nhớ nhung', 'lẻ loi', 'buốt giá', 'hư vô', 'tan biến', 'chia xa', 'bỏ rơi', 'mệt mỏi',
    // English
    'sad', 'lonely', 'cry', 'tears', 'lost', 'broken', 'dark', 'cold', 'despair', 'grief',
    'pain', 'empty', 'hopeless', 'sorrow', 'mourn', 'fade', 'ache', 'melancholy', 'depressed'
  ],
  anger: [
    // Vietnamese
    'giận', 'tức', 'căm thù', 'phá hủy', 'tức tối', 'nổ tung', 'rực cháy', 'điên cuồng', 'xóa sạch',
    'bức bối', 'thù địch', 'phẫn nộ', 'hận', 'bất công', 'bạo lực', 'nghiền nát', 'khó chịu', 'chết tiệt',
    'gắt gỏng', 'quát tháo', 'tan nát', 'cuồng nộ', 'hỗn loạn', 'vỡ nát', 'đập phá',
    // English
    'angry', 'rage', 'hate', 'furious', 'burn', 'destroy', 'mad', 'fury', 'enemy', 'wrath',
    'crush', 'kill', 'scream', 'hostile', 'chaos', 'explode', 'breach', 'friction', 'strike'
  ],
  relaxed: [
    // Vietnamese
    'thư giãn', 'bình yên', 'nhẹ nhàng', 'êm dịu', 'tĩnh lặng', 'gió', 'sóng', 'trôi nhẹ', 'thở sâu',
    'an nhiên', 'thiền', 'thanh thản', 'êm ái', 'dịu dàng', 'bình thản', 'chậm rãi', 'nghỉ ngơi',
    'trong trẻo', 'yên ả', 'thong thả', 'thư thái', 'mát mẻ', 'hài hòa', 'tĩnh tâm', 'thanh bình',
    // English
    'calm', 'relax', 'peace', 'serene', 'gentle', 'breathe', 'tranquil', 'quiet', 'smooth', 'soothe',
    'soft', 'rest', 'zen', 'chill', 'easy', 'flow', 'floating', 'silence', 'harmony'
  ]
}

export class RealtimeMoodAnalyzer {
  constructor() {
    this.keyPressTimestamps = []
    this.keyLatencies = []
    this.backspaceCount = 0
    this.totalKeysPressed = 0
    
    this.mouseEvents = []
    this.lastMousePos = null
    this.mouseVelocities = []
    
    this.lastAnalyzedText = ''
    this.currentEmotion = 'relaxed'
    this.confidence = { joy: 25, melancholy: 25, anger: 25, relaxed: 25 }
    this.biometrics = {
      wpm: 0,
      cps: 0,
      jitter: 0,
      backspaceRatio: 0,
      mouseSpeed: 0,
      mouseJitter: 0,
      valence: 0, // -1 (negative) to +1 (positive)
      arousal: 0  // 0 (calm) to 1 (high energy)
    }
  }

  // Record a keydown event
  recordKey(event) {
    const now = performance.now()
    this.totalKeysPressed++
    
    if (event.key === 'Backspace' || event.key === 'Delete') {
      this.backspaceCount++
    }

    if (this.keyPressTimestamps.length > 0) {
      const lastKeyTime = this.keyPressTimestamps[this.keyPressTimestamps.length - 1]
      const latency = now - lastKeyTime
      if (latency < 4000) { // Discard extreme idle pauses
        this.keyLatencies.push(latency)
        if (this.keyLatencies.length > 30) this.keyLatencies.shift()
      }
    }

    this.keyPressTimestamps.push(now)
    // Keep window of last 5 seconds
    const windowStart = now - 5000
    this.keyPressTimestamps = this.keyPressTimestamps.filter(t => t >= windowStart)
  }

  // Record mouse movement
  recordMouseMove(e) {
    const now = performance.now()
    const currentPos = { x: e.clientX, y: e.clientY, time: now }

    if (this.lastMousePos) {
      const dt = Math.max(1, now - this.lastMousePos.time)
      const dx = currentPos.x - this.lastMousePos.x
      const dy = currentPos.y - this.lastMousePos.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const velocity = (dist / dt) * 1000 // px per second

      this.mouseVelocities.push(velocity)
      if (this.mouseVelocities.length > 25) this.mouseVelocities.shift()
    }

    this.lastMousePos = currentPos
    this.mouseEvents.push(currentPos)
    const windowStart = now - 3000
    this.mouseEvents = this.mouseEvents.filter(m => m.time >= windowStart)
  }

  // Analyze text and combined biometrics
  analyze(text = '') {
    this.lastAnalyzedText = text
    const now = performance.now()

    // 1. Calculate Keystroke Biometrics
    const recentKeys = this.keyPressTimestamps.filter(t => t >= now - 5000)
    const cps = recentKeys.length > 0 ? (recentKeys.length / 5).toFixed(1) : 0
    const wpm = Math.round((cps * 60) / 5) // standard 5 chars per word

    // Keystroke latency jitter (standard deviation)
    let jitter = 0
    if (this.keyLatencies.length > 2) {
      const avgLatency = this.keyLatencies.reduce((a, b) => a + b, 0) / this.keyLatencies.length
      const variance = this.keyLatencies.reduce((acc, val) => acc + Math.pow(val - avgLatency, 2), 0) / this.keyLatencies.length
      jitter = Math.min(100, Math.round(Math.sqrt(variance) / 3))
    }

    const backspaceRatio = this.totalKeysPressed > 0 
      ? Math.min(1, this.backspaceCount / Math.max(1, this.totalKeysPressed))
      : 0

    // 2. Calculate Mouse Kinetics
    let avgMouseSpeed = 0
    let mouseJitter = 0
    if (this.mouseVelocities.length > 0) {
      avgMouseSpeed = Math.round(this.mouseVelocities.reduce((a, b) => a + b, 0) / this.mouseVelocities.length)
      const avgV = avgMouseSpeed
      const vVar = this.mouseVelocities.reduce((acc, val) => acc + Math.pow(val - avgV, 2), 0) / this.mouseVelocities.length
      mouseJitter = Math.min(100, Math.round(Math.sqrt(vVar) / 10))
    }

    // 3. Analyze Semantic Text Sentiment
    const words = text.toLowerCase().split(/[\s,.;:!?()"\n\r]+/).filter(Boolean)
    let joyScore = 0
    let melancholyScore = 0
    let angerScore = 0
    let relaxedScore = 0

    words.forEach(word => {
      if (EMOTION_LEXICON.joy.some(w => word.includes(w) || w.includes(word))) joyScore += 2.5
      if (EMOTION_LEXICON.melancholy.some(w => word.includes(w) || w.includes(word))) melancholyScore += 2.5
      if (EMOTION_LEXICON.anger.some(w => word.includes(w) || w.includes(word))) angerScore += 2.8
      if (EMOTION_LEXICON.relaxed.some(w => word.includes(w) || w.includes(word))) relaxedScore += 2.2
    })

    // Punctuation & Style cues
    const exclamationCount = (text.match(/!/g) || []).length
    const questionCount = (text.match(/\?/g) || []).length
    const ellipsisCount = (text.match(/\.{2,}/g) || []).length
    const allCapsCount = (text.match(/\b[A-ZÀ-Ỹ]{2,}\b/g) || []).length

    if (exclamationCount > 0) {
      angerScore += exclamationCount * 1.2
      joyScore += exclamationCount * 0.8
    }
    if (ellipsisCount > 0) {
      melancholyScore += ellipsisCount * 2.0
      relaxedScore += ellipsisCount * 1.0
    }
    if (allCapsCount > 0) {
      angerScore += allCapsCount * 2.0
    }

    // 4. Biometric Influence on Emotions
    // Fast WPM + High Mouse Speed + High Jitter -> High Arousal (Anger / High Joy)
    if (wpm > 65 || avgMouseSpeed > 800) {
      angerScore += 1.8
      joyScore += 1.5
    } else if (wpm < 30 && avgMouseSpeed < 250) {
      relaxedScore += 1.8
      melancholyScore += 1.2
    }

    // High Backspace Ratio -> Agitation or Hesitation
    if (backspaceRatio > 0.15) {
      angerScore += 1.2
      melancholyScore += 1.0
    }

    // Smooth rhythm & low jitter -> Relaxed
    if (jitter < 25 && mouseJitter < 30 && wpm > 10) {
      relaxedScore += 1.5
    }

    // Default neutral distribution if baseline empty
    const baseWeight = 0.5
    joyScore += baseWeight
    melancholyScore += baseWeight
    angerScore += baseWeight
    relaxedScore += baseWeight + 0.2 // slight calm bias for baseline

    // Compute Probabilities (Softmax-like normalize)
    const totalScore = joyScore + melancholyScore + angerScore + relaxedScore
    const joyPct = Math.round((joyScore / totalScore) * 100)
    const melPct = Math.round((melancholyScore / totalScore) * 100)
    const angPct = Math.round((angerScore / totalScore) * 100)
    const relPct = 100 - (joyPct + melPct + angPct)

    this.confidence = {
      joy: Math.max(2, joyPct),
      melancholy: Math.max(2, melPct),
      anger: Math.max(2, angPct),
      relaxed: Math.max(2, relPct)
    }

    // Determine winning emotion
    let highestEmotion = 'relaxed'
    let maxVal = -1
    for (const [emo, val] of Object.entries(this.confidence)) {
      if (val > maxVal) {
        maxVal = val
        highestEmotion = emo
      }
    }
    this.currentEmotion = highestEmotion

    // Calculate Valence (-1 to +1) & Arousal (0 to 1)
    const valence = ((this.confidence.joy + this.confidence.relaxed * 0.5) - (this.confidence.anger + this.confidence.melancholy * 0.8)) / 100
    const arousal = Math.min(1, Math.max(0, (wpm * 0.4 + avgMouseSpeed * 0.05 + this.confidence.anger * 0.6 + this.confidence.joy * 0.4) / 100))

    this.biometrics = {
      wpm,
      cps: Number(cps),
      jitter,
      backspaceRatio: parseFloat((backspaceRatio * 100).toFixed(1)),
      mouseSpeed: avgMouseSpeed,
      mouseJitter,
      valence: parseFloat(valence.toFixed(2)),
      arousal: parseFloat(arousal.toFixed(2))
    }

    return {
      emotion: this.currentEmotion,
      confidence: this.confidence,
      biometrics: this.biometrics,
      insight: this.generateInsight(this.currentEmotion, this.biometrics)
    }
  }

  // Generate real-time empathetic AI cognitive commentary
  generateInsight(emotion, biometrics) {
    const { wpm, mouseSpeed, valence, arousal } = biometrics

    switch (emotion) {
      case 'joy':
        return {
          title: '✨ NĂNG LƯỢNG TƯƠI SÁNG // JOY & EUPHORIA',
          description: `Nhịp gõ thanh thoát (${wpm} WPM) cùng trường từ vựng rạng rỡ. Dữ liệu sóng não mang tần số thăng hoa, kích hoạt xung ánh sáng đa sắc trên Lõi MAINFRAME.`,
          themeMood: 'calm',
          color: '#00f0ff',
          glow: 'rgba(0, 240, 255, 0.4)'
        }
      case 'melancholy':
        return {
          title: '💧 NỐT TRẦM KÝ ỨC // MELANCHOLY & CONTEMPLATION',
          description: `Nhịp điệu chậm rãi và độ ngập ngừng cao. Các từ ngữ mang âm hưởng hoài niệm và tĩnh lặng, đưa hệ thống vào trạng thái chiêm nghiệm sâu thẳm.`,
          themeMood: 'calm',
          color: '#60a5fa',
          glow: 'rgba(96, 165, 250, 0.4)'
        }
      case 'anger':
        return {
          title: '🔥 XUNG ĐỘNG CỰC HẠN // AGITATION & ANGER',
          description: `Tốc độ gõ và gia tốc chuột (${mouseSpeed} px/s) biến thiên mãnh liệt. Phát hiện dấu hiệu kích động và xung lực cao — Tường lửa Aegis tự động cảnh báo nhiệt độ lõi tăng!`,
          themeMood: 'breach',
          color: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.5)'
        }
      case 'relaxed':
      default:
        return {
          title: '🌿 TRẠNG THÁI THƯ THÁI // TRANQUIL & ZEN FLOW',
          description: `Nhịp gõ điều hòa ổn định, độ trôi chuột mượt mà. Ý thức đang ở trạng thái hòa hợp hoàn hảo với ma trận thần kinh của Dr. Lien.`,
          themeMood: 'friction',
          color: '#10b981',
          glow: 'rgba(16, 185, 129, 0.4)'
        }
    }
  }

  // Reset engine states
  reset() {
    this.keyPressTimestamps = []
    this.keyLatencies = []
    this.backspaceCount = 0
    this.totalKeysPressed = 0
    this.mouseEvents = []
    this.mouseVelocities = []
  }
}

// Global Singleton Instance for app-wide telemetry
export const globalMoodAI = new RealtimeMoodAnalyzer()
