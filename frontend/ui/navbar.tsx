'use client';

import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-900 shadow-lg rounded-2xl px-6 py-3 flex items-center justify-between w-11/12 max-w-lg">
      <div className="text-lg font-semibold text-gray-800 dark:text-white">Brand</div>
      <div className="hidden md:flex space-x-6">
        <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Home</a>
        <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">About</a>
        <a href="/services" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Services</a>
        <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">Contact</a>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
      {isOpen && (
        <div className="absolute top-14 right-0 w-48 bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 md:hidden">
          <a href="/" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white py-2">Home</a>
          <a href="/about" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white py-2">About</a>
          <a href="/services" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white py-2">Services</a>
          <a href="/contact" className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white py-2">Contact</a>
        </div>
      )}
    </nav>
  );
}
