import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layouts/navbar";
import QueryProvider from "@/context/QueryProvider";

export const metadata: Metadata = {
  title: "Cosmic Results Portal",
  description: "The Cosmic Portal for University Results",
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="cosmic-theme min-h-screen">
        <Navbar />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
