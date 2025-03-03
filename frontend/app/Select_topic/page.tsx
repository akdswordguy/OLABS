"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function SelectClass() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const router = useRouter();
  const pathname = usePathname();

  const physicsQuizzes = ["Ohms_Law", "Metre_Bridge", "Zener_Diode", "Potentiometer"];

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
  ];

  const handleQuizClick = (quiz: string) => {
    router.push(`/Topic_quiz/${quiz}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white bg-cover bg-center bg-no-repeat px-6 py-10"
      style={{ backgroundImage: "url('/images/Bg2.jpg')" }}>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-4 bg-black/50 backdrop-blur-md shadow-lg z-50"
      >
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600">
          OLABS
        </h1>
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <motion.div key={item.path} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Link href={item.path}>
                <div
                  className={`px-4 py-2 text-lg font-semibold text-transparent bg-clip-text 
                            bg-gradient-to-r from-blue-400 via-purple-500 to-violet-600 
                            hover:text-gray-300 transition-all duration-300 cursor-pointer 
                            ${pathname === item.path ? "underline decoration-purple-500 underline-offset-4" : ""}`}
                >
                  {item.name}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.nav>

      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center mt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-3xl text-center mt-12"
        >
          <h2 className="text-4xl font-bold mb-14 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Select a Quiz for {subject}
          </h2>
          <h3 className="text-4xl font-bold mb-14 text-transparent bg-clip-text bg-white"> Class 12</h3>

          <div className="grid grid-cols-2 gap-8 justify-center">
            {subject === "Physics" && physicsQuizzes.map((quiz, index) => (
              <motion.button
                key={quiz}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleQuizClick(quiz)}
                className="p-6 w-80 h-40 border border-purple-500 bg-black/10 backdrop-blur-lg 
                       rounded-xl shadow-lg transition-transform 
                       transform hover:scale-105 hover:shadow-2xl relative"
              >
                {quiz.replace(".tsx", "").replace("_", " ")}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
