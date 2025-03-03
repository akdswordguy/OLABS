"use client";
import React, { useState } from "react";

const PuterImageGenerator = () => {
    const [text, setText] = useState("");
    const [puterImage, setPuterImage] = useState<string | null>(null); // State to hold Puter image URL

    // Function to generate image using Puter.ai
    const generatePuterImage = async () => {
        try {
            if (!text.trim()) {
                console.error("Input text is empty.");
                return;
            }

            const imageElement = await new Promise<HTMLImageElement>((resolve, reject) => {
                // Dynamically load the Puter.ai script
                const scriptId = "puter-ai-script";
                let script = document.getElementById(scriptId) as HTMLScriptElement;

                if (!script) {
                    script = document.createElement('script');
                    script.id = scriptId;
                    script.src = "https://js.puter.com/v2/";
                    script.async = true;

                    script.onload = () => {
                        // Script is loaded, now call puter.ai.txt2img
                        if (typeof (window as any).puter === 'undefined' || typeof (window as any).puter.ai === 'undefined') {
                            console.error("Puter.ai library not correctly loaded.");
                            reject(new Error("Puter.ai library not correctly loaded."));
                            return;
                        }

                        (window as any).puter.ai.txt2img(text)
                            .then((imgElement: HTMLImageElement) => {
                                resolve(imgElement);
                            })
                            .catch((error: any) => {
                                console.error("Error generating image with Puter.ai:", error);
                                reject(error);
                            });
                    };

                    script.onerror = () => {
                        console.error("Failed to load Puter.ai script.");
                        reject(new Error("Failed to load Puter.ai script."));
                    };

                    document.head.appendChild(script);
                } else {
                    // If script is already loaded, proceed with generating image
                    if (typeof (window as any).puter !== 'undefined' && typeof (window as any).puter.ai !== 'undefined') {
                        (window as any).puter.ai.txt2img(text)
                            .then((imgElement: HTMLImageElement) => {
                                resolve(imgElement);
                            })
                            .catch((error: any) => {
                                console.error("Error generating image with Puter.ai:", error);
                                reject(error);
                            });
                    } else {
                        console.error("Puter.ai library not available.");
                        reject(new Error("Puter.ai library not available."));
                    }
                }
            });

            // Set the image URL
            setPuterImage(imageElement.src);
        } catch (error) {
            console.error("Error generating Puter.ai image:", error);
        }
    };

    // Function to clear the displayed images and reset text
    const clearImages = () => {
        setPuterImage(null);
        setText("");
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Generate Image with Puter.ai</h2>
            <textarea
                className="w-full p-2 border rounded"
                placeholder="Enter text description..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="mt-2">
                <button
                    onClick={generatePuterImage}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    Generate Image
                </button>
                <button
                    onClick={clearImages}
                    className="ml-2 px-4 py-2 bg-red-500 text-white rounded"
                >
                    Clear Image
                </button>
            </div>
            {puterImage && (
                <div className="mt-4">
                    <h3 className="text-lg">Generated Image:</h3>
                    <img
                        src={puterImage}
                        alt="Generated with Puter.ai"
                        className="w-full rounded-lg shadow-md"
                    />
                </div>
            )}
        </div>
    );
};

export default PuterImageGenerator;
    