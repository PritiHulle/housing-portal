"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PredictionChartProps {
    results: number[];
    labels?: string[];
}

export default function PredictionChart({
    results,
    labels = [],
}: PredictionChartProps) {
    if (!results || results.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                Loading data…
            </div>
        );
    }

    const chartLabels =
        labels.length > 0 ? labels : results.map((_, i) => `Point ${i + 1}`);

    const data = {
        labels: chartLabels,
        datasets: [
            {
                label: "Market Value (₹)",
                data: results,
                backgroundColor: "rgba(52, 211, 153, 0.45)",
                borderColor: "rgba(52, 211, 153, 1)",
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: "rgba(52, 211, 153, 0.65)",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "rgba(24,24,27,0.95)",
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: (ctx: any) =>
                        ` ₹${Number(ctx.raw).toLocaleString("en-IN")}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: "rgba(161,161,170,0.8)", font: { size: 11 } },
            },
            y: {
                grid: { color: "rgba(255,255,255,0.05)" },
                ticks: { color: "rgba(161,161,170,0.8)", font: { size: 11 } },
            },
        },
    };

    return (
        <div className="w-full min-h-[250px] h-full">
            <Bar data={data} options={options} />
        </div>
    );
}
