import { useRef } from "react";
import * as THREE from "three";

export function PetriDish({ element, color, ...props }) {
    const dishRef = useRef();

    return (
        <group ref={dishRef} {...props}>
            {/* Base of the Petri Dish */}
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} /> {/* Flat cylinder */}
                <meshPhysicalMaterial
                    color="lightgray"
                    roughness={0.2}
                    metalness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Lid of the Petri Dish */}
            <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[1.4, 1.4, 0.2, 32]} /> {/* Slightly smaller */}
                <meshPhysicalMaterial
                    color="lightgray"
                    roughness={0.2}
                    metalness={0.1}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Border for the Petri Dish */}
            <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[1.55, 1.55, 0.05, 32]} /> {/* Slightly larger */}
                <meshBasicMaterial
                    color="black"
                    transparent
                    opacity={0.5}
                />
            </mesh>

            {/* Circle representing the dropped element */}
            {element && (
                <mesh position={[0, 0.6, 0]}>
                    <circleGeometry args={[0.3, 32]} />
                    <meshBasicMaterial color={color} />
                </mesh>
            )}
        </group>
    );
}