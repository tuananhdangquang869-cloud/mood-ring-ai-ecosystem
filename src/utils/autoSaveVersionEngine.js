// ═══════════════════════════════════════════════════════════════════════════════
// MOOD RING // MULTI-THREADED AUTO-SAVE & VERSION HISTORY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  JOURNAL_DRAFT: 'mr-journal-draft-autosave',
  JOURNAL_VERSIONS: 'mr-journal-version-history',
  DREAM_DRAFT: 'mr-dream-draft-autosave',
  DREAM_VERSIONS: 'mr-dream-version-history'
}

// Initial seed snapshots (including a realistic 10-minute ago snapshot for immediate rollback testing)
const INITIAL_DEMO_SNAPSHOTS = [
  {
    versionId: 'ver-seed-now',
    timestamp: Date.now() - 15 * 1000, // 15 seconds ago
    timeAgoStr: '15 giây trước',
    title: 'Ký Ức Lượng Tử Giữa Đêm Vắng',
    note: 'Khi ánh sáng từ chiếc nhẫn lan tỏa, tôi cảm nhận rõ sự kết nối vô tận giữa các dòng suy nghĩ. Mọi áp lực tan biến thành những chùm sáng rực rỡ và những suy tư nhẹ nhàng.',
    mood: 'joy',
    intensity: 85,
    tags: ['#tự_do', '#vũ_trụ', '#hân_hoan'],
    wordCount: 38,
    charCount: 204,
    deltaSummary: '+4 từ, bổ sung đoạn kết',
    isMilestone: false
  },
  {
    versionId: 'ver-seed-5m',
    timestamp: Date.now() - 5 * 60 * 1000, // 5 minutes ago
    timeAgoStr: '5 phút trước',
    title: 'Ký Ức Lượng Tử',
    note: 'Khi ánh sáng từ chiếc nhẫn lan tỏa, tôi cảm nhận rõ sự kết nối vô tận giữa các dòng suy nghĩ. Mọi áp lực tan biến thành những chùm sáng.',
    mood: 'joy',
    intensity: 80,
    tags: ['#tự_do', '#vũ_trụ'],
    wordCount: 30,
    charCount: 162,
    deltaSummary: '+10 từ, tinh chỉnh ngữ nghĩa',
    isMilestone: false
  },
  {
    versionId: 'ver-seed-10m',
    timestamp: Date.now() - 10 * 60 * 1000, // 10 minutes ago
    timeAgoStr: '10 phút trước (Khuyên dùng)',
    title: 'Bản Thảo Hoàn Chỉnh Trước Khi Xóa Nhầm',
    note: 'Hôm nay là một ngày tuyệt đẹp. Tôi đã khám phá ra rằng bình yên không nằm ở bên ngoài mà bắt nguồn từ chính nhịp thở sâu và tĩnh lặng trong tâm hồn. Mọi hỗn độn đều lắng xuống khi ta cho phép bản thân được nghỉ ngơi.',
    mood: 'calm',
    intensity: 75,
    tags: ['#bình_yên', '#tĩnh_tại', '#chữa_lành', '#tâm_hồn'],
    wordCount: 46,
    charCount: 247,
    deltaSummary: '⭐ Bản thảo 10 phút trước - Đầy đủ chi tiết nhất',
    isMilestone: true
  },
  {
    versionId: 'ver-seed-30m',
    timestamp: Date.now() - 30 * 60 * 1000, // 30 minutes ago
    timeAgoStr: '30 phút trước',
    title: 'Khởi Đầu Ngày Mới',
    note: 'Hôm nay bắt đầu với một tách trà ấm và sự tĩnh lặng.',
    mood: 'calm',
    intensity: 65,
    tags: ['#khởi_đầu'],
    wordCount: 13,
    charCount: 65,
    deltaSummary: 'Bản thảo ban đầu',
    isMilestone: false
  }
]

// Get all version snapshots for a given scope ('journal' | 'dream')
export function getVersionHistory(scope = 'journal') {
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_VERSIONS : STORAGE_KEYS.DREAM_VERSIONS
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      if (scope === 'journal') {
        localStorage.setItem(key, JSON.stringify(INITIAL_DEMO_SNAPSHOTS))
        return INITIAL_DEMO_SNAPSHOTS
      }
      return []
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_DEMO_SNAPSHOTS
  }
}

