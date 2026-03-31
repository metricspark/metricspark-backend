const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

/* ================= CONFIG ================= */

const cwConfig = {
    url: "https://api-na.myconnectwise.net",
    company: "YOUR_COMPANY",
    publicKey: "YOUR_PUBLIC_KEY",
    privateKey: "YOUR_PRIVATE_KEY",
    clientId: "YOUR_CLIENT_ID"
};

const TOKEN = "metricspark123";

/* ================= AUTH ================= */

function getAuthHeader() {
    const raw = `${cwConfig.company}+${cwConfig.publicKey}:${cwConfig.privateKey}`;
    return "Basic " + Buffer.from(raw).toString("base64");
}

app.use((req, res, next) => {
    if (req.path === "/") return next();

    if (req.headers.authorization !== `Bearer ${TOKEN}`) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    next();
});

/* ================= TEST ================= */

app.get("/", (req, res) => {
    res.send("🚀 Backend Running");
});

/* ================= TICKETS API ================= */

app.get("/tickets", async (req, res) => {
    try {
        let allTickets = [];
        let page = 1;

        while (true) {
            const response = await fetch(
                `${cwConfig.url}/v4_6_release/apis/3.0/service/tickets?page=${page}&pageSize=100&conditions=status/name!="Closed"`,
                {
                    headers: {
                        Authorization: getAuthHeader(),
                        clientId: cwConfig.clientId,
                        Accept: "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!data || data.length === 0) break;

            allTickets.push(...data);
            page++;
        }

        const boardMap = {};
        const ownerMap = {};

        const tickets = allTickets.map(t => {

            const board = t.board?.name || "Unknown";

            let owner = "Unassigned";
            if (t.resources?.length) {
                owner = t.resources.map(r => r.name).join(", ");
            }

            boardMap[board] = (boardMap[board] || 0) + 1;

            owner.split(", ").forEach(o => {
                ownerMap[o] = (ownerMap[o] || 0) + 1;
            });

            return {
                id: t.id,
                summary: t.summary,
                status: t.status?.name,
                priority: t.priority?.name,
                board,
                owner,
                age: Math.floor((new Date() - new Date(t.dateEntered)) / 86400000)
            };
        });

        res.json({
            boards: Object.entries(boardMap).map(([name,count])=>({name,count})),
            owners: Object.entries(ownerMap).map(([name,count])=>({name,count})),
            tickets
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ConnectWise fetch failed" });
    }
});

/* ================= START ================= */

app.listen(5000, () => console.log("🚀 Server running on port 5000"));