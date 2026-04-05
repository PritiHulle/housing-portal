export async function predictPropertyPrice(data: any) {
    const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Prediction API failed");
    }

    return await res.json();
}
