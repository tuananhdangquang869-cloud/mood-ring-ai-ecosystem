import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  PhoneCall, 
  Wind, 
  ShieldCheck, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Phone, 
  ExternalLink, 
  RotateCcw, 
  Play, 
  Pause, 
  Flame, 
  Smile, 
  MessageCircle, 
  Info,
  Layers
} from 'lucide-react'
import { 
  EMERGENCY_HOTLINES, 
  COMFORT_AFFIRMATIONS, 
  getMentalHealthSettings 
} from '../utils/mentalHealthEngine.js'
import { 
  playHealingChimeSound, 
  playBreathingChime, 
  playKeyClick 
} from '../utils/audioSynth.js'

export default function MentalHealthAlertModal({
  isOpen = false,
  onClose = () => {},
  alertData = null,
  soundEnabled = true,
  onOpenZenMode = () => {},
  onOpenBurnMode = () => {},
  onOpenWhisper = () => {}
}) {
  const [activeTab, setActiveTab] = useState('comfort') // 'comfort' | 'hotlines' | 'breathing' | 'actions'
  const [copiedId, setCopiedId] = useState(null)
  const [hugCount, setHugCount] = useState(0)
  const [showHugEffect, setShowHugEffect] = useState(false)
  const [randomQuoteIndex, setRandomQuoteIndex] = useState(0)

  // 4-7-8 Breathing Circle State
  const [isBreathingActive, setIsBreathingActive] = useState(false)
  const [breathPhase, setBreathPhase] = useState('idle') // 'inhale' | 'hold' | 'exhale'
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4)
  const [cyclesCompleted, setCyclesCompleted] = useState(0)
  const breathTimerRef = useRef(null)

  // 5-4-3-2-1 Grounding Checklist State
  const [groundingChecks, setGroundingChecks] = useState({
    s5: false, // 5 things you can see
    s4: false, // 4 things you can touch
    s3: false, // 3 things you can hear
    s2: false, // 2 things you can smell
    s1: false  // 1 thing you are grateful for
  })

  // Play healing chime on modal open
  useEffect(() => {
    if (isOpen) {
      if (soundEnabled) playHealingChimeSound()
      if (alertData?.initialTab) {
        setActiveTab(alertData.initialTab)
      } else if (alertData?.severity === 'critical') {
        setActiveTab('hotlines')
      } else {
        setActiveTab('comfort')
      }
      setRandomQuoteIndex(Math.floor(Math.random() * COMFORT_AFFIRMATIONS.length))
    } else {
      stopBreathingCycle()
    }
  }, [isOpen, alertData])

  // Breathing Loop Implementation
  useEffect(() => {
    if (!isBreathingActive) return

    let currentPhase = 'inhale'
    let timeLeft = 4
    setBreathPhase('inhale')
    setBreathSecondsLeft(4)
    if (soundEnabled) playBreathingChime('inhale')

    breathTimerRef.current = setInterval(() => {
      timeLeft--
      if (timeLeft <= 0) {
        if (currentPhase === 'inhale') {
          currentPhase = 'hold'
          timeLeft = 7
          setBreathPhase('hold')
          setBreathSecondsLeft(7)
          if (soundEnabled) playBreathingChime('hold')
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale'
          timeLeft = 8
          setBreathPhase('exhale')
          setBreathSecondsLeft(8)
          if (soundEnabled) playBreathingChime('exhale')
        } else {
          // exhale finished -> one cycle done
          setCyclesCompleted(c => c + 1)
          currentPhase = 'inhale'
          timeLeft = 4
          setBreathPhase('inhale')
          setBreathSecondsLeft(4)
          if (soundEnabled) playBreathingChime('inhale')
        }
      } else {
        setBreathSecondsLeft(timeLeft)
      }
    }, 1000)

    return () => clearInterval(breathTimerRef.current)
  }, [isBreathingActive, soundEnabled])

  const stopBreathingCycle = () => {
    setIsBreathingActive(false)
    setBreathPhase('idle')
    setBreathSecondsLeft(4)
    if (breathTimerRef.current) clearInterval(breathTimerRef.current)
  }

  const handleCopyHotline = (hotline) => {
    try {
      navigator.clipboard.writeText(hotline.number)
      setCopiedId(hotline.id)
      if (soundEnabled) playKeyClick()
      setTimeout(() => setCopiedId(null), 2500)
    } catch {
      // fallback
    }
  }

  const handleSendHug = () => {
    setHugCount(c => c + 1)
    setShowHugEffect(true)
    if (soundEnabled) playHealingChimeSound()
    setTimeout(() => setShowHugEffect(false), 2000)
  }

  if (!isOpen) return null

  const isCritical = alertData?.severity === 'critical'
  const currentQuote = COMFORT_AFFIRMATIONS[randomQuoteIndex] || COMFORT_AFFIRMATIONS[0]

  return (
    <div className="mental-health-modal-backdrop" onClick={onClose}>
      <motion.div 
        className={`mental-health-modal-card ${isCritical ? 'critical-glow' : 'soothing-glow'}`}
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Hug Hearts Animation */}
        <AnimatePresence>
          {showHugEffect && (
            <motion.div 
              className="floating-hug-overlay"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
            >
              <div className="hug-particles">
                {['💖', '🕊️', '✨', '🫂', '🌸', '💖'].map((emoji, i) => (
                  <span key={i} className={`hug-emoji hug-emoji-${i}`}>{emoji}</span>
                ))}
              </div>
              <p className="hug-text">Đang trao bạn một cái ôm ấm áp và tràn đầy sự cảm thông...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Top Header */}
        <div className="mental-modal-header">
          <div className="flex items-center gap-3">
            <div className="mental-icon-pulse">
              <Heart size={22} className="heart-icon text-rose-400 fill-rose-400" />
            </div>
            <div>
              <span className="mental-tag">
                {isCritical ? '// CAN THIỆP KHẨN CẤP & BẢO VỆ TÂM THỨC //' : '// GIAO THỨC CHĂM SÓC & SƠ CỨU TÂM LÝ //'}
              </span>
              <h3 className="mental-title">
                {isCritical ? 'BẠN ĐANG CẦN ĐƯỢC GIÚP ĐỠ & LẮNG NGHE' : 'KHOẢNG LẶNG BÌNH YÊN DÀNH CHO BẠN'}
              </h3>
            </div>
          </div>

          <button 
            className="mental-close-btn"
            onClick={() => {
              if (soundEnabled) playKeyClick()
              onClose()
            }}
            title="Đóng bảng hỗ trợ"
          >
            <X size={18} />
          </button>
        </div>

        {/* Empathetic AI Notice Bar */}
        <div className="empathetic-notice-bar">
          <span className="notice-icon">🕊️</span>
          <p className="notice-content">
            {alertData?.message || 
              (isCritical 
                ? 'AI ghi nhận bạn đang trải qua những cảm xúc vô cùng đau đớn và bế tắc. Hãy dừng lại một nhịp, bạn không cần phải đối mặt với điều này một mình. Luôn có sự trợ giúp sẵn sàng 24/7.'
                : 'AI nhận thấy những dấu hiệu mỏi mệt và áp lực dồn nén trong câu chữ của bạn. Hãy dành một chút thời gian để hít thở và thả lỏng nhé.')}
          </p>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="mental-nav-tabs">
          <button
            type="button"
            className={`mental-tab-btn ${activeTab === 'comfort' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('comfort')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Smile size={16} className="text-amber-400" />
            <span>Lời Nhắn Dịu Dàng</span>
          </button>

          <button
            type="button"
            className={`mental-tab-btn ${activeTab === 'hotlines' ? 'active' : ''} ${isCritical ? 'urgent-tab' : ''}`}
            onClick={() => {
              setActiveTab('hotlines')
              if (soundEnabled) playKeyClick()
            }}
          >
            <PhoneCall size={16} className="text-emerald-400" />
            <span>Đường Dây Nóng 24/7 📞</span>
          </button>

          <button
            type="button"
            className={`mental-tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('breathing')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Wind size={16} className="text-cyan-400" />
            <span>Hít Thở 4-7-8 & Tiếp Đất</span>
          </button>

          <button
            type="button"
            className={`mental-tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('actions')
              if (soundEnabled) playKeyClick()
            }}
          >
            <ShieldCheck size={16} className="text-purple-400" />
            <span>Lối Tắt Chữa Lành</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="mental-modal-content" data-lenis-prevent>
          
          {/* TAB 1: COMFORT & AFFIRMATIONS */}
          {activeTab === 'comfort' && (
            <div className="tab-pane-comfort">
              {/* Soul Anchor Quote Card */}
              <div className="affirmation-spotlight-card">
                <div className="quote-badge">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>THÔNG ĐIỆP CHỮA LÀNH DÀNH RIÊNG CHO BẠN</span>
                </div>
                <blockquote className="affirmation-quote">
                  "{currentQuote.quote}"
                </blockquote>
                <div className="quote-footer">
                  <span className="quote-tag">{currentQuote.tag}</span>
                  <span className="quote-author">— {currentQuote.author}</span>
                </div>

                <div className="quote-actions">
                  <button
                    type="button"
                    className="quote-refresh-btn"
                    onClick={() => {
                      setRandomQuoteIndex(i => (i + 1) % COMFORT_AFFIRMATIONS.length)
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Đổi thông điệp khác</span>
                  </button>

                  <button
                    type="button"
                    className="quote-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(currentQuote.quote)
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <Copy size={14} />
                    <span>Lưu lại câu này</span>
                  </button>
                </div>
              </div>

              {/* Gentle AI Hug Box */}
              <div className="gentle-hug-card">
                <div className="hug-left">
                  <div className="hug-avatar-circle">🫂</div>
                  <div>
                    <h5>Cần một cái ôm ấm áp lúc này?</h5>
                    <p>Hãy bấm nút bên cạnh để nhận năng lượng thấu cảm và xoa dịu từ hệ sinh thái.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="send-hug-action-btn"
                  onClick={handleSendHug}
                >
                  <span>Nhận Cái Ôm 💖</span>
                  {hugCount > 0 && <span className="hug-badge">+{hugCount}</span>}
                </button>
              </div>

              {/* 3 Gentle Truths */}
              <div className="gentle-truths-grid">
                <div className="truth-item">
                  <span className="truth-icon">🌿</span>
                  <h6>Không Có Cơn Bão Nào Kéo Dài Mãi</h6>
                  <p>Mọi cảm xúc mãnh liệt đều sẽ đạt đỉnh và dịu lại. Hãy cho bản thân thời gian để sóng gió qua đi.</p>
                </div>
                <div className="truth-item">
                  <span className="truth-icon">🛡️</span>
                  <h6>Bạn Luôn Đáng Được Lắng Nghe</h6>
                  <p>Nỗi đau của bạn là có thật và hoàn toàn có giá trị. Đừng ngần ngại chia sẻ với những người có thể giúp đỡ bạn.</p>
                </div>
                <div className="truth-item">
                  <span className="truth-icon">✨</span>
                  <h6>Một Bước Nhỏ Là Đủ</h6>
                  <p>Bạn không cần phải giải quyết mọi thứ hôm nay. Chỉ cần uống một ngụm nước ấm và thở nhẹ nhàng.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMERGENCY HOTLINES 24/7 */}
          {activeTab === 'hotlines' && (
            <div className="tab-pane-hotlines">
              <div className="hotlines-banner">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                  <ShieldCheck size={18} />
                  <span>DANH BẠ HỖ TRỢ TÂM LÝ MIỄN PHÍ & BẢO MẬT TUYỆT ĐỐI</span>
                </div>
                <p className="text-xs text-slate-300">
                  Các chuyên gia tâm lý và nhân viên cứu trợ luôn sẵn sàng lắng nghe bạn mà không phán xét. Bạn có thể gọi trực tiếp hoặc sao chép số điện thoại dưới đây:
                </p>
              </div>

              <div className="hotlines-grid">
                {EMERGENCY_HOTLINES.map(hotline => (
                  <div key={hotline.id} className="hotline-card">
                    <div className="hotline-top">
                      <div className="hotline-country">{hotline.country}</div>
                      <span 
                        className="hotline-badge"
                        style={{ color: hotline.badgeColor, borderColor: hotline.badgeColor + '40', background: hotline.badgeColor + '15' }}
                      >
                        {hotline.badge}
                      </span>
                    </div>

                    <h4 className="hotline-name">{hotline.name}</h4>
                    <p className="hotline-subtitle">{hotline.subtitle}</p>

                    <div className="hotline-details">
                      <div className="detail-row">
                        <span className="label">Số điện thoại:</span>
                        <span className="val-number">{hotline.displayNumber}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Thời gian:</span>
                        <span className="val">{hotline.hours}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Chi phí:</span>
                        <span className="val-free">{hotline.fee}</span>
                      </div>
                    </div>

                    <p className="hotline-desc">{hotline.description}</p>

                    <div className="hotline-actions">
                      <a
                        href={hotline.telLink}
                        className="hotline-call-btn"
                        target={hotline.telLink.startsWith('http') ? '_blank' : '_self'}
                        rel="noreferrer"
                        onClick={() => soundEnabled && playKeyClick()}
                      >
                        <Phone size={14} />
                        <span>{hotline.telLink.startsWith('http') ? 'Truy Cập Trang Web' : 'Gọi Ngay'}</span>
                      </a>

                      <button
                        type="button"
                        className="hotline-copy-btn"
                        onClick={() => handleCopyHotline(hotline)}
                        title="Sao chép số điện thoại"
                      >
                        {copiedId === hotline.id ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400">Đã Sao Chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Sao Chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 4-7-8 BREATHING & GROUNDING */}
          {activeTab === 'breathing' && (
            <div className="tab-pane-breathing">
              {/* 4-7-8 Interactive Breathing Instrument */}
              <div className="breathing-instrument-card">
                <div className="instrument-header">
                  <div>
                    <h5>PHƯƠNG PHÁP HÍT THỞ NHỊP ĐIỆU 4-7-8 (DR. ANDREW WEIL)</h5>
                    <p>Kích hoạt hệ thần kinh phó giao cảm (Parasympathetic), hạ nhịp tim và làm dịu cơn hoảng loạn tức thì.</p>
                  </div>
                  <div className="cycle-badge">
                    <span>ĐÃ THỰC HIỆN:</span>
                    <strong>{cyclesCompleted} Chu Kỳ</strong>
                  </div>
                </div>

                <div className="breathing-circle-stage">
                  <div className={`breath-circle-outer ${isBreathingActive ? breathPhase : 'idle'}`}>
                    <div className="breath-circle-core">
                      <span className="phase-text">
                        {!isBreathingActive ? 'SẴN SÀNG' : breathPhase === 'inhale' ? 'HÍT VÀO SÂU' : breathPhase === 'hold' ? 'GIỮ HƠI LẠI' : 'THỞ RA NHẸ NHÀNG'}
                      </span>
                      <span className="phase-counter">
                        {!isBreathingActive ? '4-7-8' : `${breathSecondsLeft}s`}
                      </span>
                      <span className="phase-sub">
                        {!isBreathingActive ? 'Bấm Bắt Đầu Bên Dưới' : breathPhase === 'inhale' ? '(4 Giây bằng mũi)' : breathPhase === 'hold' ? '(7 Giây tĩnh lặng)' : '(8 Giây bằng miệng)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="breathing-controls">
                  {!isBreathingActive ? (
                    <button
                      type="button"
                      className="breath-btn start"
                      onClick={() => {
                        setIsBreathingActive(true)
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <Play size={16} />
                      <span>BẮT ĐẦU BÀI TẬP THỞ</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="breath-btn pause"
                      onClick={() => {
                        stopBreathingCycle()
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <Pause size={16} />
                      <span>TẠM DỪNG</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="breath-btn reset"
                    onClick={() => {
                      stopBreathingCycle()
                      setCyclesCompleted(0)
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>Làm mới</span>
                  </button>
                </div>
              </div>

              {/* 5-4-3-2-1 Grounding Checklist */}
              <div className="grounding-checklist-card">
                <div className="grounding-header">
                  <h5>🌱 KỸ THUẬT TIẾP ĐẤT 5-4-3-2-1 (GROUNDING TECHNIQUE)</h5>
                  <p>Khi tâm trí bị cuốn vào lo âu hoặc tuyệt vọng, hãy nhìn xung quanh và đánh dấu 5 giác quan để neo giữ mình lại với thực tại:</p>
                </div>

                <div className="grounding-items-list">
                  {[
                    { id: 's5', num: '5', label: '5 Vật Thể Bạn Có Thể Nhìn Thấy', desc: '(ví dụ: chiếc bàn, ánh đèn, cái cây, ly nước, bầu trời...)' },
                    { id: 's4', num: '4', label: '4 Bề Mặt Bạn Có Thể Chạm Vào', desc: '(ví dụ: mặt vải áo, bàn phím, bề mặt bàn mát lạnh, ngón tay...)' },
                    { id: 's3', num: '3', label: '3 Âm Thanh Bạn Nghe Thấy Lúc Này', desc: '(ví dụ: tiếng quạt gió, tiếng xe cộ xa xa, tiếng thở của chính bạn...)' },
                    { id: 's2', num: '2', label: '2 Mùi Hương Quanh Bạn', desc: '(ví dụ: mùi cà phê, hương mưa, mùi xà phòng hoặc không khí...)' },
                    { id: 's1', num: '1', label: '1 Điều Tốt Đẹp Bạn Vừa Làm Được', desc: '(ví dụ: bạn đã dũng cảm dừng lại và chăm sóc chính mình lúc này)' }
                  ].map(step => (
                    <label 
                      key={step.id} 
                      className={`grounding-step-item ${groundingChecks[step.id] ? 'checked' : ''}`}
                      onClick={() => {
                        setGroundingChecks(prev => ({ ...prev, [step.id]: !prev[step.id] }))
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <div className="step-num-box">{step.num}</div>
                      <div className="step-content">
                        <strong>{step.label}</strong>
                        <span>{step.desc}</span>
                      </div>
                      <div className="step-checkbox">
                        {groundingChecks[step.id] ? <Check size={16} className="text-emerald-400" /> : <div className="empty-box" />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK HEALING ACTIONS */}
          {activeTab === 'actions' && (
            <div className="tab-pane-actions">
              <div className="actions-header">
                <h5>LỰA CHỌN KHÔNG GIAN TỰ CHĂM SÓC</h5>
                <p>Chuyển nhanh đến các chế độ trị liệu và thanh lọc tâm trí được tích hợp sẵn trong Mood Ring Story:</p>
              </div>

              <div className="healing-action-cards-grid">
                {/* Action 1: Zen Mode */}
                <div className="healing-action-card">
                  <div className="card-icon-box text-emerald-400">🧘</div>
                  <h4>CHẾ ĐỘ TĨNH TÂM (ZEN MODE)</h4>
                  <p>Không gian viết lách phi phân tâm với âm thanh mưa rơi, suối chảy và sóng Alpha êm dịu.</p>
                  <button
                    type="button"
                    className="action-trigger-btn emerald"
                    onClick={() => {
                      onClose()
                      onOpenZenMode()
                    }}
                  >
                    <span>Vào Zen Mode Ngay</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Action 2: Burn Mode */}
                <div className="healing-action-card">
                  <div className="card-icon-box text-rose-400">🔥</div>
                  <h4>THANH TẨY MUỘN PHIỀN (BURN MODE)</h4>
                  <p>Viết ra tất cả những bực bội, u uất sâu kín nhất và chứng kiến ngọn lửa số hóa hóa tro toàn bộ.</p>
                  <button
                    type="button"
                    className="action-trigger-btn rose"
                    onClick={() => {
                      onClose()
                      onOpenBurnMode()
                    }}
                  >
                    <span>Vào Burn Mode Ngay</span>
                    <span>➔</span>
                  </button>
                </div>

                {/* Action 3: Whisper Corner */}
                <div className="healing-action-card">
                  <div className="card-icon-box text-cyan-400">🕊️</div>
                  <h4>GÓC ẨN DANH (WHISPER CORNER)</h4>
                  <p>Chia sẻ lời thì thầm ẩn danh an toàn tuyệt đối 100% không bình luận tiêu cực, chỉ nhận về những cái ôm thấu cảm.</p>
                  <button
                    type="button"
                    className="action-trigger-btn cyan"
                    onClick={() => {
                      onClose()
                      onOpenWhisper()
                    }}
                  >
                    <span>Ghé Thăm Whisper Corner</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="mental-modal-footer">
          <div className="footer-left">
            <span className="shortcut-hint">Phím tắt nhanh: <strong>Alt + H</strong> để mở lại bất cứ lúc nào</span>
          </div>

          <div className="footer-right">
            <button
              type="button"
              className="mental-confirm-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                onClose()
              }}
            >
              <Check size={16} />
              <span>Tôi Đã Cảm Thấy Ổn Hơn</span>
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
