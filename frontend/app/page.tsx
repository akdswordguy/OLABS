"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const pathname = usePathname();

  const categories = [
    { name: "PHYSICS", gradient: "from-purple-500 to-blue-400", path: "/Physics" },
    { name: "CHEMISTRY", gradient: "from-pink-500 to-purple-400", path: "/chemistry" },
    { name: "BIOLOGY", gradient: "from-green-500 to-teal-400" },
    { name: "MATHS", gradient: "from-orange-500 to-yellow-400" },
    { name: "LANGUAGE", gradient: "from-cyan-500 to-blue-400" },
    { name: "SCIENCE", gradient: "from-red-500 to-pink-400" },
    { name: "SOCIAL SCIENCE", gradient: "from-blue-500 to-indigo-400" },
    { name: "COMPUTER", gradient: "from-teal-500 to-green-400" },
    { name: "3D/AR/VR", gradient: "from-yellow-500 to-orange-400" },
    { name: "EDP", gradient: "from-violet-500 to-purple-400" },
    { name: "ISL", gradient: "from-blue-500 to-cyan-400" },
  ];

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
  ];

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

        {/* Hero Section */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center justify-center h-[50vh] text-center p-6"
        >
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text 
                     bg-gradient-to-r from-blue-300 to-purple-400">
            Reimagining Education Through Innovation
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl">
            Shape the future of learning by developing engaging virtual labs.
          </p>
        </motion.div>

        {/* Categories Section */}
        <div className="px-6 py-10">
          <h2 className="text-center text-3xl font-bold mb-6 text-transparent bg-clip-text 
                     bg-gradient-to-r from-blue-400 to-purple-500">
            Explore Subjects
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative border border-purple-500 bg-transparent backdrop-blur-lg 
                       rounded-xl shadow-lg overflow-hidden transition-transform 
                       transform hover:scale-105 hover:shadow-2xl p-6 before:absolute 
                       before:inset-0 before:bg-gradient-to-r before:from-black/40 
                       before:to-black/20 before:blur-md"
              >
                <div className="flex items-center justify-center h-24 relative">
                  <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${category.gradient}`}>
                    {category.name}
                  </h3>
                </div>
                <div className="mt-4 text-center relative">
                  <Link href={category.path || "#"}>
                    <button className={`px-4 py-2 text-sm font-semibold rounded-lg 
                                      bg-gradient-to-r ${category.gradient} text-black 
                                      hover:opacity-80 transition-all`}>
                      Learn More
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
