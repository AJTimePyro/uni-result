'use client'
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Search } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 bg-black/10">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600 text-center"
            >
                Galactic Results
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-base md:text-xl mb-8 text-white max-w-2xl px-4 text-center"
            >
                Explore your academic journey through our cutting-edge cosmic interface.
                Discover your achievements across the academic universe.
            </motion.p>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md px-4 justify-center"
            >
                <Link href="/ranklist" className="w-full sm:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px #6366f1" }}
                        className="group relative w-full sm:w-auto px-6 py-3 overflow-hidden rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition duration-300 transform flex items-center justify-center gap-2"
                    >
                        <Search className="group-hover:animate-pulse mr-2" />
                        View Rank List
                    </motion.button>
                </Link>

                <Link href="/results" className="w-full sm:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px #facc15" }}
                        className="group relative w-full sm:w-auto px-6 py-3 overflow-hidden rounded-lg bg-yellow-400 text-black font-semibold hover:bg-yellow-500 transition duration-300 transform flex items-center justify-center gap-2"
                    >
                        <Star className="group-hover:animate-pulse mr-2" />
                        Check My Results
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
}