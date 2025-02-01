"use client";

import { motion } from "framer-motion";

interface CountdownProps {
  daysLeft: number;
}

export function Countdown({ daysLeft }: CountdownProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif mb-8">Countdown to Our Big Day</h2>
          <div className="text-6xl font-serif text-[#d4a373]">{daysLeft}</div>
          <p className="mt-2 text-xl">Days to go</p>
        </motion.div>
      </div>
    </section>
  );
}