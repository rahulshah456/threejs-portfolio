import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/* ------------------ Utils ------------------ */

const mathRandom = (num = 8) => -Math.random() * num + Math.random() * num;

let tintToggle = true;
const setTintColor = () => {
  tintToggle = !tintToggle;
  return 0x000000;
};

const City = () => {
  const cityRef = useRef<THREE.Group>(null!);
  const townRef = useRef<THREE.Group>(null!);
  const smokeRef = useRef<THREE.Group>(null!);

  const mouse = useRef(new THREE.Vector2());
  const { camera } = useThree();

  const uSpeed = 0.001;
  let createCarPos = true;

  const isDragging = useRef(false);
  const lastDrag = useRef(new THREE.Vector2());
  const dragRotation = useRef(new THREE.Euler());

  /* ------------------ Init City ------------------ */
  useEffect(() => {
    const town = townRef.current;
    const smoke = smokeRef.current;
    const city = cityRef.current;

    /* Buildings */
    for (let i = 1; i < 100; i++) {
      const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);

      const material = new THREE.MeshStandardMaterial({
        color: setTintColor(),
        side: THREE.DoubleSide,
      });

      const wireMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.03,
      });

      const cube = new THREE.Mesh(geometry, material);
      const wire = new THREE.Mesh(geometry, wireMat);

      cube.add(wire);

      cube.scale.y = 0.1 + Math.abs(mathRandom(8));
      cube.scale.x = cube.scale.z = 0.9 + mathRandom(0.1);

      cube.position.x = Math.round(mathRandom());
      cube.position.z = Math.round(mathRandom());
      cube.castShadow = true;
      cube.receiveShadow = true;

      town.add(cube);
    }

    /* Smoke particles */
    const pGeo = new THREE.CircleGeometry(0.01, 3);
    const pMat = new THREE.MeshToonMaterial({ color: 0xffff00 });

    for (let i = 0; i < 300; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      p.position.set(mathRandom(5), mathRandom(5), mathRandom(5));
      p.rotation.set(mathRandom(), mathRandom(), mathRandom());
      smoke.add(p);
    }

    smoke.position.y = 2;

    /* Ground */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshPhongMaterial({
        color: 0x000000,
        opacity: 0.9,
        transparent: true,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    city.add(ground);

    /* Grid */
    city.add(new THREE.GridHelper(60, 120, 0xff0000, 0x000000));

    /* Cars */
    const createCars = (scale = 0.1, pos = 20, color = 0xffff00) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, scale / 40, scale / 40),
        new THREE.MeshToonMaterial({ color })
      );

      if (createCarPos) {
        createCarPos = false;
        mesh.position.set(-pos, 0, mathRandom(3));
        gsap.to(mesh.position, {
          x: pos,
          repeat: -1,
          yoyo: true,
          duration: 3,
          delay: mathRandom(3),
        });
      } else {
        createCarPos = true;
        mesh.position.set(mathRandom(3), 0, -pos);
        mesh.rotation.y = Math.PI / 2;
        gsap.to(mesh.position, {
          z: pos,
          repeat: -1,
          yoyo: true,
          duration: 5,
          delay: mathRandom(3),
        });
      }

      mesh.position.y = Math.abs(mathRandom(5));
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      city.add(mesh);
    };

    for (let i = 0; i < 60; i++) createCars();
  }, []);

  /* ------------------ Mouse ------------------ */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (isDragging.current) {
        const dx = e.clientX - lastDrag.current.x;
        const dy = e.clientY - lastDrag.current.y;
        dragRotation.current.y += dx * 0.005;
        dragRotation.current.x += dy * 0.005;
        dragRotation.current.x = THREE.MathUtils.clamp(dragRotation.current.x, -0.05, 1);
        lastDrag.current.set(e.clientX, e.clientY);
      }
    };

    const onDown = (e: MouseEvent) => {
      isDragging.current = true;
      lastDrag.current.set(e.clientX, e.clientY);
      const city = cityRef.current;
      dragRotation.current.set(city.rotation.x, city.rotation.y, city.rotation.z);
    };

    const onUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  /* ------------------ Animate ------------------ */
  useFrame(() => {
    const city = cityRef.current;
    const smoke = smokeRef.current;

    if (isDragging.current) {
      city.rotation.x = dragRotation.current.x;
      city.rotation.y = dragRotation.current.y;
    } else {
      city.rotation.y -= (mouse.current.x * 8 - camera.rotation.y) * uSpeed;
      city.rotation.x -= (-(mouse.current.y * 2) - camera.rotation.x) * uSpeed;
      city.rotation.x = THREE.MathUtils.clamp(city.rotation.x, -0.05, 1);
    }

    smoke.rotation.x += 0.01;
    smoke.rotation.y += 0.01;

    camera.lookAt(city.position);
  });

  return (
    <group ref={cityRef}>
      <group ref={townRef} />
      <group ref={smokeRef} />
    </group>
  );
};

export default City;
