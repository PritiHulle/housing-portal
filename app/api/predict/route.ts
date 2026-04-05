import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Audit Fix: Simulated Internal Auth
        // Only allow requests with our internal service header
        const appService = request.headers.get("X-App-Service");
        if (appService !== "housing-portal-client") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
        }

        const body = await request.json();

        // Call the original Render API from the server side (bypasses CORS)
        const res = await fetch("https://housing-api-n7yg.onrender.com/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorData = await res.json();
            return NextResponse.json(errorData, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 });
    }
}
