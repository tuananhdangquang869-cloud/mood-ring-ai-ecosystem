import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Compass, 
  RotateCw, 
  Headphones, 
  Radio, 
  Sliders, 
  Layers, 
  Sparkles, 
  Check,
  Zap,
  X
} from 'lucide-react'
import { globalSpatialAudio, SPATIAL_PRESETS } from '../utils/spatialAudioEngine.js'
import { playKeyClick } from '../utils/audioSynth.js'

export default function SpatialAudioRadar({ soundEnabled = true, isCompact = false, onClose = null }) {
  const [audioState, setAudioState] = useState(() => ({
    isPlaying: globalSpatialAudio.isPlaying,
    currentPreset: globalSpatialAudio.currentPreset,
    coords: { ...globalSpatialAudio.coords },
    angle: globalSpatialAudio.angle,
    radius: globalSpatialAudio.radius,
    elevation: globalSpatialAudio.elevation,
    orbitSpeed: globalSpatialAudio.orbitSpeed,
    autoOrbit: globalSpatialAudio.autoOrbit,
    volume: globalSpatialAudio.volume,
    multiSource: globalSpatialAudio.multiSource
  }))

  const [isDragging, setIsDragging] = useState(false)
  const [testingSweep, setTestingSweep] = useState(false)
  const radarRef = useRef(null)
  const containerRef = useRef(null)

  // Drag-to-pan / touch-to-scroll gesture for hand & mouse
  const handleContentPointerDown = (e) => {
    // Ignore interactive controls so dragging sliders or radar ball works normally
    if (e.target.closest('button, input, select, a, .spatial-radar-disk, .radar-sound-source')) {
      return
    }
    const container = containerRef.current?.closest('.spatial-standalone-card') || containerRef.current?.closest('.settings-content-panel') || containerRef.current
    if (!container) return

    const startY = e.clientY
    const startScrollTop = container.scrollTop

    const onPointerMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      container.scrollTop = startScrollTop - deltaY
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  // Subscribe to Spatial Audio Engine updates (60fps updates during orbit)
  useEffect(() => {
    const unsubscribe = globalSpatialAudio.subscribe((state) => {
      setAudioState(state)
    })
    return () => unsubscribe()
  }, [])

  // Handle Dragging Sound Source on Radar
  const handleRadarPointer = (e) => {
    if (!radarRef.current) return
    const rect = radarRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Normalized coordinates (-1 to 1)
    const normX = (e.clientX - centerX) / (rect.width / 2)
    const normY = (e.clientY - centerY) / (rect.height / 2)

    // Scale to -6 to 6 meters
    const scaledX = Math.max(-6, Math.min(6, normX * 6))
    const scaledZ = Math.max(-6, Math.min(6, normY * 6))

    globalSpatialAudio.setAutoOrbit(false)
    globalSpatialAudio.setManualPosition(scaledX, scaledZ)
  }

  const handlePointerDown = (e) => {
    setIsDragging(true)
    handleRadarPointer(e)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) handleRadarPointer(e)
    }
    const handlePointerUp = () => {
      if (isDragging) setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging])

  const currentPresetData = SPATIAL_PRESETS.find(p => p.id === audioState.currentPreset) || SPATIAL_PRESETS[0]

  // Map 3D coords to 2D radar percentage (0% to 100%)
  const radarPercentX = 50 + (audioState.coords.x / 7) * 44
  const radarPercentY = 50 + (audioState.coords.z / 7) * 44

  const secondaryPercentX = 50 + (-audioState.coords.x / 7) * 44
  const secondaryPercentY = 50 + (-audioState.coords.z / 7) * 44

  return (
    <div 
      ref={containerRef}
      data-lenis-prevent
      className={`spatial-radar-container ${isCompact ? 'compact-mode' : ''}`}
      onPointerDown={handleContentPointerDown}
    >
      {/* Header Bar */}
      <div className="spatial-header-bar">
        <div className="flex items-center gap-2.5">
          <div className="spatial-status-pulse">
            <Radio size={16} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="spatial-tag">// 3D BINAURAL HRTF AUDIO //</span>
            <h4 className="spatial-title">ÂM THANH KHÔNG GIAN 3D</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="spatial-headphone-badge">
            <Headphones size={13} />
            <span>KHUYÊN DÙNG TAI NGHE</span>
          </span>
          {onClose && (
            <button 
              className="spatial-close-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                onClose()
              }}
              title="Đóng Spatial Radar"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Radar Display (Left) + Controls (Right) */}
      <div className="spatial-grid-layout">
        
        {/* 1. Radar Stage */}
        <div className="spatial-radar-stage">
          <div 
            ref={radarRef}
            className="spatial-radar-disk"
            onPointerDown={handlePointerDown}
          >
            {/* Concentric Radar Grid Rings */}
            <div className="radar-ring ring-outer" />
            <div className="radar-ring ring-mid" />
            <div className="radar-ring ring-inner" />
            
            {/* Crosshairs */}
            <div className="radar-crosshair axis-x" />
            <div className="radar-crosshair axis-y" />

            {/* Orbit Path Ring */}
            <div 
              className="radar-orbit-track"
              style={{
                width: `${(audioState.radius / 7) * 88}%`,
                height: `${(audioState.radius / 7) * 88}%`
              }}
            />

            {/* Center Listener Head */}
            <div className="radar-listener-head">
              <div className="listener-ears ear-left" />
              <Headphones size={22} className="listener-icon" />
              <div className="listener-ears ear-right" />
              <div className="listener-gaze-arrow" />
              <span className="listener-label">BẠN (LISTENER)</span>
            </div>

            {/* Primary Sound Source Emitter Orb */}
            <motion.div 
              className={`radar-sound-source ${audioState.isPlaying ? 'active' : ''}`}
              style={{
                left: `${radarPercentX}%`,
                top: `${radarPercentY}%`,
                borderColor: currentPresetData.color,
                boxShadow: `0 0 20px ${currentPresetData.color}`
              }}
              animate={{ scale: audioState.isPlaying ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="source-core-dot" style={{ backgroundColor: currentPresetData.color }} />
              <div className="source-pulse-wave" style={{ borderColor: currentPresetData.color }} />
              <span className="source-label" style={{ color: currentPresetData.color }}>
                {currentPresetData.icon} {currentPresetData.name}
              </span>
            </motion.div>

            {/* Secondary Opposite Emitter Orb if Multi-Source active */}
            {audioState.multiSource && (
              <motion.div
                className="radar-sound-source secondary"
                style={{
                  left: `${secondaryPercentX}%`,
                  top: `${secondaryPercentY}%`
                }}
                animate={{ scale: audioState.isPlaying ? [1, 1.15, 1] : 1 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="source-core-dot secondary" />
                <span className="source-label secondary">✨ Vòm Phụ</span>
              </motion.div>
            )}

            {/* Radar Coordinates HUD Badge */}
            <div className="radar-coords-hud">
              <span>X: {audioState.coords.x.toFixed(1)}m</span>
              <span>Y: {audioState.coords.y.toFixed(1)}m</span>
              <span>Z: {audioState.coords.z.toFixed(1)}m</span>
            </div>
          </div>

          <p className="radar-instruction-text">
            💡 Nhấp & kéo quả cầu trên Radar để định vị nguồn âm 3D trong không gian tai của bạn.
          </p>
        </div>

        {/* 2. Controls & Preset Panel */}
        <div className="spatial-controls-column">
          
          {/* Preset Selector Carousel */}
          <div className="spatial-control-box">
            <span className="control-box-title">// MÔI TRƯỜNG ÂM THANH (PRESETS) //</span>
            <div className="spatial-presets-list">
              {SPATIAL_PRESETS.map((preset) => {
                const isSelected = audioState.currentPreset === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`spatial-preset-btn ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      if (soundEnabled) playKeyClick()
                      globalSpatialAudio.playPreset(preset.id)
                    }}
                    style={{
                      borderColor: isSelected ? preset.color : undefined
                    }}
                  >
                    <span className="preset-icon">{preset.icon}</span>
                    <div className="preset-info">
                      <div className="preset-name" style={{ color: isSelected ? preset.color : undefined }}>
                        {preset.name}
                      </div>
                      <div className="preset-desc">{preset.desc}</div>
                    </div>
                    {isSelected && (
                      <span className="preset-active-check" style={{ color: preset.color }}>
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Master Playback & Orbit Tuning */}
          <div className="spatial-control-box">
            <span className="control-box-title">// ĐIỀU KHIỂN ĐỘNG HỌC 3D //</span>
            
            {/* Play/Stop & Auto Orbit Button Row */}
            <div className="spatial-action-buttons">
              <button
                type="button"
                className={`spatial-play-btn ${audioState.isPlaying ? 'playing' : ''}`}
                onClick={() => {
                  if (soundEnabled) playKeyClick()
                  globalSpatialAudio.togglePlay()
                }}
              >
                {audioState.isPlaying ? (
                  <>
                    <Pause size={16} />
                    <span>TẠM DỪNG ÂM THANH 3D</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>BẬT ÂM THANH KHÔNG GIAN</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className={`spatial-toggle-btn ${audioState.autoOrbit ? 'active' : ''}`}
                onClick={() => {
                  if (soundEnabled) playKeyClick()
                  globalSpatialAudio.setAutoOrbit(!audioState.autoOrbit)
                }}
                title="Tự động xoay 360 độ quanh đầu người nghe"
              >
                <RotateCw size={15} className={audioState.autoOrbit && audioState.isPlaying ? 'animate-spin-slow' : ''} />
                <span>XOAY 3D TỰ ĐỘNG</span>
              </button>
            </div>

            {/* Sliders: Speed, Radius, Height, Volume */}
            <div className="spatial-sliders-stack">
              <div className="slider-item">
                <div className="slider-label-row">
                  <span>TỐC ĐỘ XOAY 3D:</span>
                  <span className="text-cyan-400 font-mono">{audioState.orbitSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={audioState.orbitSpeed}
                  onChange={(e) => globalSpatialAudio.setOrbitSpeed(parseFloat(e.target.value))}
                  className="spatial-range-slider"
                />
              </div>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>KHOẢNG CÁCH ÂM TRƯỜNG:</span>
                  <span className="text-cyan-400 font-mono">{audioState.radius.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="0.2"
                  value={audioState.radius}
                  onChange={(e) => globalSpatialAudio.setRadius(parseFloat(e.target.value))}
                  className="spatial-range-slider"
                />
              </div>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>CAO ĐỘ NGUỒN ÂM (Y-AXIS):</span>
                  <span className="text-cyan-400 font-mono">{audioState.elevation > 0 ? `+${audioState.elevation.toFixed(1)}m` : `${audioState.elevation.toFixed(1)}m`}</span>
                </div>
                <input
                  type="range"
                  min="-3"
                  max="3"
                  step="0.2"
                  value={audioState.elevation}
                  onChange={(e) => globalSpatialAudio.setElevation(parseFloat(e.target.value))}
                  className="spatial-range-slider"
                />
              </div>

              <div className="slider-item">
                <div className="slider-label-row">
                  <span>ÂM LƯỢNG MÔI TRƯỜNG:</span>
                  <span className="text-cyan-400 font-mono">{Math.round(audioState.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audioState.volume}
                  onChange={(e) => globalSpatialAudio.setVolume(parseFloat(e.target.value))}
                  className="spatial-range-slider"
                />
              </div>
            </div>

            {/* Test 360° Binaural Sweep */}
            <div className="pt-2 border-t border-cyan-500/20 flex gap-2">
              <button
                type="button"
                className="spatial-test-btn"
                onClick={() => {
                  if (soundEnabled) playKeyClick()
                  setTestingSweep(true)
                  globalSpatialAudio.runBinauralTest()
                  setTimeout(() => setTestingSweep(false), 4400)
                }}
                disabled={testingSweep}
              >
                <Radio size={14} className={testingSweep ? 'animate-ping' : ''} />
                <span>{testingSweep ? 'ĐANG QUÉT 360°...' : 'QUÉT THỬ ÂM THANH 360° (TEST)'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
