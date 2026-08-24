import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Settings as SettingsIcon, 
  Sparkles, 
  Mic, 
  Loader2,
  ChevronDown,
  RotateCcw,
  BookOpen
} from 'lucide-react'
import { 
  ttsState, 
  subscribeTTS, 
  playStoryText, 
  togglePauseStoryTTS, 
  stopStoryTTS, 
  seekStoryTTS, 
  setTTSSpeed, 
  CURATED_VOICES,
  updateTTSSettings 
} from '../utils/ttsVoiceEngine.js'
import { playKeyClick } from '../utils/audioSynth.js'

export default function StoryTTSPlayer({
  storyNode = null,
  journeyPath = [],
  storyData = {},
  onOpenSettings = () => {},
  soundEnabled = true,
  variant = 'horizontal' // 'horizontal' | 'compact' | 'card'
}) {
  const [tts, setTts] = useState({ ...ttsState })
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false)
  const [readMode, setReadMode] = useState('current') // 'current' | 'full-journey'

  useEffect(() => {
    const unsub = subscribeTTS((newState) => {
      setTts(newState)
    })
    return () => unsub()
  }, [])

  const currentVoice = CURATED_VOICES.find(v => v.id === tts.activeVoiceId) || CURATED_VOICES[0]

  const handlePlayCurrentStory = () => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()

    if (tts.isPlaying && !tts.isPaused) {
      togglePauseStoryTTS()
      return
    }

    if (tts.isPaused) {
      togglePauseStoryTTS()
      return
    }

    if (!storyNode && !storyData) return

    if (readMode === 'full-journey' && journeyPath && journeyPath.length > 0) {
      // Concatenate journey narratives
      const fullText = journeyPath
        .map(k => storyData[k]?.narrative || '')
        .filter(Boolean)
        .join('. ')
      playStoryText(fullText, `Hành trình tâm thức (${journeyPath.length} chương)`, { voiceId: tts.activeVoiceId })
    } else {
      const title = storyNode?.title || 'Lõi Nhận Thức'
      const narrative = storyNode?.narrative || ''
      playStoryText(narrative, title, { voiceId: tts.activeVoiceId })
    }
  }

  const handleStop = () => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    stopStoryTTS()
  }

  const handleCycleSpeed = () => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    const speeds = [1.0, 1.25, 1.5, 0.85]
    const nextIdx = (speeds.indexOf(tts.speed) + 1) % speeds.length
    setTTSSpeed(speeds[nextIdx >= 0 ? nextIdx : 0])
  }

  const handleSelectVoice = (voiceId) => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    updateTTSSettings({ activeVoiceId: voiceId })
    setIsVoiceDropdownOpen(false)

    // If already playing, restart with new voice
    if (tts.isPlaying) {
      const currentNarrative = tts.currentText
      const currentTitle = tts.currentTitle
      playStoryText(currentNarrative, currentTitle, { voiceId })
    }
  }

  const formatTime = (secs) => {
    if (isNaN(secs) || secs <= 0) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className={`story-tts-player-container ${variant} ${tts.isPlaying ? 'is-playing' : ''}`}>
      {/* Glow highlight line */}
      <div className="tts-top-glow" />

      <div className="tts-player-inner">
        {/* Top Bar: Play/Stop & Voice Selector on Left, Speed/Mode/Settings on Right */}
        <div className="tts-top-bar">
          <div className="tts-control-left">
            <button
              type="button"
              className={`tts-play-btn ${tts.isPlaying ? 'playing' : ''} ${tts.isLoading ? 'loading' : ''}`}
              onClick={handlePlayCurrentStory}
              title={tts.isPlaying ? 'Tạm dừng đọc (Pause)' : 'Đọc câu chuyện bằng AI Voice (ElevenLabs)'}
            >
              {tts.isLoading ? (
                <Loader2 size={18} className="animate-spin text-cyan-400" />
              ) : tts.isPlaying && !tts.isPaused ? (
                <Pause size={18} />
              ) : (
                <Play size={18} className="translate-x-0.5" />
              )}
            </button>

            {tts.isPlaying && (
              <button
                type="button"
                className="tts-stop-btn"
                onClick={handleStop}
                title="Dừng đọc"
              >
                <Square size={13} />
              </button>
            )}

            {/* Voice Profile Badge with Dropdown */}
            <div className="tts-voice-selector-wrapper">
              <button
                type="button"
                className="tts-voice-badge-btn"
                onClick={() => setIsVoiceDropdownOpen(prev => !prev)}
                title="Chọn giọng đọc AI Tiếng Việt chuẩn"
              >
                <span className="voice-avatar">{currentVoice.avatar}</span>
                <div className="voice-meta">
                  <span className="voice-name">{currentVoice.name}</span>
                  <span className="voice-tone-preview">{currentVoice.tone.split('&')[0]}</span>
                </div>
                <ChevronDown size={12} className={`voice-arrow ${isVoiceDropdownOpen ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {isVoiceDropdownOpen && (
                  <motion.div
                    className="tts-voice-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="tts-voice-dropdown-header">
                      <span>CHỌN GIỌNG MIỀN NAM 🌴</span>
                    </div>
                    <div className="tts-voice-list">
                      {CURATED_VOICES.map((v) => {
                        const isMale = v.gender === 'Nam'
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className={`tts-voice-item ${v.id === tts.activeVoiceId ? 'active' : ''}`}
                            onClick={() => handleSelectVoice(v.id)}
                          >
                            <span className="v-item-avatar">{v.avatar}</span>
                            <div className="v-item-info">
                              <div className="v-item-title">
                                <span className="v-item-name" style={{ color: isMale ? '#38bdf8' : '#f472b6' }}>
                                  {v.name}
                                </span>
                                <span className="v-item-tag" style={{ 
                                  borderColor: isMale ? 'rgba(0,240,255,0.4)' : 'rgba(236,72,153,0.4)', 
                                  color: isMale ? '#00f0ff' : '#ec4899' 
                                }}>
                                  {isMale ? '👨 Nam' : '👩 Nữ'}
                                </span>
                              </div>
                              <p className="v-item-tone">{v.tone}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side: Speed Selector, Read Mode & Settings */}
          <div className="tts-control-right">
            {/* Speed Toggle Pill */}
            <button
              type="button"
              className="tts-speed-pill"
              onClick={handleCycleSpeed}
              title="Tốc độ đọc (Click để đổi: 1.0x, 1.25x, 1.5x, 0.85x)"
            >
              {tts.speed}x
            </button>

            {/* Mode switch (Đoạn này vs Toàn bộ) */}
            <button
              type="button"
              className={`tts-mode-btn ${readMode === 'full-journey' ? 'full-active' : ''}`}
              onClick={() => {
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                setReadMode(prev => prev === 'current' ? 'full-journey' : 'current')
              }}
              title={readMode === 'current' ? 'Đang chọn: Đọc đoạn hiện tại (Bấm để chuyển sang Đọc toàn bộ hành trình)' : 'Đang chọn: Đọc toàn bộ hành trình đã trải qua'}
            >
              <BookOpen size={13} />
              <span className="tts-mode-text">{readMode === 'current' ? 'Đoạn này' : 'Toàn bộ'}</span>
            </button>

            {/* Quick Settings Link */}
            <button
              type="button"
              className="tts-settings-quick-btn"
              onClick={() => {
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                onOpenSettings()
              }}
              title="Cài đặt giọng đọc & Quản lý API Key ElevenLabs"
            >
              <SettingsIcon size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Bar: Live Waveform Visualizer & Story Progress Track */}
        <div className="tts-waveform-section">
          <div className="tts-meta-info">
            <span className="tts-title-marquee">
              {tts.isLoading ? (
                <span className="text-cyan-400 animate-pulse">Đang tải giọng đọc AI Tiếng Việt...</span>
              ) : tts.isPlaying ? (
                <span>🎙️ Đang đọc: <strong>{tts.currentTitle || storyNode?.title || 'Câu chuyện'}</strong> ({currentVoice.name})</span>
              ) : (
                <span>🎙️ Đọc văn bản truyền cảm (AI Voice Tiếng Việt Chuẩn)</span>
              )}
            </span>
            <div className="tts-time-display">
              <span>{formatTime(tts.currentTime)}</span>
              <span>/</span>
              <span>{formatTime(tts.duration)}</span>
            </div>
          </div>

          {/* Interactive Progress Bar */}
          <div 
            className="tts-progress-track"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickX = e.clientX - rect.left
              const percent = Math.min(100, Math.max(0, (clickX / rect.width) * 100))
              seekStoryTTS(percent)
            }}
          >
            <div 
              className="tts-progress-fill"
              style={{ width: `${tts.progress}%` }}
            />
            {/* Visualizer bars overlaid on track */}
            <div className="tts-soundwave-bars">
              {Array.from({ length: 28 }).map((_, idx) => {
                const val = tts.visualizerData ? (tts.visualizerData[idx] || 0) : 0
                const height = tts.isPlaying && !tts.isPaused ? Math.max(15, (val / 255) * 100) : 15
                return (
                  <span 
                    key={idx} 
                    className="wave-bar" 
                    style={{ 
                      height: `${height}%`,
                      opacity: tts.isPlaying ? 0.9 : 0.25 
                    }} 
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner if any */}
      {tts.error && (
        <div className="tts-error-notice">
          <span>⚠️ {tts.error}</span>
          <button 
            type="button"
            onClick={() => updateTTSSettings({ engineType: 'browser' })}
            className="tts-error-switch-btn"
          >
            Dùng giọng trình duyệt
          </button>
        </div>
      )}
    </div>
  )
}
