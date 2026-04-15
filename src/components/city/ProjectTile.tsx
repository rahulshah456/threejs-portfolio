import { useState, useEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { ProjectWithPages } from '../../utils/interfaces';

const RADIUS = 13;
const DARKEN = new THREE.Color(0.45, 0.45, 0.45);

interface Props {
  project: ProjectWithPages;
  angle: number;
}

const ProjectTile = ({ project, angle }: Props) => {
  const x = Math.sin(angle) * RADIUS;
  const z = Math.cos(angle) * RADIUS;
  const page = project.pages?.[0];
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!page?.media_path) return;

    if (page.media_type === 'video') {
      const video = document.createElement('video');
      video.src = page.media_path;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = 'anonymous';
      videoRef.current = video;
      void video.play().catch(() => {});
      setTex(new THREE.VideoTexture(video));
    } else {
      setTex(new THREE.TextureLoader().load(page.media_path));
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [page?.media_path]);

  if (!page) return null;

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      {/* Vertical card — bottom sits on plinth top (y=0.1 + half height 0.9 = 1.0) */}
      <mesh position={[0, 1.0, 0]}>
        <planeGeometry args={[3.2, 1.8]} />
        {tex && <meshBasicMaterial map={tex} color={DARKEN} side={THREE.DoubleSide} />}
      </mesh>

      {/* Big project name — flat on floor, inward from card */}
      <Text
        fontSize={0.5}
        position={[0, 0.01, 1.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="center"
        anchorY="middle"
        color="white"
        letterSpacing={0.05}
      >
        {project.name}
      </Text>

      {/* Page header — flat on floor, further inward */}
      <Text
        fontSize={0.15}
        position={[0, 0.01, 2.0]}
        rotation={[-Math.PI / 2, 0, 0]}
        anchorX="center"
        anchorY="middle"
        color="#bbbbbb"
        maxWidth={4}
      >
        {page.header}
      </Text>
    </group>
  );
};

export default ProjectTile;
