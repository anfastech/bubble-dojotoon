import React, { useRef, useMemo, useEffect } from 'react';
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

const Butterfly = ({ index = 0, size = 1, isFlying = false, onFlyComplete, position, debug = false }) => {
  // Clamp index and size to safe values
  const safeIndex = isNaN(index) ? 0 : Math.max(0, Math.min(index, 6));
  const safeSize = isNaN(size) ? 1 : Math.max(0.1, Math.min(size, 5));
  const meshRef = useRef();
  const materialRef = useRef();
  
  // Each butterfly gets its own completely independent flight parameters
  const flightParamsRef = useRef({
    startTime: 0,
    currentDirection: { x: 0, y: 0, z: 0.3 },
    targetDirection: { x: 0, y: 0, z: 0.3 },
    directionChangeTime: 0,
    speed: 1.5 + Math.random() * 0.5, // Each butterfly has its own speed
    centerX: 0,
    centerY: 0,
    centerZ: 0,
    isTurning: false,
    turnStartTime: 0,
    turnDuration: 0.5 + Math.random() * 0.3, // Each butterfly has its own turn duration
    currentRotationX: 0,
    currentRotationY: 0,
    currentRotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    targetRotationZ: 0,
    // Each butterfly has its own unique flight characteristics
    directionChangeInterval: 2 + Math.random() * 3, // Random interval for direction changes
    maxFlightDistance: 10 + Math.random() * 5, // Each butterfly has its own flight distance
    personality: Math.random(), // Each butterfly has a unique personality affecting its behavior
  });
  
  // Create stable texture with better error handling
  const texture = useMemo(() => {
    try {
      // Create a simple white texture as default
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 64, 64);
      const defaultTexture = new THREE.CanvasTexture(canvas);
      
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
          // Update the uniform if the material is still there
          if (materialRef.current) {
            materialRef.current.uniforms.texture.value = loadedTexture;
          }
        },
        undefined,
        (error) => {
          console.warn('Failed to load butterfly texture, using fallback:', error);
          // Keep using the default texture
        }
      );
      
      return defaultTexture;
    } catch (error) {
      console.warn('Error creating texture:', error);
      // Return a simple white texture as ultimate fallback
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    }
  }, []);
  
  // Create stable uniforms that don't change on re-render
  const uniforms = useMemo(() => ({
    index: { value: 0 },
    time: { value: 0 },
    size: { value: 1 },
    texture: { value: texture },
  }), [texture]);

  // Cleanup texture on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (texture && texture.dispose) {
        texture.dispose();
      }
    };
  }, [texture]);

  // Animate butterfly with smooth circular flight
  useFrame((state, delta) => {
    uniforms.time.value += delta;
    // Update uniforms dynamically without causing re-renders
    uniforms.index.value = safeIndex;
    uniforms.size.value = safeSize;
    
    if (meshRef.current) {
      if (isFlying) {
        // Initialize flight parameters when starting to fly
        if (flightParamsRef.current.startTime === 0) {
          flightParamsRef.current.startTime = state.clock.elapsedTime;
          flightParamsRef.current.centerX = meshRef.current.position.x;
          flightParamsRef.current.centerY = meshRef.current.position.y;
          flightParamsRef.current.centerZ = meshRef.current.position.z;
        }
        
        const params = flightParamsRef.current;
        const elapsed = state.clock.elapsedTime - params.startTime;
        
        // Change direction randomly every 2-4 seconds
        if (elapsed - params.directionChangeTime > params.directionChangeInterval) {
          // Personality affects flight behavior
          const personality = params.personality;
          
          // Different personalities have different flight patterns
          if (personality < 0.3) {
            // Cautious butterfly - smaller movements, more vertical
            params.targetDirection = {
              x: (Math.random() - 0.5) * 1,
              y: (Math.random() - 0.5) * 1.5,
              z: 0.3 + Math.random() * 0.4,
            };
          } else if (personality < 0.7) {
            // Normal butterfly - balanced movement
            params.targetDirection = {
              x: (Math.random() - 0.5) * 2,
              y: (Math.random() - 0.5) * 2,
              z: 0.2 + Math.random() * 0.6,
            };
          } else {
            // Adventurous butterfly - larger movements, more horizontal
            params.targetDirection = {
              x: (Math.random() - 0.5) * 3,
              y: (Math.random() - 0.5) * 1,
              z: 0.1 + Math.random() * 0.8,
            };
          }
          
          params.directionChangeTime = elapsed;
          
          // Calculate target rotation to face the direction
          // Normalize the direction vector
          const length = Math.sqrt(
            params.targetDirection.x * params.targetDirection.x +
            params.targetDirection.y * params.targetDirection.y +
            params.targetDirection.z * params.targetDirection.z
          );
          
          if (length > 0) {
            const normalizedDir = {
              x: params.targetDirection.x / length,
              y: params.targetDirection.y / length,
              z: params.targetDirection.z / length
            };
            
            // Calculate rotation angles to face this direction
            // Y rotation (horizontal turning)
            params.targetRotationY = Math.atan2(normalizedDir.x, normalizedDir.z);
            
            // X rotation (vertical tilting)
            const horizontalLength = Math.sqrt(normalizedDir.x * normalizedDir.x + normalizedDir.z * normalizedDir.z);
            params.targetRotationX = -Math.atan2(normalizedDir.y, horizontalLength);
            
            // Z rotation (banking/tilting for turns)
            params.targetRotationZ = 0; // Keep Z rotation minimal for now
            
            params.currentRotationX = meshRef.current.rotation.x;
            params.currentRotationY = meshRef.current.rotation.y;
            params.currentRotationZ = meshRef.current.rotation.z;
            params.isTurning = true;
            params.turnStartTime = elapsed;
          }
        }
        
        // Handle turning phase
        if (params.isTurning) {
          const turnElapsed = elapsed - params.turnStartTime;
          const turnProgress = Math.min(turnElapsed / params.turnDuration, 1);
          
          // Smooth rotation interpolation
          let angleDiffX = params.targetRotationX - params.currentRotationX;
          let angleDiffY = params.targetRotationY - params.currentRotationY;
          let angleDiffZ = params.targetRotationZ - params.currentRotationZ;

          // Handle angle wrapping for X and Y
          if (angleDiffX > Math.PI) angleDiffX -= 2 * Math.PI;
          if (angleDiffX < -Math.PI) angleDiffX += 2 * Math.PI;
          if (angleDiffY > Math.PI) angleDiffY -= 2 * Math.PI;
          if (angleDiffY < -Math.PI) angleDiffY += 2 * Math.PI;

          // For Z, we want to rotate towards the target, but the shortest path might involve wrapping
          // This is a bit complex, but we'll handle it by adding/subtracting 2*PI if needed
          // For simplicity, we'll just interpolate directly, and the shader will handle wrapping
          angleDiffZ = params.targetRotationZ - params.currentRotationZ;

          meshRef.current.rotation.x = params.currentRotationX + angleDiffX * turnProgress;
          meshRef.current.rotation.y = params.currentRotationY + angleDiffY * turnProgress;
          meshRef.current.rotation.z = params.currentRotationZ + angleDiffZ * turnProgress;
          
          // When turning is complete, start moving
          if (turnProgress >= 1) {
            params.isTurning = false;
            params.currentDirection = params.targetDirection;
          }
        } else {
          // Smoothly interpolate between current and target direction (only when not turning)
          const lerpFactor = 0.02; // Very smooth transitions
          params.currentDirection.x += (params.targetDirection.x - params.currentDirection.x) * lerpFactor;
          params.currentDirection.y += (params.targetDirection.y - params.currentDirection.y) * lerpFactor;
          params.currentDirection.z += (params.targetDirection.z - params.currentDirection.z) * lerpFactor;
          
          // Update rotation to match current direction using the same calculation
          const length = Math.sqrt(
            params.currentDirection.x * params.currentDirection.x +
            params.currentDirection.y * params.currentDirection.y +
            params.currentDirection.z * params.currentDirection.z
          );
          
          if (length > 0) {
            const normalizedDir = {
              x: params.currentDirection.x / length,
              y: params.currentDirection.y / length,
              z: params.currentDirection.z / length
            };
            
            // Calculate rotation angles to face this direction
            // Y rotation (horizontal turning)
            const moveAngleY = Math.atan2(normalizedDir.x, normalizedDir.z);
            
            // X rotation (vertical tilting)
            const horizontalLength = Math.sqrt(normalizedDir.x * normalizedDir.x + normalizedDir.z * normalizedDir.z);
            const moveAngleX = -Math.atan2(normalizedDir.y, horizontalLength);
            
            // Z rotation (banking/tilting for turns)
            const moveAngleZ = 0; // Keep Z rotation minimal for now

            meshRef.current.rotation.x = moveAngleX;
            meshRef.current.rotation.y = moveAngleY;
            meshRef.current.rotation.z = moveAngleZ;
          }
        }
        
        // Only move forward when not turning
        if (!params.isTurning) {
          // Update position based on current direction
          // Dynamic speed: fast initial burst, then steady
          const initialBurstTime = 1.0; // 1 second of fast movement
          const initialSpeed = params.speed * 3; // 3x faster initially
          const steadySpeed = params.speed;
          
          let currentSpeed;
          if (elapsed < initialBurstTime) {
            // Fast initial burst phase
            currentSpeed = initialSpeed;
          } else {
            // Steady phase
            currentSpeed = steadySpeed;
          }
          
          meshRef.current.position.x += params.currentDirection.x * currentSpeed * delta;
          meshRef.current.position.y += params.currentDirection.y * currentSpeed * delta;
          meshRef.current.position.z += params.currentDirection.z * currentSpeed * delta;
        }
        
        // Keep Z rotation minimal to avoid backwards appearance when going down
        meshRef.current.rotation.z = 0;
        
        // Check if butterfly has flown far enough
        if (meshRef.current.position.z > params.maxFlightDistance || 
            Math.abs(meshRef.current.position.x) > params.maxFlightDistance || 
            Math.abs(meshRef.current.position.y) > params.maxFlightDistance) {
          if (onFlyComplete) {
            onFlyComplete();
          }
        }
      } else {
        // Keep butterfly in fixed position - no floating animation to prevent conflicts
        meshRef.current.position.x = position?.[0] || 0;
        meshRef.current.position.y = position?.[1] || 0;
        meshRef.current.position.z = (position?.[2] !== undefined ? position[2] : 0.2);
        // Keep rotation at 0 to prevent visibility issues
        meshRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position || [0, 0, 0.2]}>
      <planeGeometry args={[safeSize, safeSize / 2, 24, 12]} />
      <rawShaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent 
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={true}
        alphaTest={0.1}
      />
      
      {/* Debug points that follow the butterfly sprite exactly */}
      {debug && (
        <>
          {/* Corner points */}
          <mesh position={[-safeSize/2, safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="red" />
          </mesh>
          <mesh position={[safeSize/2, safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="green" />
          </mesh>
          <mesh position={[-safeSize/2, -safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="blue" />
          </mesh>
          <mesh position={[safeSize/2, -safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
          
          {/* Center points */}
          <mesh position={[0, safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="purple" />
          </mesh>
          <mesh position={[0, -safeSize/4, 0.01]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="orange" />
          </mesh>
        </>
      )}
    </mesh>
  );
};

export default Butterfly;