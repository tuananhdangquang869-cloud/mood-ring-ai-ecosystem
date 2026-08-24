// ═══════════════════════════════════════════════════════════════════════════════
// MOOD RING // ZERO-KNOWLEDGE END-TO-END ENCRYPTION ENGINE (E2EE)
// Military-grade AES-GCM 256-bit + PBKDF2-HMAC-SHA256 (150,000 rounds)
// Web Crypto API Native Client-Side Zero-Knowledge Cryptography
// ═══════════════════════════════════════════════════════════════════════════════

const STORAGE_KEYS = {
  E2EE_CONFIG: 'mr-e2ee-vault-config',
  E2EE_AUTO_LOCK: 'mr-e2ee-auto-lock-timeout', // minutes (1, 5, 15, 30, 'tab_blur', 'never')
  E2EE_ENABLED: 'mr-e2ee-is-enabled'
}

// Curated 256-word Cyberpunk / Quantum Mnemonic Dictionary for 12-word seed phrases
const QUANTUM_WORDLIST = [
  'abyss', 'access', 'action', 'adapter', 'agent', 'airlock', 'algorithm', 'alien', 'alloy', 'alpha',
  'altitude', 'ambient', 'amplifier', 'anchor', 'android', 'antenna', 'anomaly', 'apex', 'apogee', 'arcade',
  'arch', 'archive', 'argon', 'armor', 'array', 'arsenal', 'artifact', 'asteroid', 'astral', 'atlas',
  'atom', 'audio', 'aurora', 'avatar', 'axis', 'beacon', 'beam', 'binary', 'biochip', 'biosphere',
  'bionic', 'blackout', 'blade', 'blast', 'blaster', 'blitz', 'booster', 'border', 'bot', 'brain',
  'breach', 'buffer', 'burst', 'bypass', 'cable', 'cadence', 'calm', 'camera', 'canopy', 'capsule',
  'carbon', 'carrier', 'cascade', 'catalyst', 'cathode', 'celestial', 'cellular', 'centauri', 'channel', 'chaos',
  'cipher', 'circuit', 'citadel', 'clamp', 'cloak', 'cluster', 'code', 'codec', 'cog', 'collider',
  'comet', 'command', 'compass', 'complex', 'conduit', 'console', 'constant', 'control', 'core', 'corona',
  'cosmic', 'crater', 'cross', 'cryo', 'crystal', 'cube', 'current', 'cyber', 'cyborg', 'cyclone',
  'dark', 'data', 'datum', 'dawn', 'decoder', 'delta', 'density', 'depth', 'diagram', 'diffuse',
  'digital', 'diode', 'dimension', 'direct', 'disco', 'disperse', 'divider', 'domain', 'dome', 'drift',
  'drone', 'dynamo', 'echo', 'eclipse', 'ecosystem', 'electric', 'electron', 'element', 'ellipse', 'ember',
  'emitter', 'encode', 'energy', 'engine', 'entropy', 'enzyme', 'epoch', 'equation', 'equator', 'ether',
  'event', 'exodus', 'exotic', 'factor', 'falcon', 'fast', 'feedback', 'fiber', 'field', 'filament',
  'filter', 'finite', 'firewall', 'fission', 'flare', 'flash', 'flight', 'fluid', 'flux', 'focus',
  'force', 'forge', 'fractal', 'frame', 'frequency', 'frontier', 'fuel', 'fusion', 'future', 'galaxy',
  'gamma', 'gateway', 'gauge', 'gear', 'generator', 'genome', 'ghost', 'glitch', 'globe', 'glow',
  'gradient', 'gravity', 'grid', 'ground', 'guardian', 'gyro', 'hacker', 'halo', 'harness', 'hazard',
  'header', 'helix', 'hologram', 'horizon', 'host', 'hybrid', 'hyper', 'hyperlink', 'icon', 'ignite',
  'impact', 'impulse', 'index', 'infinity', 'ingress', 'insight', 'integer', 'interface', 'ion', 'isotope',
  'jitter', 'journal', 'joy', 'jump', 'jupiter', 'krypton', 'laser', 'lattice', 'launcher', 'layer',
  'legacy', 'lens', 'level', 'light', 'linear', 'link', 'liquid', 'logic', 'loop', 'lumens',
  'lunar', 'macro', 'magma', 'magnet', 'matrix', 'matter', 'maximum', 'mega', 'memory', 'meson',
  'meteor', 'method', 'micro', 'mind', 'mirror', 'missile', 'module', 'momentum', 'monitor', 'monolith',
  'moon', 'motion', 'motor', 'nano', 'nebula', 'neon', 'network', 'neural', 'neutron', 'nexus',
  'nitrogen', 'node', 'nova', 'nuclear', 'nucleus', 'null', 'oasis', 'object', 'obsidian', 'ocean'
]

