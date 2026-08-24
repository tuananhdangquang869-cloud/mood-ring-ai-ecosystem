import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VaultPreviewCanvas from './VaultPreviewCanvas.jsx'
import VaultGallery3D from './VaultGallery3D.jsx'
import { LayoutGrid, Box, Sparkles, Eye, Unlock, ShieldAlert } from 'lucide-react'

export default function MemoryVault({
  vaultItemsState,
  decryptingId,
  handleDecrypt,
  selectedVaultItem,
  setSelectedVaultItem,
  activeMood = 'calm'
}) {
  // '3d-gallery' | 'grid'
  const [vaultViewMode, setVaultViewMode] = useState('3d-gallery')

  const unlockedCount = vaultItemsState.filter(i => i.status === 'UNLOCKED').length

  return (
    <>
      <div className="vault-container">
        {/* Vault Header with 3D Walkthrough View Switcher */}
        <div className="vault-panel-header">
          <div className="vault-header-text">
            <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', letterSpacing: '0.05em', fontSize: 'clamp(0.9rem, 2vw, 1.25rem)', marginBottom: '0.35rem', fontWeight: 700 }}>
              CLASSIFIED MEMORY VAULT // PHÒNG TRANH KÝ ỨC 3D
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
              Không gian triển lãm 3D lưu trữ hologram cảm biến và các tệp tài liệu mã hóa.{' '}
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                {unlockedCount}/{vaultItemsState.length} UNLOCKED
              </span>
            </p>
          </div>

          {/* View Mode Switcher Pills */}
          <div className="vault-mode-switch-group">
            <button
              type="button"
              className={`vault-mode-pill ${vaultViewMode === '3d-gallery' ? 'active' : ''}`}
              onClick={() => setVaultViewMode('3d-gallery')}
              title="Không gian phòng tranh 3D đi dạo tự do bằng chuột & phím"
            >
              <Box size={15} />
              <span>🏛️ PHÒNG TRANH 3D</span>
            </button>
            <button
              type="button"
              className={`vault-mode-pill ${vaultViewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setVaultViewMode('grid')}
              title="Xem dạng danh sách thẻ hồ sơ truyền thống"
            >
              <LayoutGrid size={15} />
              <span>📋 DANH SÁCH THẺ</span>
            </button>
          </div>
        </div>

        {/* Dynamic View: 3D Walkthrough Gallery or Classic Grid */}
        {vaultViewMode === '3d-gallery' ? (
          <div className="vault-3d-embed-area">
            <VaultGallery3D
              vaultItemsState={vaultItemsState}
              selectedVaultItem={selectedVaultItem}
              setSelectedVaultItem={setSelectedVaultItem}
              handleDecrypt={handleDecrypt}
              decryptingId={decryptingId}
              activeMood={activeMood}
            />
          </div>
        ) : (
          <div className="vault-gallery">
            {vaultItemsState.map((item) => (
              <motion.div key={item.id} layout className="vault-item">
                <div className="vault-item-img-container">
                  <VaultPreviewCanvas previewType={item.previewType} color={item.color} status={item.status} />
                  <span className={`vault-status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
                <div className="vault-item-info">
                  <div className="vault-item-title" title={item.title}>
                    {item.title}
                  </div>
                  <div className="vault-item-meta">
                    {item.date} | {item.size}
                  </div>
                  {item.status === 'UNLOCKED' ? (
                    <button
                      type="button"
                      className="vault-action-btn unlocked interactive"
                      onClick={() => setSelectedVaultItem(item)}
                      aria-label={`Mở hồ sơ mã hóa ${item.title}`}
                    >
                      📂 XEM HỒ SƠ
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={decryptingId === item.id}
                      className="vault-action-btn decrypt interactive"
                      onClick={() => handleDecrypt(item.id)}
                      aria-label={`Bẻ khóa giải mã tệp ${item.title}`}
                    >
                      {decryptingId === item.id ? '⚡ ĐANG GIẢI MÃ...' : '🔓 BẺ KHÓA / GIẢI MÃ'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Memory Vault Dossier Detail Modal */}
      <AnimatePresence>
        {selectedVaultItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedVaultItem(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-vault-title"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-card vault-dossier-card"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div>
                  <span className="modal-tag">{selectedVaultItem.id} // DECRYPTED DOSSIER</span>
                  <h2 id="modal-vault-title">{selectedVaultItem.title}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn interactive"
                  onClick={() => setSelectedVaultItem(null)}
                  aria-label="Đóng hồ sơ"
                >
                  ✕
                </button>
              </header>

              <div className="modal-body">
                <div className="vault-dossier-preview-box">
                  <VaultPreviewCanvas previewType={selectedVaultItem.previewType} color={selectedVaultItem.color} status="UNLOCKED" />
                </div>

                <div className="modal-meta-grid">
                  <div className="meta-box">
                    <span className="meta-label">KEY CODE</span>
                    <span className="meta-value">{selectedVaultItem.decryptionCode}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">ARCHIVE DATE</span>
                    <span className="meta-value">{selectedVaultItem.date}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">FILE SIZE</span>
                    <span className="meta-value">{selectedVaultItem.size}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">SECURITY LEVEL</span>
                    <span className="meta-value unlocked">UNLOCKED</span>
                  </div>
                </div>

                <div className="modal-section-title">NỘI DUNG GIẢI MÃ (CLASSIFIED CONTENT):</div>
                <div className="modal-dossier-text">
                  <p>{selectedVaultItem.loreText}</p>
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-action interactive"
                  onClick={() => setSelectedVaultItem(null)}
                >
                  ĐÓNG HỒ SƠ (ESC)
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
