const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

/* ============================
   CONNECTWISE CONFIG
============================ */

const cwConfig = {
    url: "https://cw.milnertechnologyservices.net",
    company: "milner",
    publicKey: "HESgPN5Lx1rzYk93".trim(),
    privateKey: "7q8WB6pQTSPq5uQe".trim(),
    clientId: "milner"
};

/* ============================
   AUTH HEADER
============================ */

function getAuthHeader() {
    const raw = `${cwConfig.company}+${cwConfig.publicKey}:${cwConfig.privateKey}`;
    const auth = Buffer.from(raw).toString("base64");

    console.log("🔐 Auth generated"); // debug safe log

    return `Basic ${auth}`;
}

/* ============================
   TEST ROUTE
============================ */

app.get("/", (req, res) => {
    res.send("🚀 MetricSpark Backend Running");
});

/* ============================
   TICKETS ROUTE
============================ */

app.get("/tickets", async (req, res) => {
    try {

        console.log("📡 Fetching tickets from ConnectWise...");

        const response = await fetch(
            `${cwConfig.url}/v4_6_release/apis/3.0/service/tickets?pageSize=25&orderBy=id desc`,
            {
                method: "GET",
                headers: {
                    "Authorization": getAuthHeader(),
                    "clientId": cwConfig.clientId,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        console.log("✅ Response received");

        if (!response.ok) {
            console.error("❌ ConnectWise Error:", data);
            return res.status(response.status).json({
                error: "ConnectWise API Error",
                details: data
            });
        }

        res.json(data);

    } catch (error) {

        console.error("🔥 SERVER ERROR:", error);

        res.status(500).json({
            error: "Server Error",
            message: error.message
        });

    }
});

/* ============================
   START SERVER
============================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});