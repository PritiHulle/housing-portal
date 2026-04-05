export async function predictPropertyPrice(data: any) {
    // Audit Fix: Sanitization Loophole
    // Ensure nested data is strictly numeric before sending to Python backend
    const sanitizedData = data.data
        ? { data: data.data.map((item: any) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, Number(v) || 0]))) }
        : Object.fromEntries(Object.entries(data).map(([k, v]) => [k, Number(v) || 0]));

    const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-App-Service": "housing-portal-client" // Audit Fix: Simulated Internal Auth
        },
        body: JSON.stringify(sanitizedData),
    });

    if (!res.ok) {
        throw new Error(res.status === 500 ? "Service Cold Start" : "Prediction API failed");
    }

    return await res.json();
}

/**
 * Audit Fix: Centralized Market Data Service
 * Ensures all dashboard calls use consistent security headers
 */
const COMMON_HEADERS = {
    "Content-Type": "application/json",
    "X-App-Service": "housing-portal-client"
};

export async function fetchMarketStats(queryString: string = "") {
    const res = await fetch(`/api/market/stats${queryString}`, {
        headers: COMMON_HEADERS
    });
    if (!res.ok) throw new Error("Market Stats Failed");
    return await res.json();
}

export async function fetchMarketDistribution() {
    const res = await fetch(`/api/market/distribution`, {
        headers: COMMON_HEADERS
    });
    if (!res.ok) throw new Error("Distribution Failed");
    return await res.json();
}

export async function runMarketSimulation(payload: any) {
    const res = await fetch(`/api/market/what-if`, {
        method: "POST",
        headers: COMMON_HEADERS,
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Simulation Failed");
    return await res.json();
}

export async function fetchRawMarketData(queryParams: string = "") {
    const res = await fetch(`/api/market/data?${queryParams}`, {
        headers: COMMON_HEADERS
    });
    if (!res.ok) throw new Error("Data Fetch Failed");
    return await res.json();
}
