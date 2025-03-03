"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Message {
    text: string;
    sender: "user" | "bot";
}

const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
];

const formatText = (text: string) => {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
        .replace(/__(.*?)__/g, "<u>$1</u>") // Underline
        .replace(/`(.*?)`/g, "<code>$1</code>"); // Inline code
    return DOMPurify.sanitize(formatted);
};

const ChatBot = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    const router = useRouter();
    const pathname = usePathname();

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const responseData = await response.json();

            const botMessage: Message = {
                text: responseData.response || responseData.error || "Sorry, I didn't understand that.",
                sender: "bot",
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error fetching from Flask:", error);
            setMessages((prev) => [...prev, { text: "Error fetching response. Try again.", sender: "bot" }]);
        }

        setInput("");
    };

    // Handle when content is dropped into the chat
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.dataTransfer.getData("text/plain");
        if (text) {
            const userMessage: Message = { text, sender: "user" };
            setMessages((prev) => [...prev, userMessage]);
            handleSendWithText(text); // Send the message to the server or handle locally
        }
    };

    // Allow the drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // Send a message with the provided text
    const handleSendWithText = async (text: string) => {
        const userMessage: Message = { text, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);

        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });

            const responseData = await response.json();

            const botMessage: Message = {
                text: responseData.response || responseData.error || "Sorry, I didn't understand that.",
                sender: "bot",
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error fetching from Flask:", error);
            setMessages((prev) => [...prev, { text: "Error fetching response. Try again.", sender: "bot" }]);
        }
    };

    return (
        <div 
            className="relative min-h-screen bg-black text-white flex items-center justify-center p-6"
            onDrop={handleDrop} // Add the drop event
            onDragOver={handleDragOver} // Add the drag over event
        >
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

            <motion.div
                className="absolute left-80 top-1/2 transform -translate-y-1/2"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                <motion.img
                    src="/images/robo.png"
                    alt="Chatbot"
                    className="w-80 h-80"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md border border-purple-500 rounded-xl shadow-lg backdrop-blur-lg p-4 bg-black/60 relative flex"
            >
                <div className="flex-grow">
                    <motion.h2
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold mb-4 text-center text-purple-300"
                    >
                        AI Chatbot
                    </motion.h2>
                    <div className="h-80 overflow-y-auto space-y-2 p-2 flex flex-col">
                        {messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: msg.sender === "user" ? 30 : -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`p-2 pl-3 pr-4 rounded-3xl max-w-[75%] text-white ${msg.sender === "user"
                                    ? "bg-gradient-to-r from-blue-500 to-purple-400 self-end text-right"
                                    : "bg-gray-700 self-start text-left"}`}
                            >
                                <span dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex mt-2">
                        <motion.input
                            type="text"
                            className="flex-grow p-2 rounded-l-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            whileFocus={{ scale: 1.02 }}
                        />
                        <motion.button
                            onClick={handleSend}
                            className="px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-r-lg hover:opacity-80 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Send
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatBot;