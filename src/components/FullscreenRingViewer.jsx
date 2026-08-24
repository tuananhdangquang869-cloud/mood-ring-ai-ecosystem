import { useState, useRef, useEffect, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom, Glitch, ChromaticAberration } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import AICore from '../AICore'
import { 
  ArrowLeft, 
  Share2, 
  Camera, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Sliders, 
  Layers, 
  Sparkles as SparklesIcon, 
  Compass, 
  Check, 
  Eye, 
  Activity, 
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Palette
} from 'lucide-react'

// Spectral Mood Palettes
const MOOD_OPTIONS = [
  { id: 'calm', name: 'Bình Yên', sub: 'Emerald Serenity', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'joy', name: 'Hân Hoan', sub: 'Cyan Resonance', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' },
  { id: 'melancholy', name: 'Trầm Lắng', sub: 'Deep Sapphire', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { id: 'friction', name: 'Bất An', sub: 'Amber Turmoil', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'breach', name: 'Đột Biến', sub: 'Crimson Critical', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  { id: 'relaxed', name: 'Huyền Bí', sub: 'Amethyst Cosmic', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' }
]

// Camera Angle Presets
const CAMERA_PRESETS = [
  { id: 'front', label: 'Toàn Cảnh 0°', pos: [0, 0, 16], target: [0, 0, 0] },
  { id: 'iso', label: 'Nghiêng 45°', pos: [12, 10, 12], target: [0, 0, 0] },
  { id: 'macro', label: 'Cận Cảnh Lõi', pos: [0, 0, 8.5], target: [0, 0, 0] },
  { id: 'top', label: 'Từ Trên Xuống', pos: [0, 18, 0.1], target: [0, 0, 0] },
  { id: 'wide', label: 'Góc Thiên Hà', pos: [0, 5, 28], target: [0, 0, 0] }
]

// Custom Camera Manager Component for Orbit Controls and Smooth Angle Transitions
function InteractiveCameraDirector({ cameraPreset, autoRotate, rotateSpeed, isMobile }) {
  const { camera } = useThree()
  const controlsRef = useRef(null)

  useEffect(() => {
    if (!cameraPreset) return
    const targetPreset = CAMERA_PRESETS.find(p => p.id === cameraPreset)
    if (targetPreset && controlsRef.current) {
      const yOffset = isMobile ? 1.0 : 0
      const zMult = isMobile ? 1.08 : 1.0
      camera.position.set(targetPreset.pos[0], targetPreset.pos[1] + yOffset, targetPreset.pos[2] * zMult)
      controlsRef.current.target.set(targetPreset.target[0], targetPreset.target[1] + yOffset, targetPreset.target[2])
      controlsRef.current.update()
    }
  }, [cameraPreset, camera, isMobile])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.6}
      minDistance={4}
      maxDistance={45}
      autoRotate={autoRotate}
      autoRotateSpeed={rotateSpeed * 1.5}
      makeDefault
    />
  )
}

// 3D Scene Wrapper with Snapshot Canvas Ref Handler
function RingViewerScene({ 
  mood, 
  wireframeMode, 
  showParticles, 
  bloomIntensity, 
  cameraPreset, 
  autoRotate, 
  rotateSpeed,
  isMobile,
  onGlReady
}) {
  const normalizedMood = 
    mood === 'joy' ? 'joy' :
    mood === 'melancholy' ? 'melancholy' :
    mood === 'friction' ? 'friction' :
    mood === 'breach' || mood === 'anger' ? 'breach' :
    mood === 'relaxed' ? 'relaxed' : (mood || 'calm')

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 12, 10]} intensity={1.8} color="#ffffff" />
      <pointLight 
        intensity={2.8} 
        position={[12, 12, 12]} 
        color={
          normalizedMood === 'breach' ? '#ff4d4d' : 
          normalizedMood === 'friction' ? '#ffae42' : 
          normalizedMood === 'melancholy' ? '#60a5fa' :
          normalizedMood === 'relaxed' ? '#c084fc' : '#00f0ff'
        } 
      />
      <pointLight 
        intensity={1.8} 
        position={[-12, -8, -10]} 
        color={
          normalizedMood === 'breach' ? '#ff0055' : 
          normalizedMood === 'friction' ? '#f59e0b' : 
          normalizedMood === 'melancholy' ? '#3b82f6' :
          normalizedMood === 'relaxed' ? '#9333ea' : '#10b981'
        } 
      />

      <Stars radius={150} depth={80} count={3000} factor={6} fade speed={1} />

      {showParticles && (
        <Float speed={autoRotate ? 2 : 0.8} floatIntensity={1.2} rotationIntensity={0.6}>
          <Sparkles 
            count={180} 
            size={1.4} 
            speed={rotateSpeed * 0.8} 
            color={
              normalizedMood === 'breach' ? '#ff4d4d' : 
              normalizedMood === 'friction' ? '#f59e0b' : 
              normalizedMood === 'melancholy' ? '#60a5fa' :
              normalizedMood === 'relaxed' ? '#c084fc' : '#00f0ff'
            } 
          />
        </Float>
      )}

      {/* 🔮 3D QUANTUM MOOD RING CORE */}
      <AICore mood={normalizedMood} lowGraphics={false} />

      {/* Interactive OrbitControls */}
      <InteractiveCameraDirector 
        cameraPreset={cameraPreset} 
        autoRotate={autoRotate} 
        rotateSpeed={rotateSpeed} 
        isMobile={isMobile}
      />

      {/* Postprocessing Bloom */}
      <EffectComposer multisampling={0}>
        <Bloom 
          intensity={bloomIntensity} 
          luminanceThreshold={0.18} 
          luminanceSmoothing={0.8} 
        />
        {normalizedMood === 'breach' && (
          <ChromaticAberration offset={[0.0025, 0.0025]} blendFunction={1} />
        )}
      </EffectComposer>
    </>
  )
}

