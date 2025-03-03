"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function QuizPage() {
  const router = useRouter();
  const pathname = usePathname();

  const subjects = [
    { name: "Mathematics", gradient: "from-orange-500 to-yellow-400" },
    { name: "Physics", gradient: "from-purple-500 to-blue-400" },
    { name: "History", gradient: "from-red-500 to-pink-400" },
    { name: "Geography", gradient: "from-blue-500 to-indigo-400" },
    { name: "English", gradient: "from-cyan-500 to-blue-400" },
  ];

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
  ];
  
  const handleSubjectClick = (subject: string | number | boolean) => {
    router.push(`/Select_topic?subject=${encodeURIComponent(subject)}`);
  };

  return (
    <div className="relative min-h-screen bg-black text-white bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/Landing.jpg')" }}>

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

      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-6">
        <motion.h2
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-400"
        >
          Select a Subject to Begin Your Quiz
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <motion.button
              key={subject.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleSubjectClick(subject.name)}
              className={`relative border border-purple-500 bg-transparent backdrop-blur-lg rounded-xl shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-2xl p-6 before:absolute before:inset-0 before:bg-gradient-to-r before:from-black/40 before:to-black/20 before:blur-md`}
            >
              <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${subject.gradient}`}>
                {subject.name}
              </h3>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
