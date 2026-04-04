"use client";

import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

// Register ONLY what a Doughnut chart needs — never register scales here
ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionPieChartProps {
    labels: string[];
    values: number[];
}

export default function DistributionPieChart({
    labels,
    values,
}: DistributionPieChartProps) {
    const safeValues = Array.isArray(values) ? values : Object.values(values as any);
    if (!labels || !safeValues || labels.length === 0 || safeValues.every((v: any) => v === 0)) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                Loading data…
            </div>
        );
    }

    const data = {
        labels,
        datasets: [
            {
                data: safeValues,
                backgroundColor: [
                    "rgba(52, 211, 153, 0.7)",
                    "rgba(96, 165, 250, 0.7)",
                    "rgba(167, 139, 250, 0.7)",
                ],
                borderColor: [
                    "rgba(52, 211, 153, 1)",
                    "rgba(96, 165, 250, 1)",
                    "rgba(167, 139, 250, 1)",
                ],
                borderWidth: 1,
                hoverOffset: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    color: "rgba(161,161,170,1)",
                    font: { size: 10 },
                    padding: 16,
                    usePointStyle: true,
                },
            },
            tooltip: {
                callbacks: {
                    label: (ctx: any) =>
                        ` ${ctx.label}: ₹${Number(ctx.raw).toLocaleString("en-IN")}`,
                },
            },
        },
        cutout: "68%",
    };

    return (
        <div className="w-full h-full min-h-[200px]">
            <Doughnut data={data} options={options} />
        </div>
    );
}
