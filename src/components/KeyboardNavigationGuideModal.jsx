import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Keyboard, 
  MousePointer, 
  Smartphone, 
  Sparkles, 
  X, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Move,
  CornerDownLeft,
  Sliders,
  CheckCircle2
} from 'lucide-react'

export default function KeyboardNavigationGuideModal({ isOpen, onClose, soundEnabled }) {
  const [activeNavTab, setActiveNavTab] = useState('keys') // 'keys' | 'mouse' | 'touch'

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl rounded-2xl bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] text-slate-100 overflow-hidden font-mono flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-cyan-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <Keyboard size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>ĐIỀU HƯỚNG BẰNG TAY & BÀN PHÍM</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    NO MOUSE REQUIRED
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Lướt web, di chuyển con trỏ, nhấp chọn và cuộn trang hoàn toàn không cần dùng chuột
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              title="Đóng (Esc)"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 p-3 bg-slate-950/60 border-b border-slate-800">
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeNavTab === 'keys'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              onClick={() => setActiveNavTab('keys')}
            >
              <Keyboard size={15} />
              <span>1. Cuộn & Phím Tắt Nhanh</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeNavTab === 'mouse'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              onClick={() => setActiveNavTab('mouse')}
            >
              <MousePointer size={15} />
              <span>2. Di Chuột Ảo Bằng Phím</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeNavTab === 'touch'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
              onClick={() => setActiveNavTab('touch')}
            >
              <Smartphone size={15} />
              <span>3. Cử Chỉ Trackpad & Cảm Ứng</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {activeNavTab === 'keys' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                  <Sparkles size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-cyan-300 text-sm mb-1">Cuộn trang mượt mà không cần chạm chuột:</div>
                    <p className="text-slate-300 leading-relaxed">
                      Bạn có thể dùng phím khoảng trắng (<b>Space</b>), các phím mũi tên hoặc phím <b>J/K</b> để lướt mượt mà lên xuống trên mọi màn hình.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="font-bold text-amber-400 flex items-center gap-2">
                      <ArrowDown size={15} />
                      <span>CUỘN TRANG LÊN / XUỐNG</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Cuộn xuống 1 màn hình:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">Space</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Cuộn lên 1 màn hình:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">Shift + Space</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Cuộn từng bước êm ái:</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">J</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">K</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Về đầu / cuối trang:</span>
                      <div className="flex gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">Home</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">End</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                      <Sliders size={15} />
                      <span>CHỌN LỰA TRONG CÂU CHUYỆN</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chọn nhánh số 1:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Phím 1</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chọn nhánh số 2:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Phím 2</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chọn nhánh số 3 / 4:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Phím 3 / 4</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chuyển nút bằng bàn phím:</span>
                      <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 font-bold">Tab + Enter</kbd>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                  <div className="font-bold text-cyan-400">🚀 PHÍM TẮT TOÀN CỤC & TRỢ NĂNG (A11Y & MAINFRAME):</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/40 text-emerald-300"><b>Alt + A</b>: Trung Tâm A11y ♿</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-amber-500/40 text-amber-300"><b>Alt + D</b>: Đêm Thông Minh 🌙</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-yellow-500/40 text-yellow-300"><b>Alt + H</b>: Tương Phản Cao ⚡</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-cyan-500/40 text-cyan-300"><b>Alt + F</b>: Font Dyslexia 📖</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + R</b>: Thước Đọc Focus 📏</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + 1</b>: Cốt Truyện 📜</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + 9</b>: Toàn Cảnh Nhẫn 🪐</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + 2</b>: Mood Lab 🧠</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + 3</b>: Nhật Ký 📓</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + 4</b>: Dashboard 📊</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + E</b>: Két Khóa E2EE 🔐</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + Z</b>: Chế Độ Thiền 🧘</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>Alt + K</b>: Thành Tựu 🏆</div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800"><b>? / F1 / Alt + H</b>: Mở Hướng Dẫn</div>
                  </div>
                </div>
              </div>
            )}

            {activeNavTab === 'mouse' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                  <MousePointer size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-300 text-sm mb-1">Chế Độ Bàn Phím Điều Khiển Con Trỏ Chuột (Virtual Keyboard Mouse):</div>
                    <p className="text-slate-300 leading-relaxed">
                      Khi không có chuột, bạn có thể biến các phím <b>I / K / J / L</b> hoặc <b>Các Phím Mũi Tên</b> thành chiếc chuột ảo để di chuyển vòng sáng Neon và nhấp chọn mọi nút trên màn hình.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="font-bold text-cyan-300 flex items-center gap-2">
                      <Move size={15} />
                      <span>CÁC PHÍM DI CHUYỂN CON TRỎ</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Di chuyển lên trên:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">I</kbd> hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">↑</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Di chuyển xuống dưới:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">K</kbd> hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">↓</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Di chuyển sang trái:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">J</kbd> hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">←</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Di chuyển sang phải:</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">L</kbd> hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">→</kbd>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <div className="font-bold text-amber-300 flex items-center gap-2">
                      <CornerDownLeft size={15} />
                      <span>NHẤP CHUỘT & TĂNG TỐC</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Nhấp chuột trái (Click):</span>
                      <div className="flex gap-1">
                        <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">Enter</kbd> hoặc <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">F</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Tăng tốc di chuột x2.5:</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">Giữ Shift</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Chế độ tỉ mỉ (Precision):</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">Giữ Ctrl</kbd>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Bật/Tắt Chuột Ảo Phím:</span>
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-bold">Alt + M</kbd>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeNavTab === 'touch' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <Smartphone size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300 text-sm mb-1">Cử Chỉ Bằng Tay Trên Màn Hình Cảm Ứng & Trackpad Laptop:</div>
                    <p className="text-slate-300 leading-relaxed">
                      Bạn có thể dùng đầu ngón tay vuốt trực tiếp trên màn hình hoặc rê 2 ngón tay trên Trackpad của Laptop để duyệt web cực kỳ trực quan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 size={15} />
                      <span>CỬ CHỈ TRACKPAD (BÀN DI CHUỘT)</span>
                    </div>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400">●</span>
                        <span><b>Rê 2 ngón lên/xuống</b>: Cuộn trang mượt mà theo quán tính</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400">●</span>
                        <span><b>Vuốt 2 ngón sang trái/phải</b>: Lật trang trước/sau trong Nhật ký</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-cyan-400">●</span>
                        <span><b>Chạm 1 ngón</b>: Nhấp chọn tương tác ngay lập tức</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <div className="font-bold text-cyan-400 flex items-center gap-2">
                      <CheckCircle2 size={15} />
                      <span>CỬ CHỈ TRÊN MÀN HÌNH CẢM ỨNG</span>
                    </div>
                    <ul className="space-y-2 text-slate-300">
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">●</span>
                        <span><b>Vuốt 1 ngón tay</b>: Lướt xem nội dung câu chuyện</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">●</span>
                        <span><b>Chạm nhẹ</b>: Kích hoạt âm thanh & vệt sáng Neon cảm xúc</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-amber-400">●</span>
                        <span><b>Vẽ tay</b>: Tự do vẽ tranh ký ức trong Studio Cảm Xúc</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <div className="text-slate-400 text-xs flex items-center gap-2">
              <span>💡 Mẹo: Bấm phím</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-bold">?</kbd>
              <span>bất kỳ lúc nào để mở bảng trợ giúp này.</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer transition-all"
            >
              ĐÃ HIỂU, ĐÓNG LẠI
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