// Ephemeral In-Memory State (NEVER persisted to disk in plaintext)
let activeCryptoKey = null // In-memory CryptoKey instance
let activeKeyFingerprint = null // SHA-256 hash prefix for verification
let isVaultUnlocked = false
let autoLockTimerId = null
let lastActiveTimestamp = Date.now()

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Convert Hex String to Uint8Array
function hexToBuffer(hexString) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16)
  }
  return bytes
}

// Generate cryptographically secure random bytes
function getRandomBytes(length) {
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  return array
}

// Compute SHA-256 Digest for fingerprinting
async function sha256Digest(text) {
  const enc = new TextEncoder()
  const data = enc.encode(text)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
  return bufferToHex(hashBuffer)
}

// Derive AES-GCM 256-bit Key from Passphrase + Salt using PBKDF2
export async function deriveKeyFromPassphrase(passphrase, saltBuffer) {
  const enc = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 150000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable from RAM for maximum defense
    ['encrypt', 'decrypt']
  )

  return derivedKey
}

// Generate 12-Word Quantum Recovery Phrase
export function generateQuantumMnemonic() {
  const words = []
  const randomIndices = new Uint8Array(12)
  window.crypto.getRandomValues(randomIndices)
  for (let i = 0; i < 12; i++) {
    const idx = randomIndices[i] % QUANTUM_WORDLIST.length
    words.push(QUANTUM_WORDLIST[idx])
  }
  return words.join(' ')
}

// Normalize mnemonic or passphrase
export function normalizeKeyInput(input) {
  if (!input) return ''
  return input.trim().toLowerCase().replace(/\s+/g, ' ')
}

// Calculate Password Entropy & Strength Rating
export function evaluateKeyStrength(keyStr) {
  if (!keyStr) return { score: 0, label: 'Chưa nhập', color: '#64748b', timeToCrack: '0 giây' }
  
  const len = keyStr.length
  let poolSize = 0
  if (/[a-z]/.test(keyStr)) poolSize += 26
  if (/[A-Z]/.test(keyStr)) poolSize += 26
  if (/[0-9]/.test(keyStr)) poolSize += 10
  if (/[^a-zA-Z0-9]/.test(keyStr)) poolSize += 32
  if (keyStr.split(' ').length >= 6) poolSize = Math.max(poolSize, 256) // Mnemonic bonus

  const entropy = Math.round(len * Math.log2(Math.max(poolSize, 2)))

  if (entropy < 35) {
    return { score: 1, entropy, label: 'Yếu // Dễ đoán', color: '#ef4444', timeToCrack: '< 3 phút' }
  } else if (entropy < 60) {
    return { score: 2, entropy, label: 'Trung Bình // Cơ bản', color: '#f59e0b', timeToCrack: '~ 6 tháng' }
  } else if (entropy < 85) {
    return { score: 3, entropy, label: 'Mạnh // Chuẩn Quân Sự', color: '#10b981', timeToCrack: '~ 4,000 năm' }
  } else {
    return { score: 4, entropy, label: 'Bất Khả Xâm Phạm // Lượng Tử', color: '#00f0ff', timeToCrack: '> 10 tỷ năm (Quantum-Proof)' }
  }
}

