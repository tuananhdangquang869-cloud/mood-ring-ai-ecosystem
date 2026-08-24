/**
 * Dual Voice Southern Vietnamese AI Voice Text-to-Speech (TTS) Engine
 * Feature 41: Đọc Văn bản Truyền Cảm (1 Giọng Nữ & 1 Giọng Nam Chuẩn Miền Nam)
 * 
 * 2 Curated Voices:
 * 1. 👩 Mai Phương - Giọng Nữ Miền Nam (Ngọt ngào, Dịu dàng, Truyền cảm) [MẶC ĐỊNH]
 * 2. 👨 Quang Dũng - Giọng Nam Miền Nam (Trầm ấm, Nam tính, Hào sảng)
 */

const DEFAULT_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_860664251182a586689048d984f7456486e8454842ab5811'
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1'

export const CURATED_VOICES = [
  {
    id: 'south-female-main',
    baseVoice: 'vi-VN-HoaiMyNeural',
    engine: 'edge-neural',
    name: 'Mai Phương (Giọng Nữ Miền Nam)',
    gender: 'Nữ',
    genderType: 'female',
    ageGroup: 'adult',
    ageLabel: 'Giọng Nữ',
    regionLabel: 'Miền Nam',
    pitch: '+4Hz',
    rate: '+2%',
    tone: 'Ngọt Ngào, Dịu Dàng & Truyền Cảm',
    desc: 'Giọng nữ miền Nam ngọt ngào, dịu dàng, tự nhiên, truyền cảm xúc êm đềm như một người bạn tâm tình.',
    tag: '👩 Giọng Nữ',
    color: '#ec4899',
    avatar: '🌸',
    sampleText: 'Hé lô bạn nha! Mình là Mai Phương, giọng nữ miền Nam ngọt ngào. Rất vui được đồng hành đọc câu chuyện cùng bạn.'
  },
  {
    id: 'south-male-main',
    baseVoice: 'vi-VN-NamMinhNeural',
    engine: 'edge-neural',
    name: 'Quang Dũng (Giọng Nam Miền Nam)',
    gender: 'Nam',
    genderType: 'male',
    ageGroup: 'adult',
    ageLabel: 'Giọng Nam',
    regionLabel: 'Miền Nam',
    pitch: '-3Hz',
    rate: '+2%',
    tone: 'Trầm Ấm, Nam Tính & Hào Sảng',
    desc: 'Giọng nam miền Nam trầm ấm, nam tính, hào sảng, chân thành và sâu lắng, ngắt nghỉ câu tự nhiên.',
    tag: '👨 Giọng Nam',
    color: '#00f0ff',
    avatar: '👨',
    sampleText: 'Chào bạn nha! Tui là Quang Dũng, giọng nam miền Nam trầm ấm. Tui sẽ đồng hành cùng bạn trên từng trang ký ức.'
  }
]

// In-memory audio cache
const audioCache = new Map()

// State listeners
const listeners = new Set()

let globalAudio = null
let audioContext = null
let analyserNode = null
let sourceNode = null
let isInitialized = false

// Playback state
export const ttsState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentText: '',
  currentTitle: '',
  currentTime: 0,
  duration: 0,
  progress: 0,
  volume: 1.0,
  speed: 1.0,
  activeVoiceId: localStorage.getItem('mr-tts-voice-id') || 'south-female-main',
  activeModelId: localStorage.getItem('mr-tts-model-id') || 'eleven_multilingual_v2',
  stability: parseFloat(localStorage.getItem('mr-tts-stability') || '0.5'),
  similarityBoost: parseFloat(localStorage.getItem('mr-tts-similarity') || '0.8'),
  styleExaggeration: parseFloat(localStorage.getItem('mr-tts-style') || '0.2'),
  autoNarrate: false,
  engineType: localStorage.getItem('mr-tts-engine') || 'auto',
  apiKey: localStorage.getItem('mr-tts-api-key') || DEFAULT_API_KEY,
  error: null,
  visualizerData: new Uint8Array(32)
}

function notifyListeners() {
  const stateCopy = { ...ttsState }
  listeners.forEach(cb => {
    try {
      cb(stateCopy)
    } catch (e) {
      console.error('[TTS Engine] Listener error:', e)
    }
  })
}

export function subscribeTTS(callback) {
  listeners.add(callback)
  callback({ ...ttsState })
  return () => listeners.delete(callback)
}

export function getTTSApiKey() {
  return localStorage.getItem('mr-tts-api-key') || DEFAULT_API_KEY
}

