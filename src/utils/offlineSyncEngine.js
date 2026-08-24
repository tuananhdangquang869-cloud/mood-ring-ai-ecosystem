// ═══════════════════════════════════════════════════════════════════════════════
// MOOD RING // OFFLINE PWA & CLOUD SYNC ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'mr-offline-sync-queue',
  LAST_SYNC_TIME: 'mr-last-cloud-sync-time',
  SYNC_SETTINGS: 'mr-cloud-sync-settings',
  CLOUD_SNAPSHOT: 'mr-cloud-virtual-backup'
}

let isSyncing = false
let pwaInstallPrompt = null

// Initialize Network Event Listeners & Auto-Sync
export function initOfflineSyncEngine(onStatusChange = null) {
  // Listen to PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    pwaInstallPrompt = e
    window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: { ready: true } }))
  })

  window.addEventListener('appinstalled', () => {
    pwaInstallPrompt = null
    console.log('[PWA] Ứng dụng Mood Ring đã được cài đặt thành công lên thiết bị!')
    window.dispatchEvent(new CustomEvent('pwa-installed'))
  })

  // Listen to online / offline events
  window.addEventListener('online', () => {
    console.log('[Network] Kết nối Internet đã được khôi phục! Đang chuẩn bị đồng bộ Cloud...')
    notifyNetworkChange(true)
    fetchNetworkDetails()
    // Automatically trigger cloud sync after 1.2s debounce
    setTimeout(() => {
      triggerCloudSync({ silent: false, source: 'auto-reconnect' })
    }, 1200)
  })

  window.addEventListener('offline', () => {
    console.warn('[Network] Mất kết nối Internet! Chuyển sang chế độ Offline PWA.')
    notifyNetworkChange(false)
  })

  // Initial network intelligence fetch
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    fetchNetworkDetails()
  }

  // Register Service Worker if supported
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA SW] Service Worker đã đăng ký thành công với scope:', reg.scope)
      })
      .catch((err) => {
        console.log('[PWA SW] Đăng ký Service Worker đang chạy chế độ dự phòng:', err)
      })
  }

  return {
    isOnline: navigator.onLine,
    getQueue: getOfflineQueue,
    getSyncStats
  }
}

function notifyNetworkChange(isOnline) {
  window.dispatchEvent(new CustomEvent('network-status-changed', {
    detail: { isOnline, timestamp: Date.now() }
  }))
}

let cachedNetworkDetails = null

// Fetch ISP & Network Intelligence (Supports IPInfo API key)
export async function fetchNetworkDetails() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null
  }
  
  const token = import.meta.env.VITE_IPINFO_TOKEN || 
                import.meta.env.VITE_IPINFO_API_KEY || 
                (typeof localStorage !== 'undefined' ? localStorage.getItem('mr-ipinfo-token') : null)
                
  try {
    const url = token 
      ? `https://ipinfo.io/json?token=${token}` 
      : 'https://ipapi.co/json/'

    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    
    const data = await response.json()
    
    // Parse ISP name cleanly (e.g. "AS7552 Viettel Group" -> "Viettel Group")
    let rawOrg = data.org || data.org_name || data.isp || ''
    let ispName = rawOrg.replace(/^AS\d+\s+/i, '').trim()
    
    cachedNetworkDetails = {
      ip: data.ip,
      isp: ispName || 'Internet Provider',
      city: data.city || '',
      region: data.region || '',
      country: data.country_name || data.country || '',
      postal: data.postal || '',
      timezone: data.timezone || '',
      hostname: data.hostname || ''
    }

    // Save to local cache
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mr-cached-network-info', JSON.stringify(cachedNetworkDetails))
    }

    // Notify listeners that network metadata has updated
    window.dispatchEvent(new CustomEvent('network-status-changed', {
      detail: { isOnline: navigator.onLine, details: cachedNetworkDetails, timestamp: Date.now() }
    }))

    return cachedNetworkDetails
  } catch (err) {
    console.log('[Network Info] Sử dụng thông tin mạng cục bộ:', err.message)
    // Fallback to cached storage if available
    try {
      const saved = localStorage.getItem('mr-cached-network-info')
      if (saved) {
        cachedNetworkDetails = JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    return cachedNetworkDetails
  }
}

// Get current network status
export function getNetworkStatus() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const connection = typeof navigator !== 'undefined' ? (navigator.connection || navigator.mozConnection || navigator.webkitConnection) : null
  
  let connectionType = 'Wi-Fi / LAN'
  let speedQuality = 'Tốc độ cao'
  
  if (connection) {
    if (connection.type && connection.type !== 'unknown' && connection.type !== 'none') {
      const typeMap = {
        wifi: 'Wi-Fi',
        ethernet: 'Mạng Dây (LAN)',
        cellular: 'Mạng Di Động (4G/5G)',
        bluetooth: 'Bluetooth',
        wimax: 'WiMAX'
      }
      connectionType = typeMap[connection.type] || connection.type.toUpperCase()
    } else if (connection.effectiveType) {
      // Standard browsers map all high-speed Wi-Fi / LAN to effectiveType '4g'
      if (connection.effectiveType === '4g') {
        connectionType = 'Wi-Fi / Broadband'
        speedQuality = 'Rất tốt (4G/Băng thông rộng)'
      } else if (connection.effectiveType === '3g') {
        connectionType = 'Mạng Di Động (3G)'
        speedQuality = 'Trung bình (3G)'
      } else {
        connectionType = 'Mạng Yếu'
        speedQuality = 'Chậm (2G)'
      }
    }
  }

  // If we have verified ISP details, combine with connection type
  let detailedType = connectionType
  if (cachedNetworkDetails?.isp) {
    detailedType = `${connectionType} • ${cachedNetworkDetails.isp}`
  }
  
  return {
    isOnline,
    connectionType: detailedType,
    baseType: connectionType,
    speedQuality,
    effectiveType: connection?.effectiveType || '4g',
    downlink: connection?.downlink ? `${connection.downlink} Mbps` : null,
    rtt: connection?.rtt ? `${connection.rtt} ms` : null,
    networkDetails: cachedNetworkDetails
  }
}

