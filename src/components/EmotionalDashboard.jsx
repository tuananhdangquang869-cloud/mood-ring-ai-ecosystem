import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  LineChart as LineChartIcon, 
  Compass, 
  Calendar, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Download, 
  Share2, 
  RefreshCw, 
  Layers, 
  Tag, 
  Award, 
  X, 
  Check, 
  HelpCircle,
  Flame,
  ArrowRight,
  Info
} from 'lucide-react'
import { 
  calculateDashboardAnalytics, 
  seedDemoEmotionalData, 
  clearDemoEmotionalData,
  MOOD_DEFINITIONS 
} from '../utils/emotionalAnalyticsEngine.js'
import { 
  playKeyClick, 
  playChartHoverSound, 
  playInsightChimeSound, 
  playMood 
} from '../utils/audioSynth.js'

export default function EmotionalDashboard({
  isOpen = true,
  onClose = () => {},
  isEmbedded = false,
  soundEnabled = true,
  onOpenWrapped = () => {},
  onNavigateTab = () => {}
}) {
  const [timeframe, setTimeframe] = useState('30d') // '7d' | '30d' | '1y'
  const [activeSeries, setActiveSeries] = useState({ valence: true, intensity: true, flow: false })
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [showSeedToast, setShowSeedToast] = useState(false)
  const [seedMessage, setSeedMessage] = useState('')
  const [exporting, setExporting] = useState(false)
  const dashboardRef = useRef(null)

  // Listen to storage update events
  useEffect(() => {
    const handleUpdate = () => setDataVersion(v => v + 1)
    window.addEventListener('mr-emotional-data-updated', handleUpdate)
    return () => window.removeEventListener('mr-emotional-data-updated', handleUpdate)
  }, [])

  // Calculate analytics
  const analytics = useMemo(() => {
    void dataVersion
    return calculateDashboardAnalytics(timeframe)
  }, [timeframe, dataVersion])

  const {
    totalEntries,
    totalWords,
    averageIntensity,
    resonanceIndex,
    stabilityScore,
    dominantMood,
    percentages,
    peakTime,
    timeSeries,
    barSeries,
    radarData,
    topTags,
    archetype,
    aiDiagnostics
  } = analytics

  // Timeframe selector handler
  const handleTimeframeChange = (tf) => {
    setTimeframe(tf)
    setHoveredPoint(null)
    setHoveredBar(null)
    if (soundEnabled) playKeyClick()
  }

  // Seed demo data handler
  const handleSeedData = () => {
    const count = seedDemoEmotionalData(timeframe === '1y' ? 'year' : 'month')
    setDataVersion(v => v + 1)
    setSeedMessage(`Đã nạp thành công ${count} bản ghi cảm xúc mẫu phong phú!`)
    setShowSeedToast(true)
    if (soundEnabled) playInsightChimeSound()
    setTimeout(() => setShowSeedToast(false), 3500)
  }

  // Clear demo data handler
  const handleClearDemoData = () => {
    clearDemoEmotionalData()
    setDataVersion(v => v + 1)
    setSeedMessage('Đã dọn dẹp dữ liệu mẫu, trở về dữ liệu thật của bạn!')
    setShowSeedToast(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => setShowSeedToast(false), 3500)
  }

  // SVG Line Chart Coordinate Calculations
  const chartWidth = 700
  const chartHeight = 220
  const paddingX = 40
  const paddingY = 30

  const lineChartPoints = useMemo(() => {
    if (!timeSeries.length) return { valencePath: '', intensityPath: '', areaPath: '', coords: [] }

    const stepX = (chartWidth - paddingX * 2) / (timeSeries.length - 1 || 1)
    const minY = paddingY
    const maxY = chartHeight - paddingY

    const coords = timeSeries.map((pt, idx) => {
      const x = paddingX + idx * stepX
      // Invert Y: 100 at top (minY), 0 at bottom (maxY)
      const yValence = maxY - ((pt.valence - 10) / 90) * (maxY - minY)
      const yIntensity = maxY - ((pt.intensity - 10) / 90) * (maxY - minY)
      return { ...pt, x, yValence, yIntensity, index: idx }
    })

    // Create smooth Bezier spline for Valence
    let valencePath = `M ${coords[0].x} ${coords[0].yValence}`
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1]
      const p1 = coords[i]
      const p2 = coords[i + 1]
      const p3 = coords[i + 2] || p2

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.yValence + (p2.yValence - p0.yValence) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.yValence - (p3.yValence - p1.yValence) / 6

      valencePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.yValence}`
    }

    // Create Intensity Path
    let intensityPath = `M ${coords[0].x} ${coords[0].yIntensity}`
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1]
      const p1 = coords[i]
      const p2 = coords[i + 1]
      const p3 = coords[i + 2] || p2

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.yIntensity + (p2.yIntensity - p0.yIntensity) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.yIntensity - (p3.yIntensity - p1.yIntensity) / 6

      intensityPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.yIntensity}`
    }

    // Create Area Fill Path for Valence
    const lastX = coords[coords.length - 1].x
    const areaPath = `${valencePath} L ${lastX} ${maxY} L ${coords[0].x} ${maxY} Z`

    return { valencePath, intensityPath, areaPath, coords }
  }, [timeSeries])

  // Radar Polygon Coordinate Calculations (5 axes)
  const radarSvgSize = 220
  const radarCenter = radarSvgSize / 2
  const radarRadius = 80

  const radarCoords = useMemo(() => {
    const totalAxes = radarData.length
    const points = radarData.map((d, i) => {
      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2
      const normalizedVal = Math.min(100, Math.max(15, d.value)) / 100
      const r = radarRadius * normalizedVal
      const x = radarCenter + r * Math.cos(angle)
      const y = radarCenter + r * Math.sin(angle)
      // Axis label position
      const labelR = radarRadius + 22
      const labelX = radarCenter + labelR * Math.cos(angle)
      const labelY = radarCenter + labelR * Math.sin(angle)
      return { ...d, x, y, labelX, labelY, angle }
    })

    const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    return { points, polygonPath }
  }, [radarData])

  // Simple Export / Capture simulation
  const handleExportInfographic = () => {
    setExporting(true)
    if (soundEnabled) playInsightChimeSound()
    setTimeout(() => {
      setExporting(false)
      setSeedMessage('Đã lưu ảnh Infographic Bảng Chỉ Số Tâm Lý thành công!')
      setShowSeedToast(true)
      setTimeout(() => setShowSeedToast(false), 3000)
    }, 1200)
  }

  return (
    <div className={`emotional-dashboard-container ${isEmbedded ? 'embedded' : 'standalone'}`} ref={dashboardRef}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showSeedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="dashboard-toast-notification"
          >
            <Sparkles size={16} className="toast-icon-spark" />
            <span>{seedMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Action Bar */}
      <header className="dashboard-header-bar">
        <div className="dashboard-title-group">
          <div className="dashboard-icon-ring" style={{ borderColor: dominantMood.color, boxShadow: `0 0 16px ${dominantMood.glow}` }}>
            <Activity size={20} color={dominantMood.color} />
          </div>
          <div>
            <div className="dashboard-badge-row">
              <span className="dashboard-category-badge">// CHỈ SỐ TÂM LÝ MAINFRAME //</span>
              <span className="live-status-pill">
                <span className="live-status-dot"></span> LIVE TELEMETRY
              </span>
            </div>
            <h2 className="dashboard-heading">Bảng Điều Khiển Chỉ Số Cảm Xúc</h2>
          </div>
        </div>

        <div className="dashboard-header-actions">
          {/* Timeframe switcher */}
          <div className="timeframe-pill-group">
            {[
              { id: '7d', label: '7 Ngày' },
              { id: '30d', label: '30 Ngày' },
              { id: '1y', label: '1 Năm' }
            ].map(tf => (
              <button
                key={tf.id}
                type="button"
                className={`timeframe-btn ${timeframe === tf.id ? 'active' : ''}`}
                onClick={() => handleTimeframeChange(tf.id)}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Seed Demo Data Button */}
          <button
            type="button"
            className="dashboard-action-btn seed-btn"
            onClick={handleSeedData}
            title="Sinh dữ liệu cảm xúc 30 ngày/1 năm để trải nghiệm biểu đồ hoàn chỉnh"
          >
            <RefreshCw size={14} />
            <span>Nạp Dữ Liệu Mẫu</span>
          </button>

          {/* Spotify Wrapped Trigger Button */}
          <button
            type="button"
            className="dashboard-action-btn wrapped-launch-btn"
            onClick={() => {
              if (soundEnabled) playInsightChimeSound()
              onOpenWrapped(timeframe === '7d' ? 'week' : 'year')
            }}
            title="Mở Báo Cáo Kể Chuyện Dạng Spotify Wrapped"
          >
            <Sparkles size={14} />
            <span>Báo Cáo Wrapped ✨</span>
          </button>

          {/* Export Infographic */}
          <button
            type="button"
            className="dashboard-action-btn export-btn"
            onClick={handleExportInfographic}
            disabled={exporting}
            title="Xuất infographic bảng điều khiển"
          >
            <Download size={14} />
            <span>{exporting ? 'Đang xuất...' : 'Xuất Báo Cáo'}</span>
          </button>

          {!isEmbedded && (
            <button type="button" className="dashboard-close-btn" onClick={onClose} title="Đóng">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* KPI Overview Cards Grid */}
      <div className="dashboard-kpi-grid">
        {/* Card 1: Dominant Mood */}
        <div 
          className="kpi-card dominant-mood-card" 
          style={{ borderColor: dominantMood.color, background: `linear-gradient(135deg, rgba(20,25,35,0.85), ${dominantMood.glow})` }}
        >
          <div className="kpi-card-header">
            <span className="kpi-label">TÂM TRẠNG THỐNG TRỊ</span>
            <span className="kpi-icon-badge">{dominantMood.icon}</span>
          </div>
          <div className="kpi-value-row">
            <h3 className="kpi-dominant-name" style={{ color: dominantMood.color }}>{dominantMood.name}</h3>
            <span className="kpi-percent-pill" style={{ backgroundColor: dominantMood.color + '25', color: dominantMood.color }}>
              {percentages[dominantMood.id]}%
            </span>
          </div>
          <p className="kpi-desc">{dominantMood.description}</p>
        </div>

        {/* Card 2: Emotional Resonance Index */}
        <div className="kpi-card resonance-card">
          <div className="kpi-card-header">
            <span className="kpi-label">CHỈ SỐ HÀI HÒA NỘI TÂM</span>
            <Zap size={18} className="kpi-header-icon zap" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-score-gauge">
              <span className="kpi-score-number">{resonanceIndex}</span>
              <span className="kpi-score-max">/100</span>
            </div>
            <span className={`kpi-status-tag ${resonanceIndex >= 75 ? 'optimal' : resonanceIndex >= 50 ? 'moderate' : 'alert'}`}>
              {resonanceIndex >= 80 ? '🌟 CỰC KỲ TÍCH CỰC' : resonanceIndex >= 65 ? '🌿 AN YÊN & CÂN BẰNG' : '⚙️ CẦN NGHỈ NGƠI'}
            </span>
          </div>
          <div className="kpi-progress-bar-bg">
            <motion.div 
              className="kpi-progress-bar-fill resonance" 
              initial={{ width: 0 }}
              animate={{ width: `${resonanceIndex}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card 3: Stability & Balance Score */}
        <div className="kpi-card stability-card">
          <div className="kpi-card-header">
            <span className="kpi-label">ĐỘ ỔN ĐỊNH CẢM XÚC</span>
            <ShieldCheck size={18} className="kpi-header-icon shield" />
          </div>
          <div className="kpi-value-row">
            <div className="kpi-score-gauge">
              <span className="kpi-score-number">{stabilityScore}%</span>
            </div>
            <span className="kpi-status-tag stable">
              {stabilityScore >= 75 ? '🛡️ RẤT VỮNG VÀNG' : '🌊 LINH HOẠT BIẾN ĐỔI'}
            </span>
          </div>
          <div className="kpi-progress-bar-bg">
            <motion.div 
              className="kpi-progress-bar-fill stability" 
              initial={{ width: 0 }}
              animate={{ width: `${stabilityScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card 4: Peak Writing Time */}
        <div className="kpi-card peak-time-card">
          <div className="kpi-card-header">
            <span className="kpi-label">NHỊP SINH HỌC CẢM XÚC</span>
            <Clock size={18} className="kpi-header-icon clock" />
          </div>
          <div className="kpi-peak-content">
            <div className="kpi-peak-title-row">
              <span className="peak-icon">{peakTime.icon}</span>
              <span className="peak-label-text">{peakTime.label}</span>
            </div>
            <p className="peak-desc-text">{peakTime.desc}</p>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="dashboard-charts-main-grid">
        {/* Left Column: Interactive Spline Line Chart */}
        <div className="dashboard-chart-box line-chart-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <LineChartIcon size={18} className="chart-type-icon" />
              <div>
                <h4 className="chart-title">Biểu Đồ Xu Hướng Cảm Xúc Theo Thời Gian</h4>
                <span className="chart-subtitle">
                  {timeframe === '7d' ? 'Biến thiên 7 ngày qua' : timeframe === '30d' ? 'Hành trình 30 ngày qua' : 'Bản đồ 12 tháng'}
                </span>
              </div>
            </div>

            {/* Line Series Toggles */}
            <div className="chart-series-toggles">
              <button
                type="button"
                className={`series-toggle-btn valence ${activeSeries.valence ? 'active' : ''}`}
                onClick={() => {
                  setActiveSeries(s => ({ ...s, valence: !s.valence }))
                  if (soundEnabled) playKeyClick()
                }}
              >
                <span className="series-dot valence"></span>
                <span>Chỉ Số Tích Cực</span>
              </button>

              <button
                type="button"
                className={`series-toggle-btn intensity ${activeSeries.intensity ? 'active' : ''}`}
                onClick={() => {
                  setActiveSeries(s => ({ ...s, intensity: !s.intensity }))
                  if (soundEnabled) playKeyClick()
                }}
              >
                <span className="series-dot intensity"></span>
                <span>Cường Độ</span>
              </button>
            </div>
          </div>

          {/* SVG Line Canvas */}
          <div className="line-chart-svg-wrapper">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="line-chart-svg"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                {/* Area Gradient */}
                <linearGradient id="valenceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.38" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>

                <linearGradient id="valenceStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                <linearGradient id="intensityStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>

                <filter id="glowLine" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0.25, 0.5, 0.75].map((pct, i) => {
                const y = paddingY + (chartHeight - paddingY * 2) * pct
                return (
                  <g key={i}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={chartWidth - paddingX} 
                      y2={y} 
                      stroke="rgba(255, 255, 255, 0.08)" 
                      strokeDasharray="4 4" 
                    />
                    <text x={paddingX - 10} y={y + 3} fill="rgba(255, 255, 255, 0.35)" fontSize="10" textAnchor="end">
                      {Math.round(100 - pct * 90)}
                    </text>
                  </g>
                )
              })}

              {/* Valence Area Fill */}
              {activeSeries.valence && lineChartPoints.areaPath && (
                <path 
                  d={lineChartPoints.areaPath} 
                  fill="url(#valenceAreaGrad)" 
                />
              )}

              {/* Valence Spline Stroke */}
              {activeSeries.valence && lineChartPoints.valencePath && (
                <path 
                  d={lineChartPoints.valencePath} 
                  fill="none" 
                  stroke="url(#valenceStrokeGrad)" 
                  strokeWidth="3.2" 
                  filter="url(#glowLine)"
                />
              )}

              {/* Intensity Spline Stroke */}
              {activeSeries.intensity && lineChartPoints.intensityPath && (
                <path 
                  d={lineChartPoints.intensityPath} 
                  fill="none" 
                  stroke="url(#intensityStrokeGrad)" 
                  strokeWidth="2.2" 
                  strokeDasharray="6 4"
                />
              )}

              {/* Data Points Interactive Hover Dots */}
              {lineChartPoints.coords.map((pt, idx) => (
                <g key={idx}>
                  {/* Invisible broad hitbox for easy hover */}
                  <rect
                    x={pt.x - 14}
                    y={paddingY}
                    width="28"
                    height={chartHeight - paddingY * 2}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredPoint(pt)
                      if (soundEnabled) playChartHoverSound()
                    }}
                  />

                  {/* Valence Point */}
                  {activeSeries.valence && (
                    <circle
                      cx={pt.x}
                      cy={pt.yValence}
                      r={hoveredPoint?.index === idx ? 6.5 : 3.8}
                      fill="#00f0ff"
                      stroke="#0d1117"
                      strokeWidth="2"
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  )}

                  {/* Intensity Point */}
                  {activeSeries.intensity && (
                    <circle
                      cx={pt.x}
                      cy={pt.yIntensity}
                      r={hoveredPoint?.index === idx ? 5.5 : 3}
                      fill="#f59e0b"
                      stroke="#0d1117"
                      strokeWidth="1.8"
                      style={{ transition: 'all 0.15s ease' }}
                    />
                  )}

                  {/* X-axis date labels */}
                  {(timeSeries.length <= 12 || idx % Math.ceil(timeSeries.length / 10) === 0) && (
                    <text 
                      x={pt.x} 
                      y={chartHeight - 8} 
                      fill={hoveredPoint?.index === idx ? '#00f0ff' : 'rgba(255, 255, 255, 0.4)'}
                      fontSize="10.5" 
                      textAnchor="middle"
                      fontWeight={hoveredPoint?.index === idx ? 'bold' : 'normal'}
                    >
                      {pt.label}
                    </text>
                  )}
                </g>
              ))}

              {/* Hover Cursor Vertical Line */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={paddingY}
                  x2={hoveredPoint.x}
                  y2={chartHeight - paddingY}
                  stroke="#00f0ff"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}
            </svg>

            {/* Interactive Float Tooltip */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="chart-hover-tooltip"
                  style={{
                    left: `min(calc(${(hoveredPoint.x / chartWidth) * 100}% + 10px), calc(100% - 170px))`,
                    top: `${(hoveredPoint.yValence / chartHeight) * 100 - 35}%`
                  }}
                >
                  <div className="tooltip-date-header">
                    <Calendar size={12} />
                    <span>{hoveredPoint.label}</span>
                    <span className="tooltip-count-tag">{hoveredPoint.count} ghi chép</span>
                  </div>
                  <div className="tooltip-metrics">
                    <div className="tooltip-metric-row">
                      <span className="metric-dot valence"></span>
                      <span>Chỉ số tích cực:</span>
                      <strong>{hoveredPoint.valence}/100</strong>
                    </div>
                    <div className="tooltip-metric-row">
                      <span className="metric-dot intensity"></span>
                      <span>Cường độ cảm xúc:</span>
                      <strong>{hoveredPoint.intensity}/100</strong>
                    </div>
                  </div>
                  {hoveredPoint.entries?.[0]?.title && (
                    <div className="tooltip-snippet">
                      <em>"{hoveredPoint.entries[0].title}"</em>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Multi-Mood Bar Chart */}
        <div className="dashboard-chart-box bar-chart-box">
          <div className="chart-box-header">
            <div className="chart-title-group">
              <BarChart3 size={18} className="chart-type-icon" />
              <div>
                <h4 className="chart-title">Phân Bố 5 Sắc Thái Cảm Xúc</h4>
                <span className="chart-subtitle">Tần suất xuất hiện theo chu kỳ</span>
              </div>
            </div>
          </div>

          <div className="bar-chart-bars-container">
            {barSeries.map((bar, idx) => {
              const maxVal = Math.max(1, bar.counts.joy + bar.counts.calm + bar.counts.melancholy + bar.counts.friction + bar.counts.breach)
              return (
                <div 
                  key={idx} 
                  className="bar-column-item"
                  onMouseEnter={() => {
                    setHoveredBar(bar)
                    if (soundEnabled) playChartHoverSound()
                  }}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="bar-stacked-track">
                    {Object.entries(MOOD_DEFINITIONS).map(([moodKey, moodDef]) => {
                      const count = bar.counts[moodKey] || 0
                      const heightPercent = (count / maxVal) * 100
                      if (heightPercent === 0) return null
                      return (
                        <div
                          key={moodKey}
                          className={`bar-stack-segment ${moodKey}`}
                          style={{
                            height: `${heightPercent}%`,
                            backgroundColor: moodDef.color,
                            boxShadow: `0 0 8px ${moodDef.glow}`
                          }}
                          title={`${moodDef.name}: ${count}`}
                        />
                      )
                    })}
                  </div>
                  <span className="bar-column-label">{bar.label}</span>
                </div>
              )
            })}
          </div>

          {/* 5-Mood Legend */}
          <div className="mood-color-legend-row">
            {Object.entries(MOOD_DEFINITIONS).map(([k, def]) => (
              <div 
                key={k} 
                className="legend-item" 
                onClick={() => {
                  if (soundEnabled) playMood(k)
                }}
                title={`Nhấn để phát âm sắc ${def.name}`}
              >
                <span className="legend-chip" style={{ backgroundColor: def.color }}></span>
                <span className="legend-text">{def.name} ({percentages[k]}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Radar Chart & Archetype & Tags */}
      <div className="dashboard-secondary-grid">
        {/* Radar Map */}
        <div className="dashboard-sub-card radar-card">
          <div className="sub-card-header">
            <Compass size={16} className="sub-card-icon" />
            <h5 className="sub-card-title">Bản Đồ Cân Bằng 5 Trục Tâm Thức</h5>
          </div>

          <div className="radar-svg-container">
            <svg viewBox={`0 0 ${radarSvgSize} ${radarSvgSize}`} className="radar-svg">
              {/* Concentric Web Polygons */}
              {[0.33, 0.66, 1.0].map((scale, i) => (
                <polygon
                  key={i}
                  points={radarCoords.points.map(p => {
                    const r = radarRadius * scale
                    const x = radarCenter + r * Math.cos(p.angle)
                    const y = radarCenter + r * Math.sin(p.angle)
                    return `${x},${y}`
                  }).join(' ')}
                  fill={i === 2 ? 'rgba(0, 240, 255, 0.03)' : 'none'}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />
              ))}

              {/* Axis lines */}
              {radarCoords.points.map((p, i) => (
                <line
                  key={i}
                  x1={radarCenter}
                  y1={radarCenter}
                  x2={radarCenter + radarRadius * Math.cos(p.angle)}
                  y2={radarCenter + radarRadius * Math.sin(p.angle)}
                  stroke="rgba(255, 255, 255, 0.14)"
                  strokeWidth="1"
                />
              ))}

              {/* Animated Radar Data Polygon */}
              <polygon
                points={radarCoords.points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(0, 240, 255, 0.28)"
                stroke="#00f0ff"
                strokeWidth="2.2"
                filter="drop-shadow(0 0 6px rgba(0,240,255,0.6))"
              />

              {/* Vertices Dots */}
              {radarCoords.points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill={p.color} stroke="#0d1117" strokeWidth="1.5" />
                  <text 
                    x={p.labelX} 
                    y={p.labelY} 
                    fill={p.color} 
                    fontSize="9.5" 
                    fontWeight="bold"
                    textAnchor="middle" 
                    dominantBaseline="middle"
                  >
                    {p.name} ({p.value}%)
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Emotional Archetype Card */}
        <div className="dashboard-sub-card archetype-card" style={{ borderColor: archetype.color }}>
          <div className="sub-card-header">
            <Award size={16} style={{ color: archetype.color }} />
            <h5 className="sub-card-title">Nhân Vật Tâm Lý (Archetype)</h5>
            <span className="archetype-badge-pill" style={{ backgroundColor: archetype.color + '25', color: archetype.color }}>
              {archetype.badge}
            </span>
          </div>

          <div className="archetype-body">
            <div className="archetype-icon-orb" style={{ borderColor: archetype.color, boxShadow: `0 0 16px ${archetype.color}40` }}>
              <span className="archetype-big-icon">{archetype.icon}</span>
            </div>

            <div className="archetype-info">
              <span className="archetype-en-title">{archetype.title}</span>
              <h4 className="archetype-vn-title" style={{ color: archetype.color }}>{archetype.name}</h4>
              <p className="archetype-quote">"{archetype.quote}"</p>

              <div className="archetype-traits-row">
                {archetype.traits.map((t, idx) => (
                  <span key={idx} className="archetype-trait-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="archetype-launch-wrapped-btn"
            style={{ backgroundColor: archetype.color + '20', borderColor: archetype.color, color: archetype.color }}
            onClick={() => onOpenWrapped(timeframe === '7d' ? 'week' : 'year')}
          >
            <span>Khám phá toàn bộ hồ sơ trong Wrapped Story</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Top Tags & Writing Momentum */}
        <div className="dashboard-sub-card tags-momentum-card">
          <div className="sub-card-header">
            <Tag size={16} className="sub-card-icon" />
            <h5 className="sub-card-title">Chủ Đề & Từ Khóa Cảm Xúc Nổi Bật</h5>
          </div>

          <div className="top-tags-cloud">
            {topTags.length > 0 ? (
              topTags.map((t, idx) => (
                <div key={idx} className="dashboard-tag-pill">
                  <span className="tag-name">{t.tag}</span>
                  <span className="tag-freq">{t.count}</span>
                </div>
              ))
            ) : (
              <div className="tags-empty-state">
                <span>Chưa có nhiều hashtag. Hãy gắn tag như #biết_ơn, #sáng_tạo trong Nhật ký!</span>
              </div>
            )}
          </div>

          <div className="momentum-stats-row">
            <div className="momentum-stat-item">
              <span className="momentum-num">{totalEntries}</span>
              <span className="momentum-lbl">Khoảnh Khắc Đã Lưu</span>
            </div>
            <div className="momentum-stat-item">
              <span className="momentum-num">{totalWords}</span>
              <span className="momentum-lbl">Từ Ngữ Thấu Cảm</span>
            </div>
            <div className="momentum-stat-item">
              <span className="momentum-num">{averageIntensity}%</span>
              <span className="momentum-lbl">Cường Độ Trung Bình</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mental Health Diagnostic & Healing Advice */}
      <div className="dashboard-ai-diagnosis-card">
        <div className="ai-diagnosis-header">
          <div className="ai-diagnosis-title-group">
            <div className="ai-pulse-dot"></div>
            <h4>Chẩn Đoán Tâm Thức & Lời Khuyên Chữa Lành Từ Lõi AI</h4>
          </div>
          <span className="ai-model-tag">AI HEALING MATRIX v2.4</span>
        </div>

        <div className="ai-diagnosis-content-grid">
          <div className="diagnosis-box">
            <span className="diagnosis-box-label">🔍 NHẬN DIỆN HIỆN TRẠNG</span>
            <p className="diagnosis-text">{aiDiagnostics.diagnosis}</p>
          </div>

          <div className="diagnosis-box">
            <span className="diagnosis-box-label">✨ PHÁC ĐỒ HÀNH ĐỘNG</span>
            <p className="diagnosis-text">{aiDiagnostics.prescription}</p>
          </div>

          <div className="diagnosis-box">
            <span className="diagnosis-box-label">🌿 LỜI KHUYÊN TỰ CHỮA LÀNH</span>
            <p className="diagnosis-text">{aiDiagnostics.healingTip}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
