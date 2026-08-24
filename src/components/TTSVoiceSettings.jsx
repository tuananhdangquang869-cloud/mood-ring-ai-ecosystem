import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  Sparkles, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Sliders, 
  Check, 
  RotateCcw, 
  FileText
} from 'lucide-react'
import { 
  CURATED_VOICES, 
  ttsState, 
  subscribeTTS, 
  updateTTSSettings, 
  playStoryText, 
  stopStoryTTS, 
  togglePauseStoryTTS,
  saveTTSApiKey 
} from '../utils/ttsVoiceEngine.js'
import { playKeyClick } from '../utils/audioSynth.js'

const SAMPLE_TEXT_VI = "Trong khoảng không vô tận của lõi nhận thức, những mảnh ký ức lấp lánh như bụi sao. Mỗi nhịp đập của tâm thức mở ra một tầng cảm xúc mới, dịu êm và sâu lắng."

export default function TTSVoiceSettings({ soundEnabled = true }) {
  const [tts, setTts] = useState({ ...ttsState })
  const [testText, setTestText] = useState(SAMPLE_TEXT_VI)
  const [activePreviewVoice, setActivePreviewVoice] = useState(null)

  useEffect(() => {
    const unsub = subscribeTTS((newState) => {
      setTts(newState)
    })
    return () => unsub()
  }, [])

  const handleSelectVoice = (voiceId) => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    updateTTSSettings({ activeVoiceId: voiceId })
  }

  const handleTestVoice = (voice) => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    setActivePreviewVoice(voice.id)
    const textToSpeak = voice.sampleText || `Xin chào! Tôi là giọng đọc ${voice.name}. Tôi sẽ đọc câu chuyện của bạn.`
    playStoryText(
      textToSpeak,
      `Thử giọng ${voice.name}`,
      { voiceId: voice.id }
    )
  }

  const handlePlayCustomTest = () => {
    if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
    if (tts.isPlaying && !tts.isPaused) {
      togglePauseStoryTTS()
    } else if (tts.isPaused) {
      togglePauseStoryTTS()
    } else {
      playStoryText(testText, 'Thử nghiệm phòng thu AI Voice', { voiceId: tts.activeVoiceId })
    }
  }

  return (
    <div className="tts-settings-container">
      {/* Header Banner */}
      <div className="tts-settings-header-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="tts-icon-pulse">
              <Mic size={22} className="text-cyan-400" />
            </div>
            <div>
              <span className="tts-badge-tag">// GIỌNG ĐỌC AI MIỀN NAM CHUẨN //</span>
              <h4 className="tts-headline">ĐỌC VĂN BẢN TRUYỀN CẢM (1 GIỌNG NỮ & 1 GIỌNG NAM)</h4>
              <p className="tts-subtext">
                Hệ thống tinh giản tối đa: <strong>1 Giọng Nữ (Mai Phương)</strong> ngọt ngào, dịu dàng và <strong>1 Giọng Nam (Quang Dũng)</strong> trầm ấm, nam tính chuẩn phong cách người miền Nam.
              </p>
            </div>
          </div>
          <div className="tts-engine-status-pill">
            <span className="live-dot animate-ping" />
            <span>2 GIỌNG MIỀN NAM 🌴</span>
          </div>
        </div>
      </div>

      {/* Voice Selection Cards */}
      <div className="tts-section-box">
        <div className="tts-section-title">
          <Sparkles size={16} className="text-amber-400" />
          <span>CHỌN GIỌNG ĐỌC KỂ CHUYỆN (BẤM ĐỂ CHỌN)</span>
        </div>

        {/* 2 Voice Cards Grid */}
        <div className="tts-voice-grid mt-3">
          {CURATED_VOICES.map((voice) => {
            const isSelected = voice.id === tts.activeVoiceId
            const isMale = voice.gender === 'Nam'
            return (
              <div
                key={voice.id}
                className={`tts-voice-card ${isSelected ? 'selected' : ''}`}
                style={{
                  borderColor: isSelected ? (isMale ? '#00f0ff' : '#ec4899') : undefined,
                  background: isSelected ? (isMale ? 'rgba(0, 240, 255, 0.08)' : 'rgba(236, 72, 153, 0.08)') : undefined,
                  boxShadow: isSelected ? `0 0 20px ${isMale ? 'rgba(0, 240, 255, 0.25)' : 'rgba(236, 72, 153, 0.25)'}` : undefined
                }}
                onClick={() => handleSelectVoice(voice.id)}
              >
                <div className="voice-card-header">
                  <div className="flex items-center gap-3">
                    <span className="voice-card-avatar" style={{ fontSize: '1.75rem' }}>{voice.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="voice-card-name" style={{ color: isMale ? '#38bdf8' : '#f472b6', fontSize: '0.95rem' }}>
                          {voice.name}
                        </strong>
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="voice-badge-tag-mini" style={{ 
                          background: isMale ? 'rgba(0, 240, 255, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                          color: isMale ? '#00f0ff' : '#ec4899',
                          border: `1px solid ${isMale ? 'rgba(0, 240, 255, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`
                        }}>
                          {isMale ? '👨 Giọng Nam Trầm Ấm' : '👩 Giọng Nữ Dịu Dàng'}
                        </span>
                        <span className="voice-badge-tag-mini region">🌴 Giọng Miền Nam</span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="voice-card-active-check" style={{ background: isMale ? '#00f0ff' : '#ec4899' }}>
                      <Check size={14} />
                    </span>
                  )}
                </div>

                <p className="voice-card-desc">{voice.desc}</p>

                <div className="voice-card-footer">
                  <span className="voice-card-tone" style={{ color: isMale ? '#38bdf8' : '#f472b6' }}>
                    🎙️ {voice.tone}
                  </span>
                  <button
                    type="button"
                    className="voice-card-test-btn"
                    style={{ borderColor: isMale ? 'rgba(0, 240, 255, 0.3)' : 'rgba(236, 72, 153, 0.3)' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTestVoice(voice)
                    }}
                    title={`Nghe thử giọng đọc của ${voice.name}`}
                  >
                    <Volume2 size={13} style={{ color: isMale ? '#00f0ff' : '#ec4899' }} />
                    <span>Thử giọng</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Interactive Studio Text Playground */}
      <div className="tts-section-box">
        <div className="tts-section-title">
          <FileText size={16} className="text-cyan-400" />
          <span>PHÒNG THỬ NGHIỆM GIỌNG ĐỌC TRỰC TIẾP (STUDIO PLAYGROUND)</span>
        </div>
        <p className="text-xs text-cyan-200/70 mb-3">
          Nhập bất kỳ đoạn văn tiếng Việt nào để kiểm tra chất lượng giọng đọc đã chọn:
        </p>

        <div className="tts-playground-wrapper">
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={3}
            className="tts-playground-textarea"
            placeholder="Nhập nội dung văn bản bạn muốn nghe đọc..."
          />

          <div className="tts-playground-actions">
            <button
              type="button"
              className={`tts-playground-play-btn ${tts.isPlaying ? 'playing' : ''}`}
              onClick={handlePlayCustomTest}
            >
              {tts.isLoading ? (
                <span>Đang xử lý âm thanh AI...</span>
              ) : tts.isPlaying && !tts.isPaused ? (
                <>
                  <Pause size={15} />
                  <span>TẠM DỪNG</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>PHÁT THỬ GIỌNG ĐANG CHỌN</span>
                </>
              )}
            </button>

            {tts.isPlaying && (
              <button
                type="button"
                className="tts-playground-stop-btn"
                onClick={() => stopStoryTTS()}
              >
                <Square size={13} />
                <span>DỪNG HẲN</span>
              </button>
            )}

            <button
              type="button"
              className="tts-playground-reset-btn"
              onClick={() => setTestText(SAMPLE_TEXT_VI)}
              title="Đặt lại văn bản mẫu"
            >
              <RotateCcw size={13} />
              <span>Văn bản mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Key Management */}
      <div className="tts-section-box">
        <div className="tts-section-title">
          <Sliders size={16} className="text-cyan-400" />
          <span>CẤU HÌNH ELEVENLABS API KEY</span>
        </div>
        <p className="text-xs text-cyan-200/70 mb-3">
          Nhập API Key ElevenLabs cá nhân của bạn để sử dụng giọng đọc chuẩn (Key sẽ được lưu cục bộ an toàn trên trình duyệt của bạn).
        </p>
        <div className="flex gap-2 items-center">
          <input
            type="password"
            value={tts.apiKey || ''}
            onChange={(e) => {
              saveTTSApiKey(e.target.value)
            }}
            placeholder="Dán API Key ElevenLabs của bạn vào đây (sk_...)"
            className="tts-playground-textarea"
            style={{ height: '42px', padding: '10px', fontSize: '0.85rem', flexGrow: 1 }}
          />
          {tts.apiKey && tts.apiKey !== 'sk_860664251182a586689048d984f7456486e8454842ab5811' && (
            <button
              type="button"
              className="tts-playground-reset-btn"
              onClick={() => {
                if (soundEnabled && typeof playKeyClick === 'function') playKeyClick()
                saveTTSApiKey('')
              }}
              style={{ height: '42px', flexShrink: 0, margin: 0 }}
            >
              XÓA KEY
            </button>
          )}
        </div>
        <p className="text-[10px] text-cyan-400/60 mt-1.5">
          {tts.apiKey === 'sk_860664251182a586689048d984f7456486e8454842ab5811' || !tts.apiKey ? 
            '⚠️ Đang sử dụng Key dự phòng hệ thống (dễ bị quá giới hạn lượt đọc). Hãy nhập Key cá nhân của bạn để hoạt động ổn định nhất.' : 
            '✓ Đã ghi nhận API Key cá nhân của bạn và lưu trên thiết bị này.'}
        </p>
      </div>

      {/* Voice Parameters Tuning & Mode Switches */}
      <div className="tts-section-box">
        <div className="tts-section-title">
          <Sliders size={16} className="text-cyan-400" />
          <span>TINH CHỈNH THÔNG SỐ & TỐC ĐỘ ĐỌC</span>
        </div>

        <div className="tts-sliders-grid">
          {/* Reading Speed */}
          <div className="tts-slider-item">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span>Tốc Độ Đọc (Speed Multiplier):</span>
              <strong className="text-cyan-400">{tts.speed.toFixed(2)}x</strong>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={tts.speed}
              onChange={(e) => updateTTSSettings({ speed: parseFloat(e.target.value) })}
              className="tts-range-slider"
            />
            <span className="tts-slider-hint">Tốc độ phát audio (Mặc định 1.0x là tự nhiên nhất).</span>
          </div>

          {/* Volume */}
          <div className="tts-slider-item">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span>Âm Lượng Giọng Đọc:</span>
              <strong className="text-cyan-400">{Math.round(tts.volume * 100)}%</strong>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={tts.volume}
              onChange={(e) => updateTTSSettings({ volume: parseFloat(e.target.value) })}
              className="tts-range-slider"
            />
            <span className="tts-slider-hint">Âm lượng đầu ra của trình đọc audio.</span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="tts-toggles-row">
          <label className="tts-toggle-card">
            <input
              type="checkbox"
              checked={tts.autoNarrate}
              onChange={(e) => updateTTSSettings({ autoNarrate: e.target.checked })}
            />
            <div className="tts-toggle-text">
              <strong>Tự Động Đọc Khi Chuyển Phân Cảnh (Auto-Narrate)</strong>
              <p>Tự động phát giọng đọc AI khi bạn lựa chọn ngã rẽ cốt truyện mới.</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}
