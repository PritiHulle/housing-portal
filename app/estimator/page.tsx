"use client";

import React from "react";
const { useState, useEffect } = React;
import PredictionChart from "../components/PredictionChart";

const FIELD_LABELS: Record<string, string> = {
    square_footage: "Square Footage (sq ft)",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    year_built: "Year Built",
    lot_size: "Lot Size (sq ft)",
    distance_to_city_center: "Distance to Center (miles)",
    school_rating: "School Rating (1-10)"
};

const FIELD_RULES: Record<string, { min: number, max: number, tooltip: string }> = {
    square_footage: { min: 100, max: 50000, tooltip: "Valid range: 100 to 50,000 sq ft" },
    bedrooms: { min: 0, max: 20, tooltip: "Valid range: 0 to 20 bedrooms" },
    bathrooms: { min: 0, max: 20, tooltip: "Valid range: 0 to 20 bathrooms" },
    year_built: { min: 1800, max: 2026, tooltip: "Valid range: Year 1800 to 2026" },
    lot_size: { min: 0, max: 1000000, tooltip: "Valid range: 0 to 1,000,000 sq ft" },
    distance_to_city_center: { min: 0, max: 200, tooltip: "Valid range: 0 to 200 miles" },
    school_rating: { min: 0, max: 10, tooltip: "Valid range: 0 to 10" }
};

type EstimateRecord = {
    id: string;
    timestamp: string;
    details: Record<string, string>;
    result: number;
};

export default function Estimator() {
    const [form, setForm] = useState({
        square_footage: "",
        bedrooms: "",
        bathrooms: "",
        year_built: "",
        lot_size: "",
        distance_to_city_center: "",
        school_rating: ""
    });

    // Use history array instead of just a single result. 
    // The latest result is just the last item in the history.
    const [history, setHistory] = useState<EstimateRecord[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("estimate_history");
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }
    }, []);

    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem("estimate_history", JSON.stringify(history));
        }
    }, [history]);

    const [isLoading, setIsLoading] = useState(false);
    const [showLatestResult, setShowLatestResult] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setShowLatestResult(false); // Hide the card if user starts changing values
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = Object.fromEntries(
                Object.entries(form).map(([key, value]) => [key, Number(value) || 0])
            );

            // Check if duplicate of last entry
            if (history.length > 0) {
                const last = history[history.length - 1];
                const isDuplicate = Object.keys(form).every(k => form[k] === last.details[k]);
                if (isDuplicate) {
                    setIsLoading(false);
                    return;
                }
            }

            const res = await fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("API response was not ok");

            const data = await res.json();
            const predictionNum = Math.max(0, Array.isArray(data.prediction) ? data.prediction[0] : (data.prediction || 0));

            // Prepend to history (Top of the list)
            setHistory(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                details: { ...form },
                result: predictionNum
            }, ...prev]);

            setShowLatestResult(true);

        } catch (err) {
            console.error(err);
            alert("Error predicting price. Please check the API.");
        } finally {
            setIsLoading(false);
        }
    };

    // The current active result to show in the big card is the latest one
    // The current active result to show in the big card is the first one in the reversed history
    const latestResult = history.length > 0 ? history[0].result : null;

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("estimate_history");
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 pb-20">

            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">Property Value Estimator</h1>
                <p className="text-zinc-400">Enter the details of a property to get a data-driven market estimate.</p>
            </div>

            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-xl p-8 lg:p-10 relative overflow-hidden mb-12">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(form).map(([key, val]) => (
                        <div key={key} className={key === 'school_rating' ? "md:col-span-2" : ""}>
                            <label htmlFor={key} className="block text-sm font-medium text-zinc-300 mb-2">
                                {FIELD_LABELS[key] || key}
                            </label>
                            <input
                                id={key}
                                name={key}
                                type="number"
                                step="any"
                                value={val}
                                onChange={handleChange}
                                placeholder={`e.g. ${key === 'year_built' ? '2015' : '0'}`}
                                required
                                min={FIELD_RULES[key]?.min}
                                max={FIELD_RULES[key]?.max}
                                title={FIELD_RULES[key]?.tooltip}
                                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                            />
                        </div>
                    ))}

                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transform transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Running Model..." : "Generate Estimate"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Result Card for Latest Prediction - ONLY show if user just generated one */}
            {latestResult !== null && showLatestResult && (
                <div className="mb-12 transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">
                    <div className="relative overflow-hidden bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                        <div className="absolute -top-10 -right-10 p-8 opacity-20 pointer-events-none">
                            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        </div>
                        <h3 className="text-emerald-400 flex items-center gap-2 font-semibold mb-3 tracking-wide uppercase text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Latest Estimated Market Value
                        </h3>
                        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                            ₹ {latestResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h2>
                    </div>
                </div>
            )}

            {/* History & Comparison View */}
            {history.length > 0 && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Estimation History
                        </h2>
                        <button onClick={clearHistory} className="text-sm text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                            Clear History
                        </button>
                    </div>

                    <div className="bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-950/50 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/10">
                                    <tr>
                                        <th className="px-6 py-5">Date & Time</th>
                                        <th className="px-6 py-5">Sqft</th>
                                        <th className="px-6 py-5">Beds/Baths</th>
                                        <th className="px-6 py-5">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5 text-sm text-zinc-400">
                                                {new Date(record.timestamp).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }).toLowerCase()}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-zinc-300">{record.details.square_footage}</td>
                                            <td className="px-6 py-5 text-sm text-zinc-400">{record.details.bedrooms} / {record.details.bathrooms}</td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-emerald-400">₹ {record.result.toLocaleString('en-IN')}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}