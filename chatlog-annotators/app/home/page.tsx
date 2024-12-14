"use client";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="h-scren w-full bg-cover bg-center">
      {/* Background overlay */}
      <div className="bg-black opacity-50"></div>

      {/* Content container */}
      <div className="flex justify-center h-full">
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut", 
          }}
          className = "justify-center pl-4"
        >
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Welcome to Chatlog Annotators 👋
          </h1>
          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300">
            Annotate your chat logs with ease and efficiency.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
