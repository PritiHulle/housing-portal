import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
    const path = (await params).path.join("/");
    const { searchParams } = new URL(request.url);
    const targetUrl = `https://market-backend-fb2j.onrender.com/api/market/${path}?${searchParams.toString()}`;

    try {
        const res = await fetch(targetUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Backend error" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Market Proxy GET error:", error);
        return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { path: string[] } }) {
    const path = (await params).path.join("/");
    const body = await request.json();
    const targetUrl = `https://market-backend-fb2j.onrender.com/api/market/${path}`;

    try {
        const res = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Backend error" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Market Proxy POST error:", error);
        return NextResponse.json({ error: "Failed to run market simulation" }, { status: 500 });
    }
}
