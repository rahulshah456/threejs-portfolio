import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../custom-hooks/useTheme';
import { usePlayMode } from '../../store/playModeStore';
import { useProjectStore } from '../../store/projectStore';
import { buildings } from './cityData';
import ProjectTile from './ProjectTile';

/* ------------------ Utils ------------------ */

const mathRandom = (num = 8) => -Math.random() * num + Math.random() * num;

/* ------------------ Theme Palette ------------------ */

const DARK = {
  building: 0x000000,
  buildingRoughness: 1,
  buildingMetalness: 0.2,
  wire: 0xffffff,
  wireOpacity: 0.1,
  ground: 0x000000,
  groundShininess: 10,
  groundSpecular: 0x111111,
  gridLines: 0x44444e,
  gridCenter: 0xff0000,
  smokeParticles: 0xffff00,
  cars: 0xffff00,
} as const;

const LIGHT = {
  building: 0xf9f8f6,
  buildingRoughness: 0.45,
  buildingMetalness: 0.2,
  wire: 0xb17f59,
  wireOpacity: 0.22,
  ground: 0xd9c4b0,
  groundShininess: 120,
  groundSpecular: 0xc8bfb0,
  gridLines: 0xcfab8d,
  gridCenter: 0xffff00,
  smokeParticles: 0xff0000,
  cars: 0xff0000,
} as const;

