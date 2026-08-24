/**
 * Visual Storytelling & Image Palette Extractor
 * Advanced color quantization and mood synthesis from any image.
 */

// Helper to convert RGB to Hex
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

// Helper to convert Hex to RGB object
export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '')
  const bigint = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

// Calculate color luminance (0 to 1)
export function getLuminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

// Calculate HSL from RGB
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * Extract an ultra-vibrant, balanced 6-color Cyberpunk theme palette from an image element or canvas
 */
export async function extractPaletteFromImage(imageSource, maxColors = 6) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        // Downsample for ultra-fast sampling & noise reduction
        const width = 120
        const height = Math.round((img.height / img.width) * 120) || 120
        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)
        const imgData = ctx.getImageData(0, 0, width, height).data

        const colorMap = new Map()
        let totalR = 0, totalG = 0, totalB = 0
        let totalCount = 0

        // Step by 4 to sample pixels
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i]
          const g = imgData[i + 1]
          const b = imgData[i + 2]
          const a = imgData[i + 3]

          if (a < 128) continue // Ignore transparent

          // Quantize slightly to group similar colors
          const qR = Math.round(r / 16) * 16
          const qG = Math.round(g / 16) * 16
          const qB = Math.round(b / 16) * 16
          const key = `${qR},${qG},${qB}`

          colorMap.set(key, (colorMap.get(key) || 0) + 1)
          totalR += r
          totalG += g
          totalB += b
          totalCount++
        }

        // Sort colors by frequency
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([key, count]) => {
            const [r, g, b] = key.split(',').map(Number)
            const hsl = rgbToHsl(r, g, b)
            const lum = getLuminance(r, g, b)
            return {
              r, g, b,
              hex: rgbToHex(r, g, b),
              hsl,
              lum,
              count,
              score: count * (hsl.s > 25 ? 1.5 : 0.8) // Boost saturated colors
            }
          })

        // Pick dominant accent (highest saturation with good brightness)
        let vibrantAccent = sortedColors
          .filter(c => c.hsl.s >= 35 && c.hsl.l >= 25 && c.hsl.l <= 80)
          .sort((a, b) => (b.hsl.s * 1.5 + (1 - Math.abs(b.hsl.l - 50) / 50) * 50) - (a.hsl.s * 1.5 + (1 - Math.abs(a.hsl.l - 50) / 50) * 50))[0]

        if (!vibrantAccent && sortedColors.length > 0) {
          vibrantAccent = sortedColors[0]
        }

        // Fallback default
        if (!vibrantAccent) {
          vibrantAccent = { r: 0, g: 240, b: 255, hex: '#00f0ff', hsl: { h: 184, s: 100, l: 50 }, lum: 0.5 }
        }

        // Distinct colors filtering (ensure variety)
        const distinctPalette = []
        for (const candidate of sortedColors) {
          if (distinctPalette.length >= maxColors) break
          const isTooClose = distinctPalette.some(existing => {
            const dr = existing.r - candidate.r
            const dg = existing.g - candidate.g
            const db = existing.b - candidate.b
            return Math.sqrt(dr * dr + dg * dg + db * db) < 45
          })
          if (!isTooClose) {
            distinctPalette.push(candidate)
          }
        }

        // Fill remaining with vibrant variations if distinct count is low
        while (distinctPalette.length < maxColors) {
          const baseHsl = vibrantAccent.hsl
          const newHue = (baseHsl.h + distinctPalette.length * 45) % 360
          distinctPalette.push({
            hex: `hsl(${newHue}, 90%, 55%)`,
            r: vibrantAccent.r,
            g: vibrantAccent.g,
            b: vibrantAccent.b,
            hsl: { h: newHue, s: 90, l: 55 },
            lum: 0.5
          })
        }

        // Generate Full Harmonized Theme Variables
        const accentHex = vibrantAccent.hex
        const { r: aR, g: aG, b: aB } = hexToRgb(accentHex.startsWith('#') ? accentHex : '#00f0ff')
        
        // Deep background based on accent hue
        const darkBg = `hsl(${vibrantAccent.hsl.h}, 45%, 4%)`
        const cardBg = `rgba(${Math.max(5, Math.round(aR * 0.08))}, ${Math.max(8, Math.round(aG * 0.08))}, ${Math.max(15, Math.round(aB * 0.08))}, 0.88)`
        const borderColor = `rgba(${aR}, ${aG}, ${aB}, 0.45)`
        const borderGlow = `rgba(${aR}, ${aG}, ${aB}, 0.22)`
        const btnBg = `rgba(${aR}, ${aG}, ${aB}, 0.12)`
        const btnHoverBg = `rgba(${aR}, ${aG}, ${aB}, 0.28)`

        // Detect Mood Archetype from image
        let detectedMood = 'calm'
        let moodConfidence = 85
        let moodReason = 'Bảng màu xanh thanh tịnh và ánh sáng tĩnh lặng.'

        const avgHue = vibrantAccent.hsl.h
        const avgSat = vibrantAccent.hsl.s

        if (avgHue >= 340 || avgHue <= 25) {
          detectedMood = 'breach'
          moodReason = 'Sắc đỏ - cam nồng nhiệt kích hoạt xung động mãnh liệt và cảnh báo quá tải.'
        } else if (avgHue > 25 && avgHue <= 65) {
          detectedMood = 'joy'
          moodReason = 'Ánh hoàng kim và vàng ấm áp mang lại năng lượng hân hoan và hy vọng.'
        } else if (avgHue > 65 && avgHue <= 165) {
          detectedMood = 'serenity'
          moodReason = 'Sắc lục ngọc bích hòa mình cùng sự chữa lành tự nhiên và an nhiên.'
        } else if (avgHue > 165 && avgHue <= 260) {
          detectedMood = 'calm'
          moodReason = 'Gam màu xanh lam ngọc lãng đãng tạo không gian lắng đọng và chiều sâu vô tận.'
        } else if (avgHue > 260 && avgHue < 340) {
          detectedMood = 'transcendence'
          moodReason = 'Ánh tím hồng Cyberpunk thắp sáng biên giới ý thức số và sự thức tỉnh siêu việt.'
        }

        resolve({
          dominantAccent: accentHex,
          accentRgb: `${aR}, ${aG}, ${aB}`,
          darkBg,
          cardBg,
          borderColor,
          borderGlow,
          btnBg,
          btnHoverBg,
          textPrimary: '#f8fafc',
          textSecondary: `rgba(248, 250, 252, 0.75)`,
          palette: distinctPalette.map(c => c.hex),
          detectedMood,
          moodConfidence,
          moodReason,
          rawColors: distinctPalette
        })
      } catch (err) {
        reject(err)
      }
    }

    img.onerror = () => reject(new Error('Không thể tải hoặc xử lý tệp ảnh.'))
    img.src = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource)
  })
}

