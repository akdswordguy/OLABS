"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState, useRef } from "react";
import { Beaker } from "../beaker/page";
import { Liquid } from "../liquid/page";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import useSound from "use-sound";
import { motion, AnimatePresence } from "framer-motion";
import { PetriDish } from "../petridish/page";
import Vapors from "../components/Vapors";
import "./page.css";

const ItemTypes = {
    ELEMENT: "element",
    ACID: "acid"
};

const Element = ({ name, color, draggable = false }) => {
    const dragRef = useRef(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ELEMENT,
        item: { name },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [draggable]);

    if (draggable) {
        drag(dragRef);
    }

    return (
        <div
            ref={draggable ? dragRef : null}
            className={`element ${isDragging ? "dragging" : ""}`}
            style={{ backgroundColor: color }}
        >
            {name}
        </div>
    );
};

const AcidBeaker = ({ acid, draggable = false }) => {
    const dragRef = useRef(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.ACID,
        item: { name: acid.name, color: acid.color },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [draggable, acid]);

    if (draggable) {
        drag(dragRef);
    }

    return (
        <div
            ref={draggable ? dragRef : null}
            className={`acid-item ${draggable ? "cursor-grab" : ""} ${isDragging ? "dragging" : ""}`}
        >
            <div className="acid-name">{acid.name}</div>
            <div className="acid-beaker">
                <Canvas className="w-full h-full">
                    <ambientLight intensity={0.5} />
                    <Beaker />
                    <Liquid color={acid.color} />
                </Canvas>
            </div>
        </div>
    );
};

const elements = [
    { name: "H", color: "#ff6666" },
    { name: "He", color: "#ffcc66" },
    { name: "Li", color: "#ff99cc" },
    { name: "Be", color: "#ffcc99" },
    { name: "B", color: "#99ccff" },
    { name: "C", color: "#66cc99" },
    { name: "N", color: "#6699cc" },
    { name: "O", color: "#ff9966" },
    { name: "F", color: "#cccc99" },
    { name: "Ne", color: "#cc99ff" },
    { name: "Na", color: "#FFD700", draggable: true },
    { name: "Mg", color: "#ffcc99", draggable: true },
    { name: "Al", color: "#66ccff" },
    { name: "Si", color: "#ff9966" },
    { name: "P", color: "#ffcc99" },
    { name: "S", color: "#ffcc66" },
    { name: "Cl", color: "#6699cc" },
    { name: "Ar", color: "#cc99ff" },
];

const acids = [
    { name: "HCl", color: "#FFFFFF" },
    { name: "H2SO4", color: "#FFFFFF" },
    { name: "HNO3", color: "#FFFF00" },
];

