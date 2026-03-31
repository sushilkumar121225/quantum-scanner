// 📊 Global Stats
let totalScans = 0;
let highRiskCount = 0;
let secureCount = 0;

// 🌐 Backend URL
const API_URL = "http://127.0.0.1:5000";

// 🚀 Start Scan (FIXED)
function startScan(event) {
    if (event) event.preventDefault(); // ✅ STOP PAGE RELOAD

    const url = document.getElementById("urlInput").value.trim();

    if (!url) {
        alert("Please enter a valid URL!");
        return;
    }

    document.getElementById("loader").classList.remove("hidden");
    document.getElementById("result").classList.add("hidden");

    setTimeout(() => {
        generateResults(url);
    }, 1500);
}

// 🧠 Generate Results
function generateResults(url) {

    // Show result
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("result").classList.remove("hidden");

    // 🎯 Quantum Score
    let score;
    if (url.includes("http://")) {
        score = 90 + Math.floor(Math.random() * 10);
    } else if (url.includes("badssl")) {
        score = 60 + Math.floor(Math.random() * 15);
    } else {
        score = 20 + Math.floor(Math.random() * 20);
    }

    document.getElementById("score").innerText = score;

    // ⚠️ Risk
    let risk, color;

    if (score >= 80) {
        risk = "HIGH 🔴";
        color = "red";
        highRiskCount++;
    } else if (score >= 50) {
        risk = "MEDIUM 🟡";
        color = "orange";
    } else {
        risk = "LOW 🟢";
        color = "green";
        secureCount++;
    }

    document.getElementById("riskLevel").innerText = risk;

    // 📊 Update stats
    totalScans++;
    document.getElementById("totalScans").innerText = totalScans;
    document.getElementById("highRiskCount").innerText = highRiskCount;
    document.getElementById("secureCount").innerText = secureCount;

    // 📈 Risk Bar
    let bar = document.getElementById("riskBar");
    bar.style.width = score + "%";
    bar.style.background = color;

    // 🔐 Fake Detection
    document.getElementById("tls").innerText = "TLS Version: TLS 1.2";
    document.getElementById("cipher").innerText = "Cipher: RSA-2048";

    // 🚨 Vulnerabilities
    let vulnList = document.getElementById("vulnList");
    vulnList.innerHTML = "";

    let vulnerabilities = score >= 80
        ? ["Weak TLS", "Not quantum-safe", "MITM risk"]
        : score >= 50
        ? ["Moderate encryption", "Upgrade recommended"]
        : ["Secure system", "No major issues"];

    vulnerabilities.forEach(v => {
        let li = document.createElement("li");
        li.innerText = v;
        vulnList.appendChild(li);
    });

    // 💡 Recommendations
    let recList = document.getElementById("recommendations");
    recList.innerHTML = "";

    ["Upgrade TLS 1.3", "Use PQC (Kyber)", "Strong cipher"]
        .forEach(r => {
            let li = document.createElement("li");
            li.innerText = r;
            recList.appendChild(li);
        });

    // 📜 Add to table (no reset)
    addToHistoryTable(url, risk, score);

    // 💾 Save to backend (NO UI RESET)
    fetch(`${API_URL}/save-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, risk, score })
    })
    .then(res => res.json())
    .then(data => console.log("Saved:", data.message))
    .catch(err => console.error("Error:", err));

    // ✨ Scroll to result
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

// ➕ Add row safely (FIXED METHOD)
function addToHistoryTable(url, risk, score) {
    let table = document.getElementById("historyTable");

    let row = document.createElement("tr");

    row.innerHTML = `
        <td>${url}</td>
        <td>${risk}</td>
        <td>${score}</td>
    `;

    table.prepend(row); // ✅ Better than innerHTML
}

// 📜 Load history (ONLY ON PAGE LOAD)
function loadHistory() {
    fetch(`${API_URL}/get-history`)
        .then(res => res.json())
        .then(data => {
            let table = document.getElementById("historyTable");
            table.innerHTML = "";

            totalScans = data.length;
            highRiskCount = 0;
            secureCount = 0;

            data.forEach(item => {
                addToHistoryTable(item.url, item.risk, item.score);

                if (item.risk.includes("HIGH")) highRiskCount++;
                if (item.risk.includes("LOW")) secureCount++;
            });

            document.getElementById("totalScans").innerText = totalScans;
            document.getElementById("highRiskCount").innerText = highRiskCount;
            document.getElementById("secureCount").innerText = secureCount;
        })
        .catch(err => console.error("Error:", err));
}

// 🔄 Load once only
window.onload = loadHistory;