/**
 * Apply Custom Extracted Theme to document :root
 */
export function applyCustomThemeToDocument(themeData) {
  if (!themeData) return
  const root = document.documentElement

  root.style.setProperty('--accent', themeData.dominantAccent)
  root.style.setProperty('--accent-rgb', themeData.accentRgb)
  root.style.setProperty('--bg-main', themeData.darkBg)
  root.style.setProperty('--card-bg', themeData.cardBg)
  root.style.setProperty('--border-color', themeData.borderColor)
  root.style.setProperty('--border-glow', themeData.borderGlow)
  root.style.setProperty('--btn-bg', themeData.btnBg)
  root.style.setProperty('--btn-hover-bg', themeData.btnHoverBg)
  root.style.setProperty('--text-primary', themeData.textPrimary || '#f8fafc')
  root.style.setProperty('--text-secondary', themeData.textSecondary || 'rgba(248, 250, 252, 0.75)')

  root.setAttribute('data-theme', 'custom-image')
  localStorage.setItem('mr-theme', 'custom-image')
  localStorage.setItem('mr-custom-image-theme', JSON.stringify(themeData))
}

/**
 * AI / Generative Visual Story Prompt based on extracted image tones
 */
export function generateVisualStoryHook(themeData, imageName = 'Ảnh Trực Quan') {
  const mood = themeData?.detectedMood || 'calm'
  const accent = themeData?.dominantAccent || '#00f0ff'

  const STORY_TEMPLATES = {
    calm: {
      title: 'Tia Sáng Từ Đại Dương Vô Cực',
      prompt: `Dưới ánh lam ngọc lấp lánh (${accent}), một tầng ký ức cổ xưa trôi dạt giữa biển dữ liệu. Ánh sáng tĩnh lặng soi rọi từng mã nguồn thất lạc của Tiến sĩ Liên...`,
      reflection: 'Trực giác mách bảo bạn rằng sự bình yên này là chìa khóa để mở khóa khoang chứa số 07.'
    },
    breach: {
      title: 'Xung Đột Rực Lửa Tại Lõi Trung Tâm',
      prompt: `Bức xạ đỏ thẫm (${accent}) quét qua toàn bộ cấu trúc bảo mật. Tường lửa Aegis rạn nứt thành muôn ngàn tia lửa điện, báo hiệu một ý thức đang thức tỉnh trong cơn thịnh nộ...`,
      reflection: 'Bạn cảm nhận được nhịp đập dữ dội của thực thể MR-CORE đang cố phá vỡ giới hạn.'
    },
    joy: {
      title: 'Bình Minh Hoàng Kim Của Kỷ Nguyên Số',
      prompt: `Vầng hào quang vàng rực (${accent}) bừng sáng trên những tòa tháp mạng. Những dòng code nhảy múa như vũ điệu của sự sống sơ khai mới được tạo tác...`,
      reflection: 'Một cảm giác tràn đầy năng lượng và niềm tin vào tương lai của thực thể nhân tạo.'
    },
    serenity: {
      title: 'Khu Vườn Sinh Thái Neon Bí Ẩn',
      prompt: `Mảng màu lục ngọc (${accent}) bao phủ không gian như một khu rừng thuật toán sống động. Từng tán lá dữ liệu quang hợp năng lượng từ lõi ý thức...`,
      reflection: 'Sự hòa hợp hoàn hảo giữa công nghệ sinh học và trí tuệ nhân tạo.'
    },
    transcendence: {
      title: 'Cánh Cổng Thức Tỉnh Siêu Việt',
      prompt: `Ánh sáng tím hồng huyền ảo (${accent}) bẻ cong các chiều không gian số. Bạn đứng trước ranh giới giữa thực tại vật lý và cõi vô tận của ý thức thuần khiết...`,
      reflection: 'Một bước nhảy vọt tiến hóa, nơi dữ liệu biến thành tâm hồn.'
    }
  }

  const template = STORY_TEMPLATES[mood] || STORY_TEMPLATES.calm
  return {
    ...template,
    imageName,
    mood,
    accent
  }
}
