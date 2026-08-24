import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Trash2, 
  Sparkles, 
  Wind, 
  ShieldCheck, 
  RefreshCw, 
  Heart, 
  Smile, 
  Zap, 
  Volume2, 
  VolumeX, 
  Check, 
  AlertTriangle,
  Play,
  RotateCcw,
  Feather
} from 'lucide-react'
import { 
  playFireIgniteSound, 
  playFireCrackleSound, 
  playCatharsisChime, 
  playKeyClick,
  playSynthTone 
} from '../utils/audioSynth.js'

const FLAME_TYPES = [
  {
    id: 'inferno',
    name: 'Lửa Than Hồng (Inferno)',
    emoji: '🔥',
    color: '#ff4d00',
    secondaryColor: '#f59e0b',
    glowColor: 'rgba(255, 77, 0, 0.6)',
    desc: 'Lửa đỏ cam rực rỡ, tàn tro than hồng lách tách cổ điển.'
  },
  {
    id: 'plasma',
    name: 'Plasma Xanh Lượng Tử',
    emoji: '⚡',
    color: '#00f0ff',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    desc: 'Ngọn lửa nhiệt hạch 10,000°C phân rã mọi phân tử tiêu cực.'
  },
  {
    id: 'void',
    name: 'Hư Vô Tím (Void Flame)',
    emoji: '🟣',
    color: '#a855f7',
    secondaryColor: '#ec4899',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    desc: 'Hố đen ánh tím hút sạch mọi u uất vào cõi vô định.'
  },
  {
    id: 'solar',
    name: 'Bụi Sao Hoàng Kim (Solar)',
    emoji: '🌟',
    color: '#facc15',
    secondaryColor: '#fb923c',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    desc: 'Quang phổ mặt trời thanh lọc khổ đau thành năng lượng tích cực.'
  }
]

const CATHARSIS_PROMPTS = [
  'Điều khiến tôi tức giận và ức chế nhất là...',
  'Những áp lực và gánh nặng tôi muốn trút bỏ ngay lúc này...',
  'Những lời nói gây tổn thương tôi muốn thiêu rụi vĩnh viễn...',
  'Nỗi thất vọng hay sai lầm tôi muốn tha thứ cho chính mình...',
  'Bí mật và nỗi đau mà tôi không thể chia sẻ cùng ai...'
]

const RAGE_LEVELS = [
  { level: 1, label: 'Âm ỉ', desc: 'Khó chịu nhẹ', color: '#38bdf8' },
  { level: 2, label: 'Bực tức', desc: 'Căng thẳng leo thang', color: '#f59e0b' },
  { level: 3, label: 'Bốc hỏa', desc: 'Nổi giận dữ dội', color: '#f97316' },
  { level: 4, label: 'Núi lửa', desc: 'Quá tải cảm xúc', color: '#ef4444' },
  { level: 5, label: 'Siêu tân tinh', desc: 'Bùng nổ tột cùng', color: '#dc2626' }
]

