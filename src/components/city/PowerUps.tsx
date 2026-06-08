import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayMode } from '../../store/playModeStore';

const MAX_SPAWNED = 20;
const SPAWN_INTERVAL = 1200;
const LIFETIME = 12000;
const WARN_START = 0.65;
const POWERUP_RADIUS = 0.1;
const GROW_PER_COLLECT = 0.018;
const MAX_BALL_RADIUS = 0.45;
const BASE_BALL_RADIUS = 0.075;

const RING_TILT = 27 * (Math.PI / 180); // Saturn's axial tilt
const RING_BASE_SPEED = 3.6;
const RING_MAX_SPEED = 18.0;

// Each band unlocks after N orbs collected; inner bands first
const RING_BANDS = [
  { innerR: 0.10, outerR: 0.16, color: '#ff6622', opacity: 0.60, speedMul: 1.00, unlockAt: 1,  ballCount: 3, ballColor: '#ff4400' },
  { innerR: 0.18, outerR: 0.24, color: '#ffaa44', opacity: 0.50, speedMul: 0.85, unlockAt: 4,  ballCount: 4, ballColor: '#ffaa00' },
  { innerR: 0.27, outerR: 0.33, color: '#ff4400', opacity: 0.55, speedMul: 0.72, unlockAt: 8,  ballCount: 5, ballColor: '#ff6600' },
  { innerR: 0.36, outerR: 0.42, color: '#ffcc66', opacity: 0.40, speedMul: 0.60, unlockAt: 14, ballCount: 6, ballColor: '#ffcc00' },
  { innerR: 0.45, outerR: 0.50, color: '#ff8833', opacity: 0.32, speedMul: 0.50, unlockAt: 20, ballCount: 7, ballColor: '#ff8800' },
  { innerR: 0.53, outerR: 0.58, color: '#ffdd88', opacity: 0.24, speedMul: 0.42, unlockAt: 28, ballCount: 8, ballColor: '#ffdd44' },
  { innerR: 0.61, outerR: 0.66, color: '#ff5500', opacity: 0.18, speedMul: 0.35, unlockAt: 38, ballCount: 9, ballColor: '#ff5500' },
];

const ORB_COLORS = [
  { color: '#ff2200', emissive: '#ff4400' },
  { color: '#ffcc00', emissive: '#ffaa00' },
  { color: '#ff6600', emissive: '#ff3300' },
];

function randomPos(): THREE.Vector3 {
  const angle = Math.random() * Math.PI * 2;
  const r = 4 + Math.random() * 24;
  return new THREE.Vector3(Math.sin(angle) * r, POWERUP_RADIUS, Math.cos(angle) * r);
}

let nextId = 0;

interface Orb { id: number; position: THREE.Vector3; color: string; emissive: string; spawnedAt: number; }

// ── Roaming orb ──────────────────────────────────────────────────────────────

const RoamingOrb = ({ orb }: { orb: Orb }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null!);
  const scaleRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const age = (Date.now() - orb.spawnedAt) / LIFETIME;
    const isWarning = age > WARN_START;

    scaleRef.current = Math.min(1, scaleRef.current + delta * 2.5);
    const baseScale = scaleRef.current;

    if (isWarning) {
      const warnT = (age - WARN_START) / (1 - WARN_START);
      const pulseFreq = 4 + warnT * 12;
      const pulse = Math.abs(Math.sin(Date.now() * 0.001 * pulseFreq));
      meshRef.current.scale.setScalar(baseScale * (1 - warnT * 0.35));
      if (ringRef.current && ringMatRef.current) {
        ringRef.current.visible = true;
        const ringPulse = (Date.now() * 0.001 * pulseFreq) % (Math.PI * 2);
        ringRef.current.scale.setScalar(baseScale * (1 + Math.sin(ringPulse) * 0.6));
        ringMatRef.current.opacity = (1 - warnT * 0.5) * pulse;
      }
    } else {
      meshRef.current.scale.setScalar(baseScale);
      if (ringRef.current) ringRef.current.visible = false;
    }

    meshRef.current.position.y = orb.position.y + Math.sin(Date.now() * 0.002 + orb.id) * 0.1;
    meshRef.current.rotation.y += delta * 1.5;
  });

  return (
    <mesh ref={meshRef} position={orb.position.clone()} scale={0}>
      <sphereGeometry args={[POWERUP_RADIUS, 14, 14]} />
      <meshStandardMaterial color={orb.color} emissive={orb.emissive} emissiveIntensity={2} roughness={0.15} metalness={0.5} />
      <mesh scale={1.5}>
        <sphereGeometry args={[POWERUP_RADIUS, 8, 8]} />
        <meshStandardMaterial color={orb.color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[POWERUP_RADIUS * 1.4, POWERUP_RADIUS * 1.85, 24]} />
        <meshBasicMaterial ref={ringMatRef} color="#ffffff" transparent opacity={0.8} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </mesh>
  );
};

// ── Saturn rings — flat tilted discs that follow the ball ────────────────────

const BALL_SIZE = BASE_BALL_RADIUS * 0.08; // tiny dots on the rings

const SaturnRings = ({
  collected,
  ballRef,
  ballRadiusRef,
}: {
  collected: number;
  ballRef: React.RefObject<THREE.Mesh | null>;
  ballRadiusRef: React.MutableRefObject<number>;
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current || !ballRef.current) return;

    const ballPos = new THREE.Vector3();
    ballRef.current.getWorldPosition(ballPos);
    groupRef.current.position.set(ballPos.x, ballPos.y, ballPos.z);

    const s = ballRadiusRef.current / BASE_BALL_RADIUS;
    groupRef.current.scale.setScalar(s);

    const massRatio = ballRadiusRef.current / BASE_BALL_RADIUS;
    const speed = Math.min(RING_MAX_SPEED, RING_BASE_SPEED * Math.sqrt(Math.max(1, massRatio)));
    angleRef.current += Math.min(delta, 0.1) * speed;
    groupRef.current.rotation.y = angleRef.current;
  });

  const visibleBands = RING_BANDS.filter(b => collected >= b.unlockAt);

  return (
    <group ref={groupRef} rotation={[RING_TILT, 0, 0]}>
      {visibleBands.map((band, bi) => {
        const midR = BASE_BALL_RADIUS + (band.innerR + band.outerR) / 2;
        return (
          <group key={bi}>
            {/* Flat ring disc */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[BASE_BALL_RADIUS + band.innerR, BASE_BALL_RADIUS + band.outerR, 80]} />
              <meshBasicMaterial color={band.color} transparent opacity={band.opacity} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
            {/* Evenly-spaced balls riding the ring midline */}
            {Array.from({ length: band.ballCount }).map((_, bi2) => {
              const angle = (bi2 / band.ballCount) * Math.PI * 2;
              return (
                <mesh key={bi2} position={[Math.cos(angle) * midR, 0, Math.sin(angle) * midR]}>
                  <sphereGeometry args={[BALL_SIZE, 6, 6]} />
                  <meshStandardMaterial color={band.ballColor} emissive={band.ballColor} emissiveIntensity={2} roughness={0.1} metalness={0.5} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
};

// ── PowerUps container ────────────────────────────────────────────────────────

interface Props {
  ballRef: React.RefObject<THREE.Mesh | null>;
  ballRadiusRef: React.MutableRefObject<number>;
}

const PowerUps = ({ ballRef, ballRadiusRef }: Props) => {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [collected, setCollected] = useState(0);
  const orbsRef = useRef<Orb[]>([]);
  const countRef = useRef(0);
  const setScore = usePlayMode(s => s.setScore);
  const setMass = usePlayMode(s => s.setMass);
  const setSizePercent = usePlayMode(s => s.setSizePercent);

  useEffect(() => { orbsRef.current = orbs; }, [orbs]);

  useEffect(() => {
    const spawn = () => setOrbs(prev => {
      if (prev.length >= MAX_SPAWNED) return prev;
      const c = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
      return [...prev, { id: nextId++, position: randomPos(), ...c, spawnedAt: Date.now() }];
    });
    spawn();
    const iv = setInterval(spawn, SPAWN_INTERVAL);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(
      () => setOrbs(prev => prev.filter(o => Date.now() - o.spawnedAt < LIFETIME)),
      1000
    );
    return () => clearInterval(iv);
  }, []);

  useFrame(() => {
    if (!ballRef.current) return;
    const ballPos = new THREE.Vector3();
    ballRef.current.getWorldPosition(ballPos);
    const collectDist = ballRadiusRef.current + POWERUP_RADIUS * 1.2;

    const toCollect = orbsRef.current.filter(o => ballPos.distanceTo(o.position) < collectDist);
    if (toCollect.length === 0) return;

    const ids = new Set(toCollect.map(o => o.id));
    setOrbs(prev => prev.filter(o => !ids.has(o.id)));

    toCollect.forEach(() => {
      countRef.current += 1;
      const n = countRef.current;
      ballRadiusRef.current = Math.min(MAX_BALL_RADIUS, ballRadiusRef.current + GROW_PER_COLLECT);
      setCollected(n);

      const pct = Math.round(((ballRadiusRef.current - BASE_BALL_RADIUS) / (MAX_BALL_RADIUS - BASE_BALL_RADIUS)) * 100);
      setScore(n);
      setMass(parseFloat((ballRadiusRef.current / BASE_BALL_RADIUS).toFixed(2)));
      setSizePercent(pct);
    });
  });

  return (
    <>
      {orbs.map(orb => <RoamingOrb key={orb.id} orb={orb} />)}
      {collected > 0 && (
        <SaturnRings collected={collected} ballRef={ballRef} ballRadiusRef={ballRadiusRef} />
      )}
    </>
  );
};

export default PowerUps;
