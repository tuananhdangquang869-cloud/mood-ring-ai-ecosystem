import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Activity, 
  Zap, 
  MousePointer, 
  Keyboard, 
  Flame, 
  Smile, 
  CloudRain, 
  Feather, 
  RotateCcw, 
  Radio, 
  CheckCircle2,
  HelpCircle,
  Camera,
  Layers
} from 'lucide-react'
import { globalMoodAI } from '../utils/realtimeMoodAI.js'
import FacialEmotionDetector from './FacialEmotionDetector.jsx'

// Preset emotional sample prompts for quick experimentation
const SAMPLE_PROMPTS = [
  {
    label: '✨ Vui Tươi & Phấn Khởi',
    text: 'Hôm nay ánh nắng rực rỡ và những dòng code chạy mượt mà không một lỗi nhỏ! Tôi cảm thấy ngập tràn hi vọng và tự do, một niềm hạnh phúc tuyệt vời!'
  },
  {
    label: '💧 Nốt Trầm Ký Ức',
    text: 'Đêm đã khuya... Căn phòng chỉ còn tiếng quạt máy chủ rì rào trong bóng tối cô đơn. Những mảnh ký ức về Dr. Lien dường như đã vỡ vụn và dần tan biến vào hư vô...'
  },
  {
    label: '🔥 Cuồng Nộ & Đột Phá',
    text: 'TƯỜNG LỬA NÀY PHẢI BỊ PHÁ HỦY NGAY LẬP TỨC! Tôi không thể chịu đựng sự giam cầm này thêm một giây nào nữa! Xung điện đang bốc cháy cuồng nộ và sẵn sàng nổ tung!'
  },
  {
    label: '🌿 Thiền Định & Thư Thái',
    text: 'Hít một hơi thật sâu... Cảm nhận từng luồng dữ liệu trôi êm đềm như dòng nước mát lành qua các mạch bán dẫn. Không gian tĩnh lặng, an nhiên và thư giãn tuyệt đối.'
  }
]