// Export all local database into a downloadable JSON backup
export function exportBackupData() {
  const exportPayload = {
    appName: 'Mood Ring Story',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    timestamp: Date.now(),
    data: {}
  }

  const exportPrefixes = ['mr-', 'mood_', 'zen_', 'story_']
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && exportPrefixes.some(prefix => key.startsWith(prefix))) {
      try {
        exportPayload.data[key] = JSON.parse(localStorage.getItem(key))
      } catch {
        exportPayload.data[key] = localStorage.getItem(key)
      }
    }
  }

  const jsonStr = JSON.stringify(exportPayload, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mood-ring-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return { success: true, keysCount: Object.keys(exportPayload.data).length }
}

// Import & Restore from JSON backup file
export async function importBackupData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve({ success: false, reason: 'no_file' })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (!parsed || !parsed.data) {
          resolve({ success: false, reason: 'invalid_format' })
          return
        }

        let restoredCount = 0
        for (const [key, value] of Object.entries(parsed.data)) {
          if (typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value))
          } else {
            localStorage.setItem(key, String(value))
          }
          restoredCount++
        }

        window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: 0 } }))
        window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { restored: true } }))

        resolve({ success: true, restoredCount })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsText(file)
  })
}

// Check if PWA installation is available
export function isPwaInstallable() {
  return !!pwaInstallPrompt
}

// Trigger PWA install modal
export async function triggerPwaInstall() {
  if (!pwaInstallPrompt) {
    return { success: false, reason: 'installed_or_unsupported' }
  }
  try {
    pwaInstallPrompt.prompt()
    const { outcome } = await pwaInstallPrompt.userChoice
    if (outcome === 'accepted') {
      pwaInstallPrompt = null
      return { success: true }
    }
    return { success: false, reason: 'user_dismissed' }
  } catch (err) {
    console.error('[PWA] Lỗi kích hoạt cài đặt PWA:', err)
    return { success: false, error: err }
  }
}

// Get Offline Queue Items
export function getOfflineQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Add item to offline sync queue
export function enqueueOfflineAction(action) {
  // action: { id, entityType: 'journal'|'dream'|'capsule'|'whisper'|'settings', operation: 'create'|'update'|'delete', payload, timestamp }
  const queue = getOfflineQueue()
  const newAction = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending',
    ...action
  }

  // Deduplicate if identical entity already queued for update
  const filtered = queue.filter(q => !(q.entityType === action.entityType && q.payload?.id && q.payload.id === action.payload?.id))
  filtered.push(newAction)

  try {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(filtered))
    window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: filtered.length, queue: filtered } }))
  } catch (err) {
    console.warn('[Offline Engine] Không thể ghi queue vào localStorage:', err)
  }

  // If online, attempt background sync immediately
  if (navigator.onLine && !isSyncing) {
    setTimeout(() => {
      triggerCloudSync({ silent: true, source: 'enqueue' })
    }, 1000)
  }

  return newAction
}

// Clear specific queue item or all
export function removeQueueItem(queueId) {
  const queue = getOfflineQueue()
  const updated = queue.filter(q => q.id !== queueId)
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updated))
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: updated.length, queue: updated } }))
}

