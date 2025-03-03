import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Liquid({ color }) {
    const liquidRef = useRef();

    useFrame(() => {
        if (liquidRef.current) {
            liquidRef.current.rotation.y += 0.001;
        }
    });

    return (
        <mesh ref={liquidRef} position={[0, -1.2, 0]}>
            <cylinderGeometry args={[1, 1, 1.5, 32]} />
            <meshPhysicalMaterial
                color={color}
                roughness={0.2}
                transmission={0.5}
                opacity={0.8}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
