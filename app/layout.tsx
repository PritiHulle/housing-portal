import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className="bg-[#09090b] text-zinc-100 min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200 font-sans">
        {/* Glassmorphism Navbar */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="font-bold text-white text-lg">H</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-500">
                NextHouse
              </span>
            </div>
            <div className="flex gap-8 text-sm font-medium">
              <Link href="/" className="text-zinc-400 hover:text-white transition-colors font-bold">Home</Link>
              <Link href="/estimator" className="text-zinc-400 hover:text-white transition-colors font-bold">Estimator</Link>
              <Link href="/analysis" className="text-zinc-400 hover:text-white transition-colors font-bold">Analysis Check</Link>
              <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors border-l border-zinc-700 pl-8 ml-4 font-bold">Market Dashboard</Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </main>

      </body>
    </html>
  );
}