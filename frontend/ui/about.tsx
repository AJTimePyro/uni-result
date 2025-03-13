"use client"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Total Students", value: 25000 },
  { label: "Graduated", value: 18000 },
  { label: "Ongoing", value: 7000 },
  { label: "Pass Rate", value: "92%" },
];

export default function AboutStats() {
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      return setInterval(() => {
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          if (typeof stat.value === "number" && newValues[index] < stat.value) {
            newValues[index] += Math.ceil(stat.value / 50);
          } else {
            clearInterval(intervals[index]);
          }
          return newValues;
        });
      }, 50);
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">Student Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
          >
            <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">
              {typeof stat.value === "number" ? animatedValues[index] : stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
