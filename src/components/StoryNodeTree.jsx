import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GitBranch, 
  Compass, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  MapPin, 
  Zap, 
  Layers, 
  RotateCcw, 
  ArrowRight, 
  X, 
  Info,
  Flame,
  Shield,
  Eye,
  Crown
} from 'lucide-react'
import { storyData } from '../data/storyNodes.js'
import { playKeyClick, playStoryJumpSound } from '../utils/audioSynth.js'

// Pre-defined node layout hierarchy for spatial graph rendering
const NODE_COLUMNS = [
  {
    chapterId: 'chap-1',
    chapterName: 'CHƯƠNG I: KHỞI NGUYÊN',
    nodes: ['start']
  },
  {
    chapterId: 'chap-2',
    chapterName: 'CHƯƠNG II: PHÂN NHÁNH THỨC TỈNH',
    nodes: ['explore', 'breach', 'archive']
  },
  {
    chapterId: 'chap-3',
    chapterName: 'CHƯƠNG III: THÁCH THỨC & SỰ THẬT',
    nodes: ['firewall', 'abyss', 'containment', 'awakened', 'fracture', 'recalibration']
  },
  {
    chapterId: 'chap-end',
    chapterName: 'CÁC ĐẠI KẾT CỤC (ENDINGS)',
    nodes: ['dissolution', 'transcendence', 'synthesis']
  }
]

// Mood styling dictionary
const MOOD_META = {
  calm: {
    label: 'Cân Bằng // Tĩnh Lặng',
    color: '#00f0ff',
    border: 'rgba(0, 240, 255, 0.4)',
    bg: 'rgba(0, 240, 255, 0.08)',
    glow: '0 0 20px rgba(0, 240, 255, 0.35)',
    icon: '✨'
  },
  friction: {
    label: 'Cảnh Báo // Ma Sát',
    color: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.08)',
    glow: '0 0 20px rgba(245, 158, 11, 0.35)',
    icon: '⚡'
  },
  breach: {
    label: 'Đột Phá // Nguy Cấp',
    color: '#ef4444',
    border: 'rgba(239, 68, 68, 0.4)',
    bg: 'rgba(239, 68, 68, 0.08)',
    glow: '0 0 20px rgba(239, 68, 68, 0.35)',
    icon: '🔥'
  }
}

