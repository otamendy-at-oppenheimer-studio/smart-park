const API_URL = "http://localhost:8000";

async function fetchData() {
    try {
        const res = await fetch(`${API_URL}/parking/state`);
        const data = await res.json();
        renderSummary(data);
        renderSpots(data.spots);
    } catch (err) {
        document.getElementById("summary").textContent = "Error conectando al servidor.";
    }
}

function renderSummary(data) {
    const occupied = Object.values(data.spots).filter(s => s.occupied).length;
    const total = Object.keys(data.spots).length;
    const free = total - occupied;
    const datetime = data.datetime ? new Date(data.datetime).toLocaleString() : "N/D";

    document.getElementById("summary").innerHTML = `
        <strong>Total:</strong> ${total} |
        <strong>Ocupados:</strong> ${occupied} |
        <strong>Libres:</strong> ${free} <br>
        <small>Última actualización: ${datetime}</small>
    `;
}

function renderSpots(spots) {
    const container = document.getElementById("spots");
    container.innerHTML = "";

    Object.values(spots).forEach(s => {
        const div = document.createElement("div");
        div.className = `spot ${s.occupied ? "occupied" : "free"}`;
        div.innerHTML = `
            <span>Plaza #${s.id}</span>
            <span>${s.occupied ? "🅿️ Ocupado" : "✅ Libre"}</span>
            <small>${s.vehicle_class || ""}</small>
        `;
        container.appendChild(div);
    });
}

document.getElementById("refreshBtn").addEventListener("click", fetchData);
setInterval(fetchData, 5000);
fetchData();
