import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { usePlayMode } from '../../store/playModeStore';

/* ---------- Tuning ---------- */
const SPEED = 3;
const SPEED_RUN = 7;
const JUMP_IMPULSE = 5;
const STEER_SPEED = 2.5;
const CAM_DISTANCE = 9;
const CAM_HEIGHT = 3.8;
const CAM_LOOK_HEIGHT = 1.5;
const MOUSE_SENSITIVITY_X = 0.003;
const MOUSE_SENSITIVITY_Y = 0.002;
const VERTICAL_CLAMP_MIN = -0.3;
const VERTICAL_CLAMP_MAX = 1.2;
const TRANSITION_BACK_SPEED = 1;

interface CameraRotation {
  horizontal: number;
  vertical: number;
}

const PlayerBall = () => {
  const rb = useRef<RapierRigidBody>(null!);
  const { camera } = useThree();
  const keys = useRef({ w: false, a: false, d: false, shift: false });
  const canJump = useRef(true);
  const togglePlay = usePlayMode(s => s.togglePlay);

  /* Camera state */
  const cameraRotation = useRef<CameraRotation>({ horizontal: 0, vertical: -0.1 });
  const isMouseActive = useRef(false);
  const isTransitioningBack = useRef(false);
  const currentCamPos = useRef(new THREE.Vector3(0, 2, 6));
  const currentLookAt = useRef(new THREE.Vector3());
  const facingAngle = useRef(0);

  const isMoving = useCallback(() => {
    return keys.current.w;
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
        if (body && canJump.current) {
          canJump.current = false;
          const vel = body.linvel();
          body.setLinvel({ x: vel.x, y: JUMP_IMPULSE, z: vel.z }, true);
          body.wakeUp();
          setTimeout(() => {
            canJump.current = true;
          }, 600);
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
    const body = rb.current;
    if (!body) return;

    /* Steering: A/D rotate facing angle, W drives forward */
    if (keys.current.a) facingAngle.current += STEER_SPEED * delta;
    if (keys.current.d) facingAngle.current -= STEER_SPEED * delta;

    const vel = body.linvel();
    if (keys.current.w) {
      const spd = keys.current.shift ? SPEED_RUN : SPEED;
      const vx = Math.sin(facingAngle.current) * spd;
      const vz = Math.cos(facingAngle.current) * spd;
      body.setLinvel({ x: vx, y: vel.y, z: vz }, true);
    } else {
      body.setLinvel({ x: vel.x * 0.9, y: vel.y, z: vel.z * 0.9 }, true);
    }

    /* Ball position */
    const pos = body.translation();
    const ballPos = new THREE.Vector3(pos.x, pos.y, pos.z);

    /* Track facing angle from velocity (only when no steering input) */
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

    /* Determine orbit angle */
    const moving = isMoving();
    let orbitH: number;
    let orbitV: number;

    if (isMouseActive.current) {
      // Mouse orbit mode: use mouse-set rotation
      orbitH = cameraRotation.current.horizontal;
      orbitV = cameraRotation.current.vertical;
    } else if (moving) {
      // Moving: camera behind ball facing direction
      // Reset mouse rotation toward facing direction
      cameraRotation.current.horizontal = facingAngle.current + Math.PI;
      cameraRotation.current.vertical = -0.1;
      orbitH = facingAngle.current + Math.PI;
      orbitV = -0.1;
    } else {
      // Idle + mouse released: transition back to behind-ball
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

    /* Calculate camera position from orbit angles */
    const offsetX = Math.sin(orbitH) * CAM_DISTANCE * Math.cos(orbitV);
    const offsetZ = Math.cos(orbitH) * CAM_DISTANCE * Math.cos(orbitV);
    const offsetY = CAM_HEIGHT + Math.sin(orbitV) * CAM_DISTANCE * 0.5;

    const idealCam = new THREE.Vector3(
      ballPos.x + offsetX,
      ballPos.y + offsetY,
      ballPos.z + offsetZ
    );

    const idealLook = new THREE.Vector3(ballPos.x, ballPos.y + CAM_LOOK_HEIGHT, ballPos.z);

    /* Smooth interpolation (same formula as reference) */
    const t = 1.0 - Math.pow(0.001, delta);
    currentCamPos.current.lerp(idealCam, t);
    currentLookAt.current.lerp(idealLook, t);

    camera.position.copy(currentCamPos.current);
    camera.lookAt(currentLookAt.current);
    camera.updateProjectionMatrix();
  });

  return (
    <RigidBody ref={rb} position={[0, 2, 0]} colliders="ball" linearDamping={3} angularDamping={2}>
      <Trail width={0.4} length={20} color={new THREE.Color('#ff3300')} attenuation={t => t * t}>
        <mesh castShadow renderOrder={999}>
          <sphereGeometry args={[0.0375, 16, 16]} />
          <meshStandardMaterial
            color="#ff2200"
            emissive="#ff4400"
            emissiveIntensity={1.2}
            depthTest={false}
            transparent
            opacity={1}
          />
        </mesh>
      </Trail>
    </RigidBody>
  );
};

export default PlayerBall;
