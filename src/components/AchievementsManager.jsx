import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Crown, 
  Flame, 
  Star, 
  ShieldCheck, 
  Zap, 
  Check,
  RotateCcw,
  Eye,
  Filter,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react'
import { 
  getAchievementsState, 
  setEquippedTitle, 
  recordAchievementProgress, 
  resetAchievements 
} from '../utils/achievementsEngine.js'
import { playKeyClick, playBadgeUnlockSound } from '../utils/audioSynth.js'

export default function AchievementsManager({
  soundEnabled = true,
  onClose = () => {},
  isCompact = false
}) {
  const [state, setState] = useState(() => getAchievementsState())
  const [filterCategory, setFilterCategory] = useState('all') // 'all' | 'unlocked' | 'locked' | 'legendary'
  const [selectedAchievement, setSelectedAchievement] = useState(null)
  const [celebrationBanner, setCelebrationBanner] = useState(null)

  // Confetti Particle Engine Canvas
  const canvasRef = useRef(null)
  const confettiParticles = useRef([])
  const animFrameId = useRef(null)

  const reloadState = () => {
    setState(getAchievementsState())
  }

  // Global event listener for newly unlocked achievements
  useEffect(() => {
    const handleUnlocked = (e) => {
      const { achievement } = e.detail
      reloadState()
      triggerConfettiBurst()
      if (soundEnabled) {
        playBadgeUnlockSound()
      }
      setCelebrationBanner({
        title: 'DANH HIỆU MỚI ĐƯỢC MỞ KHÓA!',
        subtitle: `Bạn đã đạt thành tựu "${achievement.title}" (+${achievement.points} Điểm)!`,
        achievement
      })
      setTimeout(() => setCelebrationBanner(null), 6000)
    }

    const handleReset = () => {
      reloadState()
    }

    window.addEventListener('mr-achievement-unlocked', handleUnlocked)
    window.addEventListener('mr-achievements-reset', handleReset)
    window.addEventListener('mr-title-changed', reloadState)

    return () => {
      window.removeEventListener('mr-achievement-unlocked', handleUnlocked)
      window.removeEventListener('mr-achievements-reset', handleReset)
      window.removeEventListener('mr-title-changed', reloadState)
    }
  }, [soundEnabled])

  // Canvas Confetti
  const triggerConfettiBurst = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight

    const colors = ['#00f0ff', '#f59e0b', '#ec4899', '#10b981', '#a855f7', '#fbbf24']
    confettiParticles.current = Array.from({ length: 70 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.28
    }))

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = 0

      confettiParticles.current.forEach((p) => {
        if (p.opacity <= 0) return
        active++
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.rotation += p.vRot
        p.opacity -= 0.012

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
        ctx.restore()
      })

      if (active > 0) {
        animFrameId.current = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    if (animFrameId.current) cancelAnimationFrame(animFrameId.current)
    animFrameId.current = requestAnimationFrame(render)
  }

  const handleEquip = (ach) => {
    if (!ach.isUnlocked) return
    if (soundEnabled) playKeyClick()
    setEquippedTitle({
      id: ach.id,
      title: ach.titleReward,
      icon: ach.icon,
      rarity: ach.rarity,
      accentColor: ach.accentColor
    })
  }

  const handleUnequip = () => {
    if (soundEnabled) playKeyClick()
    setEquippedTitle(null)
  }

  // Filtered achievements
  const filteredAchievements = state.achievements.filter(ach => {
    if (filterCategory === 'unlocked') return ach.isUnlocked
    if (filterCategory === 'locked') return !ach.isUnlocked
    if (filterCategory === 'legendary') return ach.rarity === 'legendary' || ach.rarity === 'epic'
    return true
  })

  const completionRate = state.totalCount > 0 
    ? Math.round((state.unlockedCount / state.totalCount) * 100) 
    : 0

  return (
    <div className="achievements-hub-container relative">
      {/* Background Confetti Canvas */}
      <canvas 
        ref={canvasRef} 
        className="pointer-events-none absolute inset-0 z-50 w-full h-full"
      />

      {/* Celebration Toast Banner */}
      <AnimatePresence>
        {celebrationBanner && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="achievement-celebration-toast"
            style={{ borderColor: celebrationBanner.achievement?.accentColor || '#fbbf24' }}
          >
            <div className="toast-icon-pulse" style={{ background: celebrationBanner.achievement?.badgeGlow }}>
              <Crown size={28} className="text-amber-300 animate-bounce" />
            </div>
            <div className="toast-info">
              <span className="toast-tag">✦ THÀNH TỰU MỚI MỞ KHÓA ✦</span>
              <h4 className="toast-title">{celebrationBanner.title}</h4>
              <p className="toast-sub">{celebrationBanner.subtitle}</p>
            </div>
            <button 
              className="toast-close-btn"
              onClick={() => setCelebrationBanner(null)}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Dashboard Banner */}
      <div className="achievements-header-card">
        <div className="achievements-banner-left">
          <div className="achievements-trophy-badge">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="achievements-tag">// HALL OF TITLES & ACHIEVEMENTS //</span>
              <span className="achievements-level-chip">
                <Star size={12} className="text-cyan-400 fill-cyan-400" /> Cấp Bậc Danh Dự
              </span>
            </div>
            <h3 className="achievements-main-title">HỆ THỐNG DANH HIỆU & THÀNH TỰU</h3>
            <p className="achievements-subtitle">
              Mở khóa các danh hiệu tâm thức qua chuỗi hành trình, đêm khuya và sự thấu cảm.
            </p>
          </div>
        </div>

        {/* Global Progress & Equipped Title Display */}
        <div className="achievements-stats-right">
          <div className="achievements-stat-box">
            <span className="stat-label">TIẾN ĐỘ MỞ KHÓA</span>
            <div className="flex items-baseline gap-1">
              <span className="stat-value">{state.unlockedCount}</span>
              <span className="stat-total">/ {state.totalCount} ({completionRate}%)</span>
            </div>
            <div className="stat-progress-track">
              <div 
                className="stat-progress-fill" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
          </div>

          <div className="achievements-stat-box highlight">
            <span className="stat-label">TỔNG ĐIỂM TÂM THỨC</span>
            <div className="flex items-center gap-1.5">
              <Zap size={16} className="text-amber-400 fill-amber-400" />
              <span className="stat-value text-amber-300">{state.totalPoints}</span>
              <span className="stat-total">/ {state.maxPoints} PTS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Equipped Title Showcase Card */}
      <div className="equipped-title-showcase">
        <div className="flex items-center gap-3">
          <div className="equipped-crown-glow">
            <Crown size={20} className="text-amber-400" />
          </div>
          <div>
            <span className="equipped-label">DANH HIỆU ĐANG ĐEO (EQUIPPED TITLE):</span>
            <div className="flex items-center gap-2 mt-0.5">
              {state.equippedTitle ? (
                <>
                  <span className="equipped-title-text" style={{ color: state.equippedTitle.accentColor || '#00f0ff' }}>
                    {state.equippedTitle.icon} {state.equippedTitle.title}
                  </span>
                  <span className={`rarity-chip ${state.equippedTitle.rarity || 'common'}`}>
                    {state.equippedTitle.rarity?.toUpperCase()}
                  </span>
                </>
              ) : (
                <span className="text-gray-400 italic text-sm">Chưa trang bị danh hiệu nào</span>
              )}
            </div>
          </div>
        </div>

        {state.equippedTitle && (
          <button 
            type="button"
            className="unequip-btn"
            onClick={handleUnequip}
            title="Tháo danh hiệu đang đeo"
          >
            Tháo Danh Hiệu
          </button>
        )}
      </div>

      {/* Filter Navigation Bar */}
      <div className="achievements-filter-bar">
        <div className="filter-tabs-group">
          <button
            type="button"
            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              setFilterCategory('all')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Layers size={14} /> Tất Cả ({state.totalCount})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterCategory === 'unlocked' ? 'active' : ''}`}
            onClick={() => {
              setFilterCategory('unlocked')
              if (soundEnabled) playKeyClick()
            }}
          >
            <CheckCircle2 size={14} className="text-emerald-400" /> Đã Mở Khóa ({state.unlockedCount})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterCategory === 'locked' ? 'active' : ''}`}
            onClick={() => {
              setFilterCategory('locked')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Lock size={14} className="text-gray-400" /> Chưa Mở ({state.totalCount - state.unlockedCount})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterCategory === 'legendary' ? 'active' : ''}`}
            onClick={() => {
              setFilterCategory('legendary')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Crown size={14} className="text-amber-400" /> Thần Thoại & Epic
          </button>
        </div>

        {/* Quick Demo Night Owl Trigger (Helper for users testing at any hour) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="demo-trigger-btn"
            onClick={() => {
              recordAchievementProgress('night-owl', 1)
            }}
            title="Kiểm tra mở khóa thành tựu Cú Đêm"
          >
            🦉 Thử Mở Cú Đêm
          </button>
        </div>
      </div>

      {/* Achievements Cards Grid */}
      <div className="achievements-cards-grid">
        {filteredAchievements.map((ach) => {
          const isSelected = selectedAchievement?.id === ach.id
          const isEquipped = state.equippedTitle?.id === ach.id

          return (
            <motion.div
              key={ach.id}
              className={`achievement-card ${ach.isUnlocked ? 'unlocked' : 'locked'} ${ach.rarity} ${isEquipped ? 'is-equipped' : ''}`}
              style={{
                '--ach-color': ach.accentColor,
                '--ach-glow': ach.badgeGlow
              }}
              whileHover={{ y: -3, scale: 1.01 }}
              onClick={() => {
                setSelectedAchievement(ach)
                if (soundEnabled) playKeyClick()
              }}
            >
              {/* Top Row: Icon + Rarity Badge */}
              <div className="ach-card-header">
                <div className="ach-icon-wrapper" style={{ borderColor: ach.isUnlocked ? ach.accentColor : 'rgba(255,255,255,0.1)' }}>
                  <span className="ach-icon">{ach.icon}</span>
                  {ach.isUnlocked && (
                    <span className="ach-check-mark">
                      <Check size={10} className="text-black stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="ach-meta-group">
                  <div className="flex items-center gap-1.5">
                    <span className={`rarity-tag ${ach.rarity}`}>
                      {ach.rarity.toUpperCase()}
                    </span>
                    <span className="ach-points-chip">
                      +{ach.points} PTS
                    </span>
                  </div>
                  {isEquipped && (
                    <span className="equipped-badge-chip">
                      <Crown size={11} /> ĐANG ĐEO
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="ach-body">
                <h4 className="ach-title">{ach.title}</h4>
                <span className="ach-tagline">"{ach.tagline}"</span>
                <p className="ach-desc">{ach.description}</p>
              </div>

              {/* Progress Track & Action Row */}
              <div className="ach-footer">
                <div className="ach-progress-bar-container">
                  <div className="ach-progress-labels">
                    <span className="progress-text">
                      {ach.isUnlocked ? 'ĐÃ HOÀN THÀNH' : `Tiến độ: ${ach.currentValue}/${ach.targetValue} ${ach.unit}`}
                    </span>
                    <span className="progress-percent">{ach.progressPercent}%</span>
                  </div>
                  <div className="ach-track">
                    <div 
                      className="ach-fill" 
                      style={{ 
                        width: `${ach.progressPercent}%`,
                        background: ach.isUnlocked ? ach.accentColor : 'rgba(255,255,255,0.3)'
                      }} 
                    />
                  </div>
                </div>

                {/* Equip / Unlock Button */}
                <div className="ach-action-row">
                  {ach.isUnlocked ? (
                    <button
                      type="button"
                      className={`equip-action-btn ${isEquipped ? 'equipped' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isEquipped) {
                          handleUnequip()
                        } else {
                          handleEquip(ach)
                        }
                      }}
                    >
                      {isEquipped ? (
                        <>
                          <Check size={13} /> Đang Trang Bị
                        </>
                      ) : (
                        <>
                          <Crown size={13} /> Đeo Danh Hiệu
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="locked-indicator">
                      <Lock size={12} /> Đang Khóa
                    </div>
                  )}

                  {ach.unlockedAt && (
                    <span className="unlocked-time-label" title={ach.unlockedAt}>
                      Mở ngày {new Date(ach.unlockedAt).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
