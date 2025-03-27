'use client'

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Asteroid from './asteroid';

export default function SpaceScene() {
    return (
        <Canvas camera={{ position: [0, 0, 5] }} className="absolute inset-0 z-0">
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
                <Asteroid position={[2, 1, -1]} rotation={{ x: Math.random() * 2, y: Math.random() * 2 }} />
                <Asteroid position={[-2, -1, -2]} rotation={{ x: Math.random() * 2, y: Math.random() * 2 }} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Suspense>
        </Canvas>
    );
}