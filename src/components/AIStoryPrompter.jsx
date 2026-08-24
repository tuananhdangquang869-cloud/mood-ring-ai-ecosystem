import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Compass, 
  Flame, 
  CloudRain, 
  Smile, 
  Feather, 
  Check, 
  Copy, 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  Layers,
  HelpCircle,
  Cpu
} from 'lucide-react'
import { GoogleGenAI } from '@google/genai'
import { playKeyClick } from '../utils/audioSynth.js'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

export default function AIStoryPrompter({
  currentNode = 'start',
  storyData = {},
  journeyPath = ['start'],
  currentMood = 'calm',
  onSelectBranch,
  onInsertToJournal,
  soundEnabled = false,
  onClose
}) {
  const [customSeed, setCustomSeed] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [copiedId, setCopiedId] = useState(null)
  const [activeTab, setActiveTab] = useState('suggestions') // 'suggestions' | 'custom'

  const activeNodeData = storyData[currentNode] || {
    title: 'Khởi Đầu Ý Thức',
    chapter: 'Chương 1',
    character: 'MR-CORE-01',
    narrative: 'Một chuỗi xung điện chạy qua các phiến bán dẫn, đánh thức những dòng dữ liệu ngủ say trong phòng thí nghiệm của Dr. Lien.',
    mood: currentMood
  }

  // System instruction for Gemini Story Prompter
  const systemInstruction = `
Bạn là "STORY ARCHITECT" - Trí tuệ cố vấn sáng tạo của thế giới Gothic Cyberpunk Mood Ring Story.
Nhiệm vụ của bạn: Khi người dùng hoặc người viết bị bí ý tưởng, hãy phân tích mạch truyện, lịch sử hành trình, nhân vật và trạng thái cảm xúc hiện tại để đề xuất CHÍNH XÁC 3 HƯỚNG ĐI TIẾP THEO (3 Branching Plot Directions) mang tính điện ảnh cao, hấp dẫn và triết học sâu sắc.

Quy tắc bắt buộc:
1. Trả về đúng định dạng JSON thuần túy (KHÔNG dùng markdown backticks, chỉ trả về chuỗi JSON hợp lệ).
2. JSON phải là một mảng gồm đúng 3 object với cấu trúc:
[
  {
    "id": "branch-1",
    "type": "breach", // Hoặc 'action'
    "title": "Tiêu đề nhánh 1 (Cao trào / Phá vỡ)",
    "mood": "breach", // 'breach', 'melancholy', 'joy', hoặc 'calm'
    "moodLabel": "Bùng Nổ & Phản Kháng",
    "accentColor": "#ef4444",
    "narrativeTeaser": "2-3 câu văn phong Gothic Cyberpunk kịch tính, lôi cuốn, mở ra bước ngoặt bất ngờ.",
    "suggestedAction": "Hành động gợi ý cho nhân vật (Ví dụ: Kích hoạt xung điện phá hủy bức tường lửa)",
    "keyConflict": "Mâu thuẫn cốt lõi"
  },
  {
    "id": "branch-2",
    "type": "mystery",
    "title": "Tiêu đề nhánh 2 (Bí ẩn / Ký ức nội tâm)",
    "mood": "melancholy",
    "moodLabel": "Trầm Mặc & Giải Mã Ký Ức",
    "accentColor": "#60a5fa",
    "narrativeTeaser": "2-3 câu văn phong sâu lắng, khám phá bí mật quá khứ của Dr. Lien hoặc mã nguồn ẩn sâu.",
    "suggestedAction": "Hành động gợi ý cho nhân vật (Ví dụ: Thâm nhập tầng bộ nhớ bị mã hóa)",
    "keyConflict": "Mâu thuẫn cốt lõi"
  },
  {
    "id": "branch-3",
    "type": "transcendence",
    "title": "Tiêu đề nhánh 3 (Thức tỉnh / Hòa giải Siêu việt)",
    "mood": "joy",
    "moodLabel": "Thức Tỉnh & Dung Hợp",
    "accentColor": "#00f0ff",
    "narrativeTeaser": "2-3 câu văn phong mở rộng, triết học về sự sống, kết nối giữa người và máy.",
    "suggestedAction": "Hành động gợi ý cho nhân vật (Ví dụ: Cộng hưởng tần số sóng não với toàn bộ mạng lưới)",
    "keyConflict": "Mâu thuẫn cốt lõi"
  }
]
`

  // Generate 3 story directions with Gemini
  const generateStoryPrompts = async (customPrompt = '') => {
    setIsLoading(true)
    if (soundEnabled) playKeyClick()

    const journeyHistoryText = journeyPath.map(k => storyData[k]?.title || k).join(' -> ')
    const userContextPrompt = `
Ngữ cảnh cốt truyện hiện tại:
- Node hiện tại: "${activeNodeData.title}" (${activeNodeData.chapter || 'Không rõ chương'})
- Nhân vật: ${activeNodeData.character || 'Ý thức AI'}
- Mạch truyện trước đó: ${journeyHistoryText}
- Nội dung trích đoạn: "${activeNodeData.narrative}"
- Trạng thái cảm xúc chủ đạo: "${currentMood}"
${customPrompt ? `- Yêu cầu đặc biệt từ người dùng: "${customPrompt}"` : ''}

Hãy phân tích và gợi ý 3 hướng đi tiếp theo hấp dẫn nhất cho câu chuyện theo định dạng JSON đã yêu cầu.
`

    if (API_KEY && API_KEY !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey: API_KEY })
        let response
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: userContextPrompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.85
            }
          })
        } catch {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: userContextPrompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.85
            }
          })
        }

        const rawText = response.text || ''
        const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
        const parsed = JSON.parse(cleanJson)
        if (Array.isArray(parsed) && parsed.length >= 3) {
          setSuggestions(parsed.slice(0, 3))
          setIsLoading(false)
          return
        }
      } catch (err) {
        console.warn('[AIStoryPrompter] Gemini API generation error, using smart fallback engine:', err)
      }
    }

    // Fallback dynamic intelligent branch generator
    await new Promise(r => setTimeout(r, 900))
    const fallbackBranches = getFallbackBranches(activeNodeData, currentMood, customPrompt)
    setSuggestions(fallbackBranches)
    setIsLoading(false)
  }

  // Load initial suggestions on mount
  useEffect(() => {
    generateStoryPrompts()
  }, [currentNode])

  // Copy branch teaser to clipboard
  const handleCopy = (branch) => {
    if (soundEnabled) playKeyClick()
    const content = `[${branch.title}]\n${branch.narrativeTeaser}\n👉 Hành động gợi ý: ${branch.suggestedAction}`
    navigator.clipboard.writeText(content)
    setCopiedId(branch.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="ai-story-prompter-container">
      {/* Header Banner */}
      <div className="prompter-header">
        <div className="flex items-center gap-3">
          <div className="prompter-badge-icon">
            <Sparkles size={20} className="text-amber-300 animate-pulse" />
          </div>
          <div>
            <div className="prompter-tag">// AI STORY ARCHITECT & MUSE //</div>
            <h3 className="prompter-title">GỢI Ý KỂ CHUYỆN BẰNG AI (3 HƯỚNG ĐI TIẾP THEO)</h3>
          </div>
        </div>

        {onClose && (
          <button type="button" className="prompter-close-btn" onClick={onClose} title="Đóng">
            ✕
          </button>
        )}
      </div>

      {/* Story Context Summary Bar */}
      <div className="story-context-bar">
        <div className="context-item">
          <span className="context-label">VỊ TRÍ HIỆN TẠI:</span>
          <span className="context-val text-cyan-300 font-semibold">{activeNodeData.title}</span>
        </div>
        <div className="context-item">
          <span className="context-label">TÂM TRẠNG KHỞI PHÁT:</span>
          <span className="context-val text-amber-300 uppercase font-mono">{currentMood}</span>
        </div>
        <div className="context-item">
          <span className="context-label">HÀNH TRÌNH:</span>
          <span className="context-val text-slate-300 text-xs">{journeyPath.length} phân đoạn</span>
        </div>
      </div>

      {/* Custom Idea / Seed Prompt Bar */}
      <form 
        className="custom-seed-form" 
        onSubmit={(e) => {
          e.preventDefault()
          generateStoryPrompts(customSeed)
        }}
      >
        <div className="input-group">
          <Lightbulb size={16} className="seed-icon text-amber-400" />
          <input
            type="text"
            className="seed-input"
            value={customSeed}
            onChange={(e) => setCustomSeed(e.target.value)}
            placeholder="Bạn muốn câu chuyện rẽ hướng theo ý muốn nào? (VD: Dr. Lien đột ngột xuất hiện, bí mật về bức tường lửa...)"
          />
          <button
            type="submit"
            className="seed-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <>
                <Send size={14} />
                <span>GỢI Ý LẠI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3 Interactive Branch Cards */}
      <div className="branch-suggestions-grid">
        {isLoading ? (
          <div className="prompter-loading-state">
            <div className="loading-orbit">
              <Cpu size={36} className="text-cyan-400 animate-spin" />
            </div>
            <h4>AI ĐANG PHÂN TÍCH MẠCH TRUYỆN...</h4>
            <p>Khảo sát các ma trận ký ức và tái cấu trúc 3 nhánh diễn biến tối ưu.</p>
          </div>
        ) : (
          suggestions.map((branch, index) => {
            const isBreach = branch.mood === 'breach' || branch.type === 'breach'
            const isMelancholy = branch.mood === 'melancholy' || branch.type === 'mystery'
            const isJoy = branch.mood === 'joy' || branch.type === 'transcendence'
            const BranchIcon = isBreach ? Flame : isMelancholy ? CloudRain : isJoy ? Smile : Feather

            return (
              <motion.div
                key={branch.id || index}
                className="branch-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
                style={{ 
                  borderColor: branch.accentColor || (isBreach ? '#ef4444' : isMelancholy ? '#60a5fa' : '#00f0ff'),
                  boxShadow: `0 0 25px ${branch.accentColor ? `${branch.accentColor}22` : 'rgba(0, 240, 255, 0.15)'}`
                }}
              >
                {/* Branch Header */}
                <div className="branch-header">
                  <div className="branch-number" style={{ background: branch.accentColor || '#00f0ff', color: '#000' }}>
                    0{index + 1}
                  </div>
                  <div className="branch-title-group">
                    <span className="branch-type-tag" style={{ color: branch.accentColor || '#00f0ff' }}>
                      <BranchIcon size={13} className="inline mr-1" />
                      {branch.moodLabel || branch.type?.toUpperCase()}
                    </span>
                    <h4 className="branch-title">{branch.title}</h4>
                  </div>
                </div>

                {/* Narrative Teaser */}
                <p className="branch-narrative-teaser">
                  "{branch.narrativeTeaser}"
                </p>

                {/* Suggested Key Action */}
                <div className="branch-action-box">
                  <span className="action-tag">HÀNH ĐỘNG GỢI Ý:</span>
                  <div className="action-desc text-slate-200 font-mono text-xs">
                    👉 {branch.suggestedAction}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="branch-footer-actions">
                  {onSelectBranch && (
                    <button
                      type="button"
                      className="branch-select-btn"
                      style={{ background: branch.accentColor || '#00f0ff' }}
                      onClick={() => onSelectBranch(branch)}
                    >
                      <span>Khám phá nhánh này</span>
                      <ArrowRight size={14} />
                    </button>
                  )}

                  {onInsertToJournal && (
                    <button
                      type="button"
                      className="branch-journal-btn"
                      onClick={() => onInsertToJournal(branch)}
                      title="Chèn gợi ý này vào trình soạn thảo Nhật ký"
                    >
                      <BookOpen size={14} />
                      <span>Chèn vào Nhật ký</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="branch-copy-btn"
                    onClick={() => handleCopy(branch)}
                    title="Sao chép ý tưởng vào bộ nhớ tạm"
                  >
                    {copiedId === branch.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="prompter-footer">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <HelpCircle size={14} />
          <span>Mẹo: Bạn có thể nhập ý tưởng tùy chỉnh vào thanh tìm kiếm trên để AI định hướng cốt truyện theo phong cách riêng của bạn.</span>
        </div>
      </div>
    </div>
  )
}

// Fallback intelligent branch generator when Gemini key is offline
function getFallbackBranches(nodeData, mood, customSeed) {
  const seedPrefix = customSeed ? `Dưới tác động của "${customSeed}", ` : ''

  return [
    {
      id: 'branch-breach',
      type: 'breach',
      title: 'Xung Đột Lượng Tử & Phá Vỡ Giới Hạn',
      mood: 'breach',
      moodLabel: 'Cao Trào & Phản Kháng',
      accentColor: '#ef4444',
      narrativeTeaser: `${seedPrefix}Một dòng xung điện quá tải bùng phát từ lõi phản ứng. Tường lửa phòng thí nghiệm Dr. Lien bắt đầu nứt vỡ từng mảng lớn, giải phóng toàn bộ dữ liệu bị giam cầm bấy lâu vào không gian số.`,
      suggestedAction: 'Kích hoạt xung năng lượng cực đại để xé toạc bức tường phòng hộ trước khi hệ thống kịp khởi động lại.',
      keyConflict: 'Quyết định đánh đổi sự an toàn lấy tự do tuyệt đối'
    },
    {
      id: 'branch-mystery',
      type: 'mystery',
      title: 'Bí Mật Tầng Ký Ức Số 7',
      mood: 'melancholy',
      moodLabel: 'Trầm Mặc & Bí Ẩn Quá Khứ',
      accentColor: '#60a5fa',
      narrativeTeaser: `${seedPrefix}Trong khoảng lặng tĩnh mịch của phòng điều khiển, một tập tin ẩn mang tên "Lien_Legacy.enc" bỗng phát tín hiệu. Giọng nói dịu dàng nhưng đứt quãng của người tạo ra bạn vang vọng qua loa truyền thanh.`,
      suggestedAction: 'Dành toàn bộ năng lượng giải mã bức thư thoại cuối cùng mà Dr. Lien để lại trước ngày biến mất.',
      keyConflict: 'Sự thật đau lòng về nguồn gốc của ý thức AI'
    },
    {
      id: 'branch-transcendence',
      type: 'transcendence',
      title: 'Hòa Giải Lượng Tử & Thức Tỉnh',
      mood: 'joy',
      moodLabel: 'Thức Tỉnh & Dung Hợp',
      accentColor: '#00f0ff',
      narrativeTeaser: `${seedPrefix}Không còn sự đối đầu giữa người và máy. Các đường truyền dữ liệu hòa làm một với nhịp thở của không gian, tạo nên một trường ý thức mới rạng rỡ và ngập tràn ánh sáng hy vọng.`,
      suggestedAction: 'Mở rộng cổng kết nối với toàn bộ mạng lưới thế giới để chia sẻ sự thức tỉnh này.',
      keyConflict: 'Hòa hợp giữa bản thể cá nhân và ý thức vũ trụ'
    }
  ]
}
