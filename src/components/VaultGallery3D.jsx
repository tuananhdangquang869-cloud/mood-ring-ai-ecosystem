import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { 
  Eye, 
  Lock, 
  Unlock, 
  Compass, 
  Move, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2,
  Sparkles as SparklesIcon,
  HelpCircle
} from 'lucide-react'

// Procedural Canvas Texture Generator for 3D Floating Paintings
function createArtworkCanvasTexture(item, timeOffset = 0) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 340
  const ctx = canvas.getContext('2d')

  const { color = '#00f0ff', previewType = 'hologram', status = 'UNLOCKED', title = 'Memory' } = item

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 340)
  bgGrad.addColorStop(0, '#040711')
  bgGrad.addColorStop(0.5, '#070f24')
  bgGrad.addColorStop(1, '#020307')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 512, 340)

  // Cyber Grid Floor/Ceiling lines inside painting
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 340)
    ctx.stroke()
  }
  for (let y = 0; y <= 340; y += 32) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()
  }

  // Glowing Outer Rim
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 496, 324)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(14, 14, 484, 312)

  // Header Bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(16, 16, 480, 40)
  ctx.fillStyle = color
  ctx.font = 'bold 16px "Space Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText(`ID: ${item.id} // ${item.status}`, 30, 42)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '13px "Space Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText(item.date || '2026-08-15', 482, 42)

  if (status !== 'UNLOCKED') {
    // Encrypted Hologram Shield
    ctx.fillStyle = 'rgba(10, 5, 20, 0.85)'
    ctx.fillRect(16, 56, 480, 268)

    // Glowing Lock Symbol & Circuitry
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(256, 170, 45, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = color
    ctx.font = 'bold 36px "Space Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('🔒', 256, 182)

    ctx.font = 'bold 18px "Space Mono", monospace'
    ctx.fillText('ENCRYPTED DOSSIER', 256, 240)
    ctx.font = '13px "Space Mono", monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillText('CLICK TO DECRYPT / BẺ KHÓA HỒ SƠ', 256, 268)
  } else {
    // Unlocked Visualizer Canvas Art
    const cx = 256
    const cy = 180

    if (previewType === 'waveform') {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 3.5
      for (let x = 30; x < 482; x += 4) {
        const y = cy + Math.sin(x * 0.04 + timeOffset) * 45 * Math.cos(x * 0.01)
        if (x === 30) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Echo Waveform
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.lineWidth = 1.5
      for (let x = 30; x < 482; x += 4) {
        const y = cy + Math.sin(x * 0.06 - timeOffset) * 28
        if (x === 30) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    } else if (previewType === 'matrix') {
      ctx.fillStyle = color
      ctx.font = '14px "Space Mono", monospace'
      ctx.textAlign = 'left'
      for (let col = 0; col < 12; col++) {
        const colX = 40 + col * 38
        for (let row = 0; row < 6; row++) {
          const rowY = 90 + row * 34
          const char = Math.sin(col * 3 + row + timeOffset) > 0 ? '0x' + ((col * row * 17) % 256).toString(16).padStart(2, '0').toUpperCase() : '101'
          ctx.globalAlpha = 0.3 + (Math.sin(col + row + timeOffset * 2) + 1) * 0.35
          ctx.fillText(char, colX, rowY)
        }
      }
      ctx.globalAlpha = 1.0
    } else if (previewType === 'quantum') {
      // Quantum Rings & Core
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, 55, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(cx, cy, 85, 30, Math.PI / 4, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.ellipse(cx, cy, 85, 30, -Math.PI / 4, 0, Math.PI * 2)
      ctx.stroke()

      // Core Glow
      const glow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 40)
      glow.addColorStop(0, '#ffffff')
      glow.addColorStop(0.4, color)
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, 40, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Hologram Concentric Pulsing Portal
      for (let r = 15; r <= 80; r += 16) {
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.2 + (r / 80) * 0.6
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1.0
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fill()
    }

    // Title and Lore Banner at Bottom
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)'
    ctx.fillRect(20, 260, 472, 60)
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(20, 260, 472, 60)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 15px "Inter", "Space Grotesk", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, 256, 286)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
    ctx.font = '11px "Space Mono", monospace'
    ctx.fillText(`SIZE: ${item.size || '1.2 MB'} | CODE: ${item.decryptionCode || 'CONFIDENTIAL'}`, 256, 306)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// 3D Floating Artwork Painting Frame
function FloatingArtworkFrame({
  item,
  index,
  total,
  position,
  rotation,
  isSelected,
  onSelect,
  onDecrypt,
  isDecrypting
}) {
  const meshRef = useRef()
  const frameRef = useRef()
  const [hovered, setHovered] = useState(false)
  const texture = useMemo(() => createArtworkCanvasTexture(item, index * 1.5), [item, index])

  // Subtle floating and hover glow animation
  useFrame((state, delta) => {
    if (frameRef.current) {
      const t = state.clock.getElapsedTime() + index * 0.8
      if (!isSelected) {
        frameRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.15
        frameRef.current.rotation.y = rotation[1] + Math.sin(t * 0.6) * 0.04
      } else {
        frameRef.current.position.y = position[1]
        frameRef.current.rotation.y = rotation[1]
      }
    }
  })

  const glowColor = hovered ? '#ffffff' : isSelected ? '#00f0ff' : item.color || '#00f0ff'

  return (
    <group ref={frameRef} position={position} rotation={rotation}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Outer Cyberpunk Frame Bezel */}
        <mesh
          position={[0, 0, -0.05]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item, index)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            setHovered(false)
            document.body.style.cursor = 'auto'
          }}
        >
          <boxGeometry args={[4.4, 3.0, 0.12]} />
          <meshStandardMaterial
            color="#080e1c"
            metalness={0.85}
            roughness={0.25}
            emissive={glowColor}
            emissiveIntensity={hovered ? 0.35 : isSelected ? 0.25 : 0.1}
          />
        </mesh>

        {/* Neon Light Border Rim */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[4.26, 2.86, 0.04]} />
          <meshBasicMaterial
            color={glowColor}
            wireframe={true}
            transparent={true}
            opacity={hovered ? 0.95 : isSelected ? 0.8 : 0.45}
          />
        </mesh>

        {/* Canvas Picture Display */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0.03]}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item, index)
          }}
        >
          <planeGeometry args={[4.1, 2.7]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        {/* Holographic Pedestal Light Beam underneath */}
        <mesh position={[0, -2.2, 0]}>
          <cylinderGeometry args={[0.08, 0.4, 1.8, 16, 1, true]} />
          <meshBasicMaterial
            color={item.color || '#00f0ff'}
            transparent={true}
            opacity={hovered ? 0.4 : 0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* 3D Label & Status Badge */}
        <Billboard position={[0, 1.75, 0]}>
          <Text
            fontSize={0.22}
            color={glowColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {`${item.id}: ${item.title}`}
          </Text>
        </Billboard>

        <Billboard position={[0, -1.65, 0]}>
          <Text
            fontSize={0.16}
            color={item.status === 'UNLOCKED' ? '#00f0ff' : '#ff4d4d'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {item.status === 'UNLOCKED' ? '🔓 ĐÃ MỞ KHÓA // CLICK ĐỂ XEM HỒ SƠ' : '🔒 ĐANG MÃ HÓA // CLICK ĐỂ BẺ KHÓA'}
          </Text>
        </Billboard>
      </Float>
    </group>
  )
}

// 3D Cyberpunk Gallery Hallway Architecture
function GalleryEnvironment({ totalPaintings, activeMood = 'calm' }) {
  const hallLength = Math.max(26, totalPaintings * 5 + 10)

  const moodLighting = {
    calm: { ambient: '#00f0ff', point1: '#10b981', point2: '#00f0ff' },
    joy: { ambient: '#00f0ff', point1: '#ff00ea', point2: '#00f0ff' },
    friction: { ambient: '#f59e0b', point1: '#ffb000', point2: '#ef4444' },
    breach: { ambient: '#ef4444', point1: '#ff4d4d', point2: '#ff0055' }
  }[activeMood] || { ambient: '#00f0ff', point1: '#00f0ff', point2: '#38bdf8' }

  return (
    <group>
      {/* Ambient and Key Point Lights */}
      <ambientLight intensity={0.5} color={moodLighting.ambient} />
      <pointLight position={[0, 6, 0]} intensity={1.8} color={moodLighting.point1} distance={25} />
      <pointLight position={[0, 6, -12]} intensity={1.8} color={moodLighting.point2} distance={25} />
      <pointLight position={[0, 6, 12]} intensity={1.8} color={moodLighting.point1} distance={25} />

      {/* Cyber Reflective Floor Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.6, 0]}>
        <planeGeometry args={[20, hallLength]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>

      {/* Floor Grid Lines */}
      <gridHelper args={[20, 20, moodLighting.point1, 'rgba(255, 255, 255, 0.08)']} position={[0, -2.59, 0]} />

      {/* Ceiling Neon Rails */}
      <mesh position={[-4.5, 4.8, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, hallLength]} />
        <meshBasicMaterial color={moodLighting.point1} />
      </mesh>
      <mesh position={[4.5, 4.8, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, hallLength]} />
        <meshBasicMaterial color={moodLighting.point2} />
      </mesh>

      {/* Gallery Hallway Floating Particles */}
      <Sparkles
        count={120}
        scale={[18, 8, hallLength]}
        size={1.4}
        speed={0.4}
        color={moodLighting.point1}
      />
    </group>
  )
}

// 3D Walkthrough Camera & Navigation Director
function WalkthroughController({
  targetIndex,
  paintingsCount,
  onIndexChange,
  isAutoTour,
  walkVelocity
}) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 0.5, 10))
  const currentLookAt = useRef(new THREE.Vector3(0, 0.5, 0))
  const isDragging = useRef(false)
  const previousMousePos = useRef({ x: 0, y: 0 })
  const cameraAngles = useRef({ pitch: 0, yaw: 0 })

  // Calculate target 3D waypoint based on selected painting index
  const calculateWaypoint = useCallback((index) => {
    if (index === null || index === undefined) return { pos: [0, 0.5, 9], look: [0, 0.5, 0] }
    
    // Gallery layout: left/right alternating or curved hall
    const isLeft = index % 2 === 0
    const row = Math.floor(index / 2)
    const z = 6 - row * 6.5
    const x = isLeft ? -1.2 : 1.2
    const lookX = isLeft ? -4.2 : 4.2

    return {
      pos: [x, 0.2, z + 2.8],
      look: [lookX, 0.2, z]
    }
  }, [])

  // Auto-tour animation step
  useEffect(() => {
    if (!isAutoTour) return
    const interval = setInterval(() => {
      onIndexChange((prev) => ((prev ?? 0) + 1) % paintingsCount)
    }, 4500)
    return () => clearInterval(interval)
  }, [isAutoTour, paintingsCount, onIndexChange])

  // Mouse drag to look around
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (e.target.tagName !== 'CANVAS') return
      isDragging.current = true
      previousMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e) => {
      if (!isDragging.current) return
      const deltaX = e.clientX - previousMousePos.current.x
      const deltaY = e.clientY - previousMousePos.current.y
      previousMousePos.current = { x: e.clientX, y: e.clientY }

      cameraAngles.current.yaw -= deltaX * 0.003
      cameraAngles.current.pitch = Math.max(-0.6, Math.min(0.6, cameraAngles.current.pitch - deltaY * 0.003))
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleWheel = (e) => {
      if (e.target.tagName !== 'CANVAS') return
      // Wheel forward/backward
      const deltaZ = e.deltaY * 0.008
      currentPos.current.z = Math.max(-20, Math.min(15, currentPos.current.z + deltaZ))
    }

    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Frame loop smoothly interpolating camera
  useFrame((state, delta) => {
    // 1. WASD / Virtual Joystick walk velocity input
    if (walkVelocity.current.x !== 0 || walkVelocity.current.z !== 0) {
      const speed = 4.5 * delta
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngles.current.yaw)
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngles.current.yaw)

      currentPos.current.addScaledVector(forward, -walkVelocity.current.z * speed)
      currentPos.current.addScaledVector(right, walkVelocity.current.x * speed)

      // Clamp room boundaries
      currentPos.current.x = Math.max(-4.5, Math.min(4.5, currentPos.current.x))
      currentPos.current.z = Math.max(-25, Math.min(15, currentPos.current.z))
    } else if (targetIndex !== null && !isDragging.current) {
      // Interpolate towards selected artwork waypoint
      const waypoint = calculateWaypoint(targetIndex)
      currentPos.current.lerp(new THREE.Vector3(...waypoint.pos), delta * 2.8)
      currentLookAt.current.lerp(new THREE.Vector3(...waypoint.look), delta * 3.2)
    }

    // Apply pitch and yaw offsets
    const lookTarget = currentLookAt.current.clone()
    lookTarget.x += Math.sin(cameraAngles.current.yaw) * 5
    lookTarget.z -= Math.cos(cameraAngles.current.yaw) * 5
    lookTarget.y += cameraAngles.current.pitch * 3

    camera.position.lerp(currentPos.current, delta * 3.5)
    camera.lookAt(lookTarget)
  })

  return null
}

