"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const BASE_URL = "/api/market";
const PredictionChart = dynamic(() => import("../components/PredictionChart"), { ssr: false });
const DistributionPieChart = dynamic(() => import("../components/DistributionPieChart"), { ssr: false });

export default function MarketDashboard() {
    const [filter, setFilter] = useState("all");
    const [minYear, setMinYear] = useState("");
    const [maxYear, setMaxYear] = useState("");

    const [stats, setStats] = useState({
        totalProperties: 0,
        avgPrice: 0,
        avgSqft: 0,
        topSegment: "Connecting..."
    });

    const [distribution, setDistribution] = useState({
        labels: ["Starter", "Mid-Tier", "Luxury"],
        values: [0, 0, 0]
    });

    const [showSimulator, setShowSimulator] = useState(false);
    const [simulationParams, setSimulationParams] = useState({
        square_footage: "2000",
        bedrooms: "3",
        bathrooms: "2",
        year_built: "2010",
        lot_size: "5000",
        distance_to_city_center: "5",
        school_rating: "8"
    });
    const [simulationResult, setSimulationResult] = useState<number | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleRunSimulation = async () => {
        // Validation: Ensure all fields are mandatory
        const isInvalid = Object.values(simulationParams).some(val => val === "");
        if (isInvalid) {
            alert("All fields are mandatory. Please fill in all values.");
            return;
        }

        setIsSimulating(true);
        try {
            // Convert to numbers for the API
            const payload = {
                square_footage: Number(simulationParams.square_footage),
                bedrooms: Number(simulationParams.bedrooms),
                bathrooms: Number(simulationParams.bathrooms),
                year_built: Number(simulationParams.year_built),
                lot_size: Number(simulationParams.lot_size),
                distance_to_city_center: Number(simulationParams.distance_to_city_center),
                school_rating: Number(simulationParams.school_rating)
            };

            const res = await fetch(`${BASE_URL}/what-if`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            setSimulationResult(data.projectedValue);
        } catch (err) {
            console.error("Simulation failed:", err);
        } finally {
            setIsSimulating(false);
        }
    };

    const fetchDashboardData = () => {
        let qs = `?segment=${filter}`;
        if (minYear) qs += `&minYear=${minYear}`;
        if (maxYear) qs += `&maxYear=${maxYear}`;

        fetch(`${BASE_URL}/stats${qs}`)
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to connect to Java backend:", err));

        fetch(`${BASE_URL}/distribution`)
            .then(res => res.json())
            .then(data => {
                // Backend returns { values: number[], labels: string[] }
                const vals: number[] = Array.isArray(data) ? data : (data.values ?? Object.values(data));
                const lbls: string[] = data.labels ?? ["Starter", "Mid-Tier", "Luxury"];
                setDistribution({ labels: lbls, values: vals });
            })
            .catch(err => console.error("Failed to fetch distribution:", err));
    };

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApplyFilters = () => {
        fetchDashboardData();
    };

    const handleExportCSV = () => {
        const now = new Date().toLocaleString("en-IN");
        const activeFilter = filter === "all" ? "All Markets" : filter;

        // Section 1: Market Overview Summary
        const summaryRows = [
            ["NEXTHOUSE — MARKET ANALYSIS EXPORT"],
            [`Generated At: ${now}`],
            [`Active Filter: ${activeFilter}`],
            [],
            ["MARKET OVERVIEW"],
            ["Metric", "Value"],
            ["Total Properties Analyzed", stats.totalProperties],
            ["Average Market Value (Rs)", stats.avgPrice],
            ["Average Square Footage (sqft)", stats.avgSqft],
            ["Top Market Segment", stats.topSegment],
            [],
            ["SEGMENT PRICE DISTRIBUTION"],
            ["Segment", "Average Price (Rs)"],
            ...distribution.labels.map((lbl, i) => [
                lbl,
                Number(distribution.values[i] ?? 0).toFixed(2),
            ]),
        ];

        const csvContent = "\uFEFF" + summaryRows
            .map(row => row.map(cell => `"${cell}"`).join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `NextHouse_Market_Export_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    const handleDownloadPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();

        const pageW = doc.internal.pageSize.getWidth();
        const now = new Date().toLocaleDateString("en-IN", {
            day: "2-digit", month: "long", year: "numeric"
        });

        // ── Header ──────────────────────────────────────────
        doc.setFillColor(30, 30, 46);
        doc.rect(0, 0, pageW, 30, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("NextHouse — Market Analysis Report", 14, 18);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(180, 180, 200);
        doc.text(`Generated: ${now}`, pageW - 14, 18, { align: "right" });

        // ── KPI Section ──────────────────────────────────────
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Market Overview", 14, 44);

        const kpis = [
            ["Total Properties Analyzed", stats.totalProperties.toString()],
            ["Average Market Value", `Rs ${stats.avgPrice.toLocaleString("en-IN")}`],
            ["Average Square Footage", `${stats.avgSqft.toLocaleString("en-IN")} sqft`],
            ["Top Market Segment", stats.topSegment],
            ["Active Filter", filter === "all" ? "All Markets" : filter],
        ];

        let y = 52;
        doc.setFontSize(10);
        kpis.forEach(([label, value], i) => {
            const bg = i % 2 === 0 ? [245, 247, 250] : [255, 255, 255];
            doc.setFillColor(bg[0], bg[1], bg[2]);
            doc.rect(14, y - 5, pageW - 28, 10, "F");
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 100);
            doc.text(label, 18, y + 1);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 46);
            doc.text(value, pageW - 18, y + 1, { align: "right" });
            y += 11;
        });

        // ── Segment Distribution ─────────────────────────────
        y += 10;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text("Segment Price Distribution", 14, y);
        y += 8;

        const segments = distribution.labels.map((lbl, i) => [
            lbl,
            `Rs ${Number(distribution.values[i] ?? 0).toLocaleString("en-IN")}`,
        ]);

        segments.forEach(([seg, val], i) => {
            const bg = i % 2 === 0 ? [240, 253, 244] : [255, 255, 255];
            doc.setFillColor(bg[0], bg[1], bg[2]);
            doc.rect(14, y - 5, pageW - 28, 10, "F");
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 80, 60);
            doc.text(seg, 18, y + 1);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 46);
            doc.text(val, pageW - 18, y + 1, { align: "right" });
            y += 11;
        });

        // ── Footer ───────────────────────────────────────────
        doc.setDrawColor(200, 200, 220);
        doc.line(14, 280, pageW - 14, 280);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 170);
        doc.text("Powered by NextHouse Analytics — Java 21 + Python ML Engine", 14, 286);
        doc.text("Page 1 of 1", pageW - 14, 286, { align: "right" });

        doc.save(`NextHouse_Market_Report_${now.replace(/ /g, "_")}.pdf`);
    };


    return (
        <div className="max-w-7xl mx-auto mt-8 pb-20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 mb-2">
                        Market Analysis Dashboard
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">Comprehensive property market statistics &amp; trends (Powered by Java 21).</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExportCSV} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-white/10 rounded-xl text-sm font-medium text-zinc-800 dark:text-white shadow-sm transition-all flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
                        Export CSV
                    </button>
                    <button onClick={handleDownloadPDF} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>
                        Download PDF
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-sm dark:shadow-none">
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Analyzed</h3>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-white">{stats.totalProperties.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-sm dark:shadow-none">
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Avg Market Value</h3>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">₹ {stats.avgPrice.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-sm dark:shadow-none">
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Avg Square Footage</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.avgSqft.toLocaleString('en-IN')} sqft</p>
                </div>
                <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl backdrop-blur-xl shadow-sm dark:shadow-none">
                    <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-2">Top Segment</h3>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.topSegment}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Filters Sidebar */}
                <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-3xl p-6 backdrop-blur-xl h-fit shadow-sm dark:shadow-none">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        Market Filters
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Property Segment</label>
                            <select
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Markets</option>
                                <option value="luxury">Luxury (&gt; ₹3L)</option>
                                <option value="mid">Mid-Tier (₹2L - ₹3L)</option>
                                <option value="starter">Starter (&lt; ₹2L)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Year Built Range</label>
                            <div className="flex items-center gap-3">
                                <input type="number" min="1800" max="2026" placeholder="Min" value={minYear} onChange={(e) => setMinYear(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                <span className="text-zinc-400">-</span>
                                <input type="number" min="1800" max="2026" placeholder="Max" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>

                        <button onClick={handleApplyFilters} className="w-full py-3 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-white rounded-xl font-medium transition-colors border border-zinc-300 dark:border-white/10 mt-4">
                            Apply Filters
                        </button>
                    </div>

                    {/* Filling the space below filters */}
                    <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-white/5 animate-in fade-in duration-1000">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">Market Share Insights</h4>
                        <div className="bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl p-4 border border-zinc-200 dark:border-white/5 aspect-square relative group">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <DistributionPieChart labels={distribution.labels} values={distribution.values} />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-tighter">Segment<br />Mix</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Visualizations Representation */}
                    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-3xl p-8 shadow-sm dark:shadow-xl backdrop-blur-xl overflow-hidden">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Average Price by Segment</h3>
                        <div className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-white/5 p-4 pl-0">
                            <div className="w-full max-w-2xl">
                                <PredictionChart results={distribution.values} labels={distribution.labels} />
                            </div>
                        </div>
                    </div>

                    {/* What-If Tool Preview */}
                    <div className="bg-gradient-to-br from-indigo-50 dark:from-indigo-900/40 to-purple-50 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/20 rounded-3xl p-8 shadow-sm dark:shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-indigo-500 inline-block animate-pulse"></span>
                            &ldquo;What-If&rdquo; Analysis Engine
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed max-w-xl">
                            Simulate broader market changes using our <strong>Python ML Engine</strong>.
                            Explore how adjustments in property features affect projected values in real-time. How would a different build year or school rating shift the price?
                        </p>
                        <button
                            onClick={() => setShowSimulator(true)}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                            Launch Simulator
                        </button>
                    </div>
                </div>
            </div>

            {/* Simulator Modal */}
            {showSimulator && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />

                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Market Simulator</h2>
                            <button onClick={() => setShowSimulator(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Sqft</label>
                                <input type="number" required value={simulationParams.square_footage} onChange={e => setSimulationParams({ ...simulationParams, square_footage: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bedrooms</label>
                                <input type="number" required value={simulationParams.bedrooms} onChange={e => setSimulationParams({ ...simulationParams, bedrooms: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Bathrooms</label>
                                <input type="number" required value={simulationParams.bathrooms} onChange={e => setSimulationParams({ ...simulationParams, bathrooms: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Year Built</label>
                                <input type="number" required value={simulationParams.year_built} onChange={e => setSimulationParams({ ...simulationParams, year_built: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Lot Size</label>
                                <input type="number" required value={simulationParams.lot_size} onChange={e => setSimulationParams({ ...simulationParams, lot_size: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Dist to Center</label>
                                <input type="number" required value={simulationParams.distance_to_city_center} onChange={e => setSimulationParams({ ...simulationParams, distance_to_city_center: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">School Rating</label>
                                <input type="number" required step="0.1" value={simulationParams.school_rating} onChange={e => setSimulationParams({ ...simulationParams, school_rating: e.target.value })} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl px-4 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={handleRunSimulation}
                                disabled={isSimulating}
                                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${isSimulating ? 'bg-zinc-300 dark:bg-zinc-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(79,70,229,0.4)]'}`}
                            >
                                {isSimulating ? "Running ML Simulation..." : "Execute Simulation"}
                            </button>

                            {simulationResult !== null && (
                                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">Simulated Market Value</p>
                                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white">₹ {simulationResult.toLocaleString('en-IN')}</h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