function VirtualLabComponent() {
    const [liquidColor, setLiquidColor] = useState("");
    const [reactionMessage, setReactionMessage] = useState("");
    const [addedElements, setAddedElements] = useState([]);
    const [shaking, setShaking] = useState(false);
    const [vaporsVisible, setVaporsVisible] = useState(false);
    const [playBoom] = useSound("/sounds/boom.mp3", { volume: 1.0 });
    const [playFireSound] = useSound("/sounds/fire.mp3", { volume: 1.0 });
    const [petriElement, setPetriElement] = useState(null);
    const [petriElementColor, setPetriElementColor] = useState("yellow");
    const [beakerElements, setBeakerElements] = useState([]);
    const [showVapors, setShowVapors] = useState(false);

    const resetLab = () => {
        setLiquidColor("");
        setReactionMessage("");
        setAddedElements([]);
        setShaking(false);
        setVaporsVisible(false);
        setPetriElement(null);
        setPetriElementColor("yellow");
        setBeakerElements([]);
        setShowVapors(false);
    };

    const [{ isOver: isOverPetriDish }, dropPetriDish] = useDrop(() => ({
        accept: [ItemTypes.ELEMENT],
        drop: (item) => {
            console.log("Item dropped on Petri dish:", item);
            handlePetriDishDrop(item);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [{ isOver: isOverBeaker }, dropBeaker] = useDrop(() => ({
        accept: [ItemTypes.ELEMENT, ItemTypes.ACID],
        drop: (item) => {
            console.log("Item dropped on Beaker:", item);
            handleBeakerDrop(item);
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const handlePetriDishDrop = (item) => {
        if (item.name === "Na") {
            alert("Na was successfully dropped onto the Petri dish");
            setPetriElement(item.name);
            setPetriElementColor("yellow");
        } else {
            setPetriElement(null);
        }
    };

    const handleBeakerDrop = (item) => {
        setBeakerElements((prev) => {
            if (!prev.includes(item.name)) {
                const newElements = [...prev, item.name];


                if (item.name === "Na") {
                    setLiquidColor("#FFFFFF");
                }
                if (item.name === "HCl") {
                    setLiquidColor("#FFFFFF");
                }
                if (item.name === "H2SO4") {
                    setLiquidColor("#FFFFFF");
                }
                if (item.name === "HNO3") {
                    setLiquidColor("#FFFF00");
                }
                if (item.name === "Mg") {
                    setLiquidColor("#FFFFFF");
                }


                if (newElements.includes("Na") && newElements.includes("HCl")) {
                    setTimeout(() => {
                        setShaking(true);
                        playBoom();
                        setReactionMessage("2Na + 2HCl → 2NaCl + H₂↑");
                        setVaporsVisible(true);
                        setLiquidColor("#FFFFFF");

                        let flashCount = 0;
                        const flashInterval = setInterval(() => {
                            setLiquidColor((prev) => (prev === "#FFFFFF" ? "#FF0000" : "#FFFFFF"));
                            flashCount++;
                            if (flashCount > 5) {
                                clearInterval(flashInterval);
                                setShaking(false);
                            }
                        }, 200);

                        setTimeout(() => {
                            setVaporsVisible(false);
                            setReactionMessage("");
                        }, 5000);
                    }, 1000);
                }

                if (newElements.includes("Na") && newElements.includes("H2SO4")) {
                    setTimeout(() => {
                        setShaking(true);
                        playBoom();
                        setReactionMessage("2Na + H2SO4 → Na2SO4 + H₂↑");
                        setVaporsVisible(true);
                        setLiquidColor("#FFFFFF");

                        let flashCount = 0;
                        const flashInterval = setInterval(() => {
                            setLiquidColor((prev) => (prev === "#FFFFFF" ? "#FF00FF" : "#FFFFFF"));
                            flashCount++;
                            if (flashCount > 5) {
                                clearInterval(flashInterval);
                                setShaking(false);
                            }
                        }, 200);

                        setTimeout(() => {
                            setVaporsVisible(false);
                            setReactionMessage("");
                        }, 5000);
                    }, 1000);
                }


                if (newElements.includes("Mg") && newElements.includes("HCl")) {
                    setTimeout(() => {
                        setShaking(true);
                        playBoom();
                        setReactionMessage("Mg + 2HCl → MgCl2 + H₂↑");
                        setVaporsVisible(true);
                        setLiquidColor("#FFFFFF");

                        let flashCount = 0;
                        const flashInterval = setInterval(() => {
                            setLiquidColor((prev) => (prev === "#FFFFFF" ? "#00FFCC" : "#FFFFFF"));
                            flashCount++;
                            if (flashCount > 5) {
                                clearInterval(flashInterval);
                                setShaking(false);
                            }
                        }, 200);

                        setTimeout(() => {
                            setVaporsVisible(false);
                            setReactionMessage("");
                        }, 5000);
                    }, 1000);
                }

                // Return updated elements state
                return newElements;
            }
            return prev;
        });
    };

    const handlePetriDishClick = () => {
        console.log("Petri dish clicked. Current element:", petriElement);
        if (petriElement === "Na") {
            setReactionMessage("Na flame test: Yellow flame");
            setShowVapors(true);
            playFireSound();
            setTimeout(() => setShowVapors(false), 3000);
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-900 flex flex-col items-center justify-center">
            <h1 className="text-white text-2xl mb-4">3D Virtual Chemistry Lab</h1>

            <div className="grid gap-1 bg-gray-800 rounded-lg p-4"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(18, 1fr)",
                    gridAutoRows: "50px"
                }}>
                {elements.map((element) => (
                    <Element
                        key={element.name}
                        name={element.name}
                        color={element.color}
                        draggable={element.draggable}
                    />
                ))}
            </div>

            <div className="acid-container">
                {acids.map((acid) => (
                    <AcidBeaker className="acid-item"
                        key={acid.name}
                        acid={acid}
                        draggable={acid.name === "HCl" || acid.name === "H2SO4" || acid.name === "HNO3"}
                    />
                ))}
            </div>

            <div className="flex flex-row gap-4 mt-4 justify-center items-center">
                <div ref={dropPetriDish} className={`p-4 rounded-lg ${isOverPetriDish ? "bg-gray-700" : "bg-gray-800"} flex flex-col items-center`}>
                    <Canvas className="w-full h-96">
                        <ambientLight intensity={0.5} />
                        <OrbitControls />
                        <PetriDish element={petriElement} color={petriElementColor} onDrop={handlePetriDishDrop} onClick={handlePetriDishClick} />
                        {showVapors && <Vapors active={showVapors} color="yellow" />}
                    </Canvas>
                    <div className="text-white text-center mt-2 text-right">Petri Dish</div>
                </div>

                <div ref={dropBeaker} className={`p-4 rounded-lg ${isOverBeaker ? "bg-gray-700" : "bg-gray-800"} flex flex-col items-center`}>
                    <Canvas className={`w-full h-96 ${shaking ? "animate-shake" : ""}`}>
                        <ambientLight intensity={0.5} />
                        <OrbitControls />
                        <Beaker />
                        <Liquid color={liquidColor} />
                        <Vapors active={vaporsVisible} />
                    </Canvas>
                    <div className="text-white text-center mt-2 text-right">Beaker</div>
                </div>
            </div>

            <div className="mt-4 text-center">
                <AnimatePresence>
                    {reactionMessage && (
                        <motion.p
                            className="text-white text-lg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            {reactionMessage}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <button onClick={resetLab} className="mt-4 ml-4 p-2 bg-red-600 text-white rounded-lg">Reset</button>    </div>
    );
}

export default function VirtualLab() {
    return <DndProvider backend={HTML5Backend}><VirtualLabComponent /></DndProvider>;
}