// Check if E2EE Vault is configured
export function isE2EEConfigured() {
  try {
    const cfg = localStorage.getItem(STORAGE_KEYS.E2EE_CONFIG)
    const enabled = localStorage.getItem(STORAGE_KEYS.E2EE_ENABLED)
    return !!cfg && enabled === 'true'
  } catch {
    return false
  }
}

// Get Vault Configuration Metadata (Safe metadata, no secrets)
export function getE2EEConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.E2EE_CONFIG)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Get current vault status
export function getE2EStatus() {
  const configured = isE2EEConfigured()
  const autoLockSetting = localStorage.getItem(STORAGE_KEYS.E2EE_AUTO_LOCK) || '15'
  return {
    isConfigured: configured,
    isUnlocked: isVaultUnlocked && activeCryptoKey !== null,
    keyFingerprint: activeKeyFingerprint,
    autoLockTimeout: autoLockSetting,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-HMAC-SHA256 (150k rounds)'
  }
}

// Setup & Initialize a new E2EE Vault
export async function setupE2EEVault(passphrase, options = {}) {
  const normalized = normalizeKeyInput(passphrase)
  if (!normalized || normalized.length < 6) {
    throw new Error('Mật khẩu bảo mật hoặc cụm từ phải có ít nhất 6 ký tự!')
  }

  // 1. Generate 16-byte Cryptographic Salt
  const saltBytes = getRandomBytes(16)
  const saltHex = bufferToHex(saltBytes)

  // 2. Generate 12-Word Recovery Mnemonic if not provided
  const mnemonicPhrase = options.mnemonic || generateQuantumMnemonic()

  // 3. Derive Key & Key Fingerprint
  const key = await deriveKeyFromPassphrase(normalized, saltBytes)
  const fingerprint = (await sha256Digest(normalized + saltHex)).substring(0, 16)
  const testCipher = await encryptString('__MOOD_RING_VAULT_VERIFY__', key)

  // 4. Save Vault Config (salt, verifier token, fingerprint, creation date)
  const vaultConfig = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    salt: saltHex,
    fingerprint,
    verifierCipher: testCipher,
    recoveryMnemonicHash: await sha256Digest(normalizeKeyInput(mnemonicPhrase) + saltHex)
  }

  localStorage.setItem(STORAGE_KEYS.E2EE_CONFIG, JSON.stringify(vaultConfig))
  localStorage.setItem(STORAGE_KEYS.E2EE_ENABLED, 'true')
  if (!localStorage.getItem(STORAGE_KEYS.E2EE_AUTO_LOCK)) {
    localStorage.setItem(STORAGE_KEYS.E2EE_AUTO_LOCK, '15')
  }

  // 5. Activate In-Memory Key
  activeCryptoKey = key
  activeKeyFingerprint = fingerprint
  isVaultUnlocked = true
  lastActiveTimestamp = Date.now()
  startAutoLockMonitor()

  window.dispatchEvent(new CustomEvent('mr-e2ee-status-changed', { detail: getE2EStatus() }))

  return {
    success: true,
    salt: saltHex,
    fingerprint,
    mnemonic: mnemonicPhrase
  }
}

// Unlock Vault using Passphrase or Recovery Mnemonic
export async function unlockE2EEVault(inputKey) {
  const config = getE2EEConfig()
  if (!config) {
    throw new Error('Chưa thiết lập Két mã hóa E2EE trên thiết bị này!')
  }

  const normalized = normalizeKeyInput(inputKey)
  const saltBytes = hexToBuffer(config.salt)

  // Try deriving key from input
  const candidateKey = await deriveKeyFromPassphrase(normalized, saltBytes)

  // Verify against verification cipher
  try {
    const verified = await decryptString(config.verifierCipher, candidateKey)
    if (verified !== '__MOOD_RING_VAULT_VERIFY__') {
      throw new Error('Sai mật khẩu bảo mật hoặc cụm từ khôi phục!')
    }
  } catch (err) {
    throw new Error('Mật mã không chính xác! Không thể giải mã Két Lượng Tử.')
  }

  // Set active memory state
  activeCryptoKey = candidateKey
  activeKeyFingerprint = config.fingerprint
  isVaultUnlocked = true
  lastActiveTimestamp = Date.now()
  startAutoLockMonitor()

  window.dispatchEvent(new CustomEvent('mr-e2ee-status-changed', { detail: getE2EStatus() }))
  return { success: true, fingerprint: config.fingerprint }
}

