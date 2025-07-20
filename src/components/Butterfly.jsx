import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float index;
uniform float time;
uniform float size;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
  float flapTime = radians(sin(time * 6.0 - length(position.xy) / size * 2.6 + index * 2.0) * 45.0 + 30.0);
  float hovering = cos(time * 2.0 + index * 3.0) * size / 16.0;
  vec3 updatePosition = vec3(
    cos(flapTime) * position.x,
    position.y + hovering,
    sin(flapTime) * abs(position.x) + hovering
  );

  vec4 mvPosition = modelViewMatrix * vec4(updatePosition, 1.0);

  vPosition = position;
  vUv = uv;

  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
precision highp float;

uniform float index;
uniform float time;
uniform float size;
uniform sampler2D texture;

varying vec3 vPosition;
varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise3(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}
vec3 convertHsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {
  float baseHue = 0.0;
  if (index < 1.5) baseHue = 0.0; // Red/Orange
  else if (index < 3.5) baseHue = 0.17; // Yellow/Green
  else if (index < 5.5) baseHue = 0.55; // Blue/Cyan
  else baseHue = 0.75; // Purple
  float noise = snoise3(vPosition / vec3(size * 0.25) + vec3(0.0, 0.0, time));
  float hue = mod(baseHue + noise * 0.08 + time * 0.03, 1.0);
  vec3 hsv = vec3(hue, 0.4, 1.0);
  vec3 rgb = convertHsvToRgb(hsv);
  vec4 texColor = texture2D(texture, vUv);
  gl_FragColor = vec4(rgb, 1.0) * texColor;
}
`;

const Butterfly = ({ index = 0, size = 1, isFlying = false, onFlyComplete, position }) => {
  // Clamp index and size to safe values
  const safeIndex = isNaN(index) ? 0 : Math.max(0, Math.min(index, 6));
  const safeSize = isNaN(size) ? 1 : Math.max(0.1, Math.min(size, 5));
  const meshRef = useRef();
  
  // Load texture with proper async handling
  let texture = null;
  try {
    // Use a simple white texture as default, then try to load the real texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 64, 64);
    texture = new THREE.CanvasTexture(canvas);
    
    // Try to load the real texture asynchronously
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/butterfly-tex.png',
      (loadedTexture) => {
        // Successfully loaded the real texture
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        texture = loadedTexture;
        // Update the uniform if the mesh is still there
        if (meshRef.current) {
          meshRef.current.material.uniforms.texture.value = texture;
        }
      },
      undefined,
      (error) => {
        console.warn('Failed to load butterfly texture, using fallback:', error);
        // Keep using the white texture fallback
      }
    );
  } catch (error) {
    console.warn('Error setting up texture:', error);
  }
  
  // Create stable uniforms that don't change on re-render
  const uniforms = useMemo(() => ({
    index: { value: 0 },
    time: { value: 0 },
    size: { value: 1 },
    texture: { value: texture },
  }), [texture]);

  // Animate butterfly with gentle random floating inside the bubble
  useFrame((state, delta) => {
    uniforms.time.value += delta;
    // Update uniforms dynamically without causing re-renders
    uniforms.index.value = safeIndex;
    uniforms.size.value = safeSize;
    
    if (meshRef.current) {
      // Keep butterfly in fixed position - no floating animation
      meshRef.current.position.x = position?.[0] || 0;
      meshRef.current.position.y = position?.[1] || 0;
      meshRef.current.position.z = position?.[2] !== undefined ? position[2] : 0.2;
      // Keep rotation at 0 to prevent visibility issues
      meshRef.current.rotation.set(0, 0, 0);
    }
    if (isFlying && meshRef.current) {
      meshRef.current.position.z += delta * 10;
      if (meshRef.current.position.z > 10 && onFlyComplete) {
        onFlyComplete();
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position || [0, 0, 0.2]}>
      <planeGeometry args={[safeSize, safeSize / 2, 24, 12]} />
      <rawShaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default Butterfly;