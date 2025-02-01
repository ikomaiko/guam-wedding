"use client";

import { motion } from "framer-motion";

interface HeroProps {}

export function Hero() {
  return (
    <motion.section
      className="h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-[url('/IMG_7138.JPG')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <motion.h1
          className="text-6xl font-serif mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Daiki & Hiroka
        </motion.h1>
        <motion.p
          className="text-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          2025.02.08 Sat
        </motion.p>
      </div>
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="text-white text-4xl">↓</span>
      </motion.div>
    </motion.section>
  );
}
