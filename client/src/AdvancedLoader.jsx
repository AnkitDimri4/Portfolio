import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
// import { Physics } from '@react-three/cannon';

function Globe() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial attach="material" color="blue" />
    </mesh>
  );
}

function AdvancedLoader() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5] }}
      style={{ background: 'black' }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <Suspense fallback={null}>
        <Globe />
      </Suspense>
      <OrbitControls />
      <Stars />
    </Canvas>
  );
}

export default AdvancedLoader;
