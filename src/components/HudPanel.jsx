import AudioVisualizer from './AudioVisualizer.jsx'
import OfflineSyncIndicator from './OfflineSyncIndicator.jsx'
import { Activity, Heart } from 'lucide-react'

export default function HudPanel({ 
  stats, 
  liveStats, 
  soundEnabled,
  activeTheme = 'default',
  setActiveTheme,
  customImageTheme
}) {
  if (!stats) return null

  const currentLiveStats = liveStats || {
    temp: stats.temp ?? 37,
    sync: stats.sync ?? 98,
    load: stats.load ?? 12
  }

  // Calculate live BPM based on thermal and processing load
  const liveBpm = Math.round(55 + (currentLiveStats.temp * 0.7) + (currentLiveStats.load * 0.4))
  const isHighAlert = liveBpm > 115

  return (
    <div className="hud-panel">
      <div className="hud-header">
        <div className="hud-status-wrapper">
          <span className="hud-status-dot"></span>
          <span className="hud-status-text">{stats.status}</span>
        </div>
        <span className="hud-id-tag">ID: MR-CORE-01</span>
      </div>

      {/* Mini Mood Ring Heartbeat Status */}
      <div className="hud-mood-ring-card">
        <div className="hud-ring-wrapper">
          <div 
            className="hud-mini-pulse-ring" 
            style={{ 
              animationDuration: `${(60 / Math.max(40, liveBpm)).toFixed(2)}s` 
            }} 
          />
          <div className="hud-mini-ring-core">
            <Heart size={13} className={isHighAlert ? 'text-red-400 animate-ping' : 'text-cyan-400'} />
          </div>
        </div>

        <div className="hud-bpm-info">
          <div className="hud-bpm-header">
            <span className="hud-bpm-label">NEURAL PULSE RHYTHM</span>
            <span className={`hud-bpm-value ${isHighAlert ? 'alert' : ''}`}>
              {liveBpm} BPM
            </span>
          </div>
          {/* Animated SVG ECG heartbeat line */}
          <div className="hud-ecg-track">
            <svg viewBox="0 0 160 20" className="hud-ecg-svg" preserveAspectRatio="none">
              <path
                d="M 0 10 L 30 10 L 38 3 L 44 18 L 52 2 L 60 14 L 66 10 L 160 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`ecg-path ${isHighAlert ? 'fast' : ''}`}
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="hud-stats">
        <div className="stat-row">
          <div className="stat-label">
            <span>CORE TEMPERATURE</span>
            <span className="stat-val">{currentLiveStats.temp}°C</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar-fill" style={{ width: `${currentLiveStats.temp}%` }}></div>
          </div>
        </div>
        <div className="stat-row">
          <div className="stat-label">
            <span>NEURAL SYNC RATE</span>
            <span className="stat-val">{currentLiveStats.sync}%</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar-fill" style={{ width: `${currentLiveStats.sync}%` }}></div>
          </div>
        </div>
        <div className="stat-row">
          <div className="stat-label">
            <span>PROCESSING LOAD</span>
            <span className="stat-val">{currentLiveStats.load}%</span>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar-fill" style={{ width: `${currentLiveStats.load}%` }}></div>
          </div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-label">
          <span>SYNC PULSE WAVEFORM</span>
        </div>
        <AudioVisualizer soundEnabled={soundEnabled} />
      </div>

      <div className="hud-logs">
        {stats.logs.map((log, i) => (
          <p key={i}>{log}</p>
        ))}
      </div>

      {/* HUD Bottom Controls Row (Wifi status & Theme Selector) */}
      <div className="hud-bottom-row">
        <OfflineSyncIndicator soundEnabled={soundEnabled} />

        {typeof setActiveTheme === 'function' && (
          <div className="theme-selector-hud" title="Chủ đề hiển thị HUD">
            {['default', 'green-hack', 'neon-violet', 'amber-matrix', 'deep-ocean'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTheme(t)}
                className={`theme-dot ${t} ${activeTheme === t ? 'active' : ''}`}
                title={t.replace('-', ' ').toUpperCase()}
              />
            ))}
            {customImageTheme && (
              <button
                onClick={() => setActiveTheme('custom-image')}
                className={`theme-dot custom-image ${activeTheme === 'custom-image' ? 'active' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${customImageTheme.dominantAccent}, ${customImageTheme.palette?.[1] || '#ff00ea'})`,
                  border: activeTheme === 'custom-image' ? '2px solid #fff' : '1px solid rgba(255,255,255,0.4)'
                }}
                title={`THEME ẢNH TÙY BIẾN: ${customImageTheme.dominantAccent}`}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