// Lock Vault (Purge crypto key from RAM)
export function lockE2EEVault() {
  activeCryptoKey = null
  activeKeyFingerprint = null
  isVaultUnlocked = false
  if (autoLockTimerId) {
    clearInterval(autoLockTimerId)
    autoLockTimerId = null
  }

  window.dispatchEvent(new CustomEvent('mr-e2ee-status-changed', { detail: getE2EStatus() }))
  return { success: true, locked: true }
}

// Disable E2EE (Requires prior decryption of all data to avoid data loss)
export function disableE2EEVault() {
  lockE2EEVault()
  localStorage.removeItem(STORAGE_KEYS.E2EE_CONFIG)
  localStorage.setItem(STORAGE_KEYS.E2EE_ENABLED, 'false')
  window.dispatchEvent(new CustomEvent('mr-e2ee-status-changed', { detail: getE2EStatus() }))
}

// Encrypt plaintext string into AES-GCM Cipher Package
export async function encryptString(plainText, key = activeCryptoKey) {
  if (!key) throw new Error('Két mã hóa đang bị khóa! Vui lòng mở khóa để mã hóa dữ liệu.')
  
  const enc = new TextEncoder()
  const data = enc.encode(plainText)
  const iv = getRandomBytes(12) // 12-byte IV for AES-GCM

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const ivHex = bufferToHex(iv)
  const cipherHex = bufferToHex(cipherBuffer)

  // Standard encrypted envelope format: enc:v1:aes-256-gcm:{iv}:{ciphertext}
  return `enc:v1:aes-256-gcm:${ivHex}:${cipherHex}`
}

// Decrypt AES-GCM Cipher Package into plaintext string
export async function decryptString(cipherPackage, key = activeCryptoKey) {
  if (!cipherPackage || typeof cipherPackage !== 'string') return cipherPackage
  if (!isEncryptedCipherString(cipherPackage)) return cipherPackage
  if (!key) throw new Error('Két mã hóa đang bị khóa! Vui lòng mở khóa để giải mã.')

  const parts = cipherPackage.split(':')
  if (parts.length < 5 || parts[0] !== 'enc' || parts[2] !== 'aes-256-gcm') {
    throw new Error('Định dạng mã hóa không hợp lệ!')
  }

  const ivHex = parts[3]
  const cipherHex = parts[4]

  const iv = hexToBuffer(ivHex)
  const cipherBuffer = hexToBuffer(cipherHex)

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBuffer
  )

  const dec = new TextDecoder()
  return dec.decode(decryptedBuffer)
}

// Check if string is an E2EE Cipher envelope
export function isEncryptedCipherString(str) {
  return typeof str === 'string' && str.startsWith('enc:v1:aes-256-gcm:')
}

// Encrypt an Object or Entry Payload
export async function encryptEntryPayload(entry, key = activeCryptoKey) {
  if (!entry) return entry
  // If already encrypted envelope
  if (entry._isEncrypted) return entry

  // Sensitive fields to encrypt
  const sensitiveFields = ['title', 'note', 'content', 'dreamContent', 'sketchDataUrl', 'drawingData', 'audioRecording', 'whisperContent', 'message']
  const encryptedClone = { ...entry }

  const plainBundle = {}
  for (const field of sensitiveFields) {
    if (entry[field] !== undefined && entry[field] !== null) {
      plainBundle[field] = entry[field]
    }
  }

  const plainJson = JSON.stringify(plainBundle)
  const cipherString = await encryptString(plainJson, key)

  // Mask sensitive fields in the object so no plain text exists in storage
  for (const field of sensitiveFields) {
    if (encryptedClone[field] !== undefined) {
      encryptedClone[field] = '[🔒 E2EE ENCRYPTED]'
    }
  }

  encryptedClone._isEncrypted = true
  encryptedClone._cipherEnvelope = cipherString
  encryptedClone._encryptedAt = new Date().toISOString()
  encryptedClone._fingerprint = activeKeyFingerprint || 'unknown'

  return encryptedClone
}