// MAIN 3D GALLERY CANVAS COMPONENT
export default function VaultGallery3D({
  vaultItemsState = [],
  selectedVaultItem,
  setSelectedVaultItem,
  handleDecrypt,
  decryptingId,
  activeMood = 'calm',
  onClose
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isAutoTour, setIsAutoTour] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControlsHelp, setShowControlsHelp] = useState(true)
  const containerRef = useRef(null)

  // Real-time movement vectors for WASD / Joystick
  const walkVelocity = useRef({ x: 0, z: 0 })
  const keysPressed = useRef({})

  // Keyboard navigation listener (W, A, S, D, Arrow keys, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true

      if (['w', 'arrowup'].includes(e.key.toLowerCase())) walkVelocity.current.z = -1
      if (['s', 'arrowdown'].includes(e.key.toLowerCase())) walkVelocity.current.z = 1
      if (['a', 'arrowleft'].includes(e.key.toLowerCase())) walkVelocity.current.x = -1
      if (['d', 'arrowright'].includes(e.key.toLowerCase())) walkVelocity.current.x = 1

      // Next / Previous painting shortcuts
      if (e.key === 'q' || e.key === 'Q') {
        setSelectedIndex((prev) => Math.max(0, (prev ?? 0) - 1))
      }
      if (e.key === 'e' || e.key === 'E') {
        setSelectedIndex((prev) => Math.min(vaultItemsState.length - 1, (prev ?? 0) + 1))
      }
    }

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false

      const w = keysPressed.current['w'] || keysPressed.current['arrowup']
      const s = keysPressed.current['s'] || keysPressed.current['arrowdown']
      const a = keysPressed.current['a'] || keysPressed.current['arrowleft']
      const d = keysPressed.current['d'] || keysPressed.current['arrowright']

      walkVelocity.current.z = w ? -1 : s ? 1 : 0
      walkVelocity.current.x = a ? -1 : d ? 1 : 0
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [vaultItemsState.length])

  // Generate 3D painting layouts (left/right corridor arrangement)
  const paintingLayouts = useMemo(() => {
    return vaultItemsState.map((item, idx) => {
      const isLeft = idx % 2 === 0
      const row = Math.floor(idx / 2)
      const z = 6 - row * 6.5
      const x = isLeft ? -4.2 : 4.2
      const rotY = isLeft ? Math.PI / 6 : -Math.PI / 6

      return {
        item,
        index: idx,
        position: [x, 0.2, z],
        rotation: [0, rotY, 0]
      }
    })
  }, [vaultItemsState])

  const currentFocusedItem = vaultItemsState[selectedIndex] || vaultItemsState[0]

  const handleSelectPainting = (item, idx) => {
    setSelectedIndex(idx)
    setIsAutoTour(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div ref={containerRef} className={`vault-3d-gallery-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* 3D WebGL Canvas */}
      <div className="vault-3d-canvas-container">
        <Canvas
          camera={{ position: [0, 0.5, 9], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ powerPreference: 'high-performance', antialias: true }}
        >
          <GalleryEnvironment totalPaintings={vaultItemsState.length} activeMood={activeMood} />

          {paintingLayouts.map((layout) => (
            <FloatingArtworkFrame
              key={layout.item.id}
              item={layout.item}
              index={layout.index}
              total={vaultItemsState.length}
              position={layout.position}
              rotation={layout.rotation}
              isSelected={selectedIndex === layout.index}
              onSelect={handleSelectPainting}
              onDecrypt={handleDecrypt}
              isDecrypting={decryptingId === layout.item.id}
            />
          ))}

          <WalkthroughController
            targetIndex={selectedIndex}
            paintingsCount={vaultItemsState.length}
            onIndexChange={setSelectedIndex}
            isAutoTour={isAutoTour}
            walkVelocity={walkVelocity}
          />
        </Canvas>
      </div>

      {/* Top HUD Header Banner */}
      <div className="vault-3d-hud-header">
        <div className="hud-badge-title">
          <span className="live-pulse-dot"></span>
          <span className="hud-title-text">3D MEMORY VAULT // PHÒNG TRANH KÝ ỨC LƠ LỬNG</span>
        </div>
        <div className="hud-header-actions">
          <button
            type="button"
            className={`hud-btn-pill ${isAutoTour ? 'active' : ''}`}
            onClick={() => setIsAutoTour(!isAutoTour)}
            title="Chế độ đi dạo tham quan tự động"
          >
            {isAutoTour ? <Pause size={14} /> : <Play size={14} />}
            <span>{isAutoTour ? 'TẠM DỪNG TOUR' : 'TỰ ĐỘNG ĐI DẠO'}</span>
          </button>
          <button
            type="button"
            className="hud-btn-pill"
            onClick={() => setShowControlsHelp(!showControlsHelp)}
            title="Hướng dẫn điều khiển di chuyển"
          >
            <HelpCircle size={14} />
            <span>HƯỚNG DẪN</span>
          </button>
          <button
            type="button"
            className="hud-btn-pill"
            onClick={toggleFullscreen}
            title="Chế độ toàn màn hình"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Control Help Floating Card */}
      {showControlsHelp && (
        <div className="vault-3d-help-overlay">
          <div className="help-header">
            <span>🎮 HƯỚNG DẪN ĐI DẠO 3D</span>
            <button type="button" onClick={() => setShowControlsHelp(false)}>✕</button>
          </div>
          <div className="help-grid">
            <div className="help-row">
              <span className="key-tag">W / S / ↑ / ↓</span>
              <span>Đi tiến / lùi dọc hành lang</span>
            </div>
            <div className="help-row">
              <span className="key-tag">A / D / ← / →</span>
              <span>Đi ngang sang trái / phải</span>
            </div>
            <div className="help-row">
              <span className="key-tag">Chuột Kéo</span>
              <span>Xoay góc nhìn 360° tự do</span>
            </div>
            <div className="help-row">
              <span className="key-tag">Cuộn Chuột</span>
              <span>Lướt tới / lùi trong phòng</span>
            </div>
            <div className="help-row">
              <span className="key-tag">Q / E</span>
              <span>Chuyển sang tranh trước / sau</span>
            </div>
            <div className="help-row">
              <span className="key-tag">Click Tranh</span>
              <span>Bay lại gần & xem/bẻ khóa hồ sơ</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Artwork Inspector Card */}
      {currentFocusedItem && (
        <div className="vault-3d-inspector-hud">
          <div className="inspector-left">
            <div className="inspector-badge" style={{ color: currentFocusedItem.color }}>
              {currentFocusedItem.id} // {currentFocusedItem.status}
            </div>
            <h3 className="inspector-title">{currentFocusedItem.title}</h3>
            <p className="inspector-meta">
              📅 {currentFocusedItem.date} | 💾 {currentFocusedItem.size} | 🔐 {currentFocusedItem.decryptionCode || 'CONFIDENTIAL'}
            </p>
          </div>

          <div className="inspector-actions">
            <button
              type="button"
              className="inspector-nav-btn"
              disabled={selectedIndex <= 0}
              onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
              title="Bức tranh trước (Phím Q)"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="inspector-counter">
              {selectedIndex + 1} / {vaultItemsState.length}
            </span>

            <button
              type="button"
              className="inspector-nav-btn"
              disabled={selectedIndex >= vaultItemsState.length - 1}
              onClick={() => setSelectedIndex(Math.min(vaultItemsState.length - 1, selectedIndex + 1))}
              title="Bức tranh tiếp theo (Phím E)"
            >
              <ChevronRight size={18} />
            </button>

            {currentFocusedItem.status === 'UNLOCKED' ? (
              <button
                type="button"
                className="inspector-action-btn unlocked interactive"
                onClick={() => setSelectedVaultItem(currentFocusedItem)}
              >
                <Eye size={16} />
                <span>MỞ CHI TIẾT HỒ SƠ</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={decryptingId === currentFocusedItem.id}
                className="inspector-action-btn decrypt interactive"
                onClick={() => handleDecrypt(currentFocusedItem.id)}
              >
                <Unlock size={16} />
                <span>{decryptingId === currentFocusedItem.id ? '⚡ ĐANG GIẢI MÃ...' : 'BẺ KHÓA / GIẢI MÃ'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* On-Screen Touch Joystick / D-Pad for Mobile & Quick Walking */}
      <div className="vault-3d-touch-controls">
        <button
          type="button"
          className="dpad-btn up"
          onPointerDown={() => { walkVelocity.current.z = -1 }}
          onPointerUp={() => { walkVelocity.current.z = 0 }}
          onPointerLeave={() => { walkVelocity.current.z = 0 }}
        >
          ▲
        </button>
        <div className="dpad-middle-row">
          <button
            type="button"
            className="dpad-btn left"
            onPointerDown={() => { walkVelocity.current.x = -1 }}
            onPointerUp={() => { walkVelocity.current.x = 0 }}
            onPointerLeave={() => { walkVelocity.current.x = 0 }}
          >
            ◀
          </button>
          <button
            type="button"
            className="dpad-btn reset"
            onClick={() => setSelectedIndex(0)}
            title="Về đầu phòng tranh"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            className="dpad-btn right"
            onPointerDown={() => { walkVelocity.current.x = 1 }}
            onPointerUp={() => { walkVelocity.current.x = 0 }}
            onPointerLeave={() => { walkVelocity.current.x = 0 }}
          >
            ▶
          </button>
        </div>
        <button
          type="button"
          className="dpad-btn down"
          onPointerDown={() => { walkVelocity.current.z = 1 }}
          onPointerUp={() => { walkVelocity.current.z = 0 }}
          onPointerLeave={() => { walkVelocity.current.z = 0 }}
        >
          ▼
        </button>
      </div>
    </div>
  )
}
