"use client";

import Link from "next/link";
import { Sparkles, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";

type Star = {
  left: string;
  top: string;
  size: string;
  delay: string;
};

export default function CosmicNavbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const generatedStars: Star[] = Array.from({ length: 30 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 1}px`,
      delay: `${Math.random() * 5}s`,
    }));
    setStars(generatedStars);
  }, []);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="w-full p-4 bg-black shadow-lg shadow-indigo-900/50 border-b border-indigo-700 relative z-50 overflow-x-hidden">
      {/* Starry Background */}
      {isMounted && (
        <div className="absolute inset-0 bg-gradient-to-br from-black via-indigo-900 to-black opacity-80 -z-10 overflow-hidden">
          {stars.map((star, index) => (
            <div
              key={index}
              className="absolute bg-white opacity-50 rounded-full animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Cosmic Decorations */}
      <div className="absolute top-2 left-10 w-4 h-4 bg-blue-400 rounded-full blur-sm animate-pulse z-0"></div>
      <div className="absolute bottom-4 right-20 w-3 h-3 bg-purple-500 rounded-full animate-bounce z-0"></div>

      {/* Header */}
      <div className="container mx-auto flex justify-between items-center relative z-10">
        <Link
          href="/"
          className="text-3xl font-bold text-white flex items-center gap-3"
          onClick={handleLinkClick}
        >
          <Rocket size={32} className="text-indigo-400 animate-bounce" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Galactic Results
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          className="text-white md:hidden z-50"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="text-3xl font-bold">{isMenuOpen ? "✕" : "☰"}</span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-white items-center">
          <Link href="/ranklist" className="hover:text-indigo-300 transition">
            <Sparkles size={18} className="text-yellow-300 inline-block mr-1" />
            Rank List
          </Link>
          <Link href="/my-result" className="hover:text-purple-300 transition">
            <Sparkles size={18} className="text-green-300 inline-block mr-1" />
            My Results
          </Link>
          <Link href="/contact" className="hover:text-pink-300 transition">
            <Sparkles size={18} className="text-red-300 inline-block mr-1" />
            Contact
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-transparent bg-opacity-60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={clsx(
          "fixed top-0 left-0 w-13/20 sm:w-1/2 h-full bg-[#0b0b1c] p-10 space-y-6 transform transition-transform duration-300 md:hidden z-50 shadow-lg shadow-indigo-900",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2 text-white hover:text-indigo-300 transition">
          <Rocket size={18} className="text-indigo-400" />
          Home
        </Link>
        <Link href="/ranklist" onClick={handleLinkClick} className="flex items-center gap-2 text-white hover:text-indigo-300 transition">
          <Sparkles size={18} className="text-yellow-300" />
          Rank List
        </Link>
        <Link href="/my-result" onClick={handleLinkClick} className="flex items-center gap-2 text-white hover:text-purple-300 transition">
          <Sparkles size={18} className="text-green-300" />
          My Results
        </Link>
        <Link href="/contact" onClick={handleLinkClick} className="flex items-center gap-2 text-white hover:text-pink-300 transition">
          <Sparkles size={18} className="text-red-300" />
          Contact
        </Link>
      </div>
    </nav>
  );
}
