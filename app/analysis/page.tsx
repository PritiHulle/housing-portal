"use client";

import { useState } from "react";
import PredictionChart from "../components/PredictionChart";
import { AnalysisRecord } from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { predictPropertyPrice } from "../services/api";

const FIELDS = [
    { name: "square_footage", label: "Sqft", min: 100, max: 50000, tooltip: "100-50,000 sq ft" },
    { name: "bedrooms", label: "Beds", min: 0, max: 20, tooltip: "0-20 beds" },
    { name: "bathrooms", label: "Baths", min: 0, max: 20, tooltip: "0-20 baths" },
    { name: "year_built", label: "Year", min: 1800, max: 2026, tooltip: "1800-2026" },
    { name: "lot_size", label: "Lot", min: 0, max: 1000000, tooltip: "0-1M sq ft" },
    { name: "distance_to_city_center", label: "Dist", min: 0, max: 200, tooltip: "0-200 miles" },
    { name: "school_rating", label: "Rating", min: 0, max: 10, tooltip: "Rating 0-10" }
] as const;

export default function AnalysisPage() {
    const [rows, setRows] = useState<Record<string, string>[]>([
        Object.fromEntries(FIELDS.map(f => [f.name, ""]))
    ]);
    const [results, setResults] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useLocalStorage<AnalysisRecord[]>("analysis_history", []);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [e.target.name]: e.target.value };
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, Object.fromEntries(FIELDS.map(f => [f.name, ""]))]);
    };

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        setRows(rows.filter((_, i) => i !== index));
        if (results.length > index) {
            setResults(results.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const formatted = rows
                .filter(r => r.square_footage !== "")
                .map(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Number(v) || 0])));

            if (formatted.length === 0) {
                alert("Please fill in at least one row with square footage.");
                setIsLoading(false);
                return;
            }

            const data = await predictPropertyPrice({ data: formatted });
            const predictions = data.predictions.map((p: number) => Math.max(0, p));
            setResults(predictions);

            // Save to history
            const avg = predictions.length > 0
                ? predictions.reduce((a: number, b: number) => a + b, 0) / predictions.length
                : 0;

            setHistory(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                propertyCount: predictions.length,
                avgValue: avg,
                results: predictions,
                rows: [...rows]
            }, ...prev]);
        } catch (err) {
            console.error(err);
            alert("Error calling batch prediction API.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">Batch Property Analysis</h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm">Analyze multiple properties simultaneously to compare values.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={addRow}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl border border-zinc-300 dark:border-white/5 transition-all text-sm font-medium shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        Add Property
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all text-sm font-medium active:scale-95 disabled:opacity-50 whitespace-nowrap"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 30" strokeLinecap="round" className="opacity-25"></circle><path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-2A8 8 0 0 0 12 4z"></path></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
                        )}
                        Run Analysis
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-md dark:shadow-xl overflow-hidden backdrop-blur-xl mb-8 overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-8 gap-4 p-5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/40 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        {FIELDS.map(f => (
                            <div key={f.name}>
                                <div>{f.label}</div>
                                <div className="text-[8px] font-normal opacity-70 mt-0.5 lowercase">{f.tooltip}</div>
                            </div>
                        ))}
                        <div className="text-right">Actions</div>
                    </div>

                    {/* Rows */}
                    <div className="p-5 flex flex-col gap-4">
                        {rows.map((row, index) => (
                            <div key={index} className="grid grid-cols-8 gap-4 items-center transition-all duration-300">
                                {FIELDS.map(field => (
                                    <input
                                        key={field.name}
                                        name={field.name}
                                        type="number"
                                        step="any"
                                        value={row[field.name]}
                                        placeholder="0"
                                        onChange={(e) => handleChange(index, e)}
                                        min={field.min}
                                        max={field.max}
                                        title={field.tooltip}
                                        required
                                        className="w-full bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-300 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                                    />
                                ))}
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => removeRow(index)}
                                        disabled={rows.length === 1}
                                        className="p-2 text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-500/20 dark:hover:text-red-400 dark:hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed group border border-red-500/20"
                                        title="Remove Row"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {results.length > 0 && (
                <div className="transition-all duration-500">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                        <span className="w-2 h-6 rounded bg-emerald-500 inline-block animate-pulse"></span>
                        Analysis Results
                    </h3>

                    {results.some(r => r === 0) && (
                        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400 text-sm flex gap-3 items-center shadow-sm">
                            <span className="text-xl">⚠️</span>
                            <div>
                                <p className="font-bold">Anomalous Predictions Detected</p>
                                <p className="opacity-90">One or more properties returned a ₹ 0 value. This usually happens when inputs (like Lot Size or Sqft) are significantly outside normal market ranges. Try using values closer to the suggested limits below.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {results.map((val, i) => (
                            <div key={i} className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-5 shadow-md dark:shadow-lg isolate overflow-hidden relative group hover:border-emerald-500/40 transition-colors">
                                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                                <div className="text-zinc-500 dark:text-zinc-400 text-xs font-medium mb-1 uppercase tracking-wider relative z-10">Property {i + 1}</div>
                                <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 relative z-10">
                                    ₹ {val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 shadow-md dark:shadow-xl backdrop-blur-xl mb-12">
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Comparative Estimate Chart</h4>
                        <PredictionChart results={results} />
                    </div>
                </div>
            )}

            {/* Analysis History */}
            {history.length > 0 && (
                <div className="mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                            <span className="w-2 h-6 rounded bg-blue-500 inline-block"></span>
                            Recent Analyses
                        </h3>
                        <button
                            onClick={() => {
                                if (confirm("Clear all batch analysis history?")) {
                                    setHistory([]);
                                    localStorage.removeItem("analysis_history");
                                }
                            }}
                            className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            Clear History
                        </button>
                    </div>

                    <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold border-b border-zinc-200 dark:border-white/5">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Properties</th>
                                    <th className="px-6 py-4">Avg Estimated Value</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
                                {history.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20">
                                                {item.propertyCount} Units
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                ₹ {item.avgValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setRows(item.rows);
                                                    setResults(item.results);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-zinc-950 transition-all active:scale-95 shadow-sm transform-gpu"
                                            >
                                                Restore Analysis
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}