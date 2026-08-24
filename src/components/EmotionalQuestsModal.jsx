import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Heart, 
  Compass, 
  Send, 
  X, 
  ChevronRight, 
  Lock, 
  Zap, 
  Layers, 
  Trophy, 
  Clock, 
  RotateCcw,
  Star,
  ShieldCheck,
  Eye,
  Crown
} from 'lucide-react'
import { 
  BADGES_DATA, 
  INITIAL_DAILY_QUESTS, 
  calculateResonanceLevel, 
  getQuestsState, 
  getUnlockedBadges, 
  getQuestExp, 
  getQuestStreak, 
  completeQuestEngine 
} from '../utils/emotionalQuestsEngine.js'
import { playKeyClick, playQuestCompleteSound, playBadgeUnlockSound } from '../utils/audioSynth.js'

export default function EmotionalQuestsModal({
  isOpen = true,
  isEmbedded = false,
  onClose = () => {},
  soundEnabled = true,
  onNavigateTab = () => {},
  onOpenZenMode = () => {},
  onOpenStoryTree = () => {}
}) {
  const [activeTab, setActiveTab] = useState('daily') // 'daily' | 'badges' | 'mastery'
  const [questsState, setQuestsState] = useState(() => getQuestsState())
  const [unlockedBadges, setUnlockedBadges] = useState(() => getUnlockedBadges())
  const [exp, setExp] = useState(() => getQuestExp())
  const [streak, setStreak] = useState(() => getQuestStreak())
  const [selectedBadge, setSelectedBadge] = useState(null)
  
  // Interactive inputs for daily quests
  const [skyText, setSkyText] = useState('')
  const [gratitude1, setGratitude1] = useState('')
  const [gratitude2, setGratitude2] = useState('')
  const [gratitude3, setGratitude3] = useState('')

  // Confetti Particle Engine
  const canvasRef = useRef(null)
  const confettiParticles = useRef([])
  const animFrameId = useRef(null)
  const [showCelebrationBanner, setShowCelebrationBanner] = useState(null)

  // Listen to global quest events
  useEffect(() => {
    const handleQuestCompletedEvent = (e) => {
      const { questId, newExp, newlyUnlockedBadge, questDef } = e.detail
      setQuestsState(getQuestsState())
      setUnlockedBadges(getUnlockedBadges())
      setExp(newExp)
      setStreak(getQuestStreak())

      triggerConfettiBurst()
      if (soundEnabled) {
        if (newlyUnlockedBadge) {
          playBadgeUnlockSound()
        } else {
          playQuestCompleteSound()
        }
      }

      setShowCelebrationBanner({
        title: 'NHIỆM VỤ HOÀN THÀNH!',
        subtitle: `Bạn đã nhận được +${questDef?.expReward || 50} EXP Tâm Thức!`,
        badge: newlyUnlockedBadge
      })
      setTimeout(() => setShowCelebrationBanner(null), 5000)
    }

    window.addEventListener('mr-quest-completed', handleQuestCompletedEvent)
    return () => window.removeEventListener('mr-quest-completed', handleQuestCompletedEvent)
  }, [soundEnabled])

  // Canvas Confetti Animation Loop
  const triggerConfettiBurst = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight

    const colors = ['#00f0ff', '#f59e0b', '#ec4899', '#10b981', '#a855f7', '#38bdf8', '#fbbf24']
    const particles = []

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 100,
        y: canvas.height / 3 + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.8) * 14 - 3,
        size: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        alpha: 1,
        life: 1
      })
    }
    confettiParticles.current = particles

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false

      particles.forEach((p) => {
        if (p.life > 0) {
          active = true
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.35 // gravity
          p.rotation += p.rotSpeed
          p.life -= 0.012
          p.alpha = Math.max(0, p.life)

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
          ctx.restore()
        }
      })

      if (active) {
        animFrameId.current = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    cancelAnimationFrame(animFrameId.current)
    animFrameId.current = requestAnimationFrame(render)
  }

  // Handle quest submission
  const handleSubmitDailyQuest = (questId) => {
    if (questId === 'quest-sky') {
      if (!skyText.trim()) return
      completeQuestEngine('quest-sky', skyText.trim())
      setSkyText('')
    } else if (questId === 'quest-gratitude') {
      if (!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()) return
      const triple = [gratitude1.trim(), gratitude2.trim(), gratitude3.trim()].filter(Boolean).join(' | ')
      completeQuestEngine('quest-gratitude', triple)
      setGratitude1('')
      setGratitude2('')
      setGratitude3('')
    }
  }

  const handleActionQuestClick = (quest) => {
    if (soundEnabled) playKeyClick()
    if (quest.actionType === 'open-zen') {
      onOpenZenMode()
      onClose()
    } else if (quest.actionType === 'open-capsule') {
      onNavigateTab('capsule')
      onClose()
    } else if (quest.actionType === 'open-burn') {
      onNavigateTab('burn')
      onClose()
    } else if (quest.actionType === 'open-story-tree') {
      onOpenStoryTree()
      onClose()
    } else if (quest.actionType === 'open-face-scanner') {
      onNavigateTab('moodlab')
      onClose()
    } else if (quest.actionType === 'open-journal') {
      onNavigateTab('journal')
      onClose()
    }
  }

  const resonanceLevel = calculateResonanceLevel(exp)

  const completedQuestsCount = Object.values(questsState).filter(q => q.completed).length
  const totalDailyQuests = INITIAL_DAILY_QUESTS.length

  if (!isOpen && !isEmbedded) return null

  const modalBody = (
    <>
      {/* Confetti Overlay Canvas */}
      <canvas ref={canvasRef} className="quests-confetti-canvas" />

      {/* Celebration Banner */}
      <AnimatePresence>
        {showCelebrationBanner && (
          <motion.div
            className="celebration-toast-banner"
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
          >
            <div className="celebration-badge-icon">
              {showCelebrationBanner.badge ? showCelebrationBanner.badge.icon : '🎉'}
            </div>
            <div>
              <h4 className="celebration-title">{showCelebrationBanner.title}</h4>
              <p className="celebration-sub">{showCelebrationBanner.subtitle}</p>
              {showCelebrationBanner.badge && (
                <div className="celebration-badge-name">
                  ✨ ĐÃ MỞ KHÓA HUY HIỆU: <strong>{showCelebrationBanner.badge.title}</strong>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="quests-header">
        <div className="flex items-center gap-3">
          <div className="quests-header-icon-box">
            <Trophy className="text-amber-400 animate-pulse" size={22} />
          </div>
          <div>
            <div className="quests-header-tag">// EMOTIONAL PROTOCOL //</div>
            <h2 className="quests-header-title">NHIỆM VỤ CẢM XÚC & BỘ SƯU TẬP HUY HIỆU</h2>
          </div>
        </div>

        {!isEmbedded && (
          <button
            type="button"
            className="quests-close-btn"
            onClick={() => {
              if (soundEnabled) playKeyClick()
              onClose()
            }}
            title="Đóng bảng nhiệm vụ (ESC)"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Top Progression HUD */}
      <div className="quests-top-progression-hud">
          <div className="progression-level-block">
            <div className="level-badge-chip">LV.{resonanceLevel.level}</div>
            <div>
              <div className="level-title">{resonanceLevel.title}</div>
              <div className="level-exp-meta">
                {resonanceLevel.currentExp} / {resonanceLevel.nextExp} EXP
              </div>
            </div>
          </div>

          <div className="progression-bar-container">
            <div className="progression-bar-track">
              <motion.div
                className="progression-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${resonanceLevel.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="progression-percent-label">{resonanceLevel.progressPercent}% ĐẾN CẤP TIẾP THEO</span>
          </div>

          <div className="progression-streak-chip" title="Chuỗi ngày thực hiện nhiệm vụ liên tục">
            <span className="streak-icon">🔥</span>
            <div className="flex flex-col">
              <span className="streak-count">{streak.count} Ngày</span>
              <span className="streak-label">STREAK</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="quests-nav-tabs">
          <button
            type="button"
            className={`quests-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('daily')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Zap size={16} />
            <span>Nhiệm Vụ Hôm Nay ({completedQuestsCount}/{totalDailyQuests})</span>
          </button>

          <button
            type="button"
            className={`quests-tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('badges')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Award size={16} />
            <span>Huy Hiệu Hologram ({unlockedBadges.length}/{BADGES_DATA.length})</span>
          </button>

          <button
            type="button"
            className={`quests-tab-btn ${activeTab === 'mastery' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('mastery')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Star size={16} />
            <span>Cấp Độ & Đặc Quyền</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="quests-content-scroll">
          {/* TAB 1: DAILY QUESTS */}
          {activeTab === 'daily' && (
            <motion.div
              key="tab-daily"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="quests-grid"
            >
              {INITIAL_DAILY_QUESTS.map((quest) => {
                const isCompleted = questsState[quest.id]?.completed
                const completedData = questsState[quest.id]

                return (
                  <div
                    key={quest.id}
                    className={`quest-card ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="quest-card-top">
                      <div className="flex items-center gap-2">
                        <span className="quest-card-icon">{quest.icon}</span>
                        <span className="quest-category-badge">{quest.category}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="quest-exp-reward">+{quest.expReward} EXP</span>
                        {isCompleted ? (
                          <span className="quest-status-pill completed">
                            <CheckCircle2 size={12} /> ĐÃ HOÀN THÀNH
                          </span>
                        ) : (
                          <span className="quest-status-pill in-progress">
                            <Clock size={12} /> ĐANG CHỜ
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="quest-title">{quest.title}</h3>
                    <p className="quest-subtitle">{quest.subtitle}</p>

                    {/* Quest Interaction Area */}
                    <div className="quest-interaction-box">
                      {isCompleted ? (
                        <div className="quest-completed-summary">
                          <span className="text-emerald-400 text-xs font-semibold">
                            ✓ Hoàn thành lúc: {new Date(completedData.completedAt).toLocaleTimeString('vi-VN')}
                          </span>
                          {completedData.response && (
                            <p className="quest-response-preview">
                              "{typeof completedData.response === 'string'
                                ? completedData.response
                                : typeof completedData.response === 'object' && completedData.response.ending
                                  ? `Đã đạt kết cục: ${completedData.response.ending.toUpperCase()}`
                                  : typeof completedData.response === 'object' && completedData.response.text
                                    ? completedData.response.text
                                    : JSON.stringify(completedData.response)}"
                            </p>
                          )}
                        </div>
                      ) : quest.type === 'input' && quest.id === 'quest-sky' ? (
                        <div className="quest-input-wrapper">
                          <textarea
                            className="quest-textarea"
                            rows={2}
                            placeholder={quest.placeholder}
                            value={skyText}
                            onChange={(e) => setSkyText(e.target.value)}
                          />
                          <button
                            type="button"
                            className="quest-submit-btn"
                            disabled={!skyText.trim()}
                            onClick={() => handleSubmitDailyQuest('quest-sky')}
                          >
                            <Send size={14} />
                            <span>Gửi & Nhận Thưởng</span>
                          </button>
                        </div>
                      ) : quest.type === 'input_triple' && quest.id === 'quest-gratitude' ? (
                        <div className="quest-input-wrapper">
                          <div className="flex flex-col gap-1.5 mb-2">
                            <input
                              type="text"
                              className="quest-text-input"
                              placeholder={quest.placeholder1}
                              value={gratitude1}
                              onChange={(e) => setGratitude1(e.target.value)}
                            />
                            <input
                              type="text"
                              className="quest-text-input"
                              placeholder={quest.placeholder2}
                              value={gratitude2}
                              onChange={(e) => setGratitude2(e.target.value)}
                            />
                            <input
                              type="text"
                              className="quest-text-input"
                              placeholder={quest.placeholder3}
                              value={gratitude3}
                              onChange={(e) => setGratitude3(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            className="quest-submit-btn"
                            disabled={!gratitude1.trim() && !gratitude2.trim() && !gratitude3.trim()}
                            onClick={() => handleSubmitDailyQuest('quest-gratitude')}
                          >
                            <Send size={14} />
                            <span>Khóa 3 Điều Biết Ơn (+80 EXP)</span>
                          </button>
                        </div>
                      ) : (
                        <div className="quest-action-wrapper">
                          <button
                            type="button"
                            className="quest-direct-action-btn"
                            onClick={() => handleActionQuestClick(quest)}
                          >
                            <span>{quest.actionLabel || 'Thực Hiện Ngay'}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}

          {/* TAB 2: HOLOGRAPHIC BADGES */}
          {activeTab === 'badges' && (
            <motion.div
              key="tab-badges"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="badges-showcase-grid"
            >
              {BADGES_DATA.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id)
                const isSelected = selectedBadge?.id === badge.id

                return (
                  <motion.div
                    key={badge.id}
                    className={`badge-holo-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isUnlocked ? badge.glowColor : 'rgba(255,255,255,0.1)',
                      boxShadow: isUnlocked ? `0 0 25px ${badge.glowColor}40` : 'none'
                    }}
                    onClick={() => {
                      setSelectedBadge(badge)
                      if (soundEnabled) playKeyClick()
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="badge-holo-shimmer"
                      style={{ background: isUnlocked ? badge.gradient : 'rgba(255,255,255,0.05)' }}
                    />

                    <div className="badge-card-inner">
                      <div className="badge-card-icon-wrapper">
                        <span className="badge-card-icon">{isUnlocked ? badge.icon : '🔒'}</span>
                      </div>

                      <span className={`badge-rarity-chip ${badge.rarity.toLowerCase()}`}>
                        {badge.rarity}
                      </span>

                      <h4 className="badge-card-title">{badge.title}</h4>
                      <span className="badge-card-en-title">{badge.englishTitle}</span>

                      <p className="badge-card-desc">{badge.description}</p>

                      <div className="badge-card-footer">
                        {isUnlocked ? (
                          <span className="badge-unlocked-status">
                            <CheckCircle2 size={12} className="text-emerald-400" /> ĐÃ SỞ HỮU
                          </span>
                        ) : (
                          <span className="badge-locked-status">
                            <Lock size={12} /> {badge.requirement}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* TAB 3: RESONANCE MASTERY */}
          {activeTab === 'mastery' && (
            <motion.div
              key="tab-mastery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mastery-overview-section"
            >
              <div className="mastery-current-rank-card">
                <div className="rank-crown-box">
                  <Crown size={32} className="text-amber-400" />
                </div>
                <div className="rank-details">
                  <span className="rank-sub">// CẤP ĐỘ TÂM THỨC HIỆN TẠI //</span>
                  <h3 className="rank-name">LV.{resonanceLevel.level} — {resonanceLevel.title}</h3>
                  <p className="rank-perk">✨ <strong>Đặc quyền mở khóa:</strong> {resonanceLevel.perk}</p>
                </div>
              </div>

              <h4 className="mastery-roadmap-title">LỘ TRÌNH TIẾN HÓA Ý THỨC</h4>
              <div className="mastery-levels-list">
                {[
                  { lvl: 1, title: 'Lõi Sơ Khai', exp: '0 EXP', desc: 'Mở khóa nhật ký cơ bản & quét vi biểu cảm' },
                  { lvl: 2, title: 'Tâm Thức Chớm Nở', exp: '100 EXP', desc: 'Mở khóa hiệu ứng hạt neon lấp lánh và âm thanh vinh quang' },
                  { lvl: 3, title: 'Người Dẫn Đường Cảm Xúc', exp: '250 EXP', desc: 'Mở khóa sơ đồ cây cốt truyện tương tác và Time Jump' },
                  { lvl: 4, title: 'Cộng Hưởng Viên Tinh Tế', exp: '450 EXP', desc: 'Tăng 20% cường độ hào quang Mood Ring' },
                  { lvl: 5, title: 'Hộ Vệ Ký Ức', exp: '700 EXP', desc: 'Mở khóa hiệu ứng Hologram 3D cho bộ sưu tập huy hiệu' },
                  { lvl: 6, title: 'Bậc Thầy Tâm Thức', exp: '1000 EXP', desc: 'Danh hiệu Tối Thượng & Hào quang Siêu Việt' }
                ].map((item) => {
                  const isCurrent = resonanceLevel.level === item.lvl
                  const isPassed = resonanceLevel.level > item.lvl

                  return (
                    <div
                      key={item.lvl}
                      className={`level-roadmap-item ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}`}
                    >
                      <div className="roadmap-lvl-col">
                        <span className="roadmap-lvl-num">LV.{item.lvl}</span>
                        {isPassed ? (
                          <CheckCircle2 size={14} className="text-emerald-400" />
                        ) : isCurrent ? (
                          <Sparkles size={14} className="text-amber-400 animate-spin-slow" />
                        ) : (
                          <Lock size={14} className="text-gray-500" />
                        )}
                      </div>
                      <div className="roadmap-info-col">
                        <div className="flex items-center justify-between">
                          <h5 className="roadmap-item-title">{item.title}</h5>
                          <span className="roadmap-item-exp">{item.exp}</span>
                        </div>
                        <p className="roadmap-item-desc">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
    </>
  )

  if (isEmbedded) {
    return (
      <div className="quests-embedded-container relative">
        <div className="quests-modal-card embedded-view">
          {modalBody}
        </div>
      </div>
    )
  }

  return (
    <div className="quests-modal-backdrop" onClick={onClose}>
      <motion.div
        className="quests-modal-card"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
      >
        {modalBody}
      </motion.div>
    </div>
  )
}