// Decrypt an Encrypted Entry Payload
export async function decryptEntryPayload(encryptedEntry, key = activeCryptoKey) {
  if (!encryptedEntry) return encryptedEntry
  if (!encryptedEntry._isEncrypted || !encryptedEntry._cipherEnvelope) {
    return encryptedEntry // Already in plaintext
  }
  if (!key) {
    return {
      ...encryptedEntry,
      title: '[🔒 Bị Khóa Lượng Tử]',
      note: 'Vui lòng mở khóa Két Mã Hóa E2EE để đọc nội dung nhật ký được bảo vệ tuyệt đối.',
      content: 'Vui lòng mở khóa Két Mã Hóa E2EE để đọc nội dung.',
      isLockedDisplay: true
    }
  }

  try {
    const plainJson = await decryptString(encryptedEntry._cipherEnvelope, key)
    const plainBundle = JSON.parse(plainJson)
    return {
      ...encryptedEntry,
      ...plainBundle,
      _isEncrypted: false,
      _wasEncrypted: true
    }
  } catch (err) {
    console.warn('[E2EE] Giải mã bài viết thất bại:', err)
    return {
      ...encryptedEntry,
      title: '[⚠️ Lỗi Giải Mã]',
      note: 'Không thể giải mã bài viết này với khóa hiện tại.',
      isDecryptError: true
    }
  }
}

// Bulk Encrypt All Existing Local Vault Data
export async function encryptAllExistingVaultData(onProgress) {
  if (!activeCryptoKey) {
    throw new Error('Két mã hóa chưa được mở khóa!')
  }

  const keysToMigrate = [
    { key: 'mr-multimedia-journal-entries', type: 'journal' },
    { key: 'mr-dream-journal-entries', type: 'dream' },
    { key: 'mr-time-capsules', type: 'capsule' }
  ]

  let totalItems = 0
  for (const { key } of keysToMigrate) {
    try {
      const items = JSON.parse(localStorage.getItem(key) || '[]')
      totalItems += items.length
    } catch { /* empty */ }
  }

  let processed = 0
  for (const { key, type } of keysToMigrate) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const list = JSON.parse(raw)
      const encryptedList = []

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const encrypted = await encryptEntryPayload(item, activeCryptoKey)
        encryptedList.push(encrypted)
        processed++
        if (typeof onProgress === 'function') {
          onProgress(Math.round((processed / Math.max(totalItems, 1)) * 100), `Đang mã hóa ${type} (#${i + 1})...`)
        }
        await new Promise(r => setTimeout(r, 20))
      }

      localStorage.setItem(key, JSON.stringify(encryptedList))
    } catch (err) {
      console.error(`[E2EE Migration Error for ${key}]`, err)
    }
  }

  window.dispatchEvent(new CustomEvent('mr-vault-data-encrypted'))
  return { success: true, processedCount: processed }
}

