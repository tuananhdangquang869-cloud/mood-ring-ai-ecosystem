import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Cloud, 
  CloudOff, 
  Download, 
  Upload,
  Check, 
  AlertTriangle, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Trash2, 
  X, 
  Zap,
  Layers,
  Clock,
  FolderDown,
  FolderUp
} from 'lucide-react'
import { 
  getNetworkStatus, 
  getOfflineQueue, 
  triggerCloudSync, 
  getSyncStats, 
  clearOfflineQueue, 
  removeQueueItem,
  exportBackupData,
  importBackupData
} from '../utils/offlineSyncEngine.js'
import { playKeyClick, playCloudSyncSound } from '../utils/audioSynth.js'

export default function OfflineSyncIndicator({
  soundEnabled = true,
  isOpen = false,
  onClose = null,
  isCompact = false
}) {
  const [networkStatus, setNetworkStatus] = useState(() => getNetworkStatus())
  const [queue, setQueue] = useState(() => getOfflineQueue())
  const [syncStats, setSyncStats] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncProgressMsg, setSyncProgressMsg] = useState('')
  const [syncFeedback, setSyncFeedback] = useState(null)
  const [showModal, setShowModal] = useState(isOpen)

  useEffect(() => {
    setShowModal(isOpen)
  }, [isOpen])

  // Sync state polling & event listeners
  useEffect(() => {
    const refreshData = async () => {
      setNetworkStatus(getNetworkStatus())
      setQueue(getOfflineQueue())
      const stats = await getSyncStats()
      setSyncStats(stats)
    }

    refreshData()

    const handleNetworkChange = () => refreshData()
    const handleQueueChange = () => refreshData()
    const handleSyncComplete = (e) => {
      refreshData()
      setIsSyncing(false)
      if (!e.detail?.silent) {
        setSyncFeedback({
          type: 'success',
          msg: `Đồng bộ thành công! (${new Date().toLocaleTimeString('vi-VN')})`
        })
        if (soundEnabled) playCloudSyncSound()
        setTimeout(() => setSyncFeedback(null), 3500)
      }
    }

    window.addEventListener('network-status-changed', handleNetworkChange)
    window.addEventListener('offline-queue-changed', handleQueueChange)
    window.addEventListener('cloud-sync-complete', handleSyncComplete)

    return () => {
      window.removeEventListener('network-status-changed', handleNetworkChange)
      window.removeEventListener('offline-queue-changed', handleQueueChange)
      window.removeEventListener('cloud-sync-complete', handleSyncComplete)
    }
  }, [soundEnabled])

  const handleManualSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncProgress(10)
    setSyncProgressMsg('Bắt đầu đồng bộ...')
    if (soundEnabled) playKeyClick()

    const res = await triggerCloudSync({
      silent: false,
      source: 'user-button',
      onProgress: (prog, msg) => {
        setSyncProgress(prog)
        setSyncProgressMsg(msg)
      }
    })

    if (!res.success && !res.isOnline) {
      setSyncFeedback({
        type: 'warning',
        msg: 'Đang Offline. Dữ liệu đã lưu cục bộ an toàn, sẽ tự đồng bộ khi có mạng lại.'
      })
      setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  const handleExportBackup = () => {
    if (soundEnabled) playKeyClick()
    try {
      const res = exportBackupData()
      setSyncFeedback({
        type: 'success',
        msg: `Đã xuất tệp sao lưu dữ liệu (${res.keysCount} mục) thành công!`
      })
      if (soundEnabled) playCloudSyncSound()
      setTimeout(() => setSyncFeedback(null), 4000)
    } catch {
      setSyncFeedback({
        type: 'warning',
        msg: 'Không thể xuất tệp sao lưu. Vui lòng thử lại.'
      })
      setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  const handleImportBackup = async (e) => {
    const file = e.target?.files?.[0]
    if (!file) return
    if (soundEnabled) playKeyClick()
    
    try {
      const res = await importBackupData(file)
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          msg: `Khôi phục thành công ${res.restoredCount} mục dữ liệu từ bản sao lưu!`
        })
        if (soundEnabled) playCloudSyncSound()
        setTimeout(() => {
          setSyncFeedback(null)
          window.location.reload()
        }, 2000)
      } else {
        setSyncFeedback({
          type: 'warning',
          msg: 'Tệp sao lưu không đúng định dạng hoặc bị hỏng.'
        })
        setTimeout(() => setSyncFeedback(null), 4000)
      }
    } catch {
      setSyncFeedback({
        type: 'warning',
        msg: 'Lỗi khi đọc tệp sao lưu.'
      })
      setTimeout(() => setSyncFeedback(null), 4000)
    }
    // reset input
    e.target.value = ''
  }

  const handleClose = () => {
    if (onClose) onClose()
    setShowModal(false)
  }

  // Floating HUD Badge if rendered inline
  const isOnline = networkStatus.isOnline
  const queueCount = queue.length

  return (
    <>
      {/* Floating Status HUD Chip (when not strictly a modal prop) */}
      {!onClose && (
        <button
          type="button"
          className={`offline-sync-hud-chip ${isOnline ? 'online' : 'offline'} ${isSyncing ? 'syncing' : ''}`}
          onClick={() => {
            setShowModal(true)
            if (soundEnabled) playKeyClick()
          }}
          title={isOnline ? (queueCount > 0 ? `${queueCount} tác vụ chờ đồng bộ Cloud` : 'Trực tuyến // Cloud Synced') : 'Chế độ Ngoại Tuyến (Offline PWA) // Lưu Cục Bộ'}
        >
          {isSyncing ? (
            <RefreshCw size={13} className="hud-icon spin" />
          ) : isOnline ? (
            <Wifi size={13} className="hud-icon text-emerald-400" />
          ) : (
            <WifiOff size={13} className="hud-icon text-rose-400" />
          )}

          <span className="hud-text">
            {isSyncing ? 'ĐỒNG BỘ...' : isOnline ? (queueCount > 0 ? `SYNC (${queueCount})` : 'ONLINE') : 'OFFLINE'}
          </span>

          {queueCount > 0 && !isSyncing && (
            <span className="hud-pending-badge">{queueCount}</span>
          )}
        </button>
      )}

      {/* Cloud & PWA Hub Modal - Portaled to document.body so that fixed positioning and full modal dimensions are not constrained by any parent HUD transform/backdrop-filter */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="offline-sync-backdrop" data-lenis-prevent onClick={handleClose}>
              <motion.div
                className="offline-sync-modal"
                data-lenis-prevent
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 240 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="offline-modal-header">
                  <div className="offline-title-row">
                    <div className={`network-status-indicator-dot ${isOnline ? 'online' : 'offline'}`} />
                    <div>
                      <h2>TRUNG TÂM ĐỒNG BỘ CLOUD & PWA OFFLINE</h2>
                      <span className="offline-meta-sub">
                        {isOnline ? 'KẾT NỐI TRỰC TUYẾN ỔN ĐỊNH' : 'CHẾ ĐỘ NGOẠI TUYẾN (OFFLINE MODE)'}
                      </span>
                    </div>
                  </div>
                  <button className="offline-close-btn" onClick={handleClose} aria-label="Close modal">
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="offline-modal-body" data-lenis-prevent>
                  {/* Feedback Toast Banner */}
                  {syncFeedback && (
                    <div className={`sync-feedback-banner ${syncFeedback.type}`}>
                      {syncFeedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
                      <span>{syncFeedback.msg}</span>
                    </div>
                  )}

                  {/* Connection & Status Cards Grid */}
                  <div className="offline-grid-cards">
                    {/* Card 1: Network & Cloud State */}
                    <div className={`offline-card ${isOnline ? 'border-emerald' : 'border-rose'}`}>
                      <div className="card-top-icon">
                        {isOnline ? <Cloud size={20} className="text-emerald-400" /> : <CloudOff size={20} className="text-rose-400" />}
                        <span className="card-status-title">TRẠNG THÁI MẠNG</span>
                      </div>
                      <div className="card-primary-val">
                        {isOnline ? 'ĐÃ KẾT NỐI' : 'NGOẠI TUYẾN (OFFLINE)'}
                      </div>
                      <p className="card-desc">
                        {isOnline 
                          ? 'Dữ liệu được tự động đồng bộ liên tục 2 chiều với đám mây.' 
                          : 'Mất kết nối Internet. Mọi bài viết, nét vẽ và âm thanh được lưu an toàn vào bộ nhớ máy và tự động đồng bộ khi có mạng.'}
                      </p>
                      <div className="card-sub-info">
                        <span>Loại kết nối: <b>{networkStatus.connectionType || 'Wi-Fi / LAN'} {networkStatus.downlink ? `(${networkStatus.downlink})` : ''}</b></span>
                        {networkStatus.networkDetails?.ip && (
                          <span>Mạng & Địa chỉ IP: <b>{networkStatus.networkDetails.ip} {networkStatus.networkDetails.city ? `(${networkStatus.networkDetails.city}, ${networkStatus.networkDetails.country})` : ''}</b></span>
                        )}
                        <span>Lần đồng bộ cuối: <b>{syncStats?.lastSyncFormatted || 'Vừa xong'}</b></span>
                      </div>
                    </div>

                    {/* Card 2: Backup Vault & Data Export */}
                    <div className="offline-card border-cyan">
                      <div className="card-top-icon">
                        <Database size={20} className="text-cyan-400" />
                        <span className="card-status-title">SAO LƯU & XUẤT DỮ LIỆU</span>
                      </div>
                      <div className="card-primary-val text-cyan-300">
                        KHO DỮ LIỆU DỰ PHÒNG
                      </div>
                      <p className="card-desc">
                        Tải toàn bộ nhật ký, tranh vẽ, time capsule về máy hoặc khôi phục dữ liệu từ tệp sao lưu JSON an toàn.
                      </p>
                      <div className="card-actions-row backup-btn-group">
                        <button
                          type="button"
                          className="backup-export-btn"
                          onClick={handleExportBackup}
                          title="Tải tệp sao lưu JSON về máy"
                        >
                          <FolderDown size={15} />
                          <span>XUẤT DỮ LIỆU (.JSON)</span>
                        </button>
                        <label className="backup-import-btn" title="Khôi phục dữ liệu từ tệp JSON">
                          <FolderUp size={15} />
                          <span>KHÔI PHỤC</span>
                          <input
                            type="file"
                            accept=".json,application/json"
                            style={{ display: 'none' }}
                            onChange={handleImportBackup}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Storage Quota & Capacity */}
                  <div className="offline-storage-box">
                    <div className="storage-header">
                      <div className="storage-title">
                        <HardDrive size={16} className="text-cyan-400" />
                        <span>DUNG LƯỢNG LƯU TRỮ CỤC BỘ (OFFLINE STORAGE)</span>
                      </div>
                      <span className="storage-percent">
                        {syncStats?.localStorageUsageKB || 0} KB đã dùng
                      </span>
                    </div>
                    <div className="storage-progress-bar-track">
                      <div 
                        className="storage-progress-bar-fill" 
                        style={{ width: `${Math.max(4, Math.min(100, (parseFloat(syncStats?.localStorageUsageKB || 0) / 5120) * 100))}%` }} 
                      />
                    </div>
                    <div className="storage-notes">
                      <span>Hỗ trợ lưu trữ hơn 10.000 trang nhật ký và tranh vẽ ngoại tuyến.</span>
                      <span className="shield-tag"><ShieldCheck size={12} className="text-emerald-400" /> Mã hóa Đầu-Cuối (E2EE AES-256)</span>
                    </div>
                  </div>


                  {/* Sync Queue Table */}
                  <div className="offline-queue-section">
                    <div className="queue-section-header">
                      <div className="queue-title-badge">
                        <Layers size={15} />
                        <span>HÀNG ĐỢI CHỜ ĐỒNG BỘ ({queue.length})</span>
                      </div>
                      {queue.length > 0 && (
                        <button
                          type="button"
                          className="queue-clear-btn"
                          onClick={clearOfflineQueue}
                          title="Xóa danh sách chờ"
                        >
                          <Trash2 size={13} /> Xóa hàng đợi
                        </button>
                      )}
                    </div>

                    {queue.length === 0 ? (
                      <div className="queue-empty-box">
                        <Check size={28} className="text-emerald-400 mb-2" />
                        <p className="font-semibold text-gray-200">Mọi dữ liệu đã được đồng bộ hoàn toàn!</p>
                        <span className="text-xs text-gray-400">Không có thao tác nào đang chờ tải lên đám mây.</span>
                      </div>
                    ) : (
                      <div className="queue-items-list">
                        {queue.map((item) => (
                          <div key={item.id} className="queue-item-row">
                            <div className="queue-item-info">
                              <span className="queue-item-type">{item.entityType?.toUpperCase() || 'DATA'}</span>
                              <span className="queue-item-op">{item.operation?.toUpperCase() || 'SAVE'}</span>
                              <span className="queue-item-title">{item.payload?.title || item.payload?.note?.substring(0, 30) || 'Dữ liệu thay đổi'}</span>
                            </div>
                            <div className="queue-item-actions">
                              <span className="queue-item-time">
                                {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                              </span>
                              <button
                                type="button"
                                className="queue-item-del"
                                onClick={() => removeQueueItem(item.id)}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Syncing Progress Bar */}
                  {isSyncing && (
                    <div className="sync-in-progress-box">
                      <div className="sync-progress-labels">
                        <span className="sync-msg-text">{syncProgressMsg}</span>
                        <span className="sync-prog-percent">{syncProgress}%</span>
                      </div>
                      <div className="sync-track">
                        <div className="sync-fill" style={{ width: `${syncProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="offline-modal-footer">
                    <div className="footer-tip">
                      <Zap size={14} className="text-amber-400" />
                      <span>Hệ thống tự động đồng bộ ngầm khi phát hiện mạng Internet.</span>
                    </div>

                    <button
                      type="button"
                      className={`sync-now-cta-btn ${isSyncing ? 'loading' : ''}`}
                      onClick={handleManualSync}
                      disabled={isSyncing}
                    >
                      <RefreshCw size={16} className={isSyncing ? 'spin' : ''} />
                      <span>{isSyncing ? 'ĐANG ĐỒNG BỘ DỮ LIỆU...' : 'ĐỒNG BỘ LÊN CLOUD NGAY'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
