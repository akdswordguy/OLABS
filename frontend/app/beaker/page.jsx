import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Beaker(props) {
    const beakerRef = useRef(null);

    useFrame(() => {
        if (beakerRef.current) {
            beakerRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group ref={beakerRef} {...props}>
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[1.2, 1.25, 2, 31, 16, true]} />
                <meshPhysicalMaterial
                    color="white"
                    roughness={0.1}
                    transmission={0.9}
                    thickness={0.1}
                    transparent
                    opacity={2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <mesh position={[0, -2, 0]}>
                <cylinderGeometry args={[1.25, 1.25, 0.8, 32]} />
                <meshPhysicalMaterial
                    color="white"
                    roughness={0.1}
                    transmission={0.9}
                    thickness={0.1}
                    transparent
                    opacity={0.7}
                />
            </mesh>
        </group>
    );
}