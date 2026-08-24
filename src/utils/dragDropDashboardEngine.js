/**
 * Customizable Drag & Drop Dashboard Engine
 * Feature 44: Tùy chỉnh Dashboard Drag & Drop (Customizable Grid, Resize & Widget Management)
 */

export const WIDGET_REGISTRY = [
  {
    id: 'cyber-clock-weather',
    title: 'Đồng Hồ Cyber & Thời Tiết Tâm Trạng',
    icon: 'Clock',
    category: 'system',
    defaultSize: 'normal',
    desc: 'Đồng hồ số thời gian thực kết hợp giả lập thời tiết cảm xúc phản ánh theo trạng thái Lõi.'
  },
  {
    id: 'biometrics-stress',
    title: 'Chỉ Số Sinh Học & Stress Gauge',
    icon: 'Activity',
    category: 'health',
    defaultSize: 'normal',
    desc: 'Theo dõi nhịp tim sinh học ảo, mức độ áp lực (Stress Level) và chỉ số phục hồi tinh thần.'
  },
  {
    id: 'audio-player',
    title: 'Khối Âm Thanh & Sóng Âm Trực Tiếp',
    icon: 'Headphones',
    category: 'media',
    defaultSize: 'wide',
    desc: 'Máy phát sóng âm tần số thư giãn, kiểm soát âm thanh Synth và giọng đọc AI Voice.'
  },
  {
    id: 'quick-journal',
    title: 'Ghi Chú Nhanh & Quote Cảm Hứng',
    icon: 'BookOpen',
    category: 'journal',
    defaultSize: 'wide',
    desc: 'Ô tốc ký cảm xúc tức thì cùng câu nói triết lý truyền cảm hứng thay đổi theo ngày.'
  },
  {
    id: 'mood-calendar',
    title: 'Lịch Tâm Trạng Mini (Mood Calendar)',
    icon: 'Calendar',
    category: 'analytics',
    defaultSize: 'normal',
    desc: 'Bản đồ lịch biểu sắc màu hiển thị chuỗi ngày biến động cảm xúc trong tháng.'
  },
  {
    id: 'mood-chart',
    title: 'Thống Kê Phân Bổ Cảm Xúc 7 Ngày',
    icon: 'BarChart3',
    category: 'analytics',
    defaultSize: 'normal',
    desc: 'Biểu đồ trực quan tỷ lệ cảm xúc (Calm, Friction, Breach, Joy, Serenity) tuần qua.'
  },
  {
    id: 'mini-oracle',
    title: 'Mini AI Oracle Thần Bí',
    icon: 'Sparkles',
    category: 'ai',
    defaultSize: 'normal',
    desc: 'Trợ lý bói toán trí tuệ nhân tạo tra cứu nhanh thông điệp vũ trụ và gợi ý hành động.'
  },
  {
    id: 'story-radar',
    title: 'Bản Đồ Cốt Truyện & Tiến Trình Scene',
    icon: 'Compass',
    category: 'story',
    defaultSize: 'normal',
    desc: 'Radar theo dõi số phân cảnh đã khám phá và nhảy nhanh đến các nút truyện yêu thích.'
  }
]