export default function BurnMode({
  onSyncMoodChange,
  currentMood = 'anger',
  soundEnabled = false,
  onClose
}) {
  const [ventText, setVentText] = useState('')
  const [flameType, setFlameType] = useState('inferno')
  const [rageLevel, setRageLevel] = useState(3)
  const [burnStage, setBurnStage] = useState('idle') // 'idle' | 'igniting' | 'burning' | 'ashing' | 'cleansed'
  const [charProgress, setCharProgress] = useState(0) // 0 to 100%

  // Breathing guide state in 'cleansed' stage
  const [breathingStep, setBreathingStep] = useState('inhale') // 'inhale' (4s) | 'hold' (7s) | 'exhale' (8s)
  const [breathingTimer, setBreathingTimer] = useState(4)
  const [breathingActive, setBreathingActive] = useState(true)

  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationFrameRef = useRef(null)
  const burnIntervalRef = useRef(null)

  const selectedFlame = FLAME_TYPES.find(f => f.id === flameType) || FLAME_TYPES[0]

  // Auto-tune rage level based on typing length or anger keywords
  useEffect(() => {
    if (ventText.length > 300) setRageLevel(5)
    else if (ventText.length > 180) setRageLevel(4)
    else if (ventText.length > 80) setRageLevel(3)
    else if (ventText.length > 30) setRageLevel(2)
  }, [ventText])

  // Canvas particle engine for fire, embers, and rising ash
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isRunning = true

    function resizeCanvas() {
      if (!canvas) return
      canvas.width = canvas.parentElement?.clientWidth || 600
      canvas.height = canvas.parentElement?.clientHeight || 450
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    function renderParticles() {
      if (!isRunning) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Only spawn heavy fire particles during burning/igniting stages
      if (burnStage === 'igniting' || burnStage === 'burning' || burnStage === 'ashing') {
        const spawnRate = burnStage === 'burning' ? (rageLevel * 4 + 10) : 6
        for (let i = 0; i < spawnRate; i++) {
          particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            vx: (Math.random() - 0.5) * 3,
            vy: -(Math.random() * 5 + 3),
            size: Math.random() * 6 + 2,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.01,
            color: Math.random() > 0.4 ? selectedFlame.color : selectedFlame.secondaryColor,
            isSmoke: Math.random() > 0.7
          })
        }
      }

      // Update and draw particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        if (p.isSmoke) {
          p.size += 0.15
          p.vy *= 0.98
          ctx.fillStyle = `rgba(120, 120, 130, ${Math.max(0, p.alpha * 0.4)})`
        } else {
          p.size *= 0.98
          ctx.fillStyle = p.color
          ctx.globalAlpha = Math.max(0, p.alpha)
          ctx.shadowBlur = 12
          ctx.shadowColor = selectedFlame.glowColor
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        if (p.alpha <= 0 || p.y < -20) {
          particlesRef.current.splice(i, 1)
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderParticles)
    }

    animationFrameRef.current = requestAnimationFrame(renderParticles)

    return () => {
      isRunning = false
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [burnStage, selectedFlame, rageLevel])

  // Breathing guide cycle during 'cleansed' stage (4-7-8 Breathing Technique)
  useEffect(() => {
    if (burnStage !== 'cleansed' || !breathingActive) return

    let currentStep = 'inhale'
    let timeLeft = 4

    const breathingInterval = setInterval(() => {
      timeLeft -= 1
      if (timeLeft <= 0) {
        if (currentStep === 'inhale') {
          currentStep = 'hold'
          timeLeft = 7
          playSynthTone(432, 'sine', 0.8, 0.02)
        } else if (currentStep === 'hold') {
          currentStep = 'exhale'
          timeLeft = 8
          playSynthTone(384, 'sine', 1.2, 0.02)
        } else {
          currentStep = 'inhale'
          timeLeft = 4
          playSynthTone(528, 'sine', 0.8, 0.02)
        }
        setBreathingStep(currentStep)
      }
      setBreathingTimer(timeLeft)
    }, 1000)

    return () => clearInterval(breathingInterval)
  }, [burnStage, breathingActive])

  // Start the burn sequence
  function handleStartBurn() {
    if (!ventText.trim()) {
      alert('Vui lòng viết ra điều bạn muốn giải tỏa trước khi đốt!')
      return
    }

    // Trigger screen shake
    window.dispatchEvent(new CustomEvent('trigger-screen-shake', { detail: { impact: 'heavy' } }))

    setBurnStage('igniting')
    playFireIgniteSound()

    let progress = 0
    burnIntervalRef.current = setInterval(() => {
      progress += 2.5
      setCharProgress(Math.min(100, progress))

      // Play crackles along the way
      if (progress % 15 === 0) {
        playFireCrackleSound(8)
      }

      if (progress === 40) {
        setBurnStage('burning')
      } else if (progress === 80) {
        setBurnStage('ashing')
      } else if (progress >= 100) {
        clearInterval(burnIntervalRef.current)
        
        // ZERO-TRACE PURGE: Wipe text completely from memory
        setVentText('')
        setCharProgress(0)
        setBurnStage('cleansed')
        playCatharsisChime()

        if (typeof onSyncMoodChange === 'function') {
          onSyncMoodChange('calm')
        }
      }
    }, 90)
  }

  // Reset to write again
  function handleResetBurn() {
    setVentText('')
    setBurnStage('idle')
    setCharProgress(0)
    if (soundEnabled) playKeyClick()
  }

  return (
    <div className="burn-mode-container">
      {/* Header */}
      <div className="burn-header">
        <div className="flex items-center gap-3">
          <div 
            className="burn-icon-badge"
            style={{ 
              backgroundColor: `${selectedFlame.color}20`,
              borderColor: `${selectedFlame.color}50`
            }}
          >
            <Flame size={24} style={{ color: selectedFlame.color }} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono font-bold" style={{ color: selectedFlame.color }}>
                // CATHARTIC DECOMPRESSION CHAMBER //
              </span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-mono">
                ZERO-TRACE GUARANTEE 🔒
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              CHẾ ĐỘ PHÁ HỦY <span className="text-orange-400 text-sm font-normal">(Burn & Release Mode)</span>
            </h2>
          </div>
        </div>

        {/* Status Pill */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>Văn bản không được lưu lại bất kỳ đâu</span>
        </div>
      </div>

      {/* Main Chamber Grid */}
      <div className="burn-chamber-grid">
        {/* Left Side / Main Burn Canvas & Slate */}
        <div className="burn-slate-wrapper relative">
          {/* Background Fire Canvas */}
          <canvas 
            ref={canvasRef} 
            className="burn-particle-canvas pointer-events-none"
          />

          {/* STAGE 1: IDLE / COMPOSING */}
          {burnStage === 'idle' && (
            <motion.div 
              className="burn-compose-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Quick venting prompts */}
              <div className="catharsis-prompts-bar">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Feather size={12} className="text-orange-400" />
                  <span>Gợi ý trút cảm xúc:</span>
                </span>
                <div className="prompt-chips">
                  {CATHARSIS_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVentText(prev => prev ? `${prev}\n\n${prompt} ` : `${prompt} `)
                        if (soundEnabled) playKeyClick()
                      }}
                      className="prompt-chip"
                    >
                      {prompt.slice(0, 24)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for venting */}
              <div className="relative mt-3">
                <textarea
                  value={ventText}
                  onChange={(e) => setVentText(e.target.value)}
                  placeholder="Hãy trút hết tất cả những tức giận, thất vọng, áp lực hay những lời cay đắng mà bạn không thể nói cùng ai vào đây... Sau đó nhấn nút Đốt Cháy để thiêu rụi chúng thành tro tàn mãi mãi."
                  className="burn-textarea"
                  rows={9}
                />
                
                {/* Character Count & Zero Trace Guarantee */}
                <div className="textarea-footer flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                  <span>{ventText.length} ký tự áp lực</span>
                  <span className="flex items-center gap-1 text-emerald-400/80">
                    <ShieldCheck size={12} />
                    <span>Dữ liệu sẽ bốc hơi 100% khi nhấn Burn</span>
                  </span>
                </div>
              </div>

              {/* Big Burn Action Button */}
              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setVentText('')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs font-mono transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={13} />
                  <span>Xóa trắng</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartBurn}
                  disabled={!ventText.trim()}
                  className="burn-trigger-btn"
                  style={{
                    background: `linear-gradient(135deg, ${selectedFlame.color}, ${selectedFlame.secondaryColor})`,
                    boxShadow: `0 0 25px ${selectedFlame.glowColor}`
                  }}
                >
                  <Flame size={20} className="animate-bounce" />
                  <span>🔥 PHÁ HỦY & ĐỐT CHÁY THÀNH TRO</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2, 3, 4: ACTIVE BURNING & CHAR ANIMATION */}
          {(burnStage === 'igniting' || burnStage === 'burning' || burnStage === 'ashing') && (
            <motion.div 
              className="burn-active-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="burning-banner">
                <div className="flex items-center gap-2">
                  <Flame size={20} style={{ color: selectedFlame.color }} className="animate-spin-slow" />
                  <span className="font-mono text-xs uppercase font-bold text-white tracking-widest">
                    {burnStage === 'igniting' && 'ĐANG KÍCH HOẠT NHIỆT LƯỢNG THIÊU HỦY...'}
                    {burnStage === 'burning' && 'NGỌN LỬA ĐANG THIÊU RỤI TỪNG DÒNG NỖI ĐAU...'}
                    {burnStage === 'ashing' && 'PHÂN RÃ TOÀN BỘ VĂN BẢN THÀNH TRO TÀN...'}
                  </span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: selectedFlame.color }}>
                  {Math.round(charProgress)}%
                </span>
              </div>

              {/* Burning Letter Simulation */}
              <div 
                className={`burning-sheet stage-${burnStage}`}
                style={{
                  '--char-height': `${charProgress}%`,
                  '--flame-color': selectedFlame.color,
                  '--flame-glow': selectedFlame.glowColor
                }}
              >
                <div className="burning-sheet-inner">
                  <p className="burning-text-content font-serif">
                    {ventText}
                  </p>
                  
                  {/* Fire wavefront overlay */}
                  <div className="fire-wavefront" />
                </div>
              </div>

              {/* Bottom fire bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-4">
                <div 
                  className="h-full transition-all duration-100"
                  style={{
                    width: `${charProgress}%`,
                    backgroundColor: selectedFlame.color,
                    boxShadow: `0 0 12px ${selectedFlame.color}`
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* STAGE 5: POST-CATHARSIS ZEN & BREATHING GUIDE */}
          {burnStage === 'cleansed' && (
            <motion.div 
              className="burn-cleansed-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="cleansed-badge">
                <Sparkles size={28} className="text-emerald-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mt-3">TÂM TRÍ ĐÃ ĐƯỢC THANH TẨY</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                Đoạn văn bản và những điều tiêu cực đã tan biến hoàn toàn vào cõi hư vô. Hãy buông bỏ gánh nặng này và dành một phút để điều hòa nhịp thở.
              </p>

              {/* 4-7-8 Breathing Circle */}
              <div className="breathing-circle-wrapper my-6">
                <div 
                  className={`breathing-circle step-${breathingStep}`}
                >
                  <div className="breathing-inner">
                    <span className="breathing-step-title">
                      {breathingStep === 'inhale' && 'HÍT VÀO'}
                      {breathingStep === 'hold' && 'GIỮ HƠI'}
                      {breathingStep === 'exhale' && 'THỞ RA'}
                    </span>
                    <span className="breathing-step-seconds">{breathingTimer}s</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                  Kỹ thuật thở sâu 4-7-8: Giảm cortisol & an định thần kinh
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleResetBurn}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                >
                  <RotateCcw size={15} />
                  <span>Xả stress thêm điều khác</span>
                </button>

                {typeof onClose === 'function' && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                  >
                    Trở về Trang chủ
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Side / Flame & Intensity Controls */}
        <div className="burn-controls-panel">
          {/* Flame Selector */}
          <div className="control-box">
            <label className="control-label flex items-center gap-1.5 text-xs text-slate-300 font-bold">
              <Flame size={14} style={{ color: selectedFlame.color }} />
              <span>LOẠI NGỌN LỬA THIÊU RỤI</span>
            </label>
            
            <div className="flame-options-list mt-2.5 space-y-2">
              {FLAME_TYPES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFlameType(f.id)
                    if (soundEnabled) playKeyClick()
                  }}
                  className={`flame-option-btn ${flameType === f.id ? 'active' : ''}`}
                  style={{
                    borderColor: flameType === f.id ? f.color : 'rgba(255,255,255,0.08)',
                    background: flameType === f.id ? `${f.color}15` : 'rgba(15, 23, 42, 0.6)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{f.emoji}</span>
                    <div className="text-left">
                      <span className="text-xs font-semibold text-white block">{f.name}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{f.desc}</span>
                    </div>
                  </div>
                  {flameType === f.id && (
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}` }} 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Rage / Tension Meter */}
          <div className="control-box mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="control-label flex items-center gap-1.5 text-xs text-slate-300 font-bold">
                <Zap size={14} className="text-orange-400" />
                <span>CƯỜNG ĐỘ CẢM XÚC</span>
              </label>
              <span 
                className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${RAGE_LEVELS[rageLevel - 1].color}20`,
                  color: RAGE_LEVELS[rageLevel - 1].color,
                  border: `1px solid ${RAGE_LEVELS[rageLevel - 1].color}50`
                }}
              >
                Cấp {rageLevel}: {RAGE_LEVELS[rageLevel - 1].label}
              </span>
            </div>

            <div className="rage-slider-container">
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={rageLevel}
                onChange={(e) => setRageLevel(Number(e.target.value))}
                className="rage-range-input"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1: Nhẹ</span>
                <span>2: Bực</span>
                <span>3: Giận</span>
                <span>4: Núi lửa</span>
                <span>5: Cực đại</span>
              </div>
            </div>
          </div>

          {/* Zero-Trace Verified Box */}
          <div className="control-box zero-trace-card mt-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={18} />
              <span className="text-xs font-bold font-mono">BẢO MẬT TUYỆT ĐỐI (ZERO-TRACE)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Mood Ring Story cam kết tính năng này không lưu trữ dữ liệu trên bất kỳ ổ đĩa cục bộ (localStorage) hay máy chủ nào. Khi cháy hết, mọi ký tự biến mất vĩnh viễn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
