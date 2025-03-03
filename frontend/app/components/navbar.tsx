"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import React from 'react'

const navItems = [
    { name: "Home", path: "/" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quizzes", path: "/Quizzes" },
];

const router = useRouter();
const pathname = usePathname();

function navbar() {
  return (
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
  )
}

export default navbar