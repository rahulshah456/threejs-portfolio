import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BASE_BALL_RADIUS = 0.075;

const GRID_SIZE = 240;    // matches full city + margin
const SEGMENTS = 220;
const CELL_SIZE = 0.5;
const GRID_CELLS = Math.round(GRID_SIZE / CELL_SIZE);

const vertexShader = /* glsl */`
  uniform vec3  ballPos;
  uniform float warpStrength;
  uniform float warpRadius;
  uniform float time;

  varying vec2  vUv;
  varying float vDepth;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // World-space distance from this vertex to the ball (XZ plane only)
    float dist = length(pos.xz - ballPos.xz);

    float falloff = exp(-dist * dist / (warpRadius * warpRadius));
    float dip = -warpStrength * falloff;

    float waveDist = dist - time * 3.5;
    float wave = sin(waveDist * 3.5) * exp(-dist * 0.4) * warpStrength * 0.08;
    float waveBlend = smoothstep(warpRadius * 0.4, warpRadius * 2.5, dist);
    dip += wave * waveBlend;

    pos.y += dip;
    vDepth = clamp(-dip / max(warpStrength, 0.001), 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform float time;
  uniform vec3  gridColor;
  uniform vec3  hotColor;

  varying vec2  vUv;
  varying float vDepth;

  float gridLine(float coord, float lw) {
    float f = abs(fract(coord - 0.5) - 0.5);
    return 1.0 - smoothstep(lw, lw + 0.003, f);
  }

  void main() {
    vec2 cell = vUv * float(${GRID_CELLS});
    float grid = max(gridLine(cell.x, 0.02), gridLine(cell.y, 0.02));
    if (grid < 0.01) discard;

    vec3 col = mix(gridColor, hotColor, pow(vDepth, 1.3));
    float glow = smoothstep(0.25, 1.0, vDepth) * (0.5 + 0.5 * sin(time * 5.0));
    col += hotColor * glow * 0.7;

    float edgeFade = smoothstep(1.0, 0.92, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0);

    // Flat areas invisible; only the well glows
    gl_FragColor = vec4(col, grid * edgeFade * vDepth * 0.95);
  }
`;

interface Props {
  ballPosRef: React.MutableRefObject<THREE.Vector3>;
  ballRadiusRef: React.MutableRefObject<number>;
  isDark: boolean;
}

const GravityGrid = ({ ballPosRef, ballRadiusRef, isDark }: Props) => {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, SEGMENTS, SEGMENTS);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const uniforms = useMemo(() => ({
    ballPos:      { value: new THREE.Vector3() },
    warpStrength: { value: 0.0 },
    warpRadius:   { value: 0.5 },
    time:         { value: 0 },
    gridColor:    { value: new THREE.Color(isDark ? '#1e2255' : '#9a7755') },
    hotColor:     { value: new THREE.Color(isDark ? '#ff5500' : '#ff2200') },
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;

    // Pass ball world position — mesh stays fixed at origin
    u.ballPos.value.copy(ballPosRef.current);

    const massRatio = ballRadiusRef.current / BASE_BALL_RADIUS;
    u.warpStrength.value = Math.max(0, (massRatio - 1.0) * 0.55);
    u.warpRadius.value   = 0.4 + (massRatio - 1.0) * 0.18;
    u.time.value         = clock.getElapsedTime();
    u.gridColor.value.set(isDark ? '#1e2255' : '#9a7755');
    u.hotColor.value.set(isDark ? '#ff5500' : '#ff2200');
  });

  return (
    // Static at world origin — no position tracking, shader handles the warp offset
    <mesh geometry={geometry} position={[0, 0.02, 0]} renderOrder={0}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default GravityGrid;