export function saveTTSApiKey(key) {
  const trimmed = key ? key.trim() : ''
  if (trimmed) {
    localStorage.setItem('mr-tts-api-key', trimmed)
    ttsState.apiKey = trimmed
  } else {
    localStorage.removeItem('mr-tts-api-key')
    ttsState.apiKey = DEFAULT_API_KEY
  }
  notifyListeners()
}

export function updateTTSSettings(settings = {}) {
  if (settings.activeVoiceId !== undefined) {
    ttsState.activeVoiceId = settings.activeVoiceId
    localStorage.setItem('mr-tts-voice-id', settings.activeVoiceId)
  }
  if (settings.activeModelId !== undefined) {
    ttsState.activeModelId = settings.activeModelId
    localStorage.setItem('mr-tts-model-id', settings.activeModelId)
  }
  if (settings.stability !== undefined) {
    ttsState.stability = settings.stability
    localStorage.setItem('mr-tts-stability', settings.stability.toString())
  }
  if (settings.similarityBoost !== undefined) {
    ttsState.similarityBoost = settings.similarityBoost
    localStorage.setItem('mr-tts-similarity', settings.similarityBoost.toString())
  }
  if (settings.styleExaggeration !== undefined) {
    ttsState.styleExaggeration = settings.styleExaggeration
    localStorage.setItem('mr-tts-style', settings.styleExaggeration.toString())
  }
  if (settings.autoNarrate !== undefined) {
    ttsState.autoNarrate = settings.autoNarrate
    localStorage.setItem('mr-tts-auto-narrate', settings.autoNarrate.toString())
  }
  if (settings.engineType !== undefined) {
    ttsState.engineType = settings.engineType
    localStorage.setItem('mr-tts-engine', settings.engineType)
  }
  if (settings.speed !== undefined) {
    ttsState.speed = settings.speed
    if (globalAudio) {
      globalAudio.playbackRate = settings.speed
    }
  }
  if (settings.volume !== undefined) {
    ttsState.volume = settings.volume
    if (globalAudio) {
      globalAudio.volume = settings.volume
    }
  }
  notifyListeners()
}

function initWebAudio() {
  if (isInitialized && audioContext) return
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    audioContext = new AudioCtx()
    analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 64
    analyserNode.smoothingTimeConstant = 0.8
    isInitialized = true
  } catch (e) {
    console.warn('[TTS Engine] AudioContext init failed:', e)
  }
}

function attachAudioToAnalyser(audioEl) {
  if (!audioContext || !analyserNode) return
  try {
    if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
    if (!sourceNode) {
      sourceNode = audioContext.createMediaElementSource(audioEl)
      sourceNode.connect(analyserNode)
      analyserNode.connect(audioContext.destination)
    }
  } catch (e) {
    console.debug('[TTS Engine] Analyzer attach notice:', e)
  }
}

let animationFrameId = null
function startVisualizerLoop() {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  const buffer = new Uint8Array(analyserNode ? analyserNode.frequencyBinCount : 32)

  const loop = () => {
    if (ttsState.isPlaying && !ttsState.isPaused) {
      if (analyserNode) {
        analyserNode.getByteFrequencyData(buffer)
        ttsState.visualizerData = buffer
      } else {
        for (let i = 0; i < 32; i++) {
          ttsState.visualizerData[i] = Math.floor(Math.random() * 180 + 30)
        }
      }
      notifyListeners()
      animationFrameId = requestAnimationFrame(loop)
    } else {
      ttsState.visualizerData.fill(0)
      notifyListeners()
    }
  }
  loop()
}

