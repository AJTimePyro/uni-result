"use client";

import { useEffect, useState } from "react";
import Navbar from "@/ui/navbar";
import UniversitySelect from "@/ui/universityselect";
import Footer from "@/ui/footer";
import AboutStats from "@/ui/about";

export default function HomePage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className={theme}>
     <Navbar></Navbar>
    
      <main className=" pt-20 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <section className="container mx-auto py-12">
          <UniversitySelect />
        </section>
        <section className="container mx-auto py-12">
          <AboutStats />
        </section>
      </main>
      <Footer />
      
    </div>
  );
}

