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
    clientId: "26729c0b-e5ed-489d-a639-886e993c2193"
};

/* ============================
   AUTH HEADER
============================ */

function getAuthHeader() {
    const raw = `${cwConfig.company}+${cwConfig.publicKey}:${cwConfig.privateKey}`;
    return "Basic " + Buffer.from(raw).toString("base64");
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

        const response = await fetch(
            `${cwConfig.url}/v4_6_release/apis/3.0/service/tickets?pageSize=100&orderBy=id desc&fields=id,summary,status,priority,company,board,owner,closedDate,dateEntered`,
            {
                method: "GET",
                headers: {
                    "Authorization": getAuthHeader(),
                    "clientId": cwConfig.clientId,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                error: "ConnectWise API Error",
                details: data
            });
        }

        res.json(data);

    } catch (error) {
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