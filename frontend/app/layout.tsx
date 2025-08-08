import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layouts/navbar";
import QueryProvider from "@/context/QueryProvider";
import Background from "@/components/layouts/Background";

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
          <Background>
            {children}
          </Background>
        </QueryProvider>
      </body>
    </html>
  );
}
