'use client'

import * as THREE from 'three'
import { Canvas, extend, useFrame, useLoader, useThree } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useRef, useState } from 'react'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_prevMouse;
  uniform float u_aberrationIntensity;

  void main() {
      vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
      vec2 centerOfPixel = gridUV + vec2(1.0/20.0, 1.0/20.0);

      vec2 mouseDirection = u_mouse - u_prevMouse;
      vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
      float pixelDistanceToMouse = length(pixelToMouseDirection);
      float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

      vec2 uvOffset = strength * - mouseDirection * 0.2;
      vec2 uv = vUv - uvOffset;

      vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
      vec4 colorG = texture2D(u_texture, uv);
      vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

      gl_FragColor = vec4(colorR.r, colorG.g, colorB.b, 1.0);
  }
`

// Criação do Material usando drei shaderMaterial
const AberrationMaterial = shaderMaterial(
    {
        u_texture: null,
        u_mouse: new THREE.Vector2(0.5, 0.5),
        u_prevMouse: new THREE.Vector2(0.5, 0.5),
        u_aberrationIntensity: 0
    },
    vertexShader,
    fragmentShader
)
extend({ AberrationMaterial })

function AberrationPlane({ url }) {
    const texture = useLoader(THREE.TextureLoader, url)
    const mesh = useRef()
    const [targetMouse, setTargetMouse] = useState({ x: 0.5, y: 0.5 })
    const [prevMouse, setPrevMouse] = useState({ x: 0.5, y: 0.5 })
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
    const [aberration, setAberration] = useState(0)
    const ease = 0.02

    const { viewport } = useThree()

    useFrame(() => {
        // suavização do mouse
        const mx = mouse.x + (targetMouse.x - mouse.x) * ease
        const my = mouse.y + (targetMouse.y - mouse.y) * ease
        setMouse({ x: mx, y: my })

        // atualiza os uniforms
        if (mesh.current) {
            mesh.current.material.u_mouse = new THREE.Vector2(mx, my)
            mesh.current.material.u_prevMouse = new THREE.Vector2(prevMouse.x, prevMouse.y)
            mesh.current.material.u_aberrationIntensity = aberration
        }

        // decresce a intensidade
        setAberration((a) => Math.max(0, a - 0.05))
    })

    const handlePointerMove = (e) => {
        // setPrevMouse({ ...targetMouse })
        const x = e.point.x / viewport.width + 0.5
        const y = e.point.y / viewport.height + 0.5
        setTargetMouse({ x, y })
        setAberration(2)
    }

    return (
        <mesh
            ref={mesh}
            // scale={[viewport.width, viewport.height, 1]}
            onPointerMove={handlePointerMove}
        // onPointerOver={() => setHovered(true)}
        // onPointerOut={() => setHovered(false)}
        >
            <planeGeometry args={[2, 2]} />
            <aberrationMaterial u_texture={texture} />
        </mesh>
    )
}

export default function AberrationImage() {
    return (
        <Canvas camera={{ position: [0, 0, 1], fov: 80 }}>
            <AberrationPlane url="/textures/myImage.jpg" />
        </Canvas>
    )
}
