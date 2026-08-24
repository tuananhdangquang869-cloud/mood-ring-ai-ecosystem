import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Custom Shader for Holographic Shield Aura ────────────────────────────────
const HolographicShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float pulseSpeed;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);
      float scanline = sin(vUv.y * 50.0 - time * pulseSpeed) * 0.15 + 0.85;
      float pulse = sin(time * pulseSpeed * 0.6) * 0.12 + 0.88;
      vec3 finalColor = color * (fresnel * 1.8 + 0.3) * scanline * pulse;
      gl_FragColor = vec4(finalColor, opacity * (fresnel * 1.8 + 0.15));
    }
  `
}

// ─── Floating Quantum Particles Through Ring Axis ──────────────────────────────
function CoreParticles({ color, count = 40, mood }) {
  const pointsRef = useRef(null)
  
  const particles = useMemo(() => {
    const pos = []
    for (let i = 0; i < count; i++) {
      const radius = (Math.random() * 0.8 + 0.2) * 1.8
      const angle = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 5.0
      pos.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius)
    }
    return new Float32Array(pos)
  }, [count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const speed = mood === 'breach' || mood === 'anger' ? 1.8 : mood === 'joy' ? 1.2 : 0.6
      pointsRef.current.rotation.y += delta * speed * 0.5
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={0.12} 
        transparent 
        opacity={0.85} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  )
}

// ─── DNA Helix Matrix ──────────────────────────────────────────────────────────
function DNAHelix({ color, baseScale, mood, pulseFreq }) {
  const groupRef = useRef(null)
  
  const helixData = useMemo(() => {
    const pointsCount = 28
    const positions1 = []
    const positions2 = []
    const radius = 2.4
    const height = 7.0
    
    for (let i = 0; i < pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 4
      const y = (i / pointsCount) * height - height / 2
      positions1.push(Math.cos(t) * radius, y, Math.sin(t) * radius)
      positions2.push(Math.cos(t + Math.PI) * radius, y, Math.sin(t + Math.PI) * radius)
    }
    
    return {
      p1: new Float32Array(positions1),
      p2: new Float32Array(positions2)
    }
  }, [])

  useFrame((state, delta) => {
    if (groupRef.current) {
      const speed = mood === 'breach' || mood === 'anger' ? 2.2 : mood === 'joy' ? 1.4 : 0.7
      groupRef.current.rotation.y += delta * speed
      const breathe = 1 + Math.sin(state.clock.getElapsedTime() * pulseFreq) * 0.05
      groupRef.current.scale.set(baseScale * breathe, baseScale * breathe, baseScale * breathe)
    }
  })

  return (
    <group ref={groupRef} scale={[baseScale, baseScale, baseScale]}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[helixData.p1, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.1} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[helixData.p2, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.1} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  )
}

// ─── 🔮 MAIN 3D QUANTUM MOOD RING (CHIẾC NHẪN CẢM XÚC ĐA TẦNG) ─────────────────
export default function AICore({ mood = 'calm', lowGraphics = false }) {
  const mainRingRef = useRef(null)
  const innerEnergyRingRef = useRef(null)
  const coreGemRef = useRef(null)
  const outerGimbalRef = useRef(null)
  const innerGimbalRef = useRef(null)
  const auraShaderRef = useRef(null)
  const { size } = useThree()

  // Base scale by viewport size
  const baseScale = size.width < 600 ? 0.75 : size.width < 900 ? 0.9 : 1.05

  // Emotional pulse dynamics computation
  const pulseFreq = useMemo(() => {
    if (mood === 'breach' || mood === 'anger') return 4.8
    if (mood === 'joy') return 3.0
    if (mood === 'melancholy' || mood === 'friction') return 1.4
    return 1.8
  }, [mood])

  const pulseAmp = useMemo(() => {
    if (mood === 'breach' || mood === 'anger') return 0.12
    if (mood === 'joy') return 0.08
    return 0.05
  }, [mood])

  // Dynamic Mood Colors & Glow Properties
  const moodTheme = useMemo(() => {
    switch (mood) {
      case 'joy':
        return {
          primaryHex: '#00f0ff',
          emissiveHex: '#00e5ff',
          metalColor: '#1e293b',
          glowHex: '#38bdf8',
          gemColor: '#00f0ff',
          emissiveIntensity: 1.6
        }
      case 'melancholy':
        return {
          primaryHex: '#60a5fa',
          emissiveHex: '#3b82f6',
          metalColor: '#0f172a',
          glowHex: '#93c5fd',
          gemColor: '#60a5fa',
          emissiveIntensity: 1.3
        }
      case 'friction':
        return {
          primaryHex: '#f59e0b',
          emissiveHex: '#d97706',
          metalColor: '#291b06',
          glowHex: '#fbbf24',
          gemColor: '#f59e0b',
          emissiveIntensity: 1.5
        }
      case 'breach':
      case 'anger':
        return {
          primaryHex: '#ef4444',
          emissiveHex: '#dc2626',
          metalColor: '#2a0808',
          glowHex: '#f87171',
          gemColor: '#ef4444',
          emissiveIntensity: 2.0
        }
      case 'relaxed':
      case 'calm':
      default:
        return {
          primaryHex: '#10b981',
          emissiveHex: '#059669',
          metalColor: '#06281e',
          glowHex: '#34d399',
          gemColor: '#10b981',
          emissiveIntensity: 1.4
        }
    }
  }, [mood])

  // Shader uniforms setup
  const shaderUniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color(moodTheme.primaryHex) },
    opacity: { value: 0.18 },
    pulseSpeed: { value: 2.4 }
  }), [moodTheme.primaryHex])

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const breathingFactor = 1 + Math.sin(time * pulseFreq) * pulseAmp

    // 1. Rotate Main Mood Ring Band
    if (mainRingRef.current) {
      if (mood === 'breach' || mood === 'anger') {
        mainRingRef.current.rotation.x += delta * 0.9
        mainRingRef.current.rotation.y += delta * 0.7
      } else if (mood === 'joy') {
        mainRingRef.current.rotation.x += delta * 0.35
        mainRingRef.current.rotation.y += delta * 0.5
      } else {
        mainRingRef.current.rotation.x += delta * 0.25
        mainRingRef.current.rotation.y += delta * 0.3
      }
      const s = baseScale * breathingFactor
      mainRingRef.current.scale.set(s, s, s)
    }

    // 2. Rotate Inner Energy Ring (Opposite spin)
    if (innerEnergyRingRef.current) {
      innerEnergyRingRef.current.rotation.y -= delta * 0.45
      innerEnergyRingRef.current.rotation.z += delta * 0.3
    }

    // 3. Core Floating Mood Gem (Pulsing & Tumbling)
    if (coreGemRef.current) {
      coreGemRef.current.rotation.x += delta * 0.6
      coreGemRef.current.rotation.y += delta * 0.8
      const gemScale = baseScale * (1 + Math.sin(time * pulseFreq * 1.2) * (pulseAmp * 1.4))
      coreGemRef.current.scale.set(gemScale, gemScale, gemScale)
    }

    // 4. Outer Gyroscope Gimbal Ring
    if (outerGimbalRef.current) {
      outerGimbalRef.current.rotation.y += delta * 0.25
      outerGimbalRef.current.rotation.z -= delta * 0.15
    }

    // 5. Inner Gyroscope Gimbal Ring
    if (innerGimbalRef.current) {
      innerGimbalRef.current.rotation.x -= delta * 0.35
      innerGimbalRef.current.rotation.z += delta * 0.25
    }

    // 6. Shader Time Update
    if (auraShaderRef.current) {
      auraShaderRef.current.uniforms.time.value = time
    }
  })

  const position = size.width < 992 ? [0, 1.8, 0] : [0, 0.5, 0]

  return (
    <group position={position}>
      {/* ─── 1. CORE FLOATING QUANTUM GEMSTONE ─────────────────────────────── */}
      <mesh ref={coreGemRef}>
        <octahedronGeometry args={[1.35, 0]} />
        <meshPhysicalMaterial 
          color={moodTheme.gemColor}
          emissive={moodTheme.emissiveHex}
          emissiveIntensity={moodTheme.emissiveIntensity}
          roughness={0.1}
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ─── 2. MAIN 3D METALLIC MOOD RING BAND (THÂN NHẪN CHÍNH) ─────────── */}
      <group ref={mainRingRef}>
        {/* Solid Lustrous Titanium Ring Band */}
        <mesh>
          <torusGeometry args={[3.2, 0.32, 32, 100]} />
          <meshStandardMaterial 
            color="#1e293b"
            emissive={moodTheme.primaryHex}
            emissiveIntensity={0.35}
            metalness={0.9}
            roughness={0.15}
          />
        </mesh>

        {/* Inlaid Radiant Energy Inlay (Dải sáng đổi màu theo cảm xúc) */}
        <mesh>
          <torusGeometry args={[3.2, 0.14, 24, 100]} />
          <meshStandardMaterial 
            color={moodTheme.primaryHex}
            emissive={moodTheme.primaryHex}
            emissiveIntensity={moodTheme.emissiveIntensity * 1.4}
            metalness={0.3}
            roughness={0.1}
            wireframe={false}
          />
        </mesh>

        {/* Outer Glow Halo Ring */}
        <mesh>
          <torusGeometry args={[3.2, 0.04, 16, 64]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
          />
        </mesh>
      </group>

      {/* ─── 3. SECONDARY INNER ENERGY RING (VÒNG NĂNG LƯỢNG XOAY ĐỐI XỨNG) ── */}
      <mesh ref={innerEnergyRingRef} scale={[baseScale, baseScale, baseScale]}>
        <torusGeometry args={[2.55, 0.08, 16, 80]} />
        <meshStandardMaterial 
          color={moodTheme.glowHex}
          emissive={moodTheme.emissiveHex}
          emissiveIntensity={1.2}
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* ─── 4. OUTER GYROSCOPIC GIMBAL RING (VÒNG ĐỊNH HƯỚNG NGOÀI) ───────── */}
      <mesh ref={outerGimbalRef} scale={[baseScale, baseScale, baseScale]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[4.1, 0.04, 12, 64]} />
        <meshBasicMaterial 
          color={moodTheme.primaryHex} 
          transparent 
          opacity={0.65} 
          wireframe={true}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ─── 5. INNER GYROSCOPIC GIMBAL RING (VÒNG ĐỊNH HƯỚNG TRONG) ───────── */}
      <mesh ref={innerGimbalRef} scale={[baseScale, baseScale, baseScale]} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1.9, 0.03, 12, 48]} />
        <meshBasicMaterial 
          color={moodTheme.glowHex} 
          transparent 
          opacity={0.7} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ─── 6. AXIAL QUANTUM PARTICLES ────────────────────────────────────── */}
      <CoreParticles color={moodTheme.primaryHex} count={45} mood={mood} />

      {/* ─── 7. DNA HELIX STRANDS (SPIRALING MATRIX) ───────────────────────── */}
      {!lowGraphics && (
        <DNAHelix 
          color={moodTheme.primaryHex} 
          baseScale={baseScale} 
          mood={mood} 
          pulseFreq={pulseFreq} 
        />
      )}

      {/* ─── 8. HOLOGRAPHIC SHIELD AURA (LỚP MÀNG HÀO QUANG LƯỢNG TỬ) ──────── */}
      {!lowGraphics && (
        <mesh scale={[baseScale * 1.15, baseScale * 1.15, baseScale * 1.15]}>
          <sphereGeometry args={[3.6, 24, 24]} />
          <shaderMaterial
            ref={auraShaderRef}
            vertexShader={HolographicShader.vertexShader}
            fragmentShader={HolographicShader.fragmentShader}
            uniforms={shaderUniforms}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