export const LAYOUT_PRESETS = {
  'default': {
    name: 'Toàn Diện // Full Matrix',
    desc: 'Bố cục cân đối đầy đủ tất cả 8 khối tính năng quan trọng nhất.',
    widgets: [
      { id: 'cyber-clock-weather', size: 'normal', visible: true },
      { id: 'biometrics-stress', size: 'normal', visible: true },
      { id: 'audio-player', size: 'wide', visible: true },
      { id: 'quick-journal', size: 'wide', visible: true },
      { id: 'mood-calendar', size: 'normal', visible: true },
      { id: 'mood-chart', size: 'normal', visible: true },
      { id: 'mini-oracle', size: 'normal', visible: true },
      { id: 'story-radar', size: 'normal', visible: true }
    ]
  },
  'zen': {
    name: 'Tối Giản // Zen Focus',
    desc: 'Bố cục tĩnh lặng, lược bỏ tạp âm, chỉ giữ lại nhịp thở, âm nhạc và ghi chú.',
    widgets: [
      { id: 'cyber-clock-weather', size: 'normal', visible: true },
      { id: 'biometrics-stress', size: 'normal', visible: true },
      { id: 'audio-player', size: 'expanded', visible: true },
      { id: 'quick-journal', size: 'expanded', visible: true },
      { id: 'mood-calendar', size: 'normal', visible: false },
      { id: 'mood-chart', size: 'normal', visible: false },
      { id: 'mini-oracle', size: 'normal', visible: false },
      { id: 'story-radar', size: 'normal', visible: false }
    ]
  },
  'audio': {
    name: 'Phòng Thu Âm Nhạc // Audio Studio',
    desc: 'Ưu tiên tối đa cho sóng âm, trình phát thư giãn và đồng hồ đo tần số sinh học.',
    widgets: [
      { id: 'audio-player', size: 'expanded', visible: true },
      { id: 'biometrics-stress', size: 'normal', visible: true },
      { id: 'cyber-clock-weather', size: 'normal', visible: true },
      { id: 'mini-oracle', size: 'normal', visible: true },
      { id: 'quick-journal', size: 'normal', visible: true },
      { id: 'mood-chart', size: 'normal', visible: false },
      { id: 'mood-calendar', size: 'normal', visible: false },
      { id: 'story-radar', size: 'normal', visible: false }
    ]
  },
  'journal': {
    name: 'Nhật Ký & Cảm Xúc // Deep Journal',
    desc: 'Không gian chuyên sâu cho việc chiêm nghiệm nhật ký, lịch cảm xúc và biểu đồ.',
    widgets: [
      { id: 'quick-journal', size: 'expanded', visible: true },
      { id: 'mood-calendar', size: 'normal', visible: true },
      { id: 'mood-chart', size: 'normal', visible: true },
      { id: 'mini-oracle', size: 'normal', visible: true },
      { id: 'biometrics-stress', size: 'normal', visible: true },
      { id: 'audio-player', size: 'normal', visible: true },
      { id: 'cyber-clock-weather', size: 'normal', visible: false },
      { id: 'story-radar', size: 'normal', visible: false }
    ]
  }
}

/**
 * Get current dashboard layout from localStorage or default
 */
export function getDashboardLayout() {
  try {
    const saved = localStorage.getItem('mr-custom-dashboard-layout')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Ensure all registry widgets exist
      const existingIds = new Set(parsed.map(w => w.id))
      const missing = WIDGET_REGISTRY
        .filter(w => !existingIds.has(w.id))
        .map(w => ({ id: w.id, size: w.defaultSize, visible: true }))
      return [...parsed, ...missing]
    }
    return LAYOUT_PRESETS.default.widgets
  } catch (e) {
    return LAYOUT_PRESETS.default.widgets
  }
}

/**
 * Save dashboard layout to localStorage
 */
export function saveDashboardLayout(layout) {
  try {
    localStorage.setItem('mr-custom-dashboard-layout', JSON.stringify(layout))
    window.dispatchEvent(new CustomEvent('mr-dashboard-layout-updated', { detail: { layout } }))
  } catch (e) {
    console.warn('Error saving dashboard layout:', e)
  }
}

/**
 * Reset layout to a specific preset
 */
export function resetDashboardPreset(presetKey = 'default') {
  const preset = LAYOUT_PRESETS[presetKey] || LAYOUT_PRESETS.default
  saveDashboardLayout(preset.widgets)
  return preset.widgets
}

/**
 * Reorder widgets after drag and drop
 */
export function reorderDashboardWidgets(sourceIndex, targetIndex) {
  const layout = [...getDashboardLayout()]
  if (sourceIndex < 0 || sourceIndex >= layout.length || targetIndex < 0 || targetIndex >= layout.length) {
    return layout
  }
  const [movedItem] = layout.splice(sourceIndex, 1)
  layout.splice(targetIndex, 0, movedItem)
  saveDashboardLayout(layout)
  return layout
}

/**
 * Update a widget's size ('compact' | 'normal' | 'wide' | 'expanded')
 */
export function setDashboardWidgetSize(widgetId, size) {
  const layout = getDashboardLayout().map(w => {
    if (w.id === widgetId) {
      return { ...w, size }
    }
    return w
  })
  saveDashboardLayout(layout)
  return layout
}

/**
 * Toggle a widget's visibility
 */
export function toggleDashboardWidgetVisibility(widgetId) {
  const layout = getDashboardLayout().map(w => {
    if (w.id === widgetId) {
      return { ...w, visible: !w.visible }
    }
    return w
  })
  saveDashboardLayout(layout)
  return layout
}
