'use client'

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

export default function SpaceScene() {
    return (
        <Canvas camera={{ position: [0, 0, 5] }}
            className="absolute inset-0 z-0"
            style={{ width: '100%', height: '100%' }}
        >
            <color attach="background" args={['#000']} />
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                />
                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
            </Suspense>
        </Canvas>
    );
}