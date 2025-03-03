import { useEffect, useRef } from "react";
import * as THREE from "three";

export const FlameTest = ({ element }) => {
    const flameRef = useRef();

    useEffect(() => {
        if (flameRef.current) {
            let color;
            switch (element) {
                case "Na":
                    color = "#FFD700";
                    break;
                default:
                    color = "#FFFFFF";
            }
            flameRef.current.material.color.set(color);
        }
    }, [element]);

    return (
        <mesh ref={flameRef} position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#FFFFFF" />
        </mesh>
    );
};