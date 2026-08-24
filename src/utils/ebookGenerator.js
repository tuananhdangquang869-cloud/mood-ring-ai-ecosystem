/**
 * ebookGenerator.js
 * Tiện ích hỗ trợ đóng gói và xuất sách điện tử (PDF, EPUB/HTML, Markdown, JSON)
 * Tự động tổng hợp dữ liệu từ Multimedia Journal, Dream Journal, Time Capsule và Cốt truyện.
 */

// Định nghĩa 5 preset bìa sách nghệ thuật
export const BOOK_COVER_THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Holo Neon',
    accentColor: '#00f0ff',
    secondaryColor: '#ff00ea',
    bgGradient: 'linear-gradient(135deg, #050c18 0%, #0d1b2a 50%, #1a0826 100%)',
    borderGlow: '0 0 25px rgba(0, 240, 255, 0.4)',
    coverBadge: 'NEURAL CHRONICLES',
    desc: 'Phong cách mạng lưới vi mạch dạ quang và ánh sáng Neon vị lai'
  },
  {
    id: 'nocturne',
    name: 'Nocturne Deep Space',
    accentColor: '#818cf8',
    secondaryColor: '#38bdf8',
    bgGradient: 'linear-gradient(135deg, #090a1a 0%, #13142e 60%, #1e1b4b 100%)',
    borderGlow: '0 0 25px rgba(129, 140, 248, 0.4)',
    coverBadge: 'ASTRAL MEMORIES',
    desc: 'Bầu trời đêm vô tận và những chòm sao ký ức lấp lánh'
  },
  {
    id: 'royal-leather',
    name: 'Royal Noir Gold',
    accentColor: '#fbbf24',
    secondaryColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, #111111 0%, #1c1917 50%, #292524 100%)',
    borderGlow: '0 0 25px rgba(251, 191, 36, 0.35)',
    coverBadge: 'COLLECTOR EDITION',
    desc: 'Da đen sang trọng viền kim loại vàng hoàng gia cổ điển'
  },
  {
    id: 'zen-aurora',
    name: 'Pastel Aurora Zen',
    accentColor: '#34d399',
    secondaryColor: '#2dd4bf',
    bgGradient: 'linear-gradient(135deg, #041f1e 0%, #064e3b 50%, #022c22 100%)',
    borderGlow: '0 0 25px rgba(52, 211, 153, 0.4)',
    coverBadge: 'MINDFUL JOURNEY',
    desc: 'Màu nước cực quang êm dịu, thanh tịnh và chữa lành tâm hồn'
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare Amber',
    accentColor: '#f97316',
    secondaryColor: '#ef4444',
    bgGradient: 'linear-gradient(135deg, #1c0a00 0%, #431407 50%, #7c2d12 100%)',
    borderGlow: '0 0 25px rgba(249, 115, 22, 0.4)',
    coverBadge: 'IGNITION CHRONICLES',
    desc: 'Hổ phách rực lửa và nhiệt huyết bùng cháy của những khoảnh khắc đáng nhớ'
  }
]

/**
 * Thu thập tất cả dữ liệu có thể đóng gói thành sách từ localStorage và bộ nhớ đệm
 */
