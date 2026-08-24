import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  RotateCcw, 
  Star, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  ChevronRight, 
  Eye,
  AlertCircle,
  Zap,
  Layers,
  X
} from 'lucide-react'
import { 
  getVersionHistory, 
  formatRelativeTime, 
  computeWordDiff, 
  toggleMilestone, 
  deleteVersion, 
  purgeOldVersions, 
  saveVersionSnapshot 
} from '../utils/autoSaveVersionEngine.js'
import { playKeyClick, playTimeTravelRollbackSound } from '../utils/audioSynth.js'

export default function VersionHistoryModal({
  isOpen = false,
  onClose = () => {},
  scope = 'journal', // 'journal' | 'dream'
  currentData = {}, // { title, note, mood, intensity, tags, mediaUrl }
  onRestoreVersion = () => {},
  soundEnabled = true
}) {
  const [versions, setVersions] = useState([])
  const [selectedVersionId, setSelectedVersionId] = useState(null)
  const [diffMode, setDiffMode] = useState('diff') // 'diff' | 'preview' | 'side-by-side'
  const [copied, setCopied] = useState(false)
  const [restoreConfirmId, setRestoreConfirmId] = useState(null)
  const [filterMilestoneOnly, setFilterMilestoneOnly] = useState(false)

  // Load versions on open
  useEffect(() => {
    if (isOpen) {
      const list = getVersionHistory(scope)
      setVersions(list)
      if (list.length > 0) {
        // Default to the 10-minute snapshot if present or the first version
        const tenMinVer = list.find(v => v.timeAgoStr?.includes('10 phút') || (Date.now() - v.timestamp >= 8 * 60 * 1000 && Date.now() - v.timestamp <= 15 * 60 * 1000))
        setSelectedVersionId(tenMinVer ? tenMinVer.versionId : list[0].versionId)
      }
    }
  }, [isOpen, scope])

  // Listen to external updates
  useEffect(() => {
    const handleUpdate = (e) => {
      if (e.detail?.scope === scope) {
        const list = getVersionHistory(scope)
        setVersions(list)
      }
    }
    window.addEventListener('version-history-updated', handleUpdate)
    return () => window.removeEventListener('version-history-updated', handleUpdate)
  }, [scope])

  if (!isOpen) return null

  const selectedVer = versions.find(v => v.versionId === selectedVersionId) || versions[0]
  const currentNote = currentData.note || currentData.content || ''
  const selectedNote = selectedVer?.note || ''

  // Word level diff calculation
  const wordDiff = selectedVer ? computeWordDiff(selectedNote, currentNote) : []

  const handleSelect = (verId) => {
    setSelectedVersionId(verId)
    setRestoreConfirmId(null)
    if (soundEnabled) playKeyClick()
  }

  const handleToggleStar = (e, verId) => {
    e.stopPropagation()
    const updated = toggleMilestone(scope, verId)
    setVersions(updated)
    if (soundEnabled) playKeyClick()
  }

  const handleDelete = (e, verId) => {
    e.stopPropagation()
    const updated = deleteVersion(scope, verId)
    setVersions(updated)
    if (selectedVersionId === verId && updated.length > 0) {
      setSelectedVersionId(updated[0].versionId)
    }
    if (soundEnabled) playKeyClick()
  }

  const handlePurge = () => {
    if (window.confirm('Bạn có chắc muốn xóa các bản lưu tự động cũ và chỉ giữ lại các bản ghim mốc quan trọng (⭐)?')) {
      const updated = purgeOldVersions(scope)
      setVersions(updated)
      if (updated.length > 0) setSelectedVersionId(updated[0].versionId)
      if (soundEnabled) playKeyClick()
    }
  }

  const handleCopyContent = () => {
    if (!selectedVer) return
    const textToCopy = `${selectedVer.title ? selectedVer.title + '\n\n' : ''}${selectedVer.note}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecuteRestore = (ver) => {
    if (!ver) return

    // Auto-save current state as a safety snapshot before rolling back
    saveVersionSnapshot(scope, currentData, {
      customNote: 'Dự phòng an toàn trước khi khôi phục'
    })

    if (soundEnabled) playTimeTravelRollbackSound()

    onRestoreVersion(ver)
    setRestoreConfirmId(null)
    onClose()
  }

  const filteredVersions = filterMilestoneOnly ? versions.filter(v => v.isMilestone) : versions

  return (
    <div className="version-history-backdrop" onClick={onClose}>
      <motion.div 
        className="version-history-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="version-modal-header">
          <div className="version-modal-title-group">
            <div className="version-icon-glow">
              <History size={20} />
            </div>
            <div>
              <div className="version-title-row">
                <h2>LỊCH SỬ PHIÊN BẢN (VERSION TIME-TRAVEL)</h2>
                <span className="version-scope-tag">
                  {scope === 'journal' ? 'NHẬT KÝ ĐA PHƯƠNG TIỆN' : 'SỔ TAY ƯỚC MƠ'}
                </span>
              </div>
              <p className="version-subtitle">
                Tự động sao lưu mỗi 5 giây. Quay lại an toàn bản thảo của 10 phút trước hoặc bất kỳ mốc thời gian nào.
              </p>
            </div>
          </div>
          <button className="version-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Main Body: 2 Columns (Timeline List + Diff Viewer) */}
        <div className="version-modal-body">
          {/* Left Timeline Panel */}
          <div className="version-timeline-panel">
            <div className="timeline-panel-toolbar">
              <span className="timeline-count-badge">
                <Clock size={13} /> {versions.length} Bản Lưu
              </span>
              <div className="timeline-filter-actions">
                <button
                  type="button"
                  className={`timeline-filter-btn ${filterMilestoneOnly ? 'active' : ''}`}
                  onClick={() => setFilterMilestoneOnly(!filterMilestoneOnly)}
                  title="Chỉ hiển thị các mốc đã ghim"
                >
                  <Star size={13} /> {filterMilestoneOnly ? 'Hiện tất cả' : 'Chỉ mốc ⭐'}
                </button>
                <button
                  type="button"
                  className="timeline-purge-btn"
                  onClick={handlePurge}
                  title="Dọn dẹp các bản lưu phụ"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="timeline-cards-list">
              {filteredVersions.length === 0 ? (
                <div className="timeline-empty-state">
                  <Clock size={32} opacity={0.4} />
                  <p>Chưa có bản ghi lịch sử nào trong bộ nhớ.</p>
                </div>
              ) : (
                filteredVersions.map((ver, idx) => {
                  const isSelected = ver.versionId === selectedVersionId
                  const isTenMin = ver.timeAgoStr?.includes('10 phút') || (Date.now() - ver.timestamp >= 8 * 60 * 1000 && Date.now() - ver.timestamp <= 15 * 60 * 1000)
                  const relativeStr = formatRelativeTime(ver.timestamp)

                  return (
                    <div
                      key={ver.versionId}
                      className={`timeline-card ${isSelected ? 'selected' : ''} ${isTenMin ? 'recommended-10m' : ''} ${ver.isMilestone ? 'is-milestone' : ''}`}
                      onClick={() => handleSelect(ver.versionId)}
                    >
                      <div className="timeline-node-line" />
                      <div className="timeline-card-header">
                        <div className="timeline-time-group">
                          <span className="timeline-time-badge">
                            {isTenMin ? '⭐ 10 PHÚT TRƯỚC (KHUYÊN DÙNG)' : relativeStr}
                          </span>
                          <span className="timeline-clock-str">
                            {new Date(ver.timestamp).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                        <div className="timeline-card-actions">
                          <button
                            type="button"
                            className={`timeline-star-btn ${ver.isMilestone ? 'starred' : ''}`}
                            onClick={(e) => handleToggleStar(e, ver.versionId)}
                            title={ver.isMilestone ? 'Bỏ ghim mốc' : 'Ghim mốc quan trọng'}
                          >
                            <Star size={14} />
                          </button>
                          <button
                            type="button"
                            className="timeline-delete-btn"
                            onClick={(e) => handleDelete(e, ver.versionId)}
                            title="Xóa bản lưu này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="timeline-card-title">
                        {ver.title || 'Bản thảo không tiêu đề'}
                      </div>

                      <div className="timeline-card-preview-text">
                        {ver.note ? ver.note.substring(0, 90) + '...' : '(Không có văn bản)'}
                      </div>

                      <div className="timeline-card-footer">
                        <span className="timeline-words-stat">
                          <FileText size={12} /> {ver.wordCount} từ ({ver.charCount} ký tự)
                        </span>
                        {ver.deltaSummary && (
                          <span className="timeline-delta-badge">
                            {ver.deltaSummary}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Diff & Inspection Panel */}
          <div className="version-diff-panel">
            {selectedVer ? (
              <div className="diff-panel-content">
                {/* Diff Toolbar */}
                <div className="diff-panel-toolbar">
                  <div className="diff-view-modes">
                    <button
                      type="button"
                      className={`diff-mode-btn ${diffMode === 'diff' ? 'active' : ''}`}
                      onClick={() => setDiffMode('diff')}
                    >
                      <Sparkles size={14} /> So Sánh Trực Quan (Diff)
                    </button>
                    <button
                      type="button"
                      className={`diff-mode-btn ${diffMode === 'preview' ? 'active' : ''}`}
                      onClick={() => setDiffMode('preview')}
                    >
                      <Eye size={14} /> Xem Toàn Văn Phiên Bản
                    </button>
                    <button
                      type="button"
                      className={`diff-mode-btn ${diffMode === 'side-by-side' ? 'active' : ''}`}
                      onClick={() => setDiffMode('side-by-side')}
                    >
                      <Layers size={14} /> Song Song (Side-by-Side)
                    </button>
                  </div>

                  <div className="diff-action-buttons">
                    <button
                      type="button"
                      className="diff-copy-btn"
                      onClick={handleCopyContent}
                      title="Sao chép toàn bộ văn bản của phiên bản này"
                    >
                      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copied ? 'Đã chép!' : 'Sao Chép'}</span>
                    </button>
                  </div>
                </div>

                {/* Diff Metadata Bar */}
                <div className="diff-meta-bar">
                  <div className="diff-meta-item">
                    <span className="diff-meta-label">Thời điểm lưu:</span>
                    <span className="diff-meta-val">
                      {new Date(selectedVer.timestamp).toLocaleString('vi-VN')} ({formatRelativeTime(selectedVer.timestamp)})
                    </span>
                  </div>
                  <div className="diff-meta-item">
                    <span className="diff-meta-label">Tiêu đề:</span>
                    <span className="diff-meta-val text-cyan-300 font-semibold">
                      {selectedVer.title || '(Chưa đặt tiêu đề)'}
                    </span>
                  </div>
                  <div className="diff-meta-item">
                    <span className="diff-meta-label">Mood:</span>
                    <span className="diff-meta-val uppercase">
                      {selectedVer.mood} ({selectedVer.intensity}%)
                    </span>
                  </div>
                </div>

                {/* Main Diff Viewing Area */}
                <div className="diff-display-box">
                  {diffMode === 'diff' && (
                    <div className="diff-unified-view">
                      <div className="diff-legend">
                        <span className="diff-legend-item added">
                          <span className="legend-dot green"></span> Đã thêm vào hiện tại
                        </span>
                        <span className="diff-legend-item removed">
                          <span className="legend-dot red"></span> Có trong bản cũ (đã bị xóa gần đây)
                        </span>
                      </div>

                      <div className="diff-text-flow">
                        {wordDiff.map((token, i) => {
                          if (token.type === 'added') {
                            return (
                              <span key={i} className="diff-word-added">
                                {token.text}
                              </span>
                            )
                          }
                          if (token.type === 'removed') {
                            return (
                              <span key={i} className="diff-word-removed" title="Nội dung trong bản cũ">
                                {token.text}
                              </span>
                            )
                          }
                          return <span key={i} className="diff-word-unchanged">{token.text}</span>
                        })}
                      </div>
                    </div>
                  )}

                  {diffMode === 'preview' && (
                    <div className="diff-raw-preview">
                      <h3 className="preview-heading">{selectedVer.title || 'Bản Thảo Phiên Bản Cũ'}</h3>
                      <div className="preview-body-text">
                        {selectedVer.note || '(Bản thảo trống văn bản)'}
                      </div>
                      {selectedVer.tags && selectedVer.tags.length > 0 && (
                        <div className="preview-tags-row">
                          {selectedVer.tags.map((t, idx) => (
                            <span key={idx} className="preview-tag-pill">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {diffMode === 'side-by-side' && (
                    <div className="diff-side-by-side-grid">
                      <div className="side-pane old-pane">
                        <div className="side-pane-header">
                          <span>PHIÊN BẢN CŨ ({formatRelativeTime(selectedVer.timestamp)})</span>
                          <span>{selectedVer.wordCount} từ</span>
                        </div>
                        <div className="side-pane-body">
                          <h4>{selectedVer.title || '(Không tiêu đề)'}</h4>
                          <p>{selectedVer.note || '(Trống)'}</p>
                        </div>
                      </div>

                      <div className="side-pane current-pane">
                        <div className="side-pane-header">
                          <span>BẢN ĐANG VIẾT HIỆN TẠI</span>
                          <span>{(currentNote.trim().split(/\s+/).filter(Boolean).length)} từ</span>
                        </div>
                        <div className="side-pane-body">
                          <h4>{currentData.title || '(Không tiêu đề)'}</h4>
                          <p>{currentNote || '(Trống)'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rollback Bottom Action Bar */}
                <div className="diff-footer-actions">
                  <div className="restore-safety-hint">
                    <ShieldCheck size={16} className="text-cyan-400" />
                    <span>Hệ thống tự động sao lưu bản hiện tại trước khi khôi phục. Bạn có thể hoàn tác bất kỳ lúc nào.</span>
                  </div>

                  <div className="restore-btn-group">
                    {restoreConfirmId === selectedVer.versionId ? (
                      <div className="restore-confirm-dialog">
                        <span className="confirm-text">Xác nhận quay lại phiên bản này?</span>
                        <button
                          type="button"
                          className="confirm-yes-btn"
                          onClick={() => handleExecuteRestore(selectedVer)}
                        >
                          <Check size={15} /> ĐỒNG Ý KHÔI PHỤC
                        </button>
                        <button
                          type="button"
                          className="confirm-cancel-btn"
                          onClick={() => setRestoreConfirmId(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="rollback-primary-btn"
                        onClick={() => setRestoreConfirmId(selectedVer.versionId)}
                      >
                        <RotateCcw size={16} />
                        <span>KHÔI PHỤC PHIÊN BẢN NÀY ({formatRelativeTime(selectedVer.timestamp).toUpperCase()})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="diff-empty-selection">
                <FileText size={40} opacity={0.3} />
                <p>Vui lòng chọn một phiên bản ở cột bên trái để so sánh và khôi phục.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
