'use client'

import { useRef } from "react";
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface AsteroidProps {
    position: [number, number, number];
    rotation: { x: number; y: number };
}

export default function Asteroid({ position, rotation }: AsteroidProps) {
    const meshRef = useRef<Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = rotation.x + clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = rotation.y + clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <mesh position={position} ref={meshRef}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshStandardMaterial color="#8B8C89" roughness={0.7} metalness={0.3} />
        </mesh>
    );
}