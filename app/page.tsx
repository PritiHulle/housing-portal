import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center transition-all duration-700">

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-16 mt-8">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 drop-shadow-sm">
          Smarter Property Valuation
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
          NextHouse is an advanced, data-driven real estate platform. We leverage predictive modeling to give you instant market estimates and comparative batch analysis for properties.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/estimator" className="px-8 py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1">
            Get an Estimate
          </Link>
          <Link href="/analysis" className="px-8 py-4 rounded-xl font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all hover:-translate-y-1">
            Batch Analysis
          </Link>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 w-full">

        {/* Card 1: Estimator */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-xl hover:shadow-indigo-500/10 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>

          <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Property Estimator</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Need to know how much a specific house is worth? Enter details like square footage, bedrooms, and location to instantly get a machine-learning powered market estimate.
          </p>

          <Link href="/estimator" className="inline-flex items-center gap-2 text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">
            Try Estimator
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>

        {/* Card 2: Analysis */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-xl hover:shadow-emerald-500/10 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>

          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="9" x2="9" y1="21" y2="9" /></svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Batch Analysis</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Comparing multiple properties?
            Our batch analysis tool lets you input several listings in a spreadsheet-like format to evaluate and compare multiple estimated values side-by-side.
          </p>

          <Link href="/analysis" className="inline-flex items-center gap-2 text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
            Start Analysis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>

      </div>
    </div>
  );
}