const City = () => {
  const cityRef = useRef<THREE.Group>(null!);
  const townRef = useRef<THREE.Group>(null!);
  const smokeRef = useRef<THREE.Group>(null!);
  const groundRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const cityGroupRef = useRef<THREE.Group | null>(null);
  const smokeMatRef = useRef<THREE.MeshToonMaterial | null>(null);
  const carMatRef = useRef<THREE.MeshToonMaterial | null>(null);

  const { camera } = useThree();
  const { isDark } = useTheme();
  const isPlaying = usePlayMode(s => s.isPlaying);
  const cityOpacity = usePlayMode(s => s.cityOpacity);
  const projects = useProjectStore(s => s.projects);

  const prevCityOpacity = useRef(1);

  const uSpeed = 0.0004;
  const mouse = useRef(new THREE.Vector2());
  const isDragging = useRef(false);
  const lastDrag = useRef(new THREE.Vector2());
  const dragRotation = useRef(new THREE.Euler());

  /* ------------------ Init City ------------------ */
  useEffect(() => {
    let createCarPos = true;
    const town = townRef.current;
    const smoke = smokeRef.current;
    const city = cityRef.current;

    /* Buildings */
    buildings.forEach(b => {
      const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);

      const material = new THREE.MeshStandardMaterial({
        color: DARK.building,
        side: THREE.DoubleSide,
        roughness: DARK.buildingRoughness,
        metalness: DARK.buildingMetalness,
      });

      const wireMat = new THREE.MeshLambertMaterial({
        color: DARK.wire,
        wireframe: true,
        transparent: true,
        opacity: DARK.wireOpacity,
      });

      const cube = new THREE.Mesh(geometry, material);
      const wire = new THREE.Mesh(geometry, wireMat);

      cube.add(wire);

      cube.scale.y = b.scaleY;
      cube.scale.x = cube.scale.z = b.scaleXZ;

      cube.position.x = b.posX;
      cube.position.z = b.posZ;
      cube.castShadow = true;
      cube.receiveShadow = true;

      town.add(cube);
    });

    /* Smoke particles */
    const pGeo = new THREE.CircleGeometry(0.01, 3);
    const pMat = new THREE.MeshToonMaterial({ color: DARK.smokeParticles });
    smokeMatRef.current = pMat;

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
        color: DARK.ground,
        opacity: 0.9,
        transparent: true,
        shininess: DARK.groundShininess,
        specular: new THREE.Color(DARK.groundSpecular),
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.001;
    ground.receiveShadow = true;
    groundRef.current = ground;
    city.add(ground);

    /* Grid */
    const grid = new THREE.GridHelper(60, 120, DARK.gridCenter, DARK.gridLines);
    gridRef.current = grid;
    cityGroupRef.current = city;
    city.add(grid);

    /* Cars */
    const carMat = new THREE.MeshToonMaterial({ color: DARK.cars });
    carMatRef.current = carMat;
    const createCars = (scale = 0.1, pos = 20) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, scale / 40, scale / 40), carMat);

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
        dragRotation.current.y += dx * 0.002;
        dragRotation.current.x += dy * 0.002;
        dragRotation.current.x = THREE.MathUtils.clamp(dragRotation.current.x, -0.05, 1);
        lastDrag.current.set(e.clientX, e.clientY);
      }
    };

    const onDown = (e: MouseEvent) => {
      if (!cityRef.current?.visible) return;
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

  /* ------------------ Theme ------------------ */
  useEffect(() => {
    const town = townRef.current;
    if (!town) return;

    const palette = isDark ? DARK : LIGHT;

    const buildingColor = palette.building;
    const wireColor = palette.wire;
    const groundColor = palette.ground;

    town.children.forEach(child => {
      const cube = child as THREE.Mesh;
      const mat = cube.material as THREE.MeshStandardMaterial;
      mat.color.setHex(buildingColor);
      mat.roughness = palette.buildingRoughness;
      mat.metalness = palette.buildingMetalness;
      const wire = cube.children[0] as THREE.Mesh;
      if (wire) {
        const wMat = wire.material as THREE.MeshLambertMaterial;
        wMat.color.setHex(wireColor);
        wMat.opacity = palette.wireOpacity;
      }
    });

    if (groundRef.current) {
      const mat = groundRef.current.material as THREE.MeshPhongMaterial;
      mat.color.setHex(groundColor);
      mat.shininess = palette.groundShininess;
      mat.specular.setHex(palette.groundSpecular);
    }

    if (gridRef.current && cityGroupRef.current) {
      cityGroupRef.current.remove(gridRef.current);
      gridRef.current.geometry.dispose();
      const newGrid = new THREE.GridHelper(60, 120, palette.gridCenter, palette.gridLines);
      gridRef.current = newGrid;
      cityGroupRef.current.add(newGrid);
    }

    if (smokeMatRef.current) {
      smokeMatRef.current.color.setHex(palette.smokeParticles);
    }

    if (carMatRef.current) {
      carMatRef.current.color.setHex(palette.cars);
    }
  }, [isDark]);

  /* ------------------ Play Mode ------------------ */
  useEffect(() => {
    const city = cityRef.current;
    if (isPlaying) {
      gsap.to(city.rotation, { x: 0, y: 0, z: 0, duration: 0.5 });
    } else {
      camera.position.set(0, 2, 14);
      camera.lookAt(city.position);
    }
  }, [isPlaying, camera]);

  /* ------------------ Animate ------------------ */
  useFrame(() => {
    const city = cityRef.current;
    const smoke = smokeRef.current;

    if (!isPlaying) {
      if (city.visible) {
        if (isDragging.current) {
          city.rotation.x = dragRotation.current.x;
          city.rotation.y = dragRotation.current.y;
        } else {
          city.rotation.y -= (mouse.current.x * 8 - camera.rotation.y) * uSpeed;
          city.rotation.x -= (-(mouse.current.y * 2) - camera.rotation.x) * uSpeed;
          city.rotation.x = THREE.MathUtils.clamp(city.rotation.x, -0.05, 1);
        }
      }
      camera.lookAt(city.position);
    }

    // Hide city entirely once fully consumed by fog
    if (Math.abs(cityOpacity - prevCityOpacity.current) > 0.001) {
      prevCityOpacity.current = cityOpacity;
      city.visible = cityOpacity > 0.01;
    }

    smoke.rotation.x += 0.01;
    smoke.rotation.y += 0.01;
  });

  return (
    <group ref={cityRef}>
      <group ref={townRef} />
      <group ref={smokeRef} />
      <group visible={isPlaying}>
        {projects.map((project, i) => (
          <ProjectTile
            key={project.id}
            project={project}
            angle={(i / projects.length) * Math.PI * 2}
          />
        ))}
      </group>
    </group>
  );
};

export default City;
