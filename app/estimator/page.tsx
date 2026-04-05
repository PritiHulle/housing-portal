"use client";

import React from "react";
import { useState } from "react";
import PredictionChart from "../components/PredictionChart";
import { EstimateRecord, PropertyFields } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { predictPropertyPrice } from "../services/api";

const FIELDS = [
    { name: "square_footage", label: "Square Footage", icon: "📏" },
    { name: "bedrooms", label: "Bedrooms", icon: "🛏️" },
    { name: "bathrooms", label: "Bathrooms", icon: "🚿" },
    { name: "year_built", label: "Year Built", icon: "📅" },
    { name: "lot_size", label: "Lot Size", icon: "🌳" },
    { name: "distance_to_city_center", label: "City Distance", icon: "🏙️" },
    { name: "school_rating", label: "School Rating", icon: "🎓" }
];

const FIELD_RULES: Record<string, { min: number, max: number, tooltip: string }> = {
    square_footage: { min: 100, max: 50000, tooltip: "Valid range: 100 to 50,000 sq ft" },
    bedrooms: { min: 0, max: 20, tooltip: "Valid range: 0 to 20 bedrooms" },
    bathrooms: { min: 0, max: 20, tooltip: "Valid range: 0 to 20 bathrooms" },
    year_built: { min: 1800, max: 2026, tooltip: "Valid range: Year 1800 to 2026" },
    lot_size: { min: 0, max: 1000000, tooltip: "Valid range: 0 to 1,000,000 sq ft" },
    distance_to_city_center: { min: 0, max: 200, tooltip: "Valid range: 0 to 200 miles" },
    school_rating: { min: 0, max: 10, tooltip: "Valid range: 0 to 10" }
};

export default function Estimator() {
    const [form, setForm] = useState<PropertyFields>({
        square_footage: "",
        bedrooms: "",
        bathrooms: "",
        year_built: "",
        lot_size: "",
        distance_to_city_center: "",
        school_rating: ""
    });

    const [history, setHistory] = useLocalStorage<EstimateRecord[]>("estimate_history", []);
    const [isLoading, setIsLoading] = useState(false);
    const [showLatestResult, setShowLatestResult] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setShowLatestResult(false);
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
                const isDuplicate = Object.keys(form).every(
                    (k) => (form as any)[k] === (last.details as any)[k]
                );
                if (isDuplicate) {
                    setIsLoading(false);
                    return;
                }
            }

            const data = await predictPropertyPrice(payload);
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
    const latestResult = history.length > 0 ? history[0].result : null;

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("estimate_history");
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 pb-20">

            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3">Property Value Estimator</h1>
                <p className="text-zinc-600 dark:text-zinc-400">Enter the details of a property to get a data-driven market estimate.</p>
            </div>

            <div className="bg-white dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200 dark:border-white/5 rounded-3xl shadow-md dark:shadow-xl p-8 lg:p-10 relative overflow-hidden mb-12">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

                <form onSubmit={handleSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FIELDS.map(({ name, label, icon }) => (
                        <div key={name} className="flex flex-col gap-2">
                            <label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 ml-1">
                                <span className="text-base">{icon}</span>
                                {label}
                            </label>
                            <input
                                id={name}
                                name={name}
                                type="number"
                                step="any"
                                value={form[name as keyof PropertyFields]}
                                onChange={handleChange}
                                placeholder={`e.g. ${name === 'year_built' ? '2015' : '0'}`}
                                required
                                min={FIELD_RULES[name]?.min}
                                max={FIELD_RULES[name]?.max}
                                className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-300 dark:border-white/5 rounded-xl px-4 py-3 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
                            />
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-1">
                                {FIELD_RULES[name]?.tooltip}
                            </p>
                        </div>
                    ))}

                    <div className="md:col-span-2 mt-4">
                        {showLatestResult && history.length > 0 && history[0].result === 0 && (
                            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs flex gap-2 items-center">
                                <span>⚠️</span>
                                <span>Unusual input combination detected. Try adjusting square footage or lot size for a better estimate.</span>
                            </div>
                        )}
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
                        <h3 className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-semibold mb-3 tracking-wide uppercase text-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Latest Estimated Market Value
                        </h3>
                        <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 dark:from-emerald-300 dark:to-emerald-500">
                            ₹ {latestResult.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </h2>
                    </div>
                </div>
            )}

            {/* History & Comparison View */}
            {history.length > 0 && (
                <div className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500 dark:text-indigo-400"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </span>
                            Estimation History
                        </h2>
                        <button onClick={clearHistory} className="text-sm text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                            Clear History
                        </button>
                    </div>

                    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-md dark:shadow-2xl backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-xs font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-200 dark:border-white/10">
                                    <tr>
                                        <th className="px-6 py-5">Date &amp; Time</th>
                                        <th className="px-6 py-5">Sqft</th>
                                        <th className="px-6 py-5">Beds/Baths</th>
                                        <th className="px-6 py-5">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                                    {history.map((record) => (
                                        <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5 text-sm text-zinc-500 dark:text-zinc-400">
                                                {new Date(record.timestamp).toLocaleString('en-IN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                }).toLowerCase()}
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-zinc-700 dark:text-zinc-300">{record.details.square_footage}</td>
                                            <td className="px-6 py-5 text-sm text-zinc-500 dark:text-zinc-400">{record.details.bedrooms} / {record.details.bathrooms}</td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹ {record.result.toLocaleString('en-IN')}</span>
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