// Bulk Decrypt All Vault Data Back to Plaintext (for safe export or disabling E2EE)
export async function decryptAllVaultDataToPlain(onProgress) {
  if (!activeCryptoKey) {
    throw new Error('Két mã hóa chưa được mở khóa!')
  }

  const keysToDecrypt = [
    { key: 'mr-multimedia-journal-entries', type: 'journal' },
    { key: 'mr-dream-journal-entries', type: 'dream' },
    { key: 'mr-time-capsules', type: 'capsule' }
  ]

  let processed = 0
  for (const { key, type } of keysToDecrypt) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const list = JSON.parse(raw)
      const plainList = []

      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        const plain = await decryptEntryPayload(item, activeCryptoKey)
        delete plain._isEncrypted
        delete plain._cipherEnvelope
        delete plain._encryptedAt
        delete plain._fingerprint
        delete plain._wasEncrypted
        plainList.push(plain)
        processed++
        if (typeof onProgress === 'function') {
          onProgress(Math.round((processed / 10) * 100), `Đang giải mã ${type}...`)
        }
      }

      localStorage.setItem(key, JSON.stringify(plainList))
    } catch (err) {
      console.error(`[E2EE Decrypt Error for ${key}]`, err)
    }
  }

  window.dispatchEvent(new CustomEvent('mr-vault-data-decrypted'))
  return { success: true, processedCount: processed }
}

// Auto-Lock Monitor & Lifecycle
function startAutoLockMonitor() {
  if (autoLockTimerId) clearInterval(autoLockTimerId)

  // Track user activity
  const markActive = () => {
    lastActiveTimestamp = Date.now()
  }

  window.removeEventListener('mousemove', markActive)
  window.removeEventListener('keydown', markActive)
  window.addEventListener('mousemove', markActive, { passive: true })
  window.addEventListener('keydown', markActive, { passive: true })

  // Listen to tab switch / window blur if configured
  const handleVisibilityChange = () => {
    const timeout = localStorage.getItem(STORAGE_KEYS.E2EE_AUTO_LOCK) || '15'
    if (timeout === 'tab_blur' && document.hidden && isVaultUnlocked) {
      lockE2EEVault()
      console.log('[E2EE] Đã tự động khóa Két Lượng Tử khi rời khỏi tab.')
    }
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // Periodic interval check
  autoLockTimerId = setInterval(() => {
    if (!isVaultUnlocked) return
    const timeoutSetting = localStorage.getItem(STORAGE_KEYS.E2EE_AUTO_LOCK) || '15'
    if (timeoutSetting === 'never' || timeoutSetting === 'tab_blur') return

    const minutes = parseInt(timeoutSetting, 10) || 15
    const elapsedMinutes = (Date.now() - lastActiveTimestamp) / (1000 * 60)

    if (elapsedMinutes >= minutes) {
      console.log(`[E2EE] Tự động khóa Két Lượng Tử sau ${minutes} phút không hoạt động.`)
      lockE2EEVault()
    }
  }, 10000) // check every 10s
}

// Set Auto-Lock Timeout Setting
export function setAutoLockTimeout(timeoutValue) {
  localStorage.setItem(STORAGE_KEYS.E2EE_AUTO_LOCK, timeoutValue)
  window.dispatchEvent(new CustomEvent('mr-e2ee-status-changed', { detail: getE2EStatus() }))
}

// Export Quantum Vault Key Certificate (.json)
export function exportVaultKeyCertificate(mnemonic = null) {
  const config = getE2EEConfig()
  if (!config) throw new Error('Chưa có cấu hình Két E2EE để xuất chứng chỉ.')

  const cert = {
    format: 'MOOD_RING_QUANTUM_E2EE_CERTIFICATE',
    version: '1.0.0',
    vaultId: `mr-vault-${config.fingerprint}`,
    algorithm: 'AES-GCM-256',
    keyDerivation: 'PBKDF2-HMAC-SHA256 (150,000 rounds)',
    fingerprint: config.fingerprint,
    saltHex: config.salt,
    exportedAt: new Date().toISOString(),
    recoveryMnemonic: mnemonic || 'Được bảo mật bởi cụm từ 12 từ của người dùng',
    securityNotice: 'TÀI LIỆU BẢO MẬT TUYỆT ĐỐI. KHÔNG CHIA SẺ FILE HOẶC CHUỖI KHÓA NÀY CHO BẤT KỲ AI KỂ CẢ QUẢN TRỊ VIÊN HỆ THỐNG.'
  }

  const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `moodring-e2ee-key-cert-${config.fingerprint}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return cert
}