// Format relative time in Vietnamese
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000))

  if (diffSec < 10) return 'Vừa xong'
  if (diffSec < 60) return `${diffSec} giây trước`
  
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin === 1) return '1 phút trước'
  if (diffMin < 60) return `${diffMin} phút trước`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour === 1) return '1 giờ trước'
  if (diffHour < 24) return `${diffHour} giờ trước`

  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay} ngày trước`
}

// Compute simple word difference summary
export function computeDeltaSummary(prevNote, newNote) {
  const prevWords = prevNote.trim() ? prevNote.trim().split(/\s+/).length : 0
  const newWords = newNote.trim() ? newNote.trim().split(/\s+/).length : 0
  const diff = newWords - prevWords

  if (diff > 0) return `+${diff} từ`
  if (diff < 0) return `-${Math.abs(diff)} từ (Rút gọn)`
  return 'Chỉnh sửa nhỏ'
}

// Save a version snapshot
export function saveVersionSnapshot(scope = 'journal', data = {}, options = {}) {
  const { isMilestone = false, customNote = '' } = options
  const versions = getVersionHistory(scope)
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_VERSIONS : STORAGE_KEYS.DREAM_VERSIONS

  const note = data.note || data.content || ''
  const title = data.title || ''
  const mood = data.mood || 'calm'
  const intensity = data.intensity || 70
  const tags = data.tags || []
  const mediaUrl = data.mediaUrl || data.sketchDataUrl || ''

  const wordCount = note.trim() ? note.trim().split(/\s+/).length : 0
  const charCount = note.length

  // Check if content is virtually identical to latest version to avoid duplicate noise
  const latest = versions[0]
  if (latest && latest.note === note && latest.title === title && !isMilestone) {
    return latest
  }

  const deltaSummary = customNote || computeDeltaSummary(latest ? latest.note : '', note)

  const newSnapshot = {
    versionId: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
    timeAgoStr: 'Vừa xong',
    title,
    note,
    mood,
    intensity,
    tags,
    mediaUrl,
    wordCount,
    charCount,
    deltaSummary,
    isMilestone
  }

  // Retention: Keep milestone snapshots + up to 45 recent snapshots (Max 50 total)
  const milestoneSnapshots = versions.filter(v => v.isMilestone)
  const regularSnapshots = versions.filter(v => !v.isMilestone)

  const updated = [newSnapshot, ...regularSnapshots].slice(0, 45)
  // Merge unique milestones
  milestoneSnapshots.forEach(m => {
    if (!updated.some(u => u.versionId === m.versionId)) {
      updated.push(m)
    }
  })

  // Sort by timestamp descending
  updated.sort((a, b) => b.timestamp - a.timestamp)

  try {
    localStorage.setItem(key, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('version-history-updated', {
      detail: { scope, count: updated.length, latest: newSnapshot }
    }))
  } catch (e) {
    console.warn('[Version Engine] Storage limit reached for snapshots:', e)
  }

  return newSnapshot
}

// Toggle milestone status on a specific version
export function toggleMilestone(scope = 'journal', versionId) {
  const versions = getVersionHistory(scope)
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_VERSIONS : STORAGE_KEYS.DREAM_VERSIONS
  
  const updated = versions.map(v => {
    if (v.versionId === versionId) {
      return { ...v, isMilestone: !v.isMilestone }
    }
    return v
  })

  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

// Delete a specific version
export function deleteVersion(scope = 'journal', versionId) {
  const versions = getVersionHistory(scope)
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_VERSIONS : STORAGE_KEYS.DREAM_VERSIONS
  const updated = versions.filter(v => v.versionId !== versionId)
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

// Clear all non-milestone versions
export function purgeOldVersions(scope = 'journal') {
  const versions = getVersionHistory(scope)
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_VERSIONS : STORAGE_KEYS.DREAM_VERSIONS
  const updated = versions.filter(v => v.isMilestone)
  localStorage.setItem(key, JSON.stringify(updated))
  return updated
}

// Auto-Save Draft (Every 5 seconds)
export function saveDraft(scope = 'journal', draftData) {
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_DRAFT : STORAGE_KEYS.DREAM_DRAFT
  const payload = {
    ...draftData,
    savedAt: Date.now(),
    savedAtFormatted: new Date().toLocaleTimeString('vi-VN')
  }
  try {
    localStorage.setItem(key, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('draft-auto-saved', { detail: { scope, timestamp: Date.now(), draft: payload } }))
  } catch (err) {
    console.warn('[Draft AutoSave Error]', err)
  }
  return payload
}

// Get saved draft
export function getSavedDraft(scope = 'journal') {
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_DRAFT : STORAGE_KEYS.DREAM_DRAFT
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Clear draft once formally saved
export function clearSavedDraft(scope = 'journal') {
  const key = scope === 'journal' ? STORAGE_KEYS.JOURNAL_DRAFT : STORAGE_KEYS.DREAM_DRAFT
  localStorage.removeItem(key)
}

// Word-level diff generator for comparison UI
export function computeWordDiff(oldText = '', newText = '') {
  const oldWords = oldText ? oldText.split(/(\s+)/) : []
  const newWords = newText ? newText.split(/(\s+)/) : []

  // Simple token matching
  const diffTokens = []
  let i = 0
  let j = 0

  while (i < oldWords.length || j < newWords.length) {
    if (i >= oldWords.length) {
      diffTokens.push({ type: 'added', text: newWords[j] })
      j++
    } else if (j >= newWords.length) {
      diffTokens.push({ type: 'removed', text: oldWords[i] })
      i++
    } else if (oldWords[i] === newWords[j]) {
      diffTokens.push({ type: 'unchanged', text: oldWords[i] })
      i++
      j++
    } else {
      // Lookahead to see if next matches
      if (newWords.indexOf(oldWords[i], j) !== -1) {
        diffTokens.push({ type: 'added', text: newWords[j] })
        j++
      } else {
        diffTokens.push({ type: 'removed', text: oldWords[i] })
        i++
      }
    }
  }

  return diffTokens
}