export function gatherAllBookData() {
  // 1. Nhật ký đa phương tiện
  let journalEntries = []
  try {
    const saved = localStorage.getItem('mr-multimedia-journal-entries')
    if (saved) {
      journalEntries = JSON.parse(saved)
    }
  } catch (e) {
    console.warn('Cannot read multimedia journal entries for book:', e)
  }

  // Nếu rỗng, bổ sung các bài mẫu mặc định đẹp mắt
  if (!journalEntries || journalEntries.length === 0) {
    journalEntries = [
      {
        id: 'entry-nebula-01',
        title: 'Hạt Tinh Vân Trong Tâm Thức',
        date: '2026-08-15 22:45',
        mood: 'joy',
        intensity: 85,
        type: 'drawing',
        mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23050c18"/><circle cx="300" cy="200" r="90" fill="none" stroke="%2300f0ff" stroke-width="4"/><circle cx="300" cy="200" r="45" fill="%23ff00ea" opacity="0.6"/><path d="M150,200 Q300,50 450,200 T750,200" fill="none" stroke="%2339ff14" stroke-width="3" opacity="0.8"/><circle cx="220" cy="160" r="5" fill="%23ffffff"/><circle cx="380" cy="240" r="7" fill="%2300f0ff"/></svg>',
        note: 'Khi ánh sáng từ chiếc nhẫn lan tỏa, tôi cảm nhận rõ sự kết nối vô tận giữa các dòng suy nghĩ. Mọi áp lực tan biến thành những chùm sáng rực rỡ.',
        tags: ['#tự_do', '#vũ_trụ', '#hân_hoan'],
        palette: ['#00f0ff', '#ff00ea', '#39ff14', '#050c18', '#ffffff'],
        aiAnalysis: 'Sóng cảm xúc ở tần số cao với sắc thái lạc quan và cởi mở. Đường nét hình học đồng tâm biểu thị sự hội tụ tư duy và trạng thái thăng hoa sáng tạo.'
      },
      {
        id: 'entry-ocean-02',
        title: 'Khoảng Lặng Đáy Biển Số',
        date: '2026-08-14 19:10',
        mood: 'calm',
        intensity: 60,
        type: 'drawing',
        mediaUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%2302120e"/><path d="M50,260 C150,220 250,300 350,250 C450,200 550,280 650,240" fill="none" stroke="%2310b981" stroke-width="5" opacity="0.9"/><circle cx="300" cy="140" r="30" fill="%2310b981" opacity="0.3"/></svg>',
        note: 'Một ngày trôi qua chậm rãi. Lắng nghe từng nhịp thở và để tâm trí lắng đọng như mặt hồ phẳng lặng sau cơn bão.',
        tags: ['#bình_yên', '#khoảng_lặng', '#chữa_lành'],
        palette: ['#10b981', '#34d399', '#02120e', '#ecfdf5', '#064e3b'],
        aiAnalysis: 'Trạng thái cân bằng nội tại sâu sắc (Theta Wave Resonance). Các đường cong nhịp nhàng phản ánh sự điều hòa cảm xúc ổn định.'
      }
    ]
  }

  // 2. Sổ tay ước mơ
  let dreamEntries = []
  try {
    const saved = localStorage.getItem('mr-dream-journal-entries')
    if (saved) dreamEntries = JSON.parse(saved)
  } catch (e) {
    console.warn('Cannot read dream entries for book:', e)
  }

  // 3. Hộp thời gian
  let capsuleEntries = []
  try {
    const saved = localStorage.getItem('mr-time-capsules')
    if (saved) capsuleEntries = JSON.parse(saved)
  } catch (e) {
    console.warn('Cannot read time capsules for book:', e)
  }

  // 4. Mạch truyện đã đi qua
  let journeySteps = ['start']
  try {
    const saved = localStorage.getItem('mr-journey-path')
    if (saved) journeySteps = JSON.parse(saved)
  } catch (e) {
    console.warn('Cannot read journey path for book:', e)
  }

  // 5. Thống kê cảm xúc
  const moodDistribution = {
    calm: 0,
    joy: 0,
    melancholy: 0,
    friction: 0,
    breach: 0
  }

  journalEntries.forEach(entry => {
    if (entry.mood && moodDistribution[entry.mood] !== undefined) {
      moodDistribution[entry.mood]++
    }
  })

  return {
    journalEntries,
    dreamEntries,
    capsuleEntries,
    journeySteps,
    moodDistribution,
    totalEntries: journalEntries.length + dreamEntries.length + capsuleEntries.length
  }
}

/**
 * Tạo nội dung HTML hoàn chỉnh độc lập (Offline Standalone Book / EPUB Web Package)
 */
