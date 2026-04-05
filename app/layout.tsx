import Navbar from "./components/Navbar";
import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NextHouse | AI-Powered Housing Portal",
  description: "Advanced property price estimation and market analytics using ML and Spring Boot.",
  keywords: ["real estate", "price prediction", "housing portal", "machine learning", "next.js"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-700 dark:selection:text-indigo-200 font-sans transition-colors duration-300">
        <Navbar />

        <main className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </main>

      </body>
    </html>
  );
}