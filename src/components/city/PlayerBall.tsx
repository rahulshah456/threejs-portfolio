import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail, useTexture } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { usePlayMode } from '../../store/playModeStore';

/* ---------- Tuning ---------- */
const SPEED = 6;
const SPEED_RUN = 14;
const JUMP_IMPULSE = 10;
const STEER_SPEED = 2.5;
const CAM_DISTANCE = 9;
const CAM_HEIGHT = 2;
const CAM_LOOK_HEIGHT = 1;
const MOUSE_SENSITIVITY_X = 0.003;
const MOUSE_SENSITIVITY_Y = 0.002;
const VERTICAL_CLAMP_MIN = -0.3;
const VERTICAL_CLAMP_MAX = 1.2;
const TRANSITION_BACK_SPEED = 1;

interface CameraRotation {
  horizontal: number;
  vertical: number;
}

const BASE_RADIUS = 0.075;

interface PlayerBallProps {
  meshRef: React.RefObject<THREE.Mesh | null>;
  ballRadiusRef: React.MutableRefObject<number>;
  ballPosRef: React.MutableRefObject<THREE.Vector3>;
}

const PlayerBall = ({ meshRef, ballRadiusRef, ballPosRef }: PlayerBallProps) => {
  const rb = useRef<RapierRigidBody>(null!);
  const { camera } = useThree();
  const [diffuse, normal, rough] = useTexture([
    '/assets/textures/coral_ground_02_diff_1k.jpg',
    '/assets/textures/coral_ground_02_nor_gl_1k.jpg',
    '/assets/textures/coral_ground_02_rough_1k.jpg',
  ]);
  const keys = useRef({ w: false, a: false, s: false, d: false, shift: false });
  const jumpsLeft = useRef(2);
  const togglePlay = usePlayMode(s => s.togglePlay);

  /* Camera state */
  const cameraRotation = useRef<CameraRotation>({ horizontal: 0, vertical: -0.1 });
  const isMouseActive = useRef(false);
  const isTransitioningBack = useRef(false);
  const currentCamPos = useRef(new THREE.Vector3(0, 2, 6));
  const currentLookAt = useRef(new THREE.Vector3());
  const facingAngle = useRef(0);

  const isMoving = useCallback(() => {
    return keys.current.w || keys.current.s;
  }, []);

  /* ---------- Mouse handlers ---------- */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isMouseActive.current) return;
    const rot = cameraRotation.current;
    rot.horizontal -= (e.movementX || 0) * MOUSE_SENSITIVITY_X;
    rot.vertical -= (e.movementY || 0) * MOUSE_SENSITIVITY_Y;
    rot.vertical = THREE.MathUtils.clamp(rot.vertical, VERTICAL_CLAMP_MIN, VERTICAL_CLAMP_MAX);
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      isMouseActive.current = true;
      isTransitioningBack.current = false;
      document.body.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      isMouseActive.current = false;
      isTransitioningBack.current = true;
      document.body.style.cursor = 'default';
    }
  }, []);

  /* ---------- Keyboard ---------- */
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePlay();
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        const body = rb.current;
        if (body && jumpsLeft.current > 0) {
          jumpsLeft.current -= 1;
          const vel = body.linvel();
          body.setLinvel({ x: vel.x, y: JUMP_IMPULSE, z: vel.z }, true);
          body.wakeUp();
        }
        return;
      }
      if (e.key === 'Shift') {
        keys.current.shift = true;
        return;
      }
      const k = e.key.toLowerCase() as keyof typeof keys.current;
      if (k in keys.current) keys.current[k] = true;
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        keys.current.shift = false;
        return;
      }
      const k = e.key.toLowerCase() as keyof typeof keys.current;
      if (k in keys.current) keys.current[k] = false;
    };

    const blockSpace = (e: KeyboardEvent) => {
      if (e.key === ' ') e.preventDefault();
    };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    document.addEventListener('keydown', blockSpace, true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      document.removeEventListener('keydown', blockSpace, true);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [togglePlay, handleMouseMove, handleMouseDown, handleMouseUp]);

  /* ---------- Frame loop ---------- */
  useFrame((_state, delta) => {
    // Scale mesh; rotation comes naturally from Rapier's angular velocity (angularDamping=50 keeps it controlled)
    if (meshRef.current) {
      const s = ballRadiusRef.current / BASE_RADIUS;
      meshRef.current.scale.setScalar(s);
    }

    const body = rb.current;
    if (!body) return;

    if (keys.current.a) facingAngle.current += STEER_SPEED * delta;
    if (keys.current.d) facingAngle.current -= STEER_SPEED * delta;

    const vel = body.linvel();
    const pos = body.translation();
    ballPosRef.current.set(pos.x, pos.y, pos.z);
    // Reset double jump when near ground and falling/landed
    if (pos.y < 0.3 && vel.y <= 0.1) jumpsLeft.current = 2;
    if (keys.current.w || keys.current.s) {
      const spd = keys.current.shift ? SPEED_RUN : SPEED;
      const dir = keys.current.s ? -1 : 1;
      const vx = Math.sin(facingAngle.current) * spd * dir;
      const vz = Math.cos(facingAngle.current) * spd * dir;
      body.setLinvel({ x: vx, y: vel.y, z: vz }, true);
    } else {
      body.setLinvel({ x: vel.x * 0.9, y: vel.y, z: vel.z * 0.9 }, true);
    }

    const ballPos = new THREE.Vector3(pos.x, pos.y, pos.z);

    if (!keys.current.a && !keys.current.d) {
      const horizVel = new THREE.Vector2(vel.x, vel.z);
      if (horizVel.lengthSq() > 0.05) {
        const targetAngle = Math.atan2(vel.x, vel.z);
        let diff = targetAngle - facingAngle.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        facingAngle.current += diff * 0.05;
      }
    }

    const moving = isMoving();
    let orbitH: number;
    let orbitV: number;

    if (isMouseActive.current) {
      orbitH = cameraRotation.current.horizontal;
      orbitV = cameraRotation.current.vertical;
    } else if (moving) {
      cameraRotation.current.horizontal = facingAngle.current + Math.PI;
      cameraRotation.current.vertical = -0.1;
      orbitH = facingAngle.current + Math.PI;
      orbitV = -0.1;
    } else {
      if (isTransitioningBack.current) {
        const targetH = facingAngle.current + Math.PI;
        let diffH = targetH - cameraRotation.current.horizontal;
        while (diffH > Math.PI) diffH -= Math.PI * 2;
        while (diffH < -Math.PI) diffH += Math.PI * 2;

        const step = TRANSITION_BACK_SPEED * delta;
        cameraRotation.current.horizontal += diffH * step;
        cameraRotation.current.vertical += (-0.1 - cameraRotation.current.vertical) * step;

        if (Math.abs(diffH) < 0.01 && Math.abs(cameraRotation.current.vertical - -0.1) < 0.01) {
          isTransitioningBack.current = false;
        }
      }
      orbitH = cameraRotation.current.horizontal;
      orbitV = cameraRotation.current.vertical;
    }

    const offsetX = Math.sin(orbitH) * CAM_DISTANCE * Math.cos(orbitV);
    const offsetZ = Math.cos(orbitH) * CAM_DISTANCE * Math.cos(orbitV);
    const offsetY = CAM_HEIGHT + Math.sin(orbitV) * CAM_DISTANCE * 0.5;

    const idealCam = new THREE.Vector3(
      ballPos.x + offsetX,
      ballPos.y + offsetY,
      ballPos.z + offsetZ
    );

    const idealLook = new THREE.Vector3(ballPos.x, ballPos.y + CAM_LOOK_HEIGHT, ballPos.z);

    const t = 1.0 - Math.pow(0.001, delta);
    currentCamPos.current.lerp(idealCam, t);
    currentLookAt.current.lerp(idealLook, t);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
    camera.updateProjectionMatrix();
  });

  return (
    <RigidBody ref={rb} position={[0, 2, 0]} colliders="ball" linearDamping={3} angularDamping={50}>
      <Trail width={0.8} length={20} color={new THREE.Color('#ff3300')} attenuation={t => t * t}>
        <mesh ref={meshRef} castShadow>
          <sphereGeometry args={[BASE_RADIUS, 32, 32]} />
          <meshStandardMaterial
            map={diffuse}
            normalMap={normal}
            roughnessMap={rough}
            emissive="#ff2200"
            emissiveIntensity={0.25}
            roughness={1}
            metalness={0}
          />
        </mesh>
      </Trail>
    </RigidBody>
  );
};

export default PlayerBall;
