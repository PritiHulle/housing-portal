"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Estimator", href: "/estimator" },
        { name: "Analysis Check", href: "/analysis" },
        { name: "Market Dashboard", href: "/dashboard", special: true },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#09090b]/80 border-b border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-lg transition-all duration-300">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                            <span className="font-bold text-white text-xl">H</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
                            NextHouse
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-semibold transition-all duration-200 ${isActive(link.href)
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                    } ${link.special ? "pl-6 border-l border-zinc-200 dark:border-zinc-800 ml-2" : ""}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
                        )}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isOpen && (
                    <div className="md:hidden mt-4 pb-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive(link.href)
                                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
