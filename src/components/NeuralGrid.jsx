import { motion, AnimatePresence } from 'framer-motion'

export default function NeuralGrid({ networkNodes, selectedNode, setSelectedNode }) {
  return (
    <>
      <div className="network-container">
        <h2 style={{ fontFamily: 'var(--font-title)', color: 'var(--accent)', letterSpacing: '0.05em', fontWeight: 700 }}>
          NEURAL NODE GRID SYSTEM
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Nhấp vào từng nút để mở bảng phân tích gói tin và thông số đo xa (Telemetry).
        </p>
        <div className="network-grid">
          {networkNodes.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="network-card interactive"
              onClick={() => setSelectedNode(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedNode(item) }}
              aria-label={`Xem chi tiết nút ${item.id}: ${item.title}`}
            >
              <div className="network-card-header">
                <span className="network-node-id">{item.id}</span>
                <span className={`network-status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="network-card-meta">
                <span>FREQ: {item.freq}</span>
                <span>LATENCY: {item.latency}</span>
              </div>
              <div className="network-card-action">🔍 PHÂN TÍCH TELEMETRY ➔</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Neural Grid Node Drill-down Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setSelectedNode(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-node-title"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div>
                  <span className="modal-tag">{selectedNode.id} // TELEMETRY DUMP</span>
                  <h2 id="modal-node-title">{selectedNode.title}</h2>
                </div>
                <button
                  type="button"
                  className="modal-close-btn interactive"
                  onClick={() => setSelectedNode(null)}
                  aria-label="Đóng bảng phân tích"
                >
                  ✕
                </button>
              </header>

              <div className="modal-body">
                <div className="modal-meta-grid">
                  <div className="meta-box">
                    <span className="meta-label">STATUS</span>
                    <span className={`meta-value ${selectedNode.status.toLowerCase()}`}>{selectedNode.status}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">FREQUENCY</span>
                    <span className="meta-value">{selectedNode.freq}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">LATENCY</span>
                    <span className="meta-value">{selectedNode.latency}</span>
                  </div>
                  <div className="meta-box">
                    <span className="meta-label">THROUGHPUT</span>
                    <span className="meta-value">{selectedNode.throughput}</span>
                  </div>
                </div>

                <p className="modal-description">{selectedNode.detail}</p>

                <div className="modal-section-title">LOGS TELEMETRY LIVE FEED:</div>
                <div className="modal-log-box">
                  {selectedNode.telemetryLogs.map((log, i) => (
                    <div key={i} className="modal-log-line">{log}</div>
                  ))}
                </div>

                <div className="modal-section-title">CONNECTED SUB-NODES:</div>
                <div className="modal-tags-row">
                  {selectedNode.subNodes.map((sub, i) => (
                    <span key={i} className="modal-sub-tag">🔗 {sub}</span>
                  ))}
                </div>
              </div>

              <footer className="modal-footer">
                <button
                  type="button"
                  className="modal-btn-action interactive"
                  onClick={() => setSelectedNode(null)}
                >
                  ĐÓNG PHÂN TÍCH (ESC)
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