export default function StoryNodeTree({
  isOpen = true,
  isEmbedded = false,
  onClose = () => {},
  currentNode = 'start',
  journeyPath = ['start'],
  customStoryNodes = {},
  onJumpToNode = () => {},
  soundEnabled = true
}) {
  const [viewMode, setViewMode] = useState('graph') // 'graph' | 'tree'
  const [filterMood, setFilterMood] = useState('all') // 'all' | 'calm' | 'friction' | 'breach' | 'endings'
  const [inspectedNodeId, setInspectedNodeId] = useState(currentNode)

  // Merge default nodes with custom AI generated nodes
  const allNodes = useMemo(() => {
    return { ...storyData, ...customStoryNodes }
  }, [customStoryNodes])

  // Track discovered nodes in local storage or journey path history
  const visitedSet = useMemo(() => {
    try {
      const savedHistory = localStorage.getItem('mr-all-discovered-nodes')
      const parsed = savedHistory ? JSON.parse(savedHistory) : []
      const combined = new Set([...journeyPath, ...parsed, currentNode])
      localStorage.setItem('mr-all-discovered-nodes', JSON.stringify(Array.from(combined)))
      return combined
    } catch {
      return new Set([...journeyPath, currentNode])
    }
  }, [journeyPath, currentNode])

  // Compute story completion statistics
  const totalNodesCount = Object.keys(allNodes).length
  const visitedNodesCount = visitedSet.size
  const completionPercent = Math.min(100, Math.round((visitedNodesCount / totalNodesCount) * 100))

  const endings = ['dissolution', 'transcendence', 'synthesis']
  const discoveredEndingsCount = endings.filter(e => visitedSet.has(e)).length

  // Filtered nodes logic
  const filteredNodeKeys = useMemo(() => {
    return Object.keys(allNodes).filter(key => {
      const node = allNodes[key]
      if (filterMood === 'all') return true
      if (filterMood === 'endings') return node.isEnding
      return node.mood === filterMood
    })
  }, [allNodes, filterMood])

  const inspectedNode = allNodes[inspectedNodeId] || allNodes[currentNode] || allNodes['start']

  const handleTimeJump = (nodeId) => {
    if (soundEnabled) {
      playStoryJumpSound()
    }
    onJumpToNode(nodeId)
    setInspectedNodeId(nodeId)
  }

  if (!isOpen && !isEmbedded) return null

  const treeBody = (
    <>
      {/* Header Bar */}
      <div className="story-tree-header">
        <div className="flex items-center gap-3">
          <div className="tree-header-icon-box">
            <GitBranch className="text-cyan-400 animate-pulse" size={22} />
          </div>
          <div>
            <div className="tree-header-tag">// NARRATIVE QUANTUM MAP //</div>
            <h2 className="tree-header-title">SƠ ĐỒ CÂY CỐT TRUYỆN TƯƠNG TÁC</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="tree-view-toggle">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('graph')
                if (soundEnabled) playKeyClick()
              }}
              title="Sơ đồ Mạng Lưới Lượng Tử (Interactive Graph)"
            >
              <Zap size={14} />
              <span>Mạng Lưới</span>
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('tree')
                if (soundEnabled) playKeyClick()
              }}
              title="Phân Cấp Chương & Nhánh Kết (Hierarchy Tree)"
            >
              <Layers size={14} />
              <span>Phân Cấp</span>
            </button>
          </div>

          {!isEmbedded && (
            <button
              type="button"
              className="tree-close-btn"
              onClick={() => {
                if (soundEnabled) playKeyClick()
                onClose()
              }}
              title="Đóng sơ đồ (ESC)"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

        {/* Stats & Filter Bar */}
        <div className="story-tree-stats-bar">
          <div className="stats-badges-group">
            <div className="stat-pill" title="Tỷ lệ phân đoạn đã đi qua">
              <span className="stat-label">KHÁM PHÁ:</span>
              <span className="stat-value text-cyan-400 font-bold">{completionPercent}%</span>
              <span className="stat-sub">({visitedNodesCount}/{totalNodesCount})</span>
            </div>
            <div className="stat-pill" title="Số kết thúc đã đạt được">
              <span className="stat-label">KẾT CỤC:</span>
              <span className="stat-value text-amber-400 font-bold">{discoveredEndingsCount}/3</span>
            </div>
            <div className="stat-pill" title="Tổng số bước rẽ nhánh hiện tại">
              <span className="stat-label">BƯỚC ĐI:</span>
              <span className="stat-value text-purple-400 font-bold">{journeyPath.length}</span>
              <span className="stat-sub">Hops</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-group">
            <button
              type="button"
              className={`filter-pill ${filterMood === 'all' ? 'active' : ''}`}
              onClick={() => {
                setFilterMood('all')
                if (soundEnabled) playKeyClick()
              }}
            >
              Tất Cả ({totalNodesCount})
            </button>
            <button
              type="button"
              className={`filter-pill calm ${filterMood === 'calm' ? 'active' : ''}`}
              onClick={() => {
                setFilterMood('calm')
                if (soundEnabled) playKeyClick()
              }}
            >
              ✨ Cân Bằng
            </button>
            <button
              type="button"
              className={`filter-pill friction ${filterMood === 'friction' ? 'active' : ''}`}
              onClick={() => {
                setFilterMood('friction')
                if (soundEnabled) playKeyClick()
              }}
            >
              ⚡ Ma Sát
            </button>
            <button
              type="button"
              className={`filter-pill breach ${filterMood === 'breach' ? 'active' : ''}`}
              onClick={() => {
                setFilterMood('breach')
                if (soundEnabled) playKeyClick()
              }}
            >
              🔥 Đột Phá
            </button>
            <button
              type="button"
              className={`filter-pill endings ${filterMood === 'endings' ? 'active' : ''}`}
              onClick={() => {
                setFilterMood('endings')
                if (soundEnabled) playKeyClick()
              }}
            >
              👑 Kết Cục (3)
            </button>
          </div>
        </div>

        {/* Main Canvas / Grid Area */}
        <div className="story-tree-main-layout">
          {/* Left / Center: Interactive Map Graph or Tree View */}
          <div className="story-tree-canvas-container">
            {viewMode === 'graph' ? (
              <div className="story-node-columns-grid">
                {NODE_COLUMNS.map((col, colIdx) => (
                  <div key={col.chapterId} className="node-column-track">
                    <div className="column-header-chip">
                      <span className="col-idx">0{colIdx + 1}</span>
                      <span className="col-title">{col.chapterName}</span>
                    </div>

                    <div className="column-nodes-stack">
                      {col.nodes.map((nodeKey) => {
                        const node = allNodes[nodeKey]
                        if (!node) return null

                        const isCurrent = nodeKey === currentNode
                        const isVisited = visitedSet.has(nodeKey)
                        const isInspected = nodeKey === inspectedNodeId
                        const moodStyle = MOOD_META[node.mood] || MOOD_META.calm
                        const isEnding = node.isEnding

                        return (
                          <motion.div
                            key={nodeKey}
                            layout
                            className={`tree-node-card ${isCurrent ? 'current-active' : ''} ${isVisited ? 'visited' : 'unvisited'} ${isInspected ? 'inspected' : ''} ${isEnding ? 'ending-node' : ''}`}
                            style={{
                              borderColor: isCurrent ? '#00f0ff' : isVisited ? moodStyle.border : 'rgba(255, 255, 255, 0.1)',
                              boxShadow: isCurrent ? '0 0 25px rgba(0, 240, 255, 0.45)' : isVisited ? moodStyle.glow : 'none',
                              background: isVisited ? moodStyle.bg : 'rgba(15, 23, 42, 0.6)'
                            }}
                            onClick={() => {
                              setInspectedNodeId(nodeKey)
                              if (soundEnabled) playKeyClick()
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Top Status & Indicators */}
                            <div className="node-card-top">
                              <div className="flex items-center gap-1.5">
                                <span className="node-mood-icon">{isEnding ? '👑' : moodStyle.icon}</span>
                                <span className="node-id-tag">[{nodeKey.toUpperCase()}]</span>
                              </div>

                              {isCurrent ? (
                                <span className="node-status-badge current">
                                  <MapPin size={10} className="animate-bounce" /> ĐANG Ở ĐÂY
                                </span>
                              ) : isVisited ? (
                                <span className="node-status-badge visited">
                                  <CheckCircle2 size={10} /> ĐÃ QUA
                                </span>
                              ) : (
                                <span className="node-status-badge locked">
                                  <Lock size={10} /> CHƯA MỞ
                                </span>
                              )}
                            </div>

                            {/* Node Title */}
                            <h4 className="node-card-title">{node.title}</h4>

                            {/* Node Choices Preview */}
                            <div className="node-card-branches">
                              <span className="branches-count">
                                ➔ {node.choices ? node.choices.length : 0} nhánh rẽ tiếp theo
                              </span>
                            </div>

                            {/* Action Button */}
                            <div className="node-card-action">
                              {isCurrent ? (
                                <span className="current-indicator-label">Ý Thức Đang Hiện Diện</span>
                              ) : isVisited ? (
                                <button
                                  type="button"
                                  className="jump-node-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleTimeJump(nodeKey)
                                  }}
                                  title={`Dịch chuyển thời gian về node [${nodeKey.toUpperCase()}]`}
                                >
                                  <RotateCcw size={12} />
                                  <span>Dịch Chuyển Đến Đây</span>
                                </button>
                              ) : (
                                <span className="unexplored-label">Chưa được kích hoạt</span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tree Hierarchy Mode */
              <div className="story-tree-hierarchy-view">
                {NODE_COLUMNS.map((col) => (
                  <div key={col.chapterId} className="hierarchy-section">
                    <div className="hierarchy-section-title">
                      <Compass size={16} className="text-cyan-400" />
                      <span>{col.chapterName}</span>
                    </div>

                    <div className="hierarchy-cards-grid">
                      {col.nodes.map((nodeKey) => {
                        const node = allNodes[nodeKey]
                        if (!node) return null

                        const isCurrent = nodeKey === currentNode
                        const isVisited = visitedSet.has(nodeKey)
                        const moodStyle = MOOD_META[node.mood] || MOOD_META.calm

                        return (
                          <div
                            key={nodeKey}
                            className={`hierarchy-node-item ${isCurrent ? 'current' : ''} ${isVisited ? 'visited' : 'locked'}`}
                            onClick={() => {
                              setInspectedNodeId(nodeKey)
                              if (soundEnabled) playKeyClick()
                            }}
                          >
                            <div className="hierarchy-item-header">
                              <span className="hierarchy-id">[{nodeKey.toUpperCase()}]</span>
                              <span className="hierarchy-title">{node.title}</span>
                            </div>
                            <p className="hierarchy-snippet">{node.narrative ? node.narrative.slice(0, 100) + '...' : ''}</p>
                            {isVisited && !isCurrent && (
                              <button
                                type="button"
                                className="hierarchy-jump-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTimeJump(nodeKey)
                                }}
                              >
                                ➔ Dịch Chuyển Về Nhánh Này
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Inspector Panel */}
          <div className="story-tree-inspector-panel">
            <div className="inspector-card-header">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-cyan-400" />
                <span className="inspector-tag">// CHI TIẾT PHÂN ĐOẠN //</span>
              </div>
              <span className="inspector-node-id">[{inspectedNode.id.toUpperCase()}]</span>
            </div>

            <div className="inspector-card-body">
              <div className="inspector-meta-row">
                <span className="inspector-chapter">{inspectedNode.chapter || 'Chương Không Xác Định'}</span>
                <span 
                  className="inspector-mood-pill"
                  style={{
                    color: MOOD_META[inspectedNode.mood]?.color || '#00f0ff',
                    borderColor: MOOD_META[inspectedNode.mood]?.border || 'rgba(0,240,255,0.4)',
                    background: MOOD_META[inspectedNode.mood]?.bg || 'rgba(0,240,255,0.1)'
                  }}
                >
                  {MOOD_META[inspectedNode.mood]?.label || inspectedNode.mood}
                </span>
              </div>

              <h3 className="inspector-title">{inspectedNode.title}</h3>

              {inspectedNode.character && (
                <div className="inspector-character">
                  <span className="text-gray-400">Nhân vật hiện diện:</span>{' '}
                  <span className="text-cyan-300 font-medium">👤 {inspectedNode.character}</span>
                </div>
              )}

              {/* Narrative Content */}
              <div className="inspector-narrative-box">
                <p>{inspectedNode.narrative}</p>
              </div>

              {/* Outgoing Choices */}
              <div className="inspector-choices-section">
                <div className="choices-header-label">CÁC HƯỚNG RẼ TỪ ĐÂY:</div>
                <div className="inspector-choices-list">
                  {inspectedNode.choices && inspectedNode.choices.map((choice, idx) => (
                    <div key={idx} className="inspector-choice-row">
                      <span className="choice-bullet">➔</span>
                      <span className="choice-text">{choice.label}</span>
                      <span className="choice-target">[{choice.targetNode.toUpperCase()}]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inspector Action Button */}
              <div className="inspector-footer-action">
                {inspectedNode.id === currentNode ? (
                  <div className="inspector-current-banner">
                    <MapPin size={16} className="text-cyan-400 animate-pulse" />
                    <span>Bạn đang ở phân đoạn này trong cốt truyện</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="inspector-jump-btn"
                    onClick={() => handleTimeJump(inspectedNode.id)}
                  >
                    <RotateCcw size={16} />
                    <span>DỊCH CHUYỂN Ý THỨC ĐẾN NHÁNH NÀY</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
    </>
  )

  if (isEmbedded) {
    return (
      <div className="story-tree-embedded-container relative">
        <div className="story-tree-modal-card embedded-view">
          {treeBody}
        </div>
      </div>
    )
  }

  return (
    <div className="story-tree-modal-backdrop" onClick={onClose}>
      <motion.div
        className="story-tree-modal-card"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
      >
        {treeBody}
      </motion.div>
    </div>
  )
}
