import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Sparkles, Float, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, Glitch, ChromaticAberration, DepthOfField } from '@react-three/postprocessing'
import AICore from './AICore'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

function Scene({ mood, activeTab, gyroActive, lowGraphics }) {
  const normalizedMood = 
    mood === 'joy' ? 'joy' :
    mood === 'melancholy' ? 'friction' :
    mood === 'anger' ? 'breach' :
    mood === 'relaxed' ? 'calm' : (mood || 'calm')

  const sparkleSettings = {
    calm: { color: 'cyan', speed: 0.25, count: 90, size: 0.8 },
    joy: { color: '#00f0ff', speed: 0.8, count: 130, size: 1.2 },
    friction: { color: 'orange', speed: 1.2, count: 140, size: 1.1 },
    breach: { color: 'red', speed: 2.6, count: 200, size: 1.8 }
  }

  const sparkles = sparkleSettings[normalizedMood] || sparkleSettings.calm

  const isPrimary3DTab = activeTab === 'core' || activeTab === 'oracle'

  if (activeTab === 'ring') return null


  return (
    <Canvas
      className={`scene-canvas ${!isPrimary3DTab ? 'dimmed' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
      frameloop={!isPrimary3DTab ? 'demand' : 'always'}
      camera={{ position: [0, 0, 20], fov: 45 }}
      dpr={[1, lowGraphics ? 1 : Math.min(window.devicePixelRatio || 1, 1.2)]}
      gl={{ powerPreference: 'high-performance', antialias: !lowGraphics, alpha: true }}
    >
          <ResponsiveStars lowGraphics={lowGraphics || !isPrimary3DTab} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[5, 8, 8]} intensity={1.4} color="#ffffff" />
          <pointLight 
            intensity={2.0} 
            position={[10, 10, 10]} 
            color={normalizedMood === 'breach' ? '#ff4d4d' : normalizedMood === 'friction' ? '#ffae42' : '#00f0ff'} 
          />
          <pointLight 
            intensity={1.2} 
            position={[-8, -6, -8]} 
            color={normalizedMood === 'breach' ? '#ff0055' : normalizedMood === 'friction' ? '#f59e0b' : '#38bdf8'} 
          />
          <AICore mood={normalizedMood} lowGraphics={lowGraphics || !isPrimary3DTab} />

          {isPrimary3DTab && (
            <Float speed={normalizedMood === 'breach' ? 2.2 : normalizedMood === 'friction' ? 1.0 : 0.35} floatIntensity={1.1} rotationIntensity={0.8}>
              <ResponsiveSparkles baseSettings={sparkles} lowGraphics={lowGraphics} />
            </Float>
          )}

          {/* CameraDirector controls smooth camera position and lookAt transitions */}
          <CameraDirector activeTab={activeTab} gyroActive={gyroActive} lowGraphics={lowGraphics} isPrimary3DTab={isPrimary3DTab} />

          {!lowGraphics && isPrimary3DTab && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.85} luminanceThreshold={0.25} luminanceSmoothing={0.7} />
              <Glitch delay={[4, 8]} duration={[0.15, 0.35]} strength={0.2} active={normalizedMood === 'breach'} />
              <ChromaticAberration offset={[0.0015, 0.0015]} blendFunction={1} active={normalizedMood === 'breach'} />
            </EffectComposer>
          )}
    </Canvas>
  )
}

function CameraDirector({ activeTab, gyroActive, lowGraphics, isPrimary3DTab }) {
  const { camera, size, gl } = useThree()
  const gyroOffset = useRef({ x: 0, y: 0 })
  
  // Performance safeguard for pixel ratio - locked to 1 in smooth mode
  useEffect(() => {
    gl.setPixelRatio(lowGraphics ? 1 : Math.min(window.devicePixelRatio || 1, 1.25))
  }, [gl, lowGraphics])

  // Responsive FOV adjustment based on screen size
  useEffect(() => {
    /* eslint-disable react-hooks/immutability */
    if (size.width < 600) {
      camera.fov = 55
    } else if (size.width < 900) {
      camera.fov = 50
    } else {
      camera.fov = 45
    }
    camera.updateProjectionMatrix()
    /* eslint-enable react-hooks/immutability */
  }, [size.width, camera])

  useEffect(() => {
    if (!gyroActive) {
      gyroOffset.current = { x: 0, y: 0 }
      return
    }

    const handleOrientation = (e) => {
      if (e.beta === null || e.gamma === null) return
      
      // Standard phone holding angle: beta around 60 degrees, gamma around 0.
      const betaRef = 60
      const gammaRef = 0

      // Calculate difference and map to camera units
      let dx = (e.gamma - gammaRef) / 20 // Tilting left-right
      let dy = (e.beta - betaRef) / 20    // Tilting up-down
      
      // Clamp to prevent camera moving out of bounds
      dx = Math.max(-3.5, Math.min(3.5, dx))
      dy = Math.max(-3.5, Math.min(3.5, dy))
      
      gyroOffset.current = { x: dx, y: -dy }
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [gyroActive])

  useFrame((state, delta) => {
    const isMobile = size.width < 992
    let targetX = 0
    let targetY = 0.5
    let targetZ = 20

    if (isMobile) {
      // Mobile positioning targets
      targetX = 0
      targetY = activeTab === 'chat' || activeTab === 'oracle' ? 2.5 : activeTab === 'vault' ? 1.2 : 1.8
      targetZ = activeTab === 'oracle' ? 24 : 22
    } else {
      // Desktop positioning targets
      switch (activeTab) {
        case 'core':
          targetX = 0
          targetY = 0.5
          targetZ = 17
          break
        case 'oracle':
          // Push core to the right so AI Oracle chatbot displays nicely on left
          targetX = -4.5
          targetY = 0.8
          targetZ = 18
          break
        case 'network':
          // Move core out of viewport slightly, zoom out
          targetX = 5.5
          targetY = 0.0
          targetZ = 23
          break
        case 'vault':
          // Shift core to the left
          targetX = 4.8
          targetY = 1.0
          targetZ = 19
          break
        case 'terminal':
          // Move deep back
          targetX = -5.0
          targetY = -1.0
          targetZ = 24
          break
        default:
          targetX = 0
          targetY = 0.5
          targetZ = 20
      }
    }

    const finalTargetX = targetX + gyroOffset.current.x
    const finalTargetY = targetY + gyroOffset.current.y
    const finalTargetZ = targetZ

    // Smooth lerp movement using frames delta to ensure frame-rate independent interpolation
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, finalTargetX, delta * 3.5)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, finalTargetY, delta * 3.5)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, finalTargetZ, delta * 3.5)
  })

  return null
}

function ResponsiveStars({ lowGraphics }) {
  const { size } = useThree()
  const base = lowGraphics ? 150 : 1800
  const count = size.width < 600 ? Math.floor(base * 0.35) : size.width < 900 ? Math.floor(base * 0.6) : base
  return <Stars radius={120} depth={60} count={count} factor={5} fade />
}

function ResponsiveSparkles({ baseSettings, lowGraphics }) {
  const { size } = useThree()
  const scale = size.width < 600 ? 0.45 : size.width < 900 ? 0.75 : 1
  const baseCount = lowGraphics ? Math.min(8, baseSettings.count || 90) : Math.min(65, baseSettings.count || 90)
  const adjusted = {
    ...baseSettings,
    count: Math.max(3, Math.floor(baseCount * scale)),
    size: (baseSettings.size || 1) * (size.width < 600 ? 0.75 : 1)
  }
  return <Sparkles {...adjusted} />
}

export default Scene