export default function FullscreenRingViewer({ currentMood = 'calm', onBackToHome, soundEnabled = false }) {
  const [activeMood, setActiveMood] = useState(currentMood)
  const [cameraPreset, setCameraPreset] = useState('front')
  const [autoRotate, setAutoRotate] = useState(true)
  const [rotateSpeed, setRotateSpeed] = useState(1.0)
  const [showParticles, setShowParticles] = useState(true)
  const [bloomIntensity, setBloomIntensity] = useState(1.2)
  const [wireframeMode, setWireframeMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false)
  const [mobilePanelExpanded, setMobilePanelExpanded] = useState(false)
  
  const canvasRef = useRef(null)

  // Detect mobile resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Direct shareable URL generation
  const getDirectShareUrl = useCallback(() => {
    const origin = window.location.origin
    const path = window.location.pathname
    return `${origin}${path}?view=ring`
  }, [])

  // Copy Direct Link to Clipboard
  const handleCopyDirectLink = useCallback(() => {
    const link = getDirectShareUrl()
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        setToastMessage('🔗 Đã sao chép liên kết toàn màn hình chiếc nhẫn!')
      }).catch(() => {
        setToastMessage(`🔗 Đường link: ${link}`)
      })
    } else {
      setToastMessage(`🔗 Đường link: ${link}`)
    }
  }, [getDirectShareUrl])

  // Clear toast after 3.5s
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Native Browser Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(err => console.error(err))
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false)
        }).catch(err => console.error(err))
      }
    }
  }, [])

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Take High-Res 3D Ring Snapshot
  const handleCaptureSnapshot = useCallback(() => {
    if (!canvasRef.current) return
    try {
      const canvas = canvasRef.current.querySelector('canvas')
      if (canvas) {
        const imageUri = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = imageUri
        downloadLink.download = `mood-ring-3d-snapshot-${activeMood}-${Date.now()}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        setToastMessage('📸 Đã chụp ảnh chiếc nhẫn 3D thành công!')
      }
    } catch (e) {
      setToastMessage('⚠️ Không thể xuất ảnh trực tiếp từ WebGL buffer!')
    }
  }, [activeMood])

  return (
    <div className="ring-viewer-container" ref={canvasRef}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            className="cyber-toast"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
          >
            <Check size={18} color="#00f0ff" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D WebGL Canvas Viewport */}
      <div className="ring-canvas-viewport">
        <Canvas
          camera={{ position: [0, isMobile ? 1.0 : 0, 16], fov: isMobile ? 48 : 45 }}
          dpr={[1, 2]}
          gl={{ 
            powerPreference: 'high-performance', 
            antialias: true, 
            preserveDrawingBuffer: true,
            alpha: false
          }}
        >
          <RingViewerScene
            mood={activeMood}
            wireframeMode={wireframeMode}
            showParticles={showParticles}
            bloomIntensity={bloomIntensity}
            cameraPreset={cameraPreset}
            autoRotate={autoRotate}
            rotateSpeed={rotateSpeed}
            isMobile={isMobile}
          />
        </Canvas>
      </div>

      {/* Top Header Navigation */}
      <header className="ring-viewer-header">
        <div className="ring-header-left">
          <button 
            className="ring-back-btn" 
            onClick={onBackToHome}
            title="Quay lại Trang Chủ Cốt Truyện"
          >
            <ArrowLeft size={16} />
            <span>TRANG CHỦ</span>
          </button>

          <div className="ring-title-box">
            <div className="ring-main-title">
              <span>🪐 TOÀN CẢNH CHIẾC NHẪN CẢM XÚC</span>
              <span className="live-indicator-dot"></span>
            </div>
            <div className="ring-sub-title">
              <span>MR-CORE-01</span>
              <span>//</span>
              <span>3D FULLSCREEN QUANTUM ORBIT</span>
            </div>
          </div>
        </div>

        <div className="ring-header-actions">
          <button 
            className="ring-action-btn primary-link-btn"
            onClick={handleCopyDirectLink}
            title="Sao chép đường link trực tiếp tới chế độ toàn màn hình này (?view=ring)"
          >
            <Share2 size={15} className="btn-icon" />
            <span>SAO CHÉP LINK TRỰC TIẾP</span>
          </button>

          <button 
            className="ring-action-btn"
            onClick={handleCaptureSnapshot}
            title="Chụp ảnh 3D chiếc nhẫn tải về máy"
          >
            <Camera size={15} className="btn-icon" />
            <span>CHỤP ẢNH 3D</span>
          </button>

          <button 
            className="ring-action-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở toàn màn hình trình duyệt (F11)'}
          >
            {isFullscreen ? <Minimize2 size={15} className="btn-icon" /> : <Maximize2 size={15} className="btn-icon" />}
            <span>{isFullscreen ? 'THU NHỎ' : 'FULLSCREEN'}</span>
          </button>
        </div>
      </header>

      {/* Left Diagnostics / Telemetry Sidebar (Desktop Only) */}
      <aside className="ring-telemetry-sidebar">
        <div className="telemetry-header">
          <div className="telemetry-title">
            <Activity size={14} />
            <span>TELEMETRY QUANTUM</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
        </div>

        <div className="telemetry-stat-row">
          <span className="telemetry-label">Trạng Thái Sắc Thái</span>
          <span className="telemetry-val highlight">{activeMood.toUpperCase()}</span>
        </div>
        <div className="telemetry-stat-row">
          <span className="telemetry-label">Tần Số Dao Động</span>
          <span className="telemetry-val">{(rotateSpeed * 60).toFixed(1)} Hz</span>
        </div>
        <div className="telemetry-stat-row">
          <span className="telemetry-label">Năng Lượng Lõi (Flux)</span>
          <span className="telemetry-val highlight">99.8% NOMINAL</span>
        </div>
        <div className="telemetry-stat-row">
          <span className="telemetry-label">Chu Kỳ Xung Nhịp</span>
          <span className="telemetry-val">{(1.2 / (rotateSpeed || 0.1)).toFixed(2)}s</span>
        </div>
        <div className="telemetry-stat-row">
          <span className="telemetry-label">Mật Độ Lưới 3D</span>
          <span className="telemetry-val">28,450 Polygons</span>
        </div>
        <div className="telemetry-stat-row">
          <span className="telemetry-label">Góc Nhìn Hiện Tại</span>
          <span className="telemetry-val highlight">{cameraPreset.toUpperCase()}</span>
        </div>
      </aside>

      {/* Interactive Controls Panel (Collapsible Drawer on Mobile) */}
      <aside 
        className={`ring-controls-sidebar ${isMobile && !mobilePanelExpanded ? 'compact' : ''}`}
        data-lenis-prevent
      >
        {/* Mobile Header Bar Handle with Toggle */}
        {isMobile && (
          <div 
            className="mobile-drawer-handle-bar"
            onClick={() => setMobilePanelExpanded(!mobilePanelExpanded)}
          >
            <div className="drawer-pull-pill"></div>
            <div className="drawer-handle-info">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-cyan-400" />
                <span className="drawer-handle-title font-bold text-xs">
                  {mobilePanelExpanded ? 'BẢNG ĐIỀU KHIỂN & GÓC NHÌN 3D' : `PHỔ MÀU: ${MOOD_OPTIONS.find(m => m.id === activeMood)?.name.toUpperCase()}`}
                </span>
              </div>
              <button type="button" className="drawer-toggle-btn">
                {mobilePanelExpanded ? (
                  <span className="flex items-center gap-1"><span>Thu gọn</span> <ChevronDown size={14} /></span>
                ) : (
                  <span className="flex items-center gap-1"><span>Tùy chỉnh</span> <ChevronUp size={14} /></span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Compact Mode on Mobile: Horizontal scrollable mood chips + quick cam toggle */}
        {isMobile && !mobilePanelExpanded ? (
          <div className="mobile-compact-mood-strip">
            <div className="mobile-mood-scroll">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = activeMood === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`mobile-mood-chip ${isSelected ? 'active' : ''}`}
                    style={{
                      borderColor: isSelected ? m.color : 'rgba(255,255,255,0.12)',
                      background: isSelected ? `linear-gradient(135deg, ${m.glow}, rgba(15,23,42,0.9))` : 'rgba(15,23,42,0.6)'
                    }}
                    onClick={() => setActiveMood(m.id)}
                  >
                    <span className="mobile-chip-dot" style={{ backgroundColor: m.color, boxShadow: isSelected ? `0 0 8px ${m.color}` : 'none' }}></span>
                    <span className="mobile-chip-name" style={{ color: isSelected ? '#ffffff' : '#cbd5e1' }}>{m.name}</span>
                  </button>
                )
              })}
            </div>

            <button 
              type="button"
              className="mobile-quick-cam-btn"
              onClick={() => {
                const nextIdx = (CAMERA_PRESETS.findIndex(p => p.id === cameraPreset) + 1) % CAMERA_PRESETS.length
                setCameraPreset(CAMERA_PRESETS[nextIdx].id)
              }}
              title="Đổi góc nhìn camera"
            >
              <Eye size={13} />
              <span>{CAMERA_PRESETS.find(p => p.id === cameraPreset)?.label.replace('Toàn Cảnh ', '').replace('Góc ', '') || 'Góc 3D'}</span>
            </button>
          </div>
        ) : (
          /* Full Controls: Rendered on Desktop OR when Expanded on Mobile */
          <>
            {/* Mood Selection Section */}
            <div>
              <div className="control-section-title">
                <Zap size={14} />
                <span>PHỔ MÀU CẢM XÚC</span>
              </div>
              <div className="ring-mood-grid">
                {MOOD_OPTIONS.map((m) => (
                  <div
                    key={m.id}
                    className={`ring-mood-card ${activeMood === m.id ? 'active' : ''}`}
                    style={{
                      '--card-accent': m.color,
                      '--card-glow': m.glow
                    }}
                    onClick={() => setActiveMood(m.id)}
                    title={m.sub}
                  >
                    <div className="mood-card-dot" style={{ backgroundColor: m.color, color: m.color }} />
                    <span className="mood-card-name">{m.name}</span>
                    <span className="mood-card-sub">{m.id}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Camera Angle Presets */}
            <div>
              <div className="control-section-title">
                <Compass size={14} />
                <span>GÓC NHÌN CAMERA 3D</span>
              </div>
              <div className="camera-presets-grid">
                {CAMERA_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className={`cam-preset-btn ${cameraPreset === p.id ? 'active' : ''}`}
                    onClick={() => setCameraPreset(p.id)}
                  >
                    <Eye size={12} />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optical & Physics Controls */}
            <div>
              <div className="control-section-title">
                <Sliders size={14} />
                <span>ĐIỀU CHỈNH QUANG HỌC</span>
              </div>
              
              <div className="setting-row">
                <span>Tự Động Xoay 360°</span>
                <button 
                  className={`setting-toggle-btn ${autoRotate ? 'active' : ''}`}
                  onClick={() => setAutoRotate(!autoRotate)}
                >
                  {autoRotate ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              <div className="slider-container" style={{ margin: '8px 0' }}>
                <div className="setting-row">
                  <span className="text-[10px] text-slate-400">Tốc Độ Xoay:</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{rotateSpeed.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="3.0" 
                  step="0.1" 
                  value={rotateSpeed} 
                  onChange={(e) => setRotateSpeed(parseFloat(e.target.value))}
                />
              </div>

              <div className="setting-row">
                <span>Hạt Lượng Tử (Particles)</span>
                <button 
                  className={`setting-toggle-btn ${showParticles ? 'active' : ''}`}
                  onClick={() => setShowParticles(!showParticles)}
                >
                  {showParticles ? 'BẬT' : 'TẮT'}
                </button>
              </div>

              <div className="slider-container" style={{ margin: '8px 0' }}>
                <div className="setting-row">
                  <span className="text-[10px] text-slate-400">Cường Độ Phát Sáng (Bloom):</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{bloomIntensity.toFixed(1)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" 
                  max="2.5" 
                  step="0.1" 
                  value={bloomIntensity} 
                  onChange={(e) => setBloomIntensity(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Bottom Floating Interaction Hint Bar */}
      <footer className="ring-viewer-bottom-bar">
        {isMobile ? (
          <>
            <div className="hint-item">
              <span className="hint-key">👆 1 NGÓN</span>
              <span>Xoay 360°</span>
            </div>
            <span>•</span>
            <div className="hint-item">
              <span className="hint-key">🤏 2 NGÓN</span>
              <span>Phóng to / thu nhỏ</span>
            </div>
          </>
        ) : (
          <>
            <div className="hint-item">
              <span className="hint-key">KÉO CHUỘT</span>
              <span>Xoay 360°</span>
            </div>
            <span>•</span>
            <div className="hint-item">
              <span className="hint-key">CUỘN CHUỘT</span>
              <span>Zoom In/Out</span>
            </div>
            <span>•</span>
            <div className="hint-item">
              <span className="hint-key">PHẢI CHUỘT</span>
              <span>Di chuyển vị trí (Pan)</span>
            </div>
          </>
        )}
      </footer>
    </div>
  )
}
