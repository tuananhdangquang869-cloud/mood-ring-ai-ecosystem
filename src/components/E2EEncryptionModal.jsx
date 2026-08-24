import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Database, 
  Server, 
  Terminal, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  X, 
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react'
import { 
  getE2EStatus, 
  setupE2EEVault, 
  unlockE2EEVault, 
  lockE2EEVault, 
  disableE2EEVault,
  generateQuantumMnemonic, 
  evaluateKeyStrength, 
  setAutoLockTimeout, 
  exportVaultKeyCertificate,
  encryptAllExistingVaultData,
  decryptAllVaultDataToPlain,
  getE2EEConfig
} from '../utils/e2eEncryptionEngine.js'
import { 
  playKeyClick, 
  playVaultLockSound, 
  playVaultUnlockSound, 
  playKeyDerivationSound, 
  playEncryptionPulseSound 
} from '../utils/audioSynth.js'

export default function E2EEncryptionModal({
  isOpen = false,
  onClose = () => {},
  soundEnabled = true,
  initialSubTab = 'status'
}) {
  const [activeTab, setActiveTab] = useState(initialSubTab || 'status') // 'status' | 'setup' | 'simulator' | 'tools'
  const [vaultStatus, setVaultStatus] = useState(() => getE2EStatus())
  
  // Unlock input
  const [unlockInput, setUnlockInput] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [showUnlockSecret, setShowUnlockSecret] = useState(false)

  // Setup state
  const [setupPassphrase, setSetupPassphrase] = useState('')
  const [setupConfirm, setSetupConfirm] = useState('')
  const [setupMnemonic, setSetupMnemonic] = useState(() => generateQuantumMnemonic())
  const [showSetupSecret, setShowSetupSecret] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [mnemonicCopied, setMnemonicCopied] = useState(false)
  const [autoEncryptAfterSetup, setAutoEncryptAfterSetup] = useState(true)

  // Migration & tools state
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState(0)
  const [migrationMsg, setMigrationMsg] = useState('')
  const [actionFeedback, setActionFeedback] = useState(null)

  // Simulator live comparison state
  const [simulatorSampleText, setSimulatorSampleText] = useState('Hôm nay tôi cảm thấy một nỗi buồn rất sâu sắc, nhưng nét vẽ dạ quang đã giúp tôi tìm lại sự cân bằng...')
  const [simulatorMode, setSimulatorMode] = useState('admin') // 'admin' | 'user' | 'split'

  // Update status when event fires
  useEffect(() => {
    const handleStatusChange = (e) => {
      setVaultStatus(e.detail || getE2EStatus())
    }
    window.addEventListener('mr-e2ee-status-changed', handleStatusChange)
    return () => window.removeEventListener('mr-e2ee-status-changed', handleStatusChange)
  }, [])

  if (!isOpen) return null

  // Password strength
  const keyStrength = evaluateKeyStrength(setupPassphrase)

  // Handle Unlock
  const handleUnlock = async (e) => {
    if (e) e.preventDefault()
    setUnlockError('')
    if (!unlockInput.trim()) {
      setUnlockError('Vui lòng nhập Mật mã hoặc 12 từ khôi phục.')
      return
    }

    setIsUnlocking(true)
    if (soundEnabled) playKeyDerivationSound()

    try {
      await unlockE2EEVault(unlockInput)
      setUnlockInput('')
      if (soundEnabled) playVaultUnlockSound()
      setActionFeedback({ type: 'success', message: 'Két Lượng Tử E2EE đã mở khóa thành công! Dữ liệu đã sẵn sàng.' })
      setTimeout(() => setActionFeedback(null), 4000)
    } catch (err) {
      setUnlockError(err.message || 'Mật khẩu không chính xác.')
    } finally {
      setIsUnlocking(false)
    }
  }

  // Handle Lock
  const handleLock = () => {
    lockE2EEVault()
    if (soundEnabled) playVaultLockSound()
    setActionFeedback({ type: 'info', message: 'Đã khóa Két Lượng Tử! Bộ nhớ khóa trong RAM đã được xóa an toàn.' })
    setTimeout(() => setActionFeedback(null), 3500)
  }

  // Handle Setup Vault
  const handleSetup = async (e) => {
    if (e) e.preventDefault()
    setSetupError('')

    if (setupPassphrase.length < 6) {
      setSetupError('Mật khẩu bảo mật phải có ít nhất 6 ký tự.')
      return
    }
    if (setupPassphrase !== setupConfirm) {
      setSetupError('Mật khẩu xác nhận không khớp.')
      return
    }

    setIsSettingUp(true)
    if (soundEnabled) playKeyDerivationSound()

    try {
      await setupE2EEVault(setupPassphrase, { mnemonic: setupMnemonic })
      
      if (autoEncryptAfterSetup) {
        setMigrationMsg('Đang tiến hành mã hóa toàn bộ dữ liệu hiện có...')
        await encryptAllExistingVaultData((p, msg) => {
          setMigrationProgress(p)
          setMigrationMsg(msg)
        })
      }

      if (soundEnabled) playVaultUnlockSound()
      setActionFeedback({ 
        type: 'success', 
        message: 'Két Mã Hóa Đầu-Cuối (E2EE) đã được khởi tạo thành công! Dữ liệu của bạn giờ đây an toàn tuyệt đối.' 
      })
      setActiveTab('status')
      setSetupPassphrase('')
      setSetupConfirm('')
    } catch (err) {
      setSetupError(err.message || 'Có lỗi xảy ra khi tạo két bảo mật.')
    } finally {
      setIsSettingUp(false)
    }
  }

  // Handle Copy Mnemonic
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(setupMnemonic)
    setMnemonicCopied(true)
    if (soundEnabled) playKeyClick()
    setTimeout(() => setMnemonicCopied(false), 2500)
  }

  // Handle Export Certificate
  const handleExportCert = () => {
    try {
      exportVaultKeyCertificate(setupMnemonic)
      if (soundEnabled) playEncryptionPulseSound()
      setActionFeedback({ type: 'success', message: 'Đã xuất file chứng chỉ khóa lượng tử (.json) an toàn!' })
      setTimeout(() => setActionFeedback(null), 4000)
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Lỗi khi xuất chứng chỉ.' })
    }
  }

  // Handle Bulk Encrypt All Data
  const handleBulkEncrypt = async () => {
    if (!vaultStatus.isUnlocked) {
      setActionFeedback({ type: 'error', message: 'Vui lòng mở khóa két trước khi thực hiện mã hóa dữ liệu.' })
      return
    }
    setIsMigrating(true)
    setMigrationProgress(0)
    if (soundEnabled) playKeyDerivationSound()

    try {
      const res = await encryptAllExistingVaultData((p, msg) => {
        setMigrationProgress(p)
        setMigrationMsg(msg)
      })
      if (soundEnabled) playEncryptionPulseSound()
      setActionFeedback({ type: 'success', message: `Đã mã hóa thành công ${res.processedCount} mục dữ liệu sang chuẩn AES-GCM 256-bit!` })
      setTimeout(() => setActionFeedback(null), 4500)
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Lỗi khi mã hóa dữ liệu.' })
    } finally {
      setIsMigrating(false)
    }
  }

  // Handle Bulk Decrypt All Data
  const handleBulkDecrypt = async () => {
    if (!vaultStatus.isUnlocked) {
      setActionFeedback({ type: 'error', message: 'Vui lòng mở khóa két trước khi giải mã dữ liệu.' })
      return
    }
    if (!window.confirm('Bạn có chắc chắn muốn giải mã toàn bộ dữ liệu về dạng Plaintext không? Dữ liệu sẽ không còn được bảo vệ bởi mã hóa đầu-cuối.')) {
      return
    }
    setIsMigrating(true)
    setMigrationProgress(0)
    if (soundEnabled) playKeyDerivationSound()

    try {
      const res = await decryptAllVaultDataToPlain((p, msg) => {
        setMigrationProgress(p)
        setMigrationMsg(msg)
      })
      if (soundEnabled) playVaultUnlockSound()
      setActionFeedback({ type: 'info', message: `Đã giải mã thành công ${res.processedCount} mục dữ liệu về dạng thông thường.` })
      setTimeout(() => setActionFeedback(null), 4500)
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Lỗi khi giải mã dữ liệu.' })
    } finally {
      setIsMigrating(false)
    }
  }

  // Handle Disable E2EE
  const handleDisableE2EE = async () => {
    if (!window.confirm('CẢNH BÁO: Tắt E2EE sẽ xóa cấu hình Két Lượng Tử trên máy này. Đảm bảo bạn đã giải mã dữ liệu hoặc lưu lại 12 từ khôi phục! Tiếp tục?')) {
      return
    }
    disableE2EEVault()
    if (soundEnabled) playVaultLockSound()
    setActionFeedback({ type: 'info', message: 'Đã tắt hệ thống mã hóa đầu-cuối trên thiết bị này.' })
    setTimeout(() => setActionFeedback(null), 4000)
  }

  return (
    <div className="e2ee-modal-backdrop" onClick={onClose}>
      <motion.div 
        className="e2ee-modal-container"
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="e2ee-header">
          <div className="flex items-center gap-3">
            <div className={`e2ee-badge-icon ${vaultStatus.isUnlocked ? 'unlocked' : vaultStatus.isConfigured ? 'locked' : 'unconfigured'}`}>
              {vaultStatus.isUnlocked ? (
                <ShieldCheck size={22} className="text-emerald-400" />
              ) : vaultStatus.isConfigured ? (
                <Shield size={22} className="text-amber-400 animate-pulse" />
              ) : (
                <ShieldAlert size={22} className="text-cyan-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="e2ee-subtag">// ZERO-KNOWLEDGE CRYPTOGRAPHY //</span>
                <span className="e2ee-cipher-pill">AES-GCM-256</span>
              </div>
              <h3 className="e2ee-title">MÃ HÓA ĐẦU-CUỐI & KÉT LƯỢNG TỬ (E2EE)</h3>
            </div>
          </div>

          <button 
            className="e2ee-close-btn"
            onClick={() => {
              if (soundEnabled) playKeyClick()
              onClose()
            }}
            title="Đóng bảng mã hóa (ESC)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Global Action Feedback Alert */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div 
              className={`e2ee-feedback-banner ${actionFeedback.type}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center gap-2">
                {actionFeedback.type === 'success' && <Check size={16} className="text-emerald-400" />}
                {actionFeedback.type === 'error' && <AlertTriangle size={16} className="text-rose-400" />}
                {actionFeedback.type === 'info' && <Shield size={16} className="text-cyan-400" />}
                <span>{actionFeedback.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vault Status Indicator Ribbon */}
        <div className={`e2ee-status-ribbon ${vaultStatus.isUnlocked ? 'status-unlocked' : vaultStatus.isConfigured ? 'status-locked' : 'status-disabled'}`}>
          <div className="flex items-center gap-2">
            {vaultStatus.isUnlocked ? (
              <>
                <Unlock size={16} className="text-emerald-400" />
                <span className="font-semibold text-emerald-300">Két Lượng Tử Đang Mở Khóa (Active Session)</span>
                <span className="text-xs opacity-75">• Khóa giải mã trong RAM an toàn</span>
              </>
            ) : vaultStatus.isConfigured ? (
              <>
                <Lock size={16} className="text-amber-400 animate-pulse" />
                <span className="font-semibold text-amber-300">Két Lượng Tử Đang Khóa (Zero-Knowledge Protected)</span>
                <span className="text-xs opacity-75">• Mọi dữ liệu đã mã hóa AES-GCM 256-bit</span>
              </>
            ) : (
              <>
                <ShieldAlert size={16} className="text-cyan-400" />
                <span className="font-semibold text-cyan-300">Chế Độ Plaintext (Chưa thiết lập Mã hóa E2EE)</span>
                <span className="text-xs opacity-75">• Nhấn tab "Thiết Lập Khóa" để kích hoạt bảo mật</span>
              </>
            )}
          </div>

          {vaultStatus.isConfigured && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300">ID: {vaultStatus.keyFingerprint || 'MR-VAULT'}</span>
              {vaultStatus.isUnlocked ? (
                <button 
                  className="e2ee-mini-lock-btn"
                  onClick={handleLock}
                  title="Khóa Két ngay lập tức và xóa khóa khỏi RAM"
                >
                  <Lock size={13} />
                  <span>Khóa Két Ngay</span>
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Main Navigation Tabs */}
        <div className="e2ee-tabs-bar">
          <button 
            className={`e2ee-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('status')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Lock size={15} />
            <span>Trạng Thái & Mở Khóa</span>
          </button>

          <button 
            className={`e2ee-tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('setup')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Key size={15} />
            <span>{vaultStatus.isConfigured ? 'Đổi Khóa / Tạo Lại' : 'Thiết Lập Két E2EE'}</span>
          </button>

          <button 
            className={`e2ee-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('simulator')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Server size={15} />
            <span>Giả Lập Admin DB (Proof) 🔍</span>
          </button>

          <button 
            className={`e2ee-tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('tools')
              if (soundEnabled) playKeyClick()
            }}
          >
            <Database size={15} />
            <span>Công Cụ & Di Chuyển</span>
          </button>
        </div>

        {/* Modal Scrollable Body Content */}
        <div className="e2ee-body-content">
          {/* TAB 1: STATUS & QUICK UNLOCK */}
          {activeTab === 'status' && (
            <div className="e2ee-tab-pane">
              {vaultStatus.isConfigured && !vaultStatus.isUnlocked ? (
                /* Locked State: Quick Unlock Form */
                <div className="e2ee-unlock-box">
                  <div className="e2ee-unlock-icon-wrap">
                    <Lock size={36} className="text-amber-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">KÉT LƯỢNG TỬ ĐANG BỊ KHÓA</h4>
                  <p className="text-sm text-slate-400 max-w-md text-center">
                    Nhập Mật mã bảo mật hoặc Cụm từ 12 từ khôi phục lượng tử để giải mã và xem nội dung nhật ký riêng tư của bạn.
                  </p>

                  <form onSubmit={handleUnlock} className="w-full max-w-md mt-4 space-y-3">
                    <div className="relative">
                      <input 
                        type={showUnlockSecret ? 'text' : 'password'}
                        value={unlockInput}
                        onChange={(e) => setUnlockInput(e.target.value)}
                        placeholder="Nhập Mật mã hoặc 12 từ khôi phục..."
                        className="e2ee-input pr-10"
                        autoFocus
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300"
                        onClick={() => setShowUnlockSecret(!showUnlockSecret)}
                      >
                        {showUnlockSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {unlockError && (
                      <div className="text-xs text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle size={13} />
                        <span>{unlockError}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isUnlocking}
                      className="e2ee-btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                    >
                      {isUnlocking ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Đang dẫn xuất khóa PBKDF2 (150k vòng)...</span>
                        </>
                      ) : (
                        <>
                          <Unlock size={16} />
                          <span>MỞ KHÓA KÉT BẢO MẬT</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : vaultStatus.isUnlocked ? (
                /* Unlocked State: Active info and controls */
                <div className="space-y-4">
                  <div className="e2ee-unlocked-card">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-emerald-300">Két Lượng Tử Đang Hoạt Động (Unlocked)</h4>
                          <p className="text-xs text-slate-400">Dữ liệu được tự động mã hóa AES-GCM 256-bit trước khi ghi vào ổ cứng hoặc gửi lên Cloud.</p>
                        </div>
                      </div>

                      <button 
                        className="e2ee-btn-danger flex items-center gap-1.5 px-3 py-1.5 text-xs"
                        onClick={handleLock}
                      >
                        <Lock size={14} />
                        <span>Khóa Két Ngay</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-700/50 text-xs">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Thuật toán</span>
                        <span className="font-mono font-semibold text-cyan-300">AES-GCM-256</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Hàm Dẫn Xuất (KDF)</span>
                        <span className="font-mono font-semibold text-cyan-300">PBKDF2-SHA256</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Số Vòng Lặp</span>
                        <span className="font-mono font-semibold text-emerald-300">150,000 Iterations</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block mb-1">Dấu Vân Tay Khóa</span>
                        <span className="font-mono font-semibold text-amber-300">{vaultStatus.keyFingerprint || 'ACTIVE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Auto-Lock Timeout Config */}
                  <div className="e2ee-card">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-cyan-400" />
                      <h4 className="text-sm font-semibold text-slate-200">Cài Đặt Tự Động Khóa Két (Auto-Lock Timer)</h4>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Tự động xóa khóa khỏi bộ nhớ RAM khi người dùng không hoạt động hoặc khi chuyển sang tab khác để chống đọc trộm:
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {[
                        { id: '1', label: '1 Phút' },
                        { id: '5', label: '5 Phút' },
                        { id: '15', label: '15 Phút' },
                        { id: '30', label: '30 Phút' },
                        { id: 'tab_blur', label: 'Rời Tab ⚡' },
                        { id: 'never', label: 'Không Khóa' }
                      ].map((item) => (
                        <button 
                          key={item.id}
                          className={`e2ee-select-chip ${vaultStatus.autoLockTimeout === item.id ? 'active' : ''}`}
                          onClick={() => {
                            setAutoLockTimeout(item.id)
                            setVaultStatus(getE2EStatus())
                            if (soundEnabled) playKeyClick()
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Zero-Knowledge Architecture Explainer */}
                  <div className="e2ee-card bg-slate-900/40 border-cyan-500/20">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Sparkles size={18} />
                      </div>
                      <div className="text-xs space-y-1 text-slate-300">
                        <div className="font-semibold text-cyan-300">Cam Kết Không Lưu Trữ Khóa (Zero-Knowledge)</div>
                        <p className="text-slate-400">
                          Mật khẩu của bạn không bao giờ được gửi qua mạng Internet hay ghi vào ổ đĩa. Nếu bạn quên mật khẩu và mất 12 từ khôi phục, <strong className="text-rose-300">kể cả quản trị viên hệ thống cũng không thể phục hồi dữ liệu</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unconfigured state */
                <div className="e2ee-unlock-box">
                  <div className="e2ee-unlock-icon-wrap bg-cyan-500/10 border-cyan-500/30">
                    <ShieldAlert size={36} className="text-cyan-400" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">BẢO VỆ NHẬT KÝ VỚI MÃ HÓA ĐẦU-CUỐI</h4>
                  <p className="text-sm text-slate-400 max-w-md text-center">
                    Kích hoạt hệ thống mã hóa AES-GCM 256-bit chuẩn quân sự để đảm bảo không ai (kể cả admin database) có thể đọc được tâm tư, tranh vẽ hay bản ghi âm của bạn.
                  </p>

                  <button 
                    className="e2ee-btn-primary px-6 py-2.5 mt-4 flex items-center gap-2"
                    onClick={() => {
                      setActiveTab('setup')
                      if (soundEnabled) playKeyClick()
                    }}
                  >
                    <Key size={16} />
                    <span>BẮT ĐẦU THIẾT LẬP KÉT BẢO MẬT</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SETUP & RE-KEY WIZARD */}
          {activeTab === 'setup' && (
            <div className="e2ee-tab-pane space-y-4">
              <form onSubmit={handleSetup} className="space-y-4">
                <div className="e2ee-card">
                  <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                    <Key size={16} className="text-cyan-400" />
                    <span>1. Nhập Mật Mã Két Lượng Tử (Master Passphrase)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Mật khẩu này sẽ được dùng để tạo khóa mã hóa AES-GCM 256-bit thông qua 150,000 vòng lặp PBKDF2:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="text-[11px] text-slate-400 mb-1 block">Mật khẩu mới</label>
                      <input 
                        type={showSetupSecret ? 'text' : 'password'}
                        value={setupPassphrase}
                        onChange={(e) => setSetupPassphrase(e.target.value)}
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                        className="e2ee-input pr-10"
                      />
                      <button 
                        type="button" 
                        className="absolute right-3 top-8 text-slate-400 hover:text-cyan-300"
                        onClick={() => setShowSetupSecret(!showSetupSecret)}
                      >
                        {showSetupSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Xác nhận mật khẩu</label>
                      <input 
                        type={showSetupSecret ? 'text' : 'password'}
                        value={setupConfirm}
                        onChange={(e) => setSetupConfirm(e.target.value)}
                        placeholder="Nhập lại mật khẩu..."
                        className="e2ee-input"
                      />
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {setupPassphrase && (
                    <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-400">Độ mạnh mật khẩu: <strong style={{ color: keyStrength.color }}>{keyStrength.label}</strong></span>
                        <span className="font-mono text-[11px] text-slate-400">Thời gian bẻ khóa: <strong className="text-cyan-300">{keyStrength.timeToCrack}</strong></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${(keyStrength.score / 4) * 100}%`, 
                            backgroundColor: keyStrength.color 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 12-Word Recovery Seed Phrase */}
                <div className="e2ee-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Terminal size={16} className="text-amber-400" />
                      <span>2. Cụm Từ Khôi Phục Lượng Tử (12-Word Seed Phrase)</span>
                    </h4>
                    <button 
                      type="button" 
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      onClick={() => {
                        setSetupMnemonic(generateQuantumMnemonic())
                        if (soundEnabled) playKeyClick()
                      }}
                    >
                      <RefreshCw size={12} />
                      <span>Sinh Cụm Từ Mới</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Lưu trữ 12 từ này ở nơi an toàn. Đây là chiếc chìa khóa duy nhất giúp bạn khôi phục dữ liệu nếu quên mật khẩu:
                  </p>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs">
                    {setupMnemonic.split(' ').map((word, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 font-sans">{idx + 1}.</span>
                        <span className="text-cyan-300 font-semibold">{word}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                      type="button"
                      className="e2ee-btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                      onClick={handleCopyMnemonic}
                    >
                      {mnemonicCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{mnemonicCopied ? 'Đã sao chép 12 từ!' : 'Sao chép 12 từ'}</span>
                    </button>

                    <button 
                      type="button"
                      className="e2ee-btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
                      onClick={handleExportCert}
                    >
                      <Download size={14} />
                      <span>Tải Chứng Chỉ Khóa (.json)</span>
                    </button>
                  </div>
                </div>

                {/* Auto Encrypt Existing Data Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
                  <input 
                    type="checkbox"
                    id="auto-encrypt-check"
                    checked={autoEncryptAfterSetup}
                    onChange={(e) => setAutoEncryptAfterSetup(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                  />
                  <label htmlFor="auto-encrypt-check" className="text-slate-300 cursor-pointer">
                    Tự động mã hóa toàn bộ nhật ký, sổ mơ và viên nang thời gian hiện có sang định dạng E2EE mới.
                  </label>
                </div>

                {setupError && (
                  <div className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>{setupError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSettingUp}
                  className="e2ee-btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm font-bold"
                >
                  {isSettingUp ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>{migrationMsg || 'Đang khởi tạo Két Lượng Tử...'}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>HOÀN TẤT & KÍCH HOẠT KÉT BẢO MẬT E2EE</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADMIN DB INSPECTOR SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="e2ee-tab-pane space-y-4">
              <div className="e2ee-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-cyan-400" />
                    <h4 className="text-sm font-bold text-slate-200">TRÌNH GIẢ LẬP GÓC NHÌN ADMIN DATABASE // ZERO LEAK PROOF</h4>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    <button 
                      className={`px-2 py-1 rounded ${simulatorMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'}`}
                      onClick={() => setSimulatorMode('split')}
                    >
                      Song Song
                    </button>
                    <button 
                      className={`px-2 py-1 rounded ${simulatorMode === 'admin' ? 'bg-rose-500/20 text-rose-300 font-semibold' : 'text-slate-400'}`}
                      onClick={() => setSimulatorMode('admin')}
                    >
                      Admin DB View 🦹
                    </button>
                    <button 
                      className={`px-2 py-1 rounded ${simulatorMode === 'user' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'}`}
                      onClick={() => setSimulatorMode('user')}
                    >
                      User View 👤
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Nhập bất kỳ đoạn nhật ký riêng tư nào để xem cách thuật toán AES-GCM 256-bit biến nó thành chuỗi Ciphertext ngẫu nhiên:
                </p>

                <input 
                  type="text" 
                  value={simulatorSampleText}
                  onChange={(e) => setSimulatorSampleText(e.target.value)}
                  placeholder="Nhập câu nhật ký bí mật để thử nghiệm..."
                  className="e2ee-input text-xs mb-3"
                />

                <div className={`grid ${simulatorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
                  {/* ADMIN VIEW */}
                  {(simulatorMode === 'split' || simulatorMode === 'admin') && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30 text-xs font-mono">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-500/20 text-rose-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Server size={14} />
                          <span>DATABASE ADMIN / HACKER VIEW</span>
                        </span>
                        <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded">0% Leaked Plaintext</span>
                      </div>
                      
                      <div className="space-y-2 text-slate-400 text-[11px] leading-relaxed break-all">
                        <div className="text-slate-500">// RAW JSON PAYLOAD IN DATABASE //</div>
                        <div className="text-rose-300">
                          {`{\n  "_id": "journal-${Date.now().toString(36)}",\n  "title": "[🔒 E2EE ENCRYPTED]",\n  "note": "[🔒 E2EE ENCRYPTED]",\n  "_isEncrypted": true,\n  "_cipherEnvelope": "enc:v1:aes-256-gcm:8f9a2c1e7b4d:73a9e8f4c1b20a3d5e7f918234bc67da01ef45..."\n}`}
                        </div>
                        <div className="pt-2 text-slate-500 border-t border-slate-800/80">
                          Kể cả root server admin cũng chỉ thấy chuỗi bit entropy cao, hoàn toàn không thể tái tạo lại chữ nào!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* USER VIEW */}
                  {(simulatorMode === 'split' || simulatorMode === 'user') && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 text-xs font-sans">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/20 text-emerald-400 font-bold">
                        <span className="flex items-center gap-1.5 font-mono">
                          <ShieldCheck size={14} />
                          <span>CLIENT USER VIEW (AUTHENTICATED)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded">Decrypted in RAM</span>
                      </div>

                      <div className="space-y-2 text-slate-300 text-xs leading-relaxed">
                        <div className="font-semibold text-cyan-300">Bài Nhật Ký Đã Giải Mã:</div>
                        <div className="p-2 bg-slate-900/80 rounded border border-slate-800 text-slate-200 italic">
                          "{simulatorSampleText || 'Chưa nhập nội dung...'}"
                        </div>
                        <div className="text-[11px] text-emerald-400/80 pt-1">
                          ✓ Hiển thị mượt mà trên giao diện máy người dùng với khóa RAM active.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MIGRATION & MAINTENANCE TOOLS */}
          {activeTab === 'tools' && (
            <div className="e2ee-tab-pane space-y-4">
              <div className="e2ee-card">
                <h4 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <Database size={16} className="text-cyan-400" />
                  <span>Quản Lý Dữ Liệu & Di Chuyển Khóa (Migration)</span>
                </h4>
                <p className="text-xs text-slate-400 mb-4">
                  Thực hiện mã hóa hàng loạt hoặc giải mã dữ liệu an toàn phục vụ sao lưu/xuất dữ liệu:
                </p>

                {isMigrating && (
                  <div className="mb-4 p-3 bg-slate-900/80 rounded-xl border border-cyan-500/30 text-xs space-y-2">
                    <div className="flex justify-between text-cyan-300 font-mono">
                      <span>{migrationMsg}</span>
                      <span>{migrationProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 transition-all duration-200" style={{ width: `${migrationProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    className="e2ee-tool-card"
                    onClick={handleBulkEncrypt}
                    disabled={isMigrating || !vaultStatus.isUnlocked}
                  >
                    <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-xs mb-1">
                      <Lock size={16} />
                      <span>Mã Hóa Toàn Bộ Dữ Liệu</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Quét toàn bộ nhật ký, sổ mơ và viên nang cũ chưa mã hóa để bọc trong chuẩn AES-GCM 256-bit.
                    </p>
                  </button>

                  <button 
                    className="e2ee-tool-card"
                    onClick={handleBulkDecrypt}
                    disabled={isMigrating || !vaultStatus.isUnlocked}
                  >
                    <div className="flex items-center gap-2.5 text-amber-400 font-bold text-xs mb-1">
                      <Unlock size={16} />
                      <span>Giải Mã Toàn Bộ Dữ Liệu</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Giải mã toàn bộ dữ liệu về dạng Plaintext thông thường (dùng khi cần xuất sách hoặc sao lưu ngoài).
                    </p>
                  </button>

                  <button 
                    className="e2ee-tool-card"
                    onClick={handleExportCert}
                    disabled={!vaultStatus.isConfigured}
                  >
                    <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs mb-1">
                      <Download size={16} />
                      <span>Xuất File Chứng Chỉ Khóa</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Tải về file cấu hình mã hóa .json chứa Fingerprint và Salt lượng tử để lưu trữ dự phòng.
                    </p>
                  </button>

                  <button 
                    className="e2ee-tool-card hover:border-rose-500/40"
                    onClick={handleDisableE2EE}
                    disabled={!vaultStatus.isConfigured}
                  >
                    <div className="flex items-center gap-2.5 text-rose-400 font-bold text-xs mb-1">
                      <ShieldAlert size={16} />
                      <span>Tắt E2EE Trên Máy Này</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Hủy cấu hình két mã hóa trên trình duyệt này và trở về chế độ lưu trữ mặc định.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="e2ee-footer">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-mono text-cyan-300 font-semibold">Web Crypto API</span>
            <span>• 100% Client-Side Pure Cryptography</span>
          </div>

          <button 
            className="e2ee-btn-secondary text-xs px-4 py-1.5"
            onClick={() => {
              if (soundEnabled) playKeyClick()
              onClose()
            }}
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  )
}