export async function checkElevenLabsAccount(customKey) {
  const key = customKey || getTTSApiKey()
  if (!key) {
    return { ok: false, error: 'Chưa có API key' }
  }

  try {
    const res = await fetch(`${ELEVENLABS_API_BASE}/user/subscription`, {
      headers: {
        'xi-api-key': key
      }
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { 
        ok: false, 
        status: res.status, 
        error: errData.detail?.message || `Lỗi API (${res.status})` 
      }
    }
    const data = await res.json()
    return {
      ok: true,
      tier: data.tier,
      characterCount: data.character_count,
      characterLimit: data.character_limit,
      remaining: Math.max(0, data.character_limit - data.character_count),
      nextReset: data.next_character_count_reset_unix
    }
  } catch (err) {
    return { ok: false, error: err.message || 'Lỗi kết nối mạng đến ElevenLabs' }
  }
}

async function fetchElevenLabsAudio(text, voiceId) {
  const apiKey = getTTSApiKey()
  if (!apiKey || apiKey.startsWith('your_')) {
    throw new Error('Chưa cấu hình ElevenLabs API key hợp lệ')
  }

  const isMale = voiceId === 'south-male-main'
  const elVoiceId = isMale ? 'ErXwobaYiN019PkySvjV' : '21m00Tcm4TlvDq8ikWAM'

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${elVoiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: ttsState.activeModelId || 'eleven_multilingual_v2',
      voice_settings: {
        stability: ttsState.stability || 0.5,
        similarity_boost: ttsState.similarityBoost || 0.8,
        style: ttsState.styleExaggeration || 0.2
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail?.message || `Lỗi ElevenLabs (${response.status})`)
  }

  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

function sanitizeSpeechText(text) {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\[\/\/.*?\]/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * High-Fidelity Southern Vietnamese Neural Synthesizer (Strictly Nam vs Nu)
 */
function fetchMicrosoftEdgeNeuralAudio(text, voiceConfig) {
  return new Promise((resolve, reject) => {
    const isMale = voiceConfig.gender === 'Nam' || voiceConfig.id === 'south-male-main'
    const baseVoice = isMale ? 'vi-VN-NamMinhNeural' : 'vi-VN-HoaiMyNeural'
    const pitch = isMale ? '-3Hz' : '+4Hz'
    const baseRate = voiceConfig.rate || '+2%'

    let finalRate = baseRate
    if (ttsState.speed && ttsState.speed !== 1.0) {
      const additionalPct = Math.round((ttsState.speed - 1.0) * 100)
      const baseNum = parseInt(baseRate.replace(/[^0-9-]/g, ''), 10) || 0
      const totalPct = baseNum + additionalPct
      finalRate = totalPct >= 0 ? `+${totalPct}%` : `${totalPct}%`
    }

    const cacheKey = `edge_${voiceConfig.id}_${baseVoice}_${pitch}_${finalRate}_${text}`
    if (audioCache.has(cacheKey)) {
      return resolve(audioCache.get(cacheKey))
    }

    const connBytes = new Uint8Array(16)
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(connBytes)
    } else {
      for (let i = 0; i < 16; i++) connBytes[i] = Math.floor(Math.random() * 256)
    }
    const connectionId = Array.from(connBytes).map(b => b.toString(16).padStart(2, '0')).join('')

    const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readahead/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connectionId}`
    
    let ws = null
    const timeout = setTimeout(() => {
      if (ws) {
        try { ws.close() } catch(e) {}
      }
      reject(new Error('Edge TTS timeout sau 10s'))
    }, 10000)

    try {
      ws = new WebSocket(wsUrl)
      ws.binaryType = 'arraybuffer'
      const audioChunks = []

      ws.onopen = () => {
        const configMessage = `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`
        ws.send(configMessage)

        const reqBytes = new Uint8Array(16)
        if (window.crypto && window.crypto.getRandomValues) {
          window.crypto.getRandomValues(reqBytes)
        } else {
          for (let i = 0; i < 16; i++) reqBytes[i] = Math.floor(Math.random() * 256)
        }
        const requestId = Array.from(reqBytes).map(b => b.toString(16).padStart(2, '0')).join('')
        const dateStr = new Date().toUTCString()

        const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${baseVoice}'><prosody pitch='${pitch}' rate='${finalRate}'>${text}</prosody></voice></speak>`
        const ssmlMessage = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\nX-Timestamp:${dateStr}\r\n\r\n${ssml}`
        ws.send(ssmlMessage)
      }

      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          if (event.data.includes('Path:turn.end')) {
            clearTimeout(timeout)
            try { ws.close() } catch(e) {}
            if (audioChunks.length > 0) {
              const combinedBlob = new Blob(audioChunks, { type: 'audio/mp3' })
              const blobUrl = URL.createObjectURL(combinedBlob)
              audioCache.set(cacheKey, blobUrl)
              resolve(blobUrl)
            } else {
              reject(new Error('Không nhận được dữ liệu âm thanh từ Edge TTS'))
            }
          }
        } else if (event.data instanceof ArrayBuffer) {
          try {
            const view = new DataView(event.data)
            const headerLength = view.getUint16(0)
            const audioBuffer = event.data.slice(headerLength + 2)
            audioChunks.push(audioBuffer)
          } catch(e) {
            audioChunks.push(event.data)
          }
        }
      }

      ws.onerror = (err) => {
        clearTimeout(timeout)
        reject(err || new Error('WebSocket connection error'))
      }

    } catch (e) {
      clearTimeout(timeout)
      reject(e)
    }
  })
}

/**
 * Fallback Web Speech Synthesis with Strict Gender Modulation
 */
function playBrowserWebSpeech(text, voiceConfig = {}) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      return reject(new Error('Trình duyệt không hỗ trợ Web Speech API'))
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const baseSpeed = ttsState.speed || 1.0
    utterance.volume = ttsState.volume !== undefined ? ttsState.volume : 1.0
    utterance.lang = 'vi-VN'

    const isMale = voiceConfig.gender === 'Nam' || voiceConfig.id === 'south-male-main'
    const voices = window.speechSynthesis.getVoices()

    if (isMale) {
      const maleVoice = voices.find(v => 
        (v.lang?.startsWith('vi') || v.name?.includes('Vietnam')) && 
        (v.name?.includes('Nam') || v.name?.includes('Minh') || v.name?.includes('Male') || v.name?.includes('David'))
      )
      if (maleVoice) {
        utterance.voice = maleVoice
      } else {
        const anyVi = voices.find(v => v.lang?.startsWith('vi') || v.name?.includes('Vietnam'))
        if (anyVi) utterance.voice = anyVi
      }

      utterance.pitch = 0.68 // Trầm ấm nam tính
      utterance.rate = baseSpeed * 0.98
    } else {
      const femaleVoice = voices.find(v => 
        (v.lang?.startsWith('vi') || v.name?.includes('Vietnam')) && 
        (v.name?.includes('Hoai') || v.name?.includes('My') || v.name?.includes('Female') || v.name?.includes('Google') || v.name?.includes('Linh') || v.name?.includes('Phuong'))
      )
      if (femaleVoice) {
        utterance.voice = femaleVoice
      } else {
        const anyVi = voices.find(v => v.lang?.startsWith('vi') || v.name?.includes('Vietnam'))
        if (anyVi) utterance.voice = anyVi
      }

      utterance.pitch = 1.08 // Ngọt ngào nữ tính
      utterance.rate = baseSpeed * 1.02
    }

    utterance.onstart = () => {
      ttsState.isPlaying = true
      ttsState.isPaused = false
      ttsState.isLoading = false
      ttsState.error = null
      notifyListeners()
      startVisualizerLoop()
    }

    utterance.onend = () => {
      ttsState.isPlaying = false
      ttsState.isPaused = false
      ttsState.isLoading = false
      ttsState.currentTime = 0
      ttsState.progress = 0
      notifyListeners()
      resolve()
    }

    utterance.onerror = (e) => {
      ttsState.isPlaying = false
      ttsState.isPaused = false
      ttsState.isLoading = false
      ttsState.error = `Web Speech Error: ${e.error || 'Thất bại'}`
      notifyListeners()
      reject(new Error(ttsState.error))
    }

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Main Play Speech Function
 */
export async function playStoryText(text, title = 'Câu chuyện hiện tại', customOptions = {}) {
  const cleanText = sanitizeSpeechText(text)
  if (!cleanText) {
    console.warn('[TTS Engine] No valid text to speak')
    return
  }

  stopStoryTTS()

  // Unlock browser speechSynthesis immediately inside click gesture context to prevent autoplay block on fallbacks
  if ('speechSynthesis' in window) {
    try {
      const dummy = new SpeechSynthesisUtterance('')
      window.speechSynthesis.speak(dummy)
    } catch (e) {
      console.debug('[TTS Engine] SpeechSpeech unlock notice:', e)
    }
  }

  ttsState.isLoading = true
  ttsState.currentText = cleanText
  ttsState.currentTitle = title
  ttsState.error = null
  ttsState.progress = 0
  ttsState.currentTime = 0
  notifyListeners()

  const voiceId = customOptions.voiceId || ttsState.activeVoiceId || 'south-female-main'
  const targetVoice = CURATED_VOICES.find(v => v.id === voiceId) || CURATED_VOICES[0]

  let errors = []

  try {
    initWebAudio()

    let audioUrl = null

    // 1. Try ElevenLabs synthesis if API Key is configured
    const apiKey = getTTSApiKey()
    const isElevenLabsConfigured = apiKey && 
                                   !apiKey.startsWith('your_') && 
                                   apiKey !== 'sk_860664251182a586689048d984f7456486e8454842ab5811' &&
                                   apiKey.length > 15

    if (isElevenLabsConfigured) {
      try {
        audioUrl = await fetchElevenLabsAudio(cleanText, targetVoice.id)
      } catch (elErr) {
        console.warn('[TTS Engine] ElevenLabs synthesis failed, trying Edge Neural:', elErr)
        errors.push(`ElevenLabs: ${elErr.message}`)
      }
    } else {
      errors.push('ElevenLabs: Chưa có API Key hoặc Key mặc định không hoạt động')
    }

    // 2. Synthesize via Edge Neural if ElevenLabs is not set or failed
    if (!audioUrl) {
      try {
        audioUrl = await fetchMicrosoftEdgeNeuralAudio(cleanText, targetVoice)
      } catch (edgeErr) {
        console.warn('[TTS Engine] Edge Neural failed, falling back to Web Speech:', edgeErr)
        errors.push(`Edge Neural: ${edgeErr.message || 'Lỗi kết nối'}`)
      }
    }

    // 3. Play generated audio
    if (audioUrl) {
      if (!globalAudio) {
        globalAudio = new Audio()
      }

      globalAudio.src = audioUrl
      globalAudio.playbackRate = ttsState.speed || 1.0
      globalAudio.volume = ttsState.volume !== undefined ? ttsState.volume : 1.0

      globalAudio.onloadedmetadata = () => {
        ttsState.duration = globalAudio.duration || 0
        ttsState.isLoading = false
        notifyListeners()
      }

      globalAudio.ontimeupdate = () => {
        if (globalAudio) {
          ttsState.currentTime = globalAudio.currentTime || 0
          ttsState.duration = globalAudio.duration || 0
          ttsState.progress = ttsState.duration > 0 ? (ttsState.currentTime / ttsState.duration) * 100 : 0
          notifyListeners()
        }
      }

      globalAudio.onplay = () => {
        ttsState.isPlaying = true
        ttsState.isPaused = false
        ttsState.isLoading = false
        notifyListeners()
        startVisualizerLoop()
      }

      globalAudio.onpause = () => {
        ttsState.isPaused = true
        notifyListeners()
      }

      globalAudio.onended = () => {
        ttsState.isPlaying = false
        ttsState.isPaused = false
        ttsState.currentTime = 0
        ttsState.progress = 0
        notifyListeners()
        window.dispatchEvent(new CustomEvent('mr-tts-ended', { detail: { title } }))
      }

      globalAudio.onerror = (e) => {
        console.warn('[TTS Engine] Audio element playback error, falling back to Web Speech:', e)
        errors.push('Lỗi trình phát Audio')
        playBrowserWebSpeech(cleanText, targetVoice).catch(err => {
          errors.push(`WebSpeech Fallback: ${err.message}`)
          ttsState.error = errors.join(' | ')
          notifyListeners()
        })
      }

      attachAudioToAnalyser(globalAudio)
      await globalAudio.play()

      window.dispatchEvent(new CustomEvent('mr-tts-started', { detail: { title, voiceId: targetVoice.id } }))
      return
    }

    // 4. Fallback to Web Speech if audioUrl is null
    await playBrowserWebSpeech(cleanText, targetVoice)

  } catch (error) {
    console.warn('[TTS Engine] Primary synthesizers failed, falling back to Browser Web Speech:', error.message)
    errors.push(`Engine: ${error.message}`)
    try {
      await playBrowserWebSpeech(cleanText, targetVoice)
    } catch (fallbackError) {
      errors.push(`WebSpeech: ${fallbackError.message}`)
      ttsState.isLoading = false
      ttsState.isPlaying = false
      ttsState.error = errors.join(' | ')
      notifyListeners()
    }
  }
}

export function togglePauseStoryTTS() {
  if (ttsState.engineType === 'browser' || !globalAudio || !globalAudio.src) {
    if (window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        ttsState.isPaused = false
        ttsState.isPlaying = true
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        ttsState.isPaused = true
      }
      notifyListeners()
    }
    return
  }

  if (globalAudio) {
    if (globalAudio.paused) {
      globalAudio.play().then(() => {
        ttsState.isPaused = false
        ttsState.isPlaying = true
        notifyListeners()
        startVisualizerLoop()
      }).catch(e => console.error(e))
    } else {
      globalAudio.pause()
      ttsState.isPaused = true
      notifyListeners()
    }
  }
}

export function stopStoryTTS() {
  if (globalAudio) {
    try {
      globalAudio.pause()
      globalAudio.currentTime = 0
    } catch (e) {}
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch (e) {}
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  ttsState.isPlaying = false
  ttsState.isPaused = false
  ttsState.isLoading = false
  ttsState.currentTime = 0
  ttsState.progress = 0
  ttsState.visualizerData.fill(0)
  notifyListeners()
}

export function seekStoryTTS(percent) {
  if (globalAudio && globalAudio.duration) {
    const targetTime = (percent / 100) * globalAudio.duration
    globalAudio.currentTime = targetTime
    ttsState.currentTime = targetTime
    ttsState.progress = percent
    notifyListeners()
  }
}

export function setTTSSpeed(speed) {
  const validSpeed = Math.min(2.0, Math.max(0.5, speed))
  updateTTSSettings({ speed: validSpeed })
}
