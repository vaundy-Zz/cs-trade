'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useAnalytics } from '../context/AnalyticsContext';

interface SkinViewer3DProps {
  imageUrl: string;
  skinName: string;
  skinId?: string;
}

const RotatingSkin: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.004;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow rotation={[0.1, 0, 0]}>
        <boxGeometry args={[4.5, 1.3, 0.35]} />
        <meshStandardMaterial map={texture} metalness={0.35} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
        <circleGeometry args={[3, 48]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
};

const FallbackImage: React.FC<{ imageUrl: string; skinName: string }> = ({ imageUrl, skinName }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <img
        src={imageUrl}
        alt={skinName}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
};

export const SkinViewer3D: React.FC<SkinViewer3DProps> = ({
  imageUrl,
  skinName,
  skinId,
}) => {
  const { track } = useAnalytics();
  const [use3D, setUse3D] = useState(false);

  if (!use3D) {
    return (
      <div className="relative w-full h-full min-h-[280px] md:min-h-[400px]">
        <FallbackImage imageUrl={imageUrl} skinName={skinName} />
        <button
          onClick={() => {
            setUse3D(true);
            if (skinId) {
              track({ skinId, action: 'view_3d_enabled' });
            }
          }}
          className="absolute bottom-4 right-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          View in 3D
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[280px] md:min-h-[400px] bg-gradient-to-br from-gray-900 to-gray-800">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        }
      >
        <Canvas shadows camera={{ position: [0, 1.6, 5], fov: 45 }}>
          <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 6, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-5, 6, -3]} intensity={0.6} />
          <RotatingSkin imageUrl={imageUrl} />
          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </Suspense>
      <button
        onClick={() => {
          setUse3D(false);
          if (skinId) {
            track({ skinId, action: 'view_3d_disabled' });
          }
        }}
        className="absolute bottom-4 right-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        View 2D
      </button>
    </div>
  );
};
