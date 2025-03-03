"use client";
import React, { useEffect, useState, useRef } from "react";
import DOMPurify from "dompurify";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Chatbox from "../../../components/chatbot"; // Adjust the import path as needed
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import GeminiImageGenerator from "../../../components/Image_Generator";
 // Import the GeminiImageGenerator component

const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
];

// Type definitions
interface Step {
    text: string;
    isHeading?: boolean;
}

const formatText = (text: string) => {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
        .replace(/__(.*?)__/g, "<u>$1</u>") // Underline
        .replace(/`(.*?)`/g, "<code>$1</code>"); // Inline code
    return DOMPurify.sanitize(formatted);
};

interface SimplifiedTextRecord {
    [key: number]: string;
}

// Define a type for the Chatbox component's ref
export interface ChatboxHandle {
    addMessage: (message: string) => void;
}

export default function Procedure() {
    // State management
    const [selectedText, setSelectedText] = useState<string>("");
    const [simplifiedText, setSimplifiedText] = useState<string>("");
    const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());
    const [simplifiedTexts, setSimplifiedTexts] = useState<SimplifiedTextRecord>({});
    const [isLoading, setIsLoading] = useState<Record<number, boolean>>({});
    const [isChatboxVisible, setIsChatboxVisible] = useState<boolean>(false);
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // New state for speech status
    const router = useRouter();
    const pathname = usePathname();

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const chatboxRef = useRef<ChatboxHandle>(null);

    // Sample steps for Ohm's Law Procedure
    const steps: Step[] = [
        { text: "Materials Required:", isHeading: true },
        { text: "A resistance wire" },
        { text: "A voltmeter and an ammeter of appropriate range" },
        { text: "A battery (battery eliminator)" },
        { text: "A rheostat" },
        { text: "A metre scale" },
        { text: "One way key" },
        { text: "Connecting wires" },
        { text: "A piece of sand paper" },
        { text: "Screw gauge" },
        { text: "Real Lab Procedure:", isHeading: true },
        { text: "First we'll draw the circuit diagram." },
        { text: "Arrange the apparatus in the same manner as given in the arrangement diagram." },
        { text: "Clean the ends of the connecting wires with sand paper to remove insulation, if any." },
        {
            text:
                "Make neat, clean and tight connections according to the circuit diagrams. While making connections ensure that +ve marked terminals of the voltmeter and ammeter are joined towards the +ve terminals of the battery.",
        },
        { text: "Determine the least count of voltmeter and ammeter, and also note the zero error, if any." },
        { text: "Insert the key K, slide the rheostat contact and see that the ammeter and voltmeter are working properly." },
        {
            text:
                "Adjust the sliding contact of the rheostat such that a small current passes through the resistance coil or the resistance wire.",
        },
        { text: "Note down the value of the potential difference V from the voltmeter and current I from the ammeter." },
        {
            text:
                "Shift the rheostat contact slightly so that both the ammeter and voltmeter show full divisions readings and not in fraction.",
        },
        { text: "Record the readings of the voltmeter and ammeter." },
        { text: "Take at least six sets of independent observations." },
        { text: "Record the observations in a tabular column" },
        {
            text:
                "Now, cut the resistance wire at the points where it leaves the terminals, stretch it and find its length by the meter scale.",
        },
        {
            text:
                "Then find out the diameter and hence the radius of the wire using the screw gauge and calculate the cross-sectional area A (πr²).",
        },
        { text: "Plot a graph between current (I) along X-axis and potential difference across the wire (V) along Y-axis." },
        { text: "The graph should be a straight line." },
        {
            text:
                "Determine the slope of the graph. The slope will give the value of resistance (R) of the material of the wire.",
        },
        { text: "Calculate the resistance per centimeter of the wire." },
        { text: "Now, calculate the resistivity of the material of the wire using the formula," },
        { text: "ρ = (πR) / l" },
        { text: "Simulator Procedure (as performed through the Online Labs)", isHeading: true },
        { text: "Select the metal from the drop down list." },
        { text: "Select the length of the wire from the slider." },
        { text: "Select the diameter of the wire using the slider." },
        { text: "Select the resistance of the rheostat using the slider." },
        {
            text:
                "To see the circuit diagram, click on the 'Show circuit diagram' check box seen inside the simulator window.",
        },
        {
            text:
                "Connections can be made as seen in the circuit diagram by clicking and dragging the mouse from one connecting terminal to the other connecting terminal of the devices to be connected.",
        },
        { text: "Drag the wire and place it on the voltmeter to have it connected." },
        { text: "Once all connections are made, click and drag the key to insert it into the switch." },
        {
            text:
                "Slowly move the rheostat contact to change the voltage and current in the voltmeter and ammeter accordingly.",
        },
        { text: "Calculate the resistivity of the materials based on the length of the wire selected." },
        { text: "Click on the 'Show result' check box to verify your result." },
        { text: "Click on the 'Reset' button to redo the experiment." },
        { text: "Observations:", isHeading: true },
        { text: "1. Length" },
        { text: "Length of the resistance wire l =......cm" },
        { text: "2. Range" },
        { text: "Range of the given ammeter = .......A." },
        { text: "Range of the given voltmeter = .......V." },
        { text: "3. Least count" },
        { text: "Least count of ammeter = .......A." },
        { text: "Least count of voltmeter = .......V." },
        { text: "4. Zero error" },
        { text: "Zero error in ammeter, e1 = .......A." },
        { text: "Zero error in voltmeter,e2 = ......V." },
        { text: "5. Zero correction" },
        { text: "Zero correction for ammeter, (-e1) = .......A." },
        { text: "Zero correction for voltmeter, (-e2) = ......V." },
    ]; // Speech synthesis logic
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    const readProcedure = () => {
        const fullText = steps.map((step) => step.text).join(" ");

        if (isSpeaking) {
            // If already speaking, stop the speech
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            // Create a new SpeechSynthesisUtterance instance if not already speaking
            utterance.current = new SpeechSynthesisUtterance(fullText);
            utterance.current.lang = 'en-US';
            utterance.current.pitch = 1;
            utterance.current.rate = 1;
            utterance.current.volume = 1;

            // Start speaking
            window.speechSynthesis.speak(utterance.current);
            setIsSpeaking(true);

            // Listen for the end of speech
            utterance.current.onend = () => {
                setIsSpeaking(false);
            };
        }
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                readProcedure(); // Call readProcedure when Enter is pressed
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isSpeaking]);

    const fetchSimplifiedText = async (text: string, index: number) => {
        try {
            setIsLoading((prev) => ({ ...prev, [index]: true }));

            const response = await fetch("http://localhost:5000/simplify-text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (response.ok) {
                const data = await response.json();
                const simplified = data.simplified_text || "Simplified text not found.";
                setSimplifiedTexts((prev) => ({ ...prev, [index]: simplified }));
                setSimplifiedText(simplified);
            } else {
                const errorMessage = "Error occurred while simplifying text.";
                setSimplifiedTexts((prev) => ({ ...prev, [index]: errorMessage }));
                setSimplifiedText(errorMessage);
            }
        } catch (error) {
            console.error("API request failed:", error);
            setSimplifiedTexts((prev) => ({ ...prev, [index]: "Failed to connect to simplification service." }));
        } finally {
            setIsLoading((prev) => ({ ...prev, [index]: false }));
        }
    };

    const handleTextSelection = (index: number) => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            const text = selection.toString();
            setSelectedText(text);
            fetchSimplifiedText(text, index);
        }
    };

    const handleTextClick = (index: number) => {
      setSelectedIndexes(prev => {
          const newIndexes = new Set(prev);
          if (newIndexes.has(index)) {
              newIndexes.delete(index);
          } else {
              newIndexes.add(index);
          }
          return newIndexes;
      });
      const textToSimplify = steps[index].text;
      fetchSimplifiedText(textToSimplify, index);
  };
  
    // Function to handle drag start
    const handleDragStart = (event: React.DragEvent<HTMLDivElement>, text: string) => {
        event.dataTransfer.setData("text/plain", text);
    };

    const StepItem = ({ step, index }: { step: Step; index: number }) => {
        if (step.isHeading) {
            return (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text 
                         bg-gradient-to-r from-blue-400 to-indigo-500 mt-8 mb-4">
                    {step.text}
                </h2>
            );
        }

        return (
            <div className="mb-4 group">
                <div
                    className="text-lg text-gray-200 cursor-pointer transition-colors duration-200 
                         hover:text-white hover:bg-gray-800 p-2 rounded-md"
                    onMouseUp={() => handleTextSelection(index)}
                    onClick={() => handleTextClick(index)}
                    draggable
                    onDragStart={(event) => handleDragStart(event, step.text)}
                >
                    {step.text}
                    <span className="hidden group-hover:inline-block ml-2 text-xs text-blue-400">
                        {selectedIndexes.has(index) ? "Click to hide" : "Click to simplify"}
                    </span>
                </div>

                {selectedIndexes.has(index) && (
                    <div className="mt-2 p-3 bg-gray-800 bg-opacity-90 text-white rounded-lg border-l-4 border-blue-500 transition-all duration-300">
                        {isLoading[index] ? (
                            <div className="flex items-center justify-center py-4">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-blue-400">Simplifying...</span>
                            </div>
                        ) : (
                            <p className="text-md">{simplifiedTexts[index] || "Select text to simplify"}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Function to handle text dropped into the chatbox
    const handleDropText = (text: string) => {
        if (chatboxRef.current && chatboxRef.current.addMessage) {
            chatboxRef.current.addMessage(text);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6" ref={containerRef}>
            <motion.nav
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-black/50 backdrop-blur-md shadow-lg z-50"
            >
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600">
                    OLABS
                </h1>
                <div className="flex space-x-6">
                    {navItems.map((item) => (
                        <motion.div
                            key={item.path}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link href={item.path}>
                                <div
                                    className={`px-4 py-2 text-lg font-semibold text-transparent bg-clip-text 
                                  bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 
                                  hover:text-gray-300 transition-all duration-300 cursor-pointer 
                                  ${pathname === item.path
                                            ? "underline decoration-purple-500 underline-offset-4"
                                            : ""
                                        }`}
                                >
                                    {item.name}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.nav>

            <header className="max-w-4xl mx-auto mb-12 text-center pt-20">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text 
                       bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 pb-2">
                    Ohm's Law Procedure
                </h1>
                <p className="text-gray-400 mt-4 text-lg">
                    Interactive guide with text simplification
                </p>
            </header>

            {/* Instruction card */}
            <div className="fixed top-1/2 left-20 transform -translate-y-1/2 bg-gray-800 p-5 text-center 
                     rounded-lg shadow-xl border border-gray-700 max-w-xs z-10 opacity-90 hover:opacity-100 transition-opacity">
                <h3 className="text-blue-400 font-semibold mb-2">How to use</h3>
                <p className="text-gray-300">
                    1.Click on text you want to simplify
                </p>
                <p className="text-gray-300">
                    2. Click on the text to toggle simplified view
                </p>
                <p className="text-gray-300">
                    3. Press "Enter" to listen to the entire procedure or pause it.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                    Simplified text appears below the selected text
                </div>
            </div>

            <main className="max-w-3xl mx-auto bg-gray-900 bg-opacity-60 rounded-xl p-6 shadow-2xl">
                <div className="mt-8">
                    <GeminiImageGenerator />
                </div>

                <div className="space-y-2">
                    {steps.map((step, index) => (
                        <StepItem key={index} step={step} index={index} />
                    ))}
                </div>
            </main>

            <footer className="max-w-3xl mx-auto mt-8 text-center text-gray-500 text-sm">
                <p>Olabs  © {new Date().getFullYear()}</p>
            </footer>

            {/* Chatbox Toggle */}
            {!isChatboxVisible && (
                <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-20">
                    <motion.button
                        onClick={() => setIsChatboxVisible(!isChatboxVisible)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-gray-800 text-white p-3 rounded-full shadow-lg"
                    >
                        <FaArrowLeft />
                    </motion.button>
                </div>
            )}

            {/* Chatbox */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isChatboxVisible ? "0%" : "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 right-0 h-full w-[28rem] z-10"
            >
                <Chatbox />
                {isChatboxVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-1/2 left-[-2rem] transform -translate-y-1/2 z-20"
                    >
                        <motion.button
                            onClick={() => setIsChatboxVisible(!isChatboxVisible)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-gray-800 text-white p-3 rounded-full shadow-lg"
                        >
                            <FaArrowRight />
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
