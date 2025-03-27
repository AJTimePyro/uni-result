import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layouts/navbar";
import QueryProvider from "@/context/QueryProvider";

export const metadata: Metadata = {
  title: "Doom Portal",
  description: "The Doom Portal of University Results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