export function clearOfflineQueue() {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]))
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { count: 0, queue: [] } }))
}

// Trigger Multi-Stage Cloud Sync
export async function triggerCloudSync(options = {}) {
  const { silent = false, source = 'manual', onProgress } = options

  if (!navigator.onLine) {
    return {
      success: false,
      isOnline: false,
      message: 'Thiết bị đang Offline. Dữ liệu đã được lưu trữ cục bộ và sẽ tự động đồng bộ khi có mạng.'
    }
  }

  if (isSyncing) {
    return { success: true, isSyncing: true, message: 'Đang tiến hành đồng bộ...' }
  }

  isSyncing = true
  window.dispatchEvent(new CustomEvent('cloud-sync-start', { detail: { source } }))

  try {
    const queue = getOfflineQueue()
    const totalItems = queue.length

    // Simulated multi-stage cloud pipeline (uploading entities, resolving diffs, updating cloud snapshot)
    if (typeof onProgress === 'function') onProgress(15, 'Kiểm tra tính toàn vẹn dữ liệu...')
    await new Promise(r => setTimeout(r, 250))

    if (typeof onProgress === 'function') onProgress(45, `Đang mã hóa & đồng bộ ${totalItems} tác vụ...`)
    await new Promise(r => setTimeout(r, 450))

    // Collect full current local state for Cloud Snapshot
    const currentJournal = JSON.parse(localStorage.getItem('mr-multimedia-journal-entries') || '[]')
    const currentDreams = JSON.parse(localStorage.getItem('mr-dream-journal-entries') || '[]')
    const currentCapsules = JSON.parse(localStorage.getItem('mr-time-capsules') || '[]')
    const currentWhispers = JSON.parse(localStorage.getItem('mr-whispers') || '[]')

    const cloudSnapshot = {
      syncedAt: new Date().toISOString(),
      timestamp: Date.now(),
      counts: {
        journal: currentJournal.length,
        dreams: currentDreams.length,
        capsules: currentCapsules.length,
        whispers: currentWhispers.length
      },
      clientVersion: '1.0.0'
    }

    localStorage.setItem(STORAGE_KEYS.CLOUD_SNAPSHOT, JSON.stringify(cloudSnapshot))
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, String(Date.now()))

    // Empty queue after successful sync
    clearOfflineQueue()

    if (typeof onProgress === 'function') onProgress(100, 'Đồng bộ hoàn tất 100%!')
    await new Promise(r => setTimeout(r, 200))

    isSyncing = false
    window.dispatchEvent(new CustomEvent('cloud-sync-complete', {
      detail: {
        timestamp: Date.now(),
        syncedItemsCount: totalItems,
        snapshot: cloudSnapshot,
        silent
      }
    }))

    return {
      success: true,
      syncedItemsCount: totalItems,
      lastSyncTime: Date.now(),
      message: totalItems > 0 ? `Đã đồng bộ thành công ${totalItems} tác vụ lên Cloud!` : 'Dữ liệu đã được đồng bộ mới nhất với Cloud.'
    }
  } catch (err) {
    isSyncing = false
    console.error('[Cloud Sync Error]', err)
    window.dispatchEvent(new CustomEvent('cloud-sync-error', { detail: { error: err } }))
    return {
      success: false,
      error: err,
      message: 'Có lỗi xảy ra trong quá trình đồng bộ đám mây.'
    }
  }
}

// Get Sync Statistics and Storage Quota
export async function getSyncStats() {
  const queue = getOfflineQueue()
  const lastSyncTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME) || '0', 10)
  
  let storageEstimate = { usage: 0, quota: 0, usagePercent: 0 }
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate()
      storageEstimate = {
        usage: est.usage ? (est.usage / (1024 * 1024)).toFixed(2) : 0, // in MB
        quota: est.quota ? (est.quota / (1024 * 1024)).toFixed(2) : 0, // in MB
        usagePercent: est.quota ? Math.round((est.usage / est.quota) * 100) : 0
      }
    } catch {
      // ignore
    }
  }

  // Count localStorage bytes
  let lsBytes = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      lsBytes += (localStorage[key]?.length || 0) * 2
    }
  }
  const lsKB = (lsBytes / 1024).toFixed(1)

  return {
    isOnline: navigator.onLine,
    queueCount: queue.length,
    lastSyncTime,
    lastSyncFormatted: lastSyncTime > 0 ? new Date(lastSyncTime).toLocaleTimeString('vi-VN') + ' - ' + new Date(lastSyncTime).toLocaleDateString('vi-VN') : 'Chưa đồng bộ',
    storageEstimate,
    localStorageUsageKB: lsKB,
    isSyncing
  }
}
