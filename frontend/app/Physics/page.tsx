"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

// Separate arrays for navbar and box items
const navItems = [
    { name: "Home", path: "/", subject: "Physics" },
    { name: "Quizzes", path: "/Quizzes", subject: "Physics" },
    { name: "Procedure", path: "/Topic_select", subject: "Physics" },
];

const boxItems = [
    { name: "Attend Test", path: "/AttendTest", subject: "Physics" },
    { name: "Quizzes", path: "/Select_topic/Physics", subject: "Physics" }, // Dynamically passing subject
    { name: "Procedure", path: "/Topic_select/Physics", subject: "Physics" },
];

const Physics = () => {
    const pathname = usePathname();
    const router = useRouter();

    // Handle Procedure button click
    const handleProcedureClick = (subject: string) => {
        router.push(`/Topic_select/${subject}`);
    };

    // Handle Subject Click
    const handleSubjectClick = (subject: string | number | boolean) => {
        router.push(`/Select_topic?subject=${encodeURIComponent(subject)}`);
    };

    return (
        <div
            className="relative min-h-screen bg-black text-white bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/Landing.jpg')" }}
        >
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10">
                {/* Navbar */}
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

                {/* Categories Section */}
                <div className="px-6 py-10 flex justify-start items-center min-h-[80vh]">
                    <div className="w-full max-w-6xl ml-125"> {/* Shifted content to the right */}

                        {/* Updated Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center">
                            {boxItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="relative border border-purple-500 bg-transparent backdrop-blur-lg 
                       rounded-xl shadow-lg overflow-hidden transition-transform 
                       transform hover:scale-105 hover:shadow-2xl p-6 before:absolute 
                       before:inset-0 before:bg-gradient-to-r before:from-black/40 
                       before:to-black/20 before:blur-md w-full max-w-xs mx-auto" // Center and set max-width
                                >
                                    <div className="flex items-center justify-center h-64 relative">
                                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600">
                                            {item.name}
                                        </h3>
                                    </div>
                                    {item.name === "Procedure" ? (
                                        <div
                                            className="mt-4 text-center relative"
                                            onClick={() => handleProcedureClick(item.subject)}
                                        >
                                            <button className="px-4 py-2 text-sm font-semibold rounded-lg 
                                      bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 
                                      text-black hover:opacity-80 transition-all">
                                                Select Topic
                                            </button>
                                        </div>
                                    ) : item.name === "Quizzes" ? (
                                        <div
                                            className="mt-4 text-center relative"
                                            onClick={() => handleSubjectClick(item.subject)}
                                        >
                                            <button className="px-4 py-2 text-sm font-semibold rounded-lg 
                                      bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 
                                      text-black hover:opacity-80 transition-all">
                                                Select Topic
                                            </button>
                                        </div>
                                    ) : (
                                        <Link href={item.path}>
                                            <div className="mt-4 text-center relative">
                                                <button className="px-4 py-2 text-sm font-semibold rounded-lg 
                                      bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 
                                      text-black hover:opacity-80 transition-all">
                                                    Learn More
                                                </button>
                                            </div>
                                        </Link>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Physics;
