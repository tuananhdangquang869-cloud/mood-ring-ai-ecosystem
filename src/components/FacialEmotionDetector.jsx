import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Activity, 
  Zap, 
  Smile, 
  CloudRain, 
  Flame, 
  Feather, 
  Radio, 
  Scan, 
  Eye, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ShieldCheck, 
  Check, 
  Sliders,
  HelpCircle,
  Play,
  Pause
} from 'lucide-react'
import { globalFacialAI } from '../utils/facialEmotionAI.js'
import { playKeyClick } from '../utils/audioSynth.js'

export default function FacialEmotionDetector({
  onSyncMoodChange,
  isAutoSyncEnabled = true,
  setIsAutoSyncEnabled,
  compact = false,
  soundEnabled = false,
  onCloseFloating
}) {
  const [isActive, setIsActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  
  // Real-time telemetry state
  const [telemetryState, setTelemetryState] = useState({
    emotion: 'relaxed',
    confidence: { joy: 25, melancholy: 25, anger: 25, relaxed: 25 },
    telemetry: {
      smileQuotient: 0,
      browTension: 0,
      eyeOpenness: 75,
      headMovement: 0,
      faceDetected: false,
      estimatedBPM: 72,
      valence: 0.1,
      arousal: 0.3
    },
    faceBounds: { x: 0.25, y: 0.2, width: 0.5, height: 0.6 },
    meshPoints: []
  })

  // Deep scan state
  const [isDeepScanning, setIsDeepScanning] = useState(false)
  const [deepScanResult, setDeepScanResult] = useState(null)
  const [isFloating, setIsFloating] = useState(compact)
  const [sensitivity, setSensitivity] = useState(1.0)
  const [showMeshOverlay, setShowMeshOverlay] = useState(true)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)

  // Emotional visual themes
  const emotionConfig = {
    joy: {
      name: 'Vui Tươi (Joy)',
      icon: Smile,
      color: '#00f0ff',
      gradient: 'linear-gradient(135deg, #00f0ff, #3b82f6)',
      glow: 'rgba(0, 240, 255, 0.5)',
      desc: 'Cơ mặt rạng rỡ, khóe miệng nhướng cao, tinh thần thăng hoa'
    },
    melancholy: {
      name: 'U Buồn (Melancholy)',
      icon: CloudRain,
      color: '#60a5fa',
      gradient: 'linear-gradient(135deg, #60a5fa, #8b5cf6)',
      glow: 'rgba(96, 165, 250, 0.5)',
      desc: 'Ánh mắt trầm tư, cơ mặt thả lỏng, kết nối ký ức sâu lắng'
    },
    anger: {
      name: 'Căng Thẳng / Quyết Liệt (Anger/Tension)',
      icon: Flame,
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
      glow: 'rgba(239, 68, 68, 0.6)',
      desc: 'Cung mày nhăn lại, ánh nhìn tập trung bứt phá giới hạn'
    },
    relaxed: {
      name: 'Thư Thái (Relaxed)',
      icon: Feather,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
      glow: 'rgba(16, 185, 129, 0.5)',
      desc: 'Khuôn mặt tĩnh tại, nhịp thở êm đềm, trạng thái Alpha Zen'
    }
  }

  const currentTheme = emotionConfig[telemetryState.emotion] || emotionConfig.relaxed
  const CurrentIcon = currentTheme.icon

  // Sync state from facial AI singleton
  useEffect(() => {
    const unsubscribe = globalFacialAI.subscribe((data) => {
      setTelemetryState(data)

      // Automatically sync detected mood to website theme if enabled
      if (isAutoSyncEnabled && onSyncMoodChange && data.telemetry.faceDetected) {
        onSyncMoodChange(data.emotion)
        
        // Dynamically set CSS variables for global ambient glow
        document.documentElement.style.setProperty('--face-emotion-color', currentTheme.color)
        document.documentElement.style.setProperty('--face-glow', currentTheme.glow)
      }
    })

    return () => unsubscribe()
  }, [isAutoSyncEnabled, onSyncMoodChange, currentTheme.color, currentTheme.glow])

  // Start / Stop Camera handler
  const toggleCamera = useCallback(async () => {
    if (soundEnabled) playKeyClick()
    if (isActive) {
      globalFacialAI.stopCamera()
      setIsActive(false)
      setDeepScanResult(null)
    } else {
      setIsStarting(true)
      setErrorMsg(null)
      try {
        await globalFacialAI.startCamera(videoRef.current, canvasRef.current)
        setIsActive(true)
      } catch (err) {
        setErrorMsg('Không thể mở camera. Vui lòng cấp quyền truy cập thiết bị trong trình duyệt.')
      } finally {
        setIsStarting(false)
      }
    }
  }, [isActive, soundEnabled])

  // Draw futuristic cyber mesh overlay on canvas
  useEffect(() => {
    if (!isActive || !overlayCanvasRef.current || !showMeshOverlay) return

    const overlay = overlayCanvasRef.current
    const ctx = overlay.getContext('2d')
    const width = overlay.width = overlay.clientWidth || 320
    const height = overlay.height = overlay.clientHeight || 240

    ctx.clearRect(0, 0, width, height)

    const { faceBounds, meshPoints, telemetry } = telemetryState
    if (!telemetry.faceDetected) return

    const bx = faceBounds.x * width
    const by = faceBounds.y * height
    const bw = faceBounds.width * width
    const bh = faceBounds.height * height

    // 1. Draw Target Brackets
    ctx.strokeStyle = currentTheme.color
    ctx.lineWidth = 2
    ctx.shadowColor = currentTheme.color
    ctx.shadowBlur = 8

    const cornerSize = Math.min(20, bw * 0.2)

    // Top-Left
    ctx.beginPath()
    ctx.moveTo(bx, by + cornerSize)
    ctx.lineTo(bx, by)
    ctx.lineTo(bx + cornerSize, by)
    ctx.stroke()

    // Top-Right
    ctx.beginPath()
    ctx.moveTo(bx + bw - cornerSize, by)
    ctx.lineTo(bx + bw, by)
    ctx.lineTo(bx + bw, by + cornerSize)
    ctx.stroke()

    // Bottom-Left
    ctx.beginPath()
    ctx.moveTo(bx, by + bh - cornerSize)
    ctx.lineTo(bx, by + bh)
    ctx.lineTo(bx + cornerSize, by + bh)
    ctx.stroke()

    // Bottom-Right
    ctx.beginPath()
    ctx.moveTo(bx + bw - cornerSize, by + bh)
    ctx.lineTo(bx + bw, by + bh)
    ctx.lineTo(bx + bw, by + bh - cornerSize)
    ctx.stroke()

    // 2. Draw Triangulated Face Mesh Connections
    if (meshPoints.length > 3) {
      ctx.strokeStyle = `${currentTheme.color}44`
      ctx.lineWidth = 1
      ctx.beginPath()

      for (let i = 0; i < meshPoints.length; i++) {
        const p1 = meshPoints[i]
        const p1x = p1.x * width
        const p1y = p1.y * height

        for (let j = i + 1; j < meshPoints.length; j++) {
          const p2 = meshPoints[j]
          const p2x = p2.x * width
          const p2y = p2.y * height
          const dist = Math.hypot(p1x - p2x, p1y - p2y)

          if (dist < width * 0.3) {
            ctx.moveTo(p1x, p1y)
            ctx.lineTo(p2x, p2y)
          }
        }
      }
      ctx.stroke()

      // 3. Draw Landmark Nodes
      meshPoints.forEach(p => {
        const px = p.x * width
        const py = p.y * height
        ctx.fillStyle = currentTheme.color
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Reset shadow
    ctx.shadowBlur = 0
  }, [telemetryState, isActive, showMeshOverlay, currentTheme.color])

  // Trigger Gemini Deep Scan
  const handleDeepScan = async () => {
    if (!isActive) return
    if (soundEnabled) playKeyClick()
    setIsDeepScanning(true)
    try {
      const result = await globalFacialAI.deepScanWithGemini()
      setDeepScanResult(result)
      if (result.primaryEmotion && onSyncMoodChange) {
        onSyncMoodChange(result.primaryEmotion)
      }
    } catch (err) {
      console.error('Deep scan error:', err)
    } finally {
      setIsDeepScanning(false)
    }
  }

  // Floating Mini-Widget View
  if (isFloating) {
    return (
      <motion.div
        className="facial-floating-widget"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        style={{ borderColor: currentTheme.color, boxShadow: `0 0 20px ${currentTheme.glow}` }}
      >
        <div className="floating-cam-preview">
          <video ref={videoRef} autoPlay playsInline muted className="floating-video" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="floating-emotion-tag" style={{ background: currentTheme.color, color: '#000' }}>
            <CurrentIcon size={12} />
            <span>{telemetryState.emotion.toUpperCase()}</span>
          </div>
        </div>

        <div className="floating-controls">
          <div className="floating-stat">
            <Activity size={12} style={{ color: currentTheme.color }} />
            <span>{telemetryState.telemetry.estimatedBPM} BPM</span>
          </div>
          <button 
            type="button"
            className="floating-btn"
            onClick={() => setIsFloating(false)}
            title="Mở rộng bảng điều khiển"
          >
            <Maximize2 size={13} />
          </button>
          {onCloseFloating && (
            <button 
              type="button"
              className="floating-btn close"
              onClick={onCloseFloating}
              title="Đóng widget"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // Full Studio & Telemetry View
  return (
    <div className="facial-emotion-detector-card" style={{ borderColor: currentTheme.color }}>
      {/* Header Banner */}
      <div className="facial-card-header">
        <div className="flex items-center gap-3">
          <div className="scanner-status-indicator" style={{ background: isActive ? currentTheme.color : '#64748b' }}>
            <span className={isActive ? 'ping-wave' : ''}></span>
          </div>
          <div>
            <div className="card-badge">
              <Eye size={13} /> NEURAL FACIAL VISION // BIOMETRICS 6.0
            </div>
            <h3 className="card-title">NHẬN DIỆN KHUÔN MẶT & ĐỒNG BỘ MÀU SẮC THỜI GIAN THỰC</h3>
          </div>
        </div>

        <div className="header-actions">
          {/* Auto-Sync Toggle */}
          <div className="sync-pill" title="Tự động đồng bộ màu sắc website theo biểu cảm">
            <Radio size={14} className={isAutoSyncEnabled ? 'animate-pulse text-cyan-400' : 'text-gray-500'} />
            <span>Đồng bộ Web:</span>
            <button
              type="button"
              className={`toggle-switch-sm ${isAutoSyncEnabled ? 'active' : ''}`}
              onClick={() => setIsAutoSyncEnabled && setIsAutoSyncEnabled(!isAutoSyncEnabled)}
            >
              <span className="slider-sm"></span>
            </button>
          </div>

          {/* Floating Widget Button */}
          {isActive && (
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => setIsFloating(true)}
              title="Thu nhỏ thành Camera nổi góc màn hình"
            >
              <Minimize2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="facial-scanner-grid">
        
        {/* Left Column: Cyber Camera Feed & Overlay HUD */}
        <div className="camera-view-container">
          <div className="video-viewport" style={{ borderColor: currentTheme.color }}>
            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`camera-feed ${isActive ? 'visible' : 'hidden'}`} 
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <canvas ref={overlayCanvasRef} className="mesh-overlay-canvas" />

            {/* Inactive Standby Screen */}
            {!isActive && (
              <div className="camera-standby-screen">
                <div className="standby-radar">
                  <Scan size={48} className="text-cyan-400 opacity-60 animate-pulse" />
                </div>
                <h4>CAMERA SCANNER ĐANG TẮT</h4>
                <p>Cấp quyền Camera để AI phân tích nét mặt (Vui tươi, Trầm tư, Căng thẳng, Thư giãn) và đổi màu toàn bộ website ngay tức thì.</p>
                <div className="privacy-badge">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Bảo mật 100%: Toàn bộ quá trình quét chạy trực tiếp trên trình duyệt của bạn</span>
                </div>
              </div>
            )}

            {/* Active Scanning Laser Line */}
            {isActive && (
              <div className="cyber-laser-scanner" style={{ background: currentTheme.gradient }} />
            )}

            {/* Target Reticle Tag */}
            {isActive && telemetryState.telemetry.faceDetected && (
              <div className="live-target-tag" style={{ borderColor: currentTheme.color, color: currentTheme.color }}>
                <span className="live-dot" style={{ background: currentTheme.color }}></span>
                <span>LOCK: {telemetryState.emotion.toUpperCase()} ({telemetryState.confidence[telemetryState.emotion]}%)</span>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="camera-control-bar">
            <button
              type="button"
              className={`cam-toggle-btn ${isActive ? 'danger' : 'primary'}`}
              onClick={toggleCamera}
              disabled={isStarting}
            >
              {isStarting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>ĐANG KÍCH HOẠT...</span>
                </>
              ) : isActive ? (
                <>
                  <CameraOff size={16} />
                  <span>TẮT CAMERA</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>BẬT CAMERA QUÉT BIỂU CẢM</span>
                </>
              )}
            </button>

            {isActive && (
              <>
                <button
                  type="button"
                  className="deep-scan-btn"
                  onClick={handleDeepScan}
                  disabled={isDeepScanning}
                  title="Chụp ảnh và gửi Gemini Vision phân tích vi biểu cảm chuyên sâu"
                >
                  {isDeepScanning ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>GEMINI ĐANG QUÉT...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>GEMINI DEEP SCAN ✨</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className={`mesh-toggle-btn ${showMeshOverlay ? 'active' : ''}`}
                  onClick={() => setShowMeshOverlay(!showMeshOverlay)}
                  title="Bật/Tắt lưới Face Mesh"
                >
                  <Scan size={15} />
                </button>
              </>
            )}
          </div>

          {errorMsg && (
            <div className="error-alert-banner">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Real-time Emotional Telemetry & Gemini Reflection */}
        <div className="facial-telemetry-panel">
          
          {/* Primary Emotion Status Card */}
          <div className="telemetry-emotion-card" style={{ borderColor: currentTheme.color, boxShadow: `0 0 20px ${currentTheme.glow}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CurrentIcon size={24} style={{ color: currentTheme.color }} />
                <div>
                  <div className="emotion-title" style={{ color: currentTheme.color }}>
                    {currentTheme.name}
                  </div>
                  <div className="emotion-desc">{currentTheme.desc}</div>
                </div>
              </div>

              <div className="confidence-pill" style={{ borderColor: currentTheme.color, color: currentTheme.color }}>
                {telemetryState.confidence[telemetryState.emotion]}% CONFIDENCE
              </div>
            </div>

            {/* Estimated Pulse BPM */}
            <div className="bpm-ticker-row">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-rose-400 animate-pulse" />
                <span className="text-xs text-gray-300">NHỊP ĐẬP TÂM THỨC (ESTIMATED):</span>
              </div>
              <span className="bpm-value" style={{ color: currentTheme.color }}>
                {telemetryState.telemetry.estimatedBPM} <span className="text-xs font-normal text-gray-400">BPM</span>
              </span>
            </div>
          </div>

          {/* Micro-Features Gauge Meters */}
          <div className="feature-gauges-matrix">
            {/* Smile Quotient */}
            <div className="gauge-item">
              <div className="gauge-header">
                <span className="gauge-label"><Smile size={13} className="inline text-cyan-400" /> Độ Mỉm Cười (Joy Index)</span>
                <span className="gauge-val text-cyan-400">{telemetryState.telemetry.smileQuotient}%</span>
              </div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${telemetryState.telemetry.smileQuotient}%`, background: '#00f0ff' }}></div>
              </div>
            </div>

            {/* Brow Tension */}
            <div className="gauge-item">
              <div className="gauge-header">
                <span className="gauge-label"><Flame size={13} className="inline text-rose-400" /> Độ Căng Cung Mày (Tension)</span>
                <span className="gauge-val text-rose-400">{telemetryState.telemetry.browTension}%</span>
              </div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${telemetryState.telemetry.browTension}%`, background: '#ef4444' }}></div>
              </div>
            </div>

            {/* Eye Openness */}
            <div className="gauge-item">
              <div className="gauge-header">
                <span className="gauge-label"><Eye size={13} className="inline text-emerald-400" /> Độ Mở Ánh Mắt (Focus)</span>
                <span className="gauge-val text-emerald-400">{telemetryState.telemetry.eyeOpenness}%</span>
              </div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${telemetryState.telemetry.eyeOpenness}%`, background: '#10b981' }}></div>
              </div>
            </div>

            {/* Head Movement */}
            <div className="gauge-item">
              <div className="gauge-header">
                <span className="gauge-label"><Zap size={13} className="inline text-amber-400" /> Nhịp Vận Động Đầu (Dynamics)</span>
                <span className="gauge-val text-amber-400">{telemetryState.telemetry.headMovement}%</span>
              </div>
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${telemetryState.telemetry.headMovement}%`, background: '#f59e0b' }}></div>
              </div>
            </div>
          </div>

          {/* 4-Emotion Distribution Bars */}
          <div className="distribution-bars-group">
            <div className="group-title">// PHỔ CẢM XÚC SINH TRẮC HỌC (EMOTIONAL SPECTRUM)</div>
            {Object.entries(emotionConfig).map(([k, item]) => {
              const ItemIcon = item.icon
              const pct = telemetryState.confidence[k] || 0
              const isSelected = telemetryState.emotion === k

              return (
                <div key={k} className={`dist-bar-item ${isSelected ? 'active' : ''}`}>
                  <div className="dist-label-row">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: isSelected ? item.color : '#94a3b8' }}>
                      <ItemIcon size={13} />
                      {item.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: item.color }}>{pct}%</span>
                  </div>
                  <div className="dist-track">
                    <div 
                      className="dist-fill" 
                      style={{ 
                        width: `${pct}%`, 
                        background: item.gradient,
                        boxShadow: isSelected ? `0 0 10px ${item.glow}` : 'none' 
                      }} 
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gemini Deep Scan Result Card */}
          <AnimatePresence>
            {deepScanResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="gemini-deep-scan-result"
                style={{ borderColor: deepScanResult.recommendedTheme?.hexPrimary || currentTheme.color }}
              >
                <div className="deep-scan-header">
                  <Sparkles size={16} className="text-amber-300 animate-spin" />
                  <span>KẾT QUẢ PHÂN TÍCH VI BIỂU CẢM (GEMINI VISION)</span>
                </div>

                <div className="deep-scan-body">
                  <div className="deep-emotion-highlight" style={{ color: deepScanResult.recommendedTheme?.hexPrimary || currentTheme.color }}>
                    {deepScanResult.emotionNameVi} ({deepScanResult.confidenceScore}%)
                  </div>
                  <p className="deep-analysis-text">
                    {deepScanResult.microExpressionAnalysis}
                  </p>
                  {deepScanResult.suggestedAffirmation && (
                    <div className="deep-affirmation-quote">
                      "{deepScanResult.suggestedAffirmation}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  )
}
