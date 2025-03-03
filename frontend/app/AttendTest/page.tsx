"use client";

import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";

import DOMPurify from "isomorphic-dompurify";


const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
];

const formatText = (text : string): string => {
    let formatted = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
        .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
        .replace(/__(.*?)__/g, "<u>$1</u>") // Underline
        .replace(/`(.*?)`/g, "<code>$1</code>"); // Inline code
    return DOMPurify.sanitize(formatted);
};

const Page = () => {
    const [formData, setFormData] = useState({
        aim: "",
        apparatus: "",
        procedure: "",
        observations: "",
        conclusion: "",
    });

    const [isOpen, setIsOpen] = useState(false);
    const [score, setScore] = useState(null);

    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://127.0.0.1:5000/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        setScore(data.score);
        setIsOpen(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="relative min-h-screen bg-black text-white font-roboto">
            <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-black/50 backdrop-blur-md shadow-lg z-50">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600">OLABS</h1>
                <div className="flex space-x-6">
                    {navItems.map((item) => (
                        <motion.div key={item.path} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Link href={item.path}>
                                <div className={`px-4 py-2 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 hover:text-gray-300 transition-all duration-300 cursor-pointer ${pathname === item.path ? "underline decoration-purple-500 underline-offset-4" : ""}`}>{item.name}</div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.nav>

            <div className="absolute inset-0 bg-[url('/images/Landing.jpg')] bg-cover bg-center opacity-30"></div>

            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="flex items-center justify-center min-h-screen pt-20">
                <div className="relative w-full max-w-2xl m-6 sm:m-12 bg-black/60 p-8 rounded-2xl border border-purple-500 shadow-[0_0_20px_rgba(128,0,128,0.6)] backdrop-blur-lg">
                    <FaArrowLeft className="absolute top-5 left-5 text-purple-400 text-2xl cursor-pointer hover:text-purple-300 transition" onClick={() => router.push("/")} />
                    <h2 className="text-3xl font-extrabold font-serif text-center mb-6 text-purple-300">Experiment Form</h2>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {Object.keys(formData).map((field) => (
                            <motion.div key={field} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="relative">
                                <label className="block text-lg font-serif font-extrabold text-purple-300 mb-1 capitalize">{field}</label>
                                <textarea name={field} value={formData[field]} onChange={handleChange} placeholder={`Enter ${field}`} rows={3} className="w-full p-3 border border-purple-500 rounded-lg bg-black/40 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 backdrop-blur-sm" />
                            </motion.div>
                        ))}
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition shadow-[0_0_15px_rgba(128,0,128,0.8)]">Submit</motion.button>
                    </form>
                </div>
            </motion.div>

            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Dialog.Panel className="bg-black p-6 rounded-lg shadow-xl border border-purple-500 max-w-sm text-center">
                    <Dialog.Title className="text-lg font-semibold text-purple-400" dangerouslySetInnerHTML={{ __html: formatText(`Your score is: ${score}`) }}></Dialog.Title>
                    <button onClick={() => setIsOpen(false)} className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">Close</button>
                </Dialog.Panel>
            </Dialog>
        </motion.div>
    );
};

export default Page;