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
