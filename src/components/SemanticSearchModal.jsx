import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Sparkles, 
  Bot, 
  HelpCircle, 
  X, 
  Calendar, 
  Tag, 
  Flame, 
  ArrowRight, 
  Eye, 
  Layers, 
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react'
import { 
  performSemanticSearch, 
  PRESET_SEMANTIC_QUESTIONS 
} from '../utils/semanticSearchEngine.js'
import { getMoodArtSvg } from '../utils/emotionalAnalyticsEngine.js'
import { playKeyClick } from '../utils/audioSynth.js'

export default function SemanticSearchModal({
  isOpen = true,
  onClose,
  isEmbedded = false,
  soundEnabled = true,
  onInspectEntry
}) {
  const [query, setQuery] = useState('Lần trước mình cảm thấy vui vì điều gì?')
  const [sourceFilter, setSourceFilter] = useState('all') // 'all' | 'journal' | 'dream' | 'capsule'
  const [searchResult, setSearchResult] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Execute search whenever query or source filter changes
  useEffect(() => {
    if (!query.trim()) {
      setSearchResult(null)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      const result = performSemanticSearch(query, sourceFilter)
      setSearchResult(result)
      setIsSearching(false)
    }, 280)

    return () => clearTimeout(timer)
  }, [query, sourceFilter])

  const handleSelectPreset = (presetText) => {
    setQuery(presetText)
    if (soundEnabled) playKeyClick()
  }

  const handleClear = () => {
    setQuery('')
    setSearchResult(null)
    if (soundEnabled) playKeyClick()
  }

  const handleCardClick = (entry) => {
    if (typeof onInspectEntry === 'function') {
      onInspectEntry(entry)
    } else {
      setSelectedEntry(entry)
    }
    if (soundEnabled) playKeyClick()
  }

  if (!isOpen && !isEmbedded) return null

  const content = (
    <div className={`semantic-search-container ${isEmbedded ? 'embedded-view' : ''}`}>
      {/* Header & Subtitle */}
      {!isEmbedded && (
        <div className="semantic-header">
          <div className="flex items-center gap-3">
            <div className="semantic-badge-icon">
              <Search size={20} className="text-cyan-400" />
            </div>
            <div>
              <span className="settings-tag">// NEURAL COGNITIVE RETRIEVAL //</span>
              <h3 className="settings-title">TÌM KIẾM BẰNG NGỮ NGHĨA (SEMANTIC SEARCH)</h3>
            </div>
          </div>

          {onClose && (
            <button 
              className="settings-close-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                onClose()
              }}
              title="Đóng (ESC)"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Main Search Input Area */}
      <div className="semantic-search-bar-wrap">
        <div className="semantic-input-box">
          <Search size={18} className="text-cyan-400 flex-shrink-0" />
          <input
            type="text"
            className="semantic-search-input"
            placeholder="Hỏi bất kỳ điều gì: 'Lần trước mình vui vì điều gì?', 'Những ngày áp lực'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={!isEmbedded}
          />
          {query && (
            <button 
              type="button" 
              className="clear-query-btn"
              onClick={handleClear}
              title="Xóa câu hỏi"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Source Filter Pills */}
        <div className="semantic-filters-row">
          <span className="filter-label">Nguồn dữ liệu:</span>
          {[
            { id: 'all', name: 'Tất Cả Kho Ký Ức', icon: '🌌' },
            { id: 'journal', name: 'Nhật Ký Nghệ Thuật', icon: '🎨' },
            { id: 'dream', name: 'Sổ Tay Ước Mơ', icon: '🌙' },
            { id: 'capsule', name: 'Hộp Thời Gian', icon: '⏳' }
          ].map(sf => (
            <button
              key={sf.id}
              type="button"
              className={`filter-pill ${sourceFilter === sf.id ? 'active' : ''}`}
              onClick={() => {
                setSourceFilter(sf.id)
                if (soundEnabled) playKeyClick()
              }}
            >
              <span>{sf.icon}</span>
              <span>{sf.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Questions Preset Chips */}
      <div className="semantic-preset-chips-section">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Sparkles size={14} className="text-amber-400" />
          <span>Gợi ý câu hỏi ngữ nghĩa thông minh:</span>
        </div>
        <div className="preset-chips-scroll">
          {PRESET_SEMANTIC_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-chip-btn ${query === q.text ? 'selected' : ''}`}
              onClick={() => handleSelectPreset(q.text)}
            >
              <span>{q.icon}</span>
              <span>{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Answer Synthesis Box */}
      {searchResult && searchResult.aiSummary && (
        <motion.div 
          className="semantic-ai-summary-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="ai-gemini-pill">
                <Bot size={14} className="text-cyan-300 animate-pulse" />
                <span>MR-CORE AI COGNITION</span>
              </div>
              {searchResult.intent?.detectedMoods && (
                <span className="mood-intent-badge">
                  Tâm trạng nhận diện: {(searchResult.intent.detectedMoods || []).join(', ').toUpperCase()}
                </span>
              )}
            </div>
            {isSearching && (
              <span className="text-xs text-cyan-400 flex items-center gap-1">
                <RefreshCw size={12} className="animate-spin" /> Đang tổng hợp...
              </span>
            )}
          </div>
          <div className="ai-summary-text">
            {searchResult.aiSummary.split('\n').map((line, lIdx) => (
              <p key={lIdx} dangerouslySetInnerHTML={{ 
                __html: line
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Results List */}
      <div className="semantic-results-wrapper">
        <div className="results-header-row">
          <span className="results-count-title">
            KẾT QUẢ PHÙ HỢP THEO NGỮ CẢNH ({searchResult?.results?.length || 0})
          </span>
          {searchResult?.results?.length > 0 && (
            <span className="results-sort-tag">Sắp xếp theo độ tương đồng ngữ nghĩa ↓</span>
          )}
        </div>

        {isSearching && !searchResult && (
          <div className="semantic-loading-box">
            <RefreshCw size={24} className="animate-spin text-cyan-400 mb-2" />
            <p>Đang quét không gian ngữ nghĩa & phân tích cảm xúc...</p>
          </div>
        )}

        {searchResult && searchResult.results.length === 0 && !isSearching && (
          <div className="semantic-empty-state">
            <div className="empty-icon-circle">🔍</div>
            <h5>Không tìm thấy ký ức tương thích</h5>
            <p>Thử đặt câu hỏi bằng các từ khóa cảm xúc khác (vui vẻ, áp lực, gia đình, bình yên...) hoặc thêm bản ghi nhật ký mới.</p>
          </div>
        )}

        {searchResult && searchResult.results.length > 0 && (
          <div className="semantic-cards-grid">
            {searchResult.results.map((entry) => {
              const dateStr = entry.date ? new Date(entry.date).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : 'Ký ức gần đây'

              const moodColorMap = {
                joy: '#00f0ff',
                calm: '#10b981',
                melancholy: '#60a5fa',
                friction: '#f59e0b',
                breach: '#ef4444'
              }
              const moodColor = moodColorMap[entry.mood] || '#00f0ff'

              return (
                <motion.div
                  key={entry.id}
                  className="semantic-result-card"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, borderColor: moodColor }}
                  onClick={() => handleCardClick(entry)}
                >
                  <div className="card-header-bar">
                    <div className="flex items-center gap-2">
                      <span className="source-tag-pill">
                        {entry.sourceIcon} {entry.sourceLabel}
                      </span>
                      <span 
                        className="mood-indicator-pill"
                        style={{ color: moodColor, borderColor: `${moodColor}55`, backgroundColor: `${moodColor}15` }}
                      >
                        ● {(entry.mood || 'CALM').toUpperCase()} ({entry.intensity || 75}%)
                      </span>
                    </div>

                    <div className="match-score-badge" style={{ color: moodColor }}>
                      <Sparkles size={12} />
                      <span>{entry.matchPercentage}% Khớp</span>
                    </div>
                  </div>

                  <h4 className="result-card-title">{entry.title}</h4>

                  <div className="result-card-date">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="result-excerpt-box">
                    <p className="excerpt-quote">
                      "{entry.excerpt || entry.note || 'Không có ghi chú văn bản'}"
                    </p>
                  </div>

                  {entry.matchedAspects && entry.matchedAspects.length > 0 && (
                    <div className="matched-aspects-row">
                      {entry.matchedAspects.slice(0, 3).map((asp, aIdx) => (
                        <span key={aIdx} className="aspect-chip">
                          ✓ {asp}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="card-footer-row">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {entry.tags?.slice(0, 3).map((t, tIdx) => (
                        <span key={tIdx} className="card-tag-pill">{t}</span>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      className="inspect-action-btn"
                      style={{ color: moodColor }}
                    >
                      <span>Xem Chi Tiết</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Entry Inspector Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="entry-inspect-overlay" onClick={() => setSelectedEntry(null)}>
            <motion.div 
              className="entry-inspect-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inspect-header">
                <div className="flex items-center gap-2">
                  <span className="source-tag-pill">{selectedEntry.sourceIcon} {selectedEntry.sourceLabel}</span>
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    // KÝ ỨC #{selectedEntry.id.slice(0, 10)} //
                  </span>
                </div>
                <button 
                  className="settings-close-btn"
                  onClick={() => setSelectedEntry(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="inspect-body">
                <h3 className="text-xl font-bold text-white mb-2">{selectedEntry.title}</h3>
                <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                  <Clock size={13} />
                  <span>{new Date(selectedEntry.date).toLocaleString('vi-VN')}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold uppercase">{selectedEntry.mood} ({selectedEntry.intensity}%)</span>
                </div>

                <div className="inspect-media-container mb-4">
                  <img 
                    src={selectedEntry.mediaUrl || getMoodArtSvg(selectedEntry.mood, selectedEntry.title, selectedEntry.intensity)} 
                    alt={selectedEntry.title} 
                    className="inspect-media-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = getMoodArtSvg(selectedEntry.mood, selectedEntry.title, selectedEntry.intensity)
                    }}
                  />
                </div>

                <div className="inspect-note-box mb-4">
                  <h5 className="text-xs font-bold text-slate-300 mb-1">NỘI DUNG NHẬT KÝ:</h5>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.note || 'Không có ghi chú.'}
                  </p>
                </div>

                {selectedEntry.aiAnalysis && (
                  <div className="inspect-ai-box mb-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                      <Sparkles size={13} />
                      <span>PHÂN TÍCH AI & SÓNG CẢM XÚC:</span>
                    </div>
                    <p className="text-xs text-emerald-200/90 leading-relaxed">
                      {selectedEntry.aiAnalysis}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-700">
                  {selectedEntry.tags?.map((t, i) => (
                    <span key={i} className="card-tag-pill">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )

  if (isEmbedded) {
    return content
  }

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <motion.div 
        className="settings-modal-card semantic-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </motion.div>
    </div>
  )
}