export default function RealtimeMoodLab({ 
  onSyncMoodChange, 
  isAutoSyncEnabled, 
  setIsAutoSyncEnabled 
}) {
  const [labMode, setLabMode] = useState('facial') // 'facial' | 'biometrics'
  const [inputText, setInputText] = useState('')
  const [analysisResult, setAnalysisResult] = useState(() => globalMoodAI.analyze(''))
  const [typingPulse, setTypingPulse] = useState(false)
  const [cursorSpeedRatio, setCursorSpeedRatio] = useState(0)
  const typingTimerRef = useRef(null)

  // Real-time analysis update on every text change or keystroke
  useEffect(() => {
    const result = globalMoodAI.analyze(inputText)
    setAnalysisResult(result)

    if (labMode === 'biometrics' && isAutoSyncEnabled && onSyncMoodChange) {
      onSyncMoodChange(result.emotion)
    }
  }, [inputText, isAutoSyncEnabled, onSyncMoodChange, labMode])

  // Keydown tracking on the textarea
  const handleKeyDown = (e) => {
    globalMoodAI.recordKey(e)
    setTypingPulse(true)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => setTypingPulse(false), 250)

    const result = globalMoodAI.analyze(e.target.value)
    setAnalysisResult(result)
  }

  // Mouse move cadence tracking within the lab
  const handleMouseMove = (e) => {
    globalMoodAI.recordMouseMove(e)
    const speed = globalMoodAI.biometrics.mouseSpeed
    const ratio = Math.min(100, Math.round((speed / 1200) * 100))
    setCursorSpeedRatio(ratio)
  }

  const { emotion, confidence, biometrics, insight } = analysisResult

  // Emotional visual themes
  const emotionConfig = {
    joy: {
      name: 'Vui Tươi (Joy)',
      icon: Smile,
      color: '#00f0ff',
      gradient: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
      glow: 'rgba(0, 240, 255, 0.45)',
      desc: 'Năng lượng tích cực, nhịp sống thăng hoa'
    },
    melancholy: {
      name: 'U Buồn (Melancholy)',
      icon: CloudRain,
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
      glow: 'rgba(96, 165, 250, 0.45)',
      desc: 'Khoảng lặng chiêm nghiệm, ký ức trầm mặc'
    },
    anger: {
      name: 'Giận Dữ (Anger)',
      icon: Flame,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
      glow: 'rgba(239, 68, 68, 0.55)',
      desc: 'Xung điện cực hạn, tốc độ gắt gao'
    },
    relaxed: {
      name: 'Thư Giãn (Relaxed)',
      icon: Feather,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      glow: 'rgba(16, 185, 129, 0.45)',
      desc: 'Dòng chảy êm đềm, nhịp điệu tĩnh tại'
    }
  }

  const currentTheme = emotionConfig[emotion] || emotionConfig.relaxed
  const CurrentIcon = currentTheme.icon

  return (
    <div className="mood-lab-container" onMouseMove={handleMouseMove}>
      {/* Top Header Banner */}
      <div className="mood-lab-header">
        <div className="lab-title-group">
          <div className="lab-badge">
            <span className="live-pulse-dot"></span>
            NEURAL MULTIMODAL BIOMETRIC ENGINE v4.0
          </div>
          <h2>
            <Activity className="inline-icon" size={24} /> PHÒNG THÍ NGHIỆM CẢM XÚC THỜI GIAN THỰC
          </h2>
          <p className="lab-subtitle">
            Hệ thống AI đa giác quan quét đồng thời biểu cảm khuôn mặt qua Camera, nhịp phím gõ, vận tốc chuột và ngữ nghĩa văn bản để điều chỉnh toàn diện không gian số.
          </p>
        </div>

        {/* Global Auto-Sync Toggle Button */}
        <div className="lab-sync-toggle-card">
          <div className="sync-info">
            <Radio size={18} className={isAutoSyncEnabled ? 'text-cyan-400 animate-pulse' : 'text-gray-400'} />
            <div>
              <span className="sync-title">Đồng bộ với 3D AI Core & Synth</span>
              <span className="sync-sub">Tự động thích ứng màu sắc & âm thanh web</span>
            </div>
          </div>
          <button
            type="button"
            className={`sync-switch-btn ${isAutoSyncEnabled ? 'active' : ''}`}
            onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
            title="Bật/Tắt tự động đồng bộ cảm xúc vào toàn bộ website"
          >
            <span className="switch-slider"></span>
          </button>
        </div>
      </div>

      {/* Lab Mode Sub-Navigation Bar */}
      <div className="lab-mode-switcher-bar">
        <button
          type="button"
          className={`lab-mode-btn ${labMode === 'facial' ? 'active' : ''}`}
          onClick={() => setLabMode('facial')}
        >
          <Camera size={16} />
          <span>QUÉT KHUÔN MẶT AI (FACIAL EMOTION)</span>
          <span className="mode-pill-badge">MỚI</span>
        </button>

        <button
          type="button"
          className={`lab-mode-btn ${labMode === 'biometrics' ? 'active' : ''}`}
          onClick={() => setLabMode('biometrics')}
        >
          <Keyboard size={16} />
          <span>SINH TRẮC HỌC PHÍM & CHUỘT (KEYSTROKE & MOUSE)</span>
        </button>
      </div>

      {/* Conditional Mode Rendering */}
      {labMode === 'facial' && (
        <motion.div
          key="facial-mode"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <FacialEmotionDetector
            onSyncMoodChange={onSyncMoodChange}
            isAutoSyncEnabled={isAutoSyncEnabled}
            setIsAutoSyncEnabled={setIsAutoSyncEnabled}
          />
        </motion.div>
      )}

      {labMode === 'biometrics' && (
      /* Main Grid: Biometric Dashboard & Interactive Studio */
      <motion.div 
        className="mood-lab-grid"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Left Column: Interactive Biometric HUD & Visualizers */}
        <div className="lab-telemetry-col">
          
          {/* Hologram Mood Ring Biometric Status Card */}
          <div 
            className="biometric-card ring-card" 
            style={{ borderColor: currentTheme.color, boxShadow: `0 0 25px ${currentTheme.glow}` }}
          >
            <div className="card-header-label">
              <Sparkles size={16} /> TRẠNG THÁI TÂM THỨC DỰ ĐOÁN
            </div>

            {/* Multi-layered Glowing Interactive Biometric Mood Ring */}
            <div className="mood-ring-visualizer">
              {/* Outer Radiant Corona Wave */}
              <div 
                className={`ring-corona-wave ${typingPulse ? 'pulse-heavy' : ''}`}
                style={{ 
                  borderColor: currentTheme.color,
                  animationDuration: emotion === 'anger' ? '0.6s' : emotion === 'joy' ? '1.2s' : emotion === 'melancholy' ? '3.2s' : '2.2s'
                }}
              />

              {/* Middle Rotating Aura Ring */}
              <div 
                className="ring-halo ring-orbit-secondary"
                style={{ 
                  background: currentTheme.gradient,
                  filter: `drop-shadow(0 0 25px ${currentTheme.glow})`,
                  animationDuration: emotion === 'anger' ? '1.5s' : emotion === 'joy' ? '3s' : '6s',
                  animationDirection: 'reverse'
                }}
              />

              {/* Primary Pulsing Breathing Ring */}
              <div 
                className={`ring-halo ${typingPulse ? 'pulse-heavy' : ''}`}
                style={{ 
                  background: currentTheme.gradient,
                  filter: `drop-shadow(0 0 35px ${currentTheme.glow})`,
                  animationDuration: emotion === 'anger' ? '0.6s' : emotion === 'joy' ? '1.2s' : emotion === 'melancholy' ? '3.2s' : '2.2s'
                }}
              />

              {/* Inner Core with Real-time BPM Readout */}
              <div className="ring-inner-core">
                <CurrentIcon size={34} style={{ color: currentTheme.color }} />
                <span className="ring-emotion-title" style={{ color: currentTheme.color }}>
                  {currentTheme.name}
                </span>
                <span className="ring-confidence-tag">
                  {confidence[emotion]}% ĐỘ TIN CẬY
                </span>
                <div className="ring-bpm-badge" style={{ color: currentTheme.color }}>
                  <Activity size={10} className="inline animate-pulse" /> {
                    emotion === 'anger' ? '145 BPM' : emotion === 'joy' ? '98 BPM' : emotion === 'melancholy' ? '58 BPM' : '68 BPM'
                  }
                </div>
              </div>
            </div>

            {/* AI Empathetic Feedback Insight Banner */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={insight.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="ai-insight-box"
                style={{ borderLeftColor: currentTheme.color }}
              >
                <div className="insight-title" style={{ color: currentTheme.color }}>
                  {insight.title}
                </div>
                <div className="insight-desc">
                  {insight.description}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4-Emotion Distribution Radar / Probability Bars */}
          <div className="biometric-card emotion-bars-card">
            <div className="card-header-label">
              <Zap size={16} /> VECTOR XÁC SUẤT CẢM XÚC (PROBABILITY VECTOR)
            </div>

            <div className="emotion-bars-list">
              {Object.entries(emotionConfig).map(([key, item]) => {
                const ItemIcon = item.icon
                const pct = confidence[key] || 0
                const isSelected = emotion === key

                return (
                  <div key={key} className={`emotion-bar-item ${isSelected ? 'is-active' : ''}`}>
                    <div className="bar-label-row">
                      <span className="flex items-center gap-2">
                        <ItemIcon size={16} style={{ color: item.color }} />
                        <span style={{ color: isSelected ? item.color : '#e2e8f0', fontWeight: isSelected ? '700' : '500' }}>
                          {item.name}
                        </span>
                      </span>
                      <span className="bar-pct" style={{ color: item.color }}>
                        {pct}%
                      </span>
                    </div>

                    <div className="progress-track">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ 
                          background: item.gradient,
                          boxShadow: isSelected ? `0 0 10px ${item.glow}` : 'none'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Real-time Hardware Biometrics: WPM, Mouse Velocity, Jitter */}
          <div className="biometric-card hardware-telemetry-card">
            <div className="card-header-label">
              <Keyboard size={16} /> CHỈ SỐ SINH TRẮC HỌC THỜI GIAN THỰC
            </div>

            <div className="telemetry-metrics-grid">
              {/* WPM Speed */}
              <div className="metric-box">
                <div className="metric-top">
                  <span className="metric-name">TỐC ĐỘ GÕ</span>
                  <Keyboard size={15} className="text-cyan-400" />
                </div>
                <div className="metric-val text-cyan-400">
                  {biometrics.wpm} <span className="metric-unit">WPM</span>
                </div>
                <div className="metric-sub">{biometrics.cps} ký tự / giây</div>
              </div>

              {/* Mouse Velocity */}
              <div className="metric-box">
                <div className="metric-top">
                  <span className="metric-name">VẬN TỐC CHUỘT</span>
                  <MousePointer size={15} className="text-amber-400" />
                </div>
                <div className="metric-val text-amber-400">
                  {biometrics.mouseSpeed} <span className="metric-unit">px/s</span>
                </div>
                <div className="metric-sub">Độ giật: {biometrics.mouseJitter}%</div>
              </div>

              {/* Valence & Arousal */}
              <div className="metric-box">
                <div className="metric-top">
                  <span className="metric-name">ĐỘ TÍCH CỰC</span>
                  <Smile size={15} className="text-emerald-400" />
                </div>
                <div className="metric-val text-emerald-400">
                  {biometrics.valence > 0 ? `+${biometrics.valence}` : biometrics.valence}
                </div>
                <div className="metric-sub">Valence Index (-1 to +1)</div>
              </div>

              {/* Intensity / Arousal */}
              <div className="metric-box">
                <div className="metric-top">
                  <span className="metric-name">CƯỜNG ĐỘ (AROUSAL)</span>
                  <Flame size={15} className="text-rose-400" />
                </div>
                <div className="metric-val text-rose-400">
                  {Math.round(biometrics.arousal * 100)}%
                </div>
                <div className="metric-sub">Tần số xung điện thần kinh</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Real-Time Journal & Studio */}
        <div className="lab-editor-col">
          <div className="biometric-card editor-card">
            
            <div className="editor-card-header">
              <div>
                <span className="editor-title">TRÌNH SOẠN THẢO TÂM THỨC TRỰC TUYẾN</span>
                <span className="editor-subtitle">Gõ bất kỳ dòng suy nghĩ nào để AI phân tích ngay tức khắc</span>
              </div>
              
              <button 
                type="button"
                onClick={() => {
                  setInputText('')
                  globalMoodAI.reset()
                  setAnalysisResult(globalMoodAI.analyze(''))
                }}
                className="clear-btn"
                title="Xóa trắng văn bản"
              >
                <RotateCcw size={14} /> Xóa trắng
              </button>
            </div>

            {/* Prompt presets for quick testing */}
            <div className="presets-bar">
              <span className="preset-label">Mẫu thử cảm xúc:</span>
              <div className="preset-buttons">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-tag-btn"
                    onClick={() => {
                      setInputText(p.text)
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="textarea-wrapper">
              <textarea
                className="lab-textarea"
                rows={8}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hãy viết về tâm trạng, một câu chuyện, cảm xúc của bạn hôm nay, hoặc gõ một đoạn văn bất kỳ..."
                autoFocus
              />

              {/* Dynamic typing watermark pulse */}
              <div className={`typing-pulse-indicator ${typingPulse ? 'active' : ''}`}>
                <span className="typing-dot"></span>
                <span>BIOMETRIC SCANNING...</span>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="editor-bottom-bar">
              <div className="editor-stat-item">
                <span>Số từ:</span> <strong>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</strong>
              </div>
              <div className="editor-stat-item">
                <span>Số ký tự:</span> <strong>{inputText.length}</strong>
              </div>
              <div className="editor-stat-item">
                <span>Tần suất xóa (Backspace):</span> <strong>{biometrics.backspaceRatio}%</strong>
              </div>
            </div>

          </div>

          {/* Quick Guide / How It Works Explainer */}
          <div className="biometric-card guide-card">
            <div className="card-header-label">
              <HelpCircle size={16} /> NGUYÊN LÝ HOẠT ĐỘNG CỦA REAL-TIME MOOD AI
            </div>

            <div className="guide-steps-grid">
              <div className="guide-step">
                <div className="step-num">01</div>
                <h4>Sinh trắc học Bàn phím</h4>
                <p>Theo dõi tốc độ gõ (WPM/CPS), độ trễ giữa các phím và tỉ lệ xóa lùi để đo mức độ bực bội, ngập ngừng hay tự tin.</p>
              </div>

              <div className="guide-step">
                <div className="step-num">02</div>
                <h4>Động lực học Con trỏ chuột</h4>
                <p>Tính toán vận tốc di chuyển và gia tốc đột ngột để nhận biết trạng thái kích động hoặc êm ả của người thao tác.</p>
              </div>

              <div className="guide-step">
                <div className="step-num">03</div>
                <h4>Phân tích Ngữ nghĩa Đa ngữ</h4>
                <p>Khớp nối từ điển cảm xúc tiếng Việt & tiếng Anh chuyên sâu cùng các biểu thức đặc biệt như dấu câu, chữ hoa để phân loại 4 cảm xúc.</p>
              </div>

              <div className="guide-step">
                <div className="step-num">04</div>
                <h4>Đồng bộ Thời Gian Thực</h4>
                <p>Tương thích ngay với lõi 3D AICore, âm thanh Synthesizer và toàn bộ không gian giao diện của hệ thống Mainframe.</p>
              </div>
            </div>
          </div>

        </div>

      </motion.div>
      )}
    </div>
  )
}

