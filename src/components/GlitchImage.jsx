'use client'

import * as THREE from 'three'
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import { useRef, useState } from 'react'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
//o segment cria as rows
const fragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float glitchIntensity;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec4 baseState = texture2D(tDiffuse, uv);

    if (glitchIntensity > 0.0) {
        float segment = floor(uv.y * 12.0);
        float randomValue = fract(sin(segment * 12345.6789 + glitchIntensity) * 43758.5453);
        vec2 offset = vec2(randomValue * 0.03, 0.0) * glitchIntensity;

        vec4 redGlitch   = texture2D(tDiffuse, uv + offset);
        vec4 greenGlitch = texture2D(tDiffuse, uv - offset);
        vec4 blueGlitch  = texture2D(tDiffuse, uv);

        if (mod(segment, 3.0) == 0.0) {
            gl_FragColor = vec4(redGlitch.r, greenGlitch.g, baseState.b, 1.0);
        } else if (mod(segment, 3.0) == 1.0) {
            gl_FragColor = vec4(baseState.r, greenGlitch.g, blueGlitch.b, 1.0);
        } else {
            gl_FragColor = vec4(redGlitch.r, baseState.g, blueGlitch.b, 1.0);
        }
    } else {
        gl_FragColor = baseState;
    }
  }
`;

const GlitchMaterial = shaderMaterial(
    { tDiffuse: null, glitchIntensity: 0 },
    vertexShader,
    fragmentShader
);
extend({ GlitchMaterial });

function GlitchPlane({ url }) {
    const texture = useLoader(THREE.TextureLoader, url);
    const mesh = useRef();
    const [hovered, setHovered] = useState(false);
    const hoverDuration = useRef(0);

    useFrame((_, delta) => {
        if (hovered) {
            hoverDuration.current += delta * 2;//velocidade
            if (hoverDuration.current >= 0.5) {
                hoverDuration.current = 0;
                mesh.current.material.glitchIntensity = Math.random() * 0.9;//intensidade
            }
        } else {
            mesh.current.material.glitchIntensity = 0;
        }
    });

    return (
        <mesh
            ref={mesh}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <planeGeometry args={[2, 2]} />
            <glitchMaterial tDiffuse={texture} />
        </mesh>
    );
}

export default function GlitchImage() {
    return (
        <Canvas camera={{ position: [0, 0, 1], fov: 80 }}>
            <GlitchPlane url="/textures/myImage.jpg" />
        </Canvas>
    );
}