export function generateEbookHTML(config, bookData) {
  const {
    title = 'KÝ ỨC TÂM THỨC - HÀNH TRÌNH MOOD RING',
    author = 'Operator MR-CORE-01',
    preface = 'Những lát cắt cảm xúc và tư duy được lưu giữ trong dòng chảy không gian số.',
    coverTheme = 'cyberpunk',
    includeCover = true,
    includeTOC = true,
    includeStats = true,
    includeJournal = true,
    includeDreams = true,
    includeCapsules = true,
    includeColophon = true,
    createdDate = new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
  } = config

  const themeObj = BOOK_COVER_THEMES.find(t => t.id === coverTheme) || BOOK_COVER_THEMES[0]

  // Xây dựng các mục cho Table of Contents
  let tocItems = []
  let pageCounter = 1

  if (includeCover) {
    pageCounter++
  }

  if (includeStats) {
    tocItems.push({ id: 'sec-preface', title: 'I. Lời Tựa & Tổng Quan Cảm Xúc', page: pageCounter })
    pageCounter++
  }

  if (includeJournal && bookData.journalEntries?.length > 0) {
    tocItems.push({ id: 'sec-journal', title: `II. Nhật Ký Đa Phương Tiện (${bookData.journalEntries.length} Bản Ghi)`, page: pageCounter })
    pageCounter += bookData.journalEntries.length
  }

  if (includeDreams && bookData.dreamEntries?.length > 0) {
    tocItems.push({ id: 'sec-dreams', title: `III. Sổ Tay Giấc Mơ & Phân Tích Ký Ức (${bookData.dreamEntries.length} Giấc Mơ)`, page: pageCounter })
    pageCounter += bookData.dreamEntries.length
  }

  if (includeCapsules && bookData.capsuleEntries?.length > 0) {
    tocItems.push({ id: 'sec-capsules', title: `IV. Kén Niêm Phong Thời Gian (${bookData.capsuleEntries.length} Lá Thư)`, page: pageCounter })
    pageCounter += bookData.capsuleEntries.length
  }

  if (includeColophon) {
    tocItems.push({ id: 'sec-colophon', title: 'V. Lời Kết & Dấu Ấn Kỹ Thuật Số', page: pageCounter })
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)} — ${escapeHTML(author)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

    :root {
      --book-accent: ${themeObj.accentColor};
      --book-secondary: ${themeObj.secondaryColor};
      --book-bg: #090d16;
      --book-paper: #0e1422;
      --book-text: #e2e8f0;
      --book-muted: #94a3b8;
      --book-border: rgba(255, 255, 255, 0.1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--book-bg);
      color: var(--book-text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      line-height: 1.7;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
    }

    .book-container {
      max-width: 820px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .book-page {
      background-color: var(--book-paper);
      border: 1px solid var(--book-border);
      border-radius: 12px;
      padding: 50px 45px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      position: relative;
      page-break-after: always;
      overflow: hidden;
    }

    /* Print Styles for Perfect PDF Output */
    @media print {
      body {
        background: #ffffff !important;
        color: #111827 !important;
      }
      .book-container {
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .book-page {
        background: #ffffff !important;
        color: #111827 !important;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 40px 30px !important;
        margin: 0 !important;
        page-break-after: always !important;
      }
      .no-print {
        display: none !important;
      }
      .cover-page {
        background: ${themeObj.bgGradient} !important;
        color: #ffffff !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    /* Cover Page */
    .cover-page {
      min-height: 800px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      background: ${themeObj.bgGradient};
      border: 2px solid ${themeObj.accentColor};
      box-shadow: ${themeObj.borderGlow};
      position: relative;
    }

    .cover-badge {
      display: inline-block;
      padding: 6px 16px;
      border: 1px solid ${themeObj.accentColor};
      border-radius: 30px;
      color: ${themeObj.accentColor};
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 30px;
    }

    .cover-orb {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      border: 2px dashed ${themeObj.accentColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 40px auto;
      box-shadow: 0 0 40px ${themeObj.accentColor}33;
      position: relative;
    }

    .cover-orb-inner {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, ${themeObj.accentColor} 0%, ${themeObj.secondaryColor} 100%);
      box-shadow: 0 0 25px ${themeObj.accentColor};
    }

    .cover-title {
      font-family: 'Cinzel', serif;
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 2px;
      margin-bottom: 12px;
      text-transform: uppercase;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
    }

    .cover-subtitle {
      font-size: 14px;
      color: ${themeObj.accentColor};
      font-family: 'JetBrains Mono', monospace;
      margin-bottom: 25px;
      letter-spacing: 1px;
    }

    .cover-footer {
      width: 100%;
      padding-top: 30px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--book-muted);
    }

    /* Headings */
    h2.section-heading {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      color: ${themeObj.accentColor};
      border-bottom: 2px solid ${themeObj.accentColor}40;
      padding-bottom: 10px;
      margin-bottom: 25px;
      letter-spacing: 1px;
    }

    /* Table of Contents */
    .toc-list {
      list-style: none;
      margin: 30px 0;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 12px 0;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
      font-size: 15px;
    }

    .toc-dots {
      flex: 1;
      border-bottom: 1px dotted var(--book-muted);
      margin: 0 12px;
    }

    /* Stats Grid */
    .stats-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 15px;
      margin: 25px 0;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--book-border);
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }

    .stat-val {
      font-size: 24px;
      font-weight: 700;
      color: ${themeObj.accentColor};
      font-family: 'JetBrains Mono', monospace;
    }

    .stat-lbl {
      font-size: 11px;
      color: var(--book-muted);
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* Entry Card */
    .entry-card {
      margin-bottom: 35px;
      padding: 25px;
      border: 1px solid var(--book-border);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .entry-title {
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
    }

    .entry-date {
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--book-muted);
    }

    .entry-media {
      margin: 18px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .entry-media img, .entry-media svg {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    .entry-note {
      font-size: 15px;
      line-height: 1.8;
      color: #cbd5e1;
      margin: 15px 0;
      white-space: pre-line;
    }

    .entry-ai-box {
      background: rgba(0, 240, 255, 0.05);
      border-left: 3px solid var(--book-accent);
      padding: 12px 16px;
      border-radius: 0 6px 6px 0;
      font-size: 13px;
      color: #93c5fd;
      margin-top: 15px;
      font-style: italic;
    }

    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }

    .tag-chip {
      font-size: 11px;
      padding: 3px 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 4px;
      color: var(--book-accent);
      font-family: 'JetBrains Mono', monospace;
    }

    .page-number {
      position: absolute;
      bottom: 20px;
      right: 30px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--book-muted);
    }
  </style>
</head>
<body>
  <div class="book-container">

    ${includeCover ? `
    <!-- BÌA SÁCH (COVER PAGE) -->
    <div class="book-page cover-page" id="sec-cover">
      <div>
        <span class="cover-badge">${escapeHTML(themeObj.coverBadge)}</span>
      </div>

      <div>
        <div class="cover-orb">
          <div class="cover-orb-inner"></div>
        </div>
        <h1 class="cover-title">${escapeHTML(title)}</h1>
        <p class="cover-subtitle">// BIÊN NIÊN SỬ CẢM XÚC SỐ //</p>
        <p style="font-size: 14px; max-width: 500px; margin: 0 auto; color: #cbd5e1; font-style: italic;">
          "${escapeHTML(preface)}"
        </p>
      </div>

      <div class="cover-footer">
        <span>Tác Giả: <strong>${escapeHTML(author)}</strong></span>
        <span>Phát Hành: <strong>${escapeHTML(createdDate)}</strong></span>
      </div>
    </div>
    ` : ''}

    ${includeTOC ? `
    <!-- MỤC LỤC (TABLE OF CONTENTS) -->
    <div class="book-page" id="sec-toc">
      <h2 class="section-heading">MỤC LỤC TỔNG QUAN</h2>
      <p style="font-size: 13px; color: var(--book-muted); margin-bottom: 20px;">
        Cuốn sách này được biên soạn và đóng gói tự động từ hệ thống lõi tâm thức <strong>MR-CORE-01</strong>.
      </p>

      <ul class="toc-list">
        ${tocItems.map(item => `
          <li class="toc-item">
            <span><strong>${escapeHTML(item.title)}</strong></span>
            <span class="toc-dots"></span>
            <span style="font-family: 'JetBrains Mono', monospace; color: var(--book-accent);">Trang ${item.page}</span>
          </li>
        `).join('')}
      </ul>

      <div class="page-number">Trang 2</div>
    </div>
    ` : ''}

    ${includeStats ? `
    <!-- LỜI TỰA & THỐNG KÊ CẢM XÚC -->
    <div class="book-page" id="sec-preface">
      <h2 class="section-heading">I. LỜI TỰA & TỔNG QUAN CẢM XÚC</h2>
      
      <div style="font-size: 15px; line-height: 1.9; margin-bottom: 25px; color: #cbd5e1;">
        <p style="margin-bottom: 15px;">
          <em>"${escapeHTML(preface)}"</em>
        </p>
        <p>
          Trong suốt hành trình tương tác với không gian số, mỗi dòng suy nghĩ, nét vẽ neon, giấc mơ lúc rạng đông hay những lá thư phong ấn thời gian đều là một mảnh ghép tái hiện cấu trúc tâm thức sống động của bạn.
        </p>
      </div>

      <h3 style="font-size: 15px; color: var(--book-accent); margin-top: 30px; font-family: 'JetBrains Mono', monospace;">
        // THỐNG KÊ MA TRẬN CẢM XÚC //
      </h3>

      <div class="stats-summary-grid">
        <div class="stat-card">
          <div class="stat-val">${bookData.totalEntries}</div>
          <div class="stat-lbl">Tổng Bản Ghi</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${bookData.journalEntries?.length || 0}</div>
          <div class="stat-lbl">Trang Nhật Ký</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${bookData.dreamEntries?.length || 0}</div>
          <div class="stat-lbl">Giấc Mơ</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${bookData.capsuleEntries?.length || 0}</div>
          <div class="stat-lbl">Hộp Thời Gian</div>
        </div>
      </div>

      <div class="page-number">Trang 3</div>
    </div>
    ` : ''}

    ${includeJournal && bookData.journalEntries?.length > 0 ? `
    <!-- PHẦN NHẬT KÝ ĐA PHƯƠNG TIỆN -->
    <div class="book-page" id="sec-journal">
      <h2 class="section-heading">II. NHẬT KÝ ĐA PHƯƠNG TIỆN</h2>
      <p style="font-size: 13px; color: var(--book-muted); margin-bottom: 25px;">
        Các tác phẩm thị giác vẽ tay, ảnh chụp khoảnh khắc và những dòng ghi chú tự sự.
      </p>

      ${bookData.journalEntries.map((entry, idx) => `
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-title">#${idx + 1}. ${escapeHTML(entry.title || 'Nhật ký không tiêu đề')}</span>
            <span class="entry-date">${escapeHTML(entry.date || '')}</span>
          </div>

          ${entry.mediaUrl ? `
            <div class="entry-media">
              <img src="${entry.mediaUrl}" alt="${escapeHTML(entry.title)}" />
            </div>
          ` : ''}

          <div class="entry-note">${escapeHTML(entry.note || '')}</div>

          ${entry.aiAnalysis ? `
            <div class="entry-ai-box">
              <strong>🤖 AI Phân Tích Cảm Xúc:</strong> ${escapeHTML(entry.aiAnalysis)}
            </div>
          ` : ''}

          ${entry.tags && entry.tags.length > 0 ? `
            <div class="tags-row">
              ${entry.tags.map(t => `<span class="tag-chip">${escapeHTML(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${includeDreams && bookData.dreamEntries?.length > 0 ? `
    <!-- PHẦN SỔ TAY GIẤC MƠ -->
    <div class="book-page" id="sec-dreams">
      <h2 class="section-heading">III. SỔ TAY GIẤC MƠ & GIẢI MÃ</h2>
      <p style="font-size: 13px; color: var(--book-muted); margin-bottom: 25px;">
        Những giấc mộng ghi lại ngay sau khi thức giấc cùng giải mã tâm lý học Jungian.
      </p>

      ${bookData.dreamEntries.map((dream, idx) => `
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-title">🌙 #${idx + 1}. ${escapeHTML(dream.title || 'Giấc mơ vô danh')}</span>
            <span class="entry-date">${escapeHTML(dream.date || '')}</span>
          </div>

          <div class="entry-note">${escapeHTML(dream.content || dream.note || '')}</div>

          ${dream.aiInterpretation ? `
            <div class="entry-ai-box">
              <strong>✨ Giải Mã Giấc Mơ Jungian:</strong> ${escapeHTML(dream.aiInterpretation)}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${includeCapsules && bookData.capsuleEntries?.length > 0 ? `
    <!-- PHẦN HỘP THỜI GIAN -->
    <div class="book-page" id="sec-capsules">
      <h2 class="section-heading">IV. KÉN NIÊM PHONG THỜI GIAN</h2>
      <p style="font-size: 13px; color: var(--book-muted); margin-bottom: 25px;">
        Những bức thư và thông điệp gửi gắm tới bản thân trong tương lai.
      </p>

      ${bookData.capsuleEntries.map((cap, idx) => `
        <div class="entry-card">
          <div class="entry-header">
            <span class="entry-title">⏳ #${idx + 1}. ${escapeHTML(cap.title || 'Lá thư thời gian')}</span>
            <span class="entry-date">Mở khóa: ${escapeHTML(cap.unlockDate || '')}</span>
          </div>

          <div class="entry-note">${escapeHTML(cap.message || cap.content || '')}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${includeColophon ? `
    <!-- LỜI KẾT & DẤU ẤN KỸ THUẬT SỐ -->
    <div class="book-page" id="sec-colophon" style="text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 400px;">
      <h2 class="section-heading" style="border: none;">CHỨNG THỰC DỮ LIỆU SỐ</h2>
      <p style="font-size: 14px; max-width: 500px; margin: 0 auto 20px; color: #cbd5e1;">
        Cuốn sách này đã được mã hóa và đóng gói hoàn tất. Mọi bản quyền thuộc về tác giả <strong>${escapeHTML(author)}</strong>.
      </p>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--book-muted);">
        [VERIFIED BY MR-CORE-01 ARCHIVAL ENGINE]
      </div>
    </div>
    ` : ''}

  </div>
</body>
</html>`
}

/**
 * Xuất file Markdown (.md)
 */
export function generateMarkdownBook(config, bookData) {
  const {
    title = 'KÝ ỨC TÂM THỨC - HÀNH TRÌNH MOOD RING',
    author = 'Operator MR-CORE-01',
    preface = 'Những lát cắt cảm xúc được lưu giữ trong dòng chảy không gian số.',
    createdDate = new Date().toLocaleDateString('vi-VN')
  } = config

  let md = `# ${title}\n\n`
  md += `**Tác Giả:** ${author}  \n`
  md += `**Ngày Xuất Bản:** ${createdDate}  \n`
  md += `**Hệ Thống:** MR-CORE-01 Archival System  \n\n`
  md += `---\n\n`

  md += `## Lời Tựa\n\n> *"${preface}"*\n\n`
  md += `---\n\n`

  md += `## Mục Lục\n\n`
  md += `- [1. Nhật Ký Đa Phương Tiện](#1-nhật-ký-đa-phương-tiện)\n`
  md += `- [2. Sổ Tay Giấc Mơ](#2-sổ-tay-giấc-mơ)\n`
  md += `- [3. Hộp Thời Gian](#3-hộp-thời-gian)\n\n`
  md += `---\n\n`

  md += `## 1. Nhật Ký Đa Phương Tiện\n\n`
  bookData.journalEntries?.forEach((entry, idx) => {
    md += `### #${idx + 1}. ${entry.title || 'Nhật ký'}\n`
    md += `*Thời gian: ${entry.date || ''} | Mood: ${entry.mood || 'N/A'}*\n\n`
    if (entry.note) md += `${entry.note}\n\n`
    if (entry.aiAnalysis) md += `> **🤖 AI Phân Tích:** ${entry.aiAnalysis}\n\n`
    if (entry.tags && entry.tags.length > 0) md += `*Tags:* ${entry.tags.join(' ')}\n\n`
    md += `---\n\n`
  })

  md += `## 2. Sổ Tay Giấc Mơ\n\n`
  bookData.dreamEntries?.forEach((dream, idx) => {
    md += `### 🌙 #${idx + 1}. ${dream.title || 'Giấc mơ'}\n`
    md += `*Thời gian: ${dream.date || ''}*\n\n`
    md += `${dream.content || dream.note || ''}\n\n`
    if (dream.aiInterpretation) md += `> **✨ Giải Mã:** ${dream.aiInterpretation}\n\n`
    md += `---\n\n`
  })

  md += `## 3. Hộp Thời Gian\n\n`
  bookData.capsuleEntries?.forEach((cap, idx) => {
    md += `### ⏳ #${idx + 1}. ${cap.title || 'Lá thư thời gian'}\n`
    md += `*Mở khóa: ${cap.unlockDate || ''}*\n\n`
    md += `${cap.message || cap.content || ''}\n\n`
    md += `---\n\n`
  })

  md += `\n*Tài liệu được xuất tự động từ Mood Ring Story.*\n`
  return md
}

/**
 * Tải file trực tiếp về máy tính người dùng
 */
export function downloadFile(content, fileName, mimeType = 'text/html') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Mở cửa sổ in ấn để lưu thành PDF chuẩn
 */
export function printBookAsPDF(htmlContent) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Trình duyệt đã chặn popup. Vui lòng cho phép popup để mở khung in PDF.')
    return
  }

  printWindow.document.open()
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }
}

function escapeHTML(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
