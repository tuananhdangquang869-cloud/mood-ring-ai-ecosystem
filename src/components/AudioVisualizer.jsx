import { useEffect, useRef } from 'react'
import { analyser } from '../utils/audioSynth.js'

export default function AudioVisualizer({ soundEnabled }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    if (!soundEnabled || !analyser) {
      ctx.clearRect(0, 0, width, height)
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)'
      ctx.lineWidth = 2
      ctx.stroke()
      return
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      ctx.clearRect(0, 0, width, height)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyser.getByteFrequencyData(dataArray)
      
      ctx.beginPath()
      const sliceWidth = width / bufferLength
      let x = 0
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 255
        const y = height / 2 + (v * (height / 2) * (i % 2 === 0 ? 1 : -1))
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }
      
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
    
    draw()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [soundEnabled])

  return <canvas ref={canvasRef} className="visualizer-canvas" width="300" height="40" />
}
