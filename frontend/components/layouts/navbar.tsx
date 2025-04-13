"use client";
import Link from "next/link";
import { Sparkles, Rocket } from "lucide-react";
import { useState } from "react";

export default function CosmicNavbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full p-4 bg-black shadow-lg shadow-indigo-900/50 border-b border-indigo-700 relative overflow-hidden">
      {/* Starry Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-900 to-black opacity-80">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white opacity-50 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Cosmic Elements */}
      <div className="absolute top-2 left-10 w-4 h-4 bg-blue-400 rounded-full blur-sm animate-pulse"></div>
      <div className="absolute bottom-4 right-20 w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>

      <div className="container mx-auto flex justify-between items-center relative z-10">
        <Link
          href="/"
          className="text-3xl font-bold text-white flex items-center gap-3"
        >
          <Rocket size={32} className="text-indigo-400 animate-bounce" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Galactic Results
          </span>
        </Link>

        {/* Hamburger Toggle Button */}
        <button
          className="text-white md:hidden transition-transform duration-300"
          onClick={() => setMenuOpen(!isMenuOpen)}
        >
          <span className="text-3xl font-bold">
            {isMenuOpen ? "✕" : "☰"}
          </span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-white items-center">
          <Link
            href="/ranklist"
            className="flex items-center gap-2 hover:text-indigo-300 transition duration-300 ease-in-out"
          >
            <Sparkles size={18} className="text-yellow-300" />
            Rank List
          </Link>
          <Link
            href="/results"
            className="flex items-center gap-2 hover:text-purple-300 transition duration-300 ease-in-out"
          >
            <Sparkles size={18} className="text-green-300" />
            My Results
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 hover:text-pink-300 transition duration-300 ease-in-out"
          >
            <Sparkles size={18} className="text-red-300" />
            Contact
          </Link>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-black border-t border-indigo-700 flex flex-col space-y-4 p-4 md:hidden">
            <Link
              href="/ranklist"
              className="flex items-center gap-2 text-white hover:text-indigo-300 transition duration-300 ease-in-out"
            >
              <Sparkles size={18} className="text-yellow-300" />
              Rank List
            </Link>
            <Link
              href="/results"
              className="flex items-center gap-2 text-white hover:text-purple-300 transition duration-300 ease-in-out"
            >
              <Sparkles size={18} className="text-green-300" />
              My Results
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-white hover:text-pink-300 transition duration-300 ease-in-out"
            >
              <Sparkles size={18} className="text-red-300" />
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}