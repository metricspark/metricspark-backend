const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ============================
   CONFIG
============================ */

const cwConfig = {
    url: "https://cw.milnertechnologyservices.net",
    company: "milner",
    publicKey: "HESgPN5Lx1rzYk93".trim(),
    privateKey: "7q8WB6pQTSPq5uQe".trim(),
    clientId: "26729c0b-e5ed-489d-a639-886e993c2193"
};

const API_TOKEN = "metricspark123";

/* ============================
   AUTH
============================ */

function getAuthHeader() {
    const raw = `${cwConfig.company}+${cwConfig.publicKey}:${cwConfig.privateKey}`;
    return "Basic " + Buffer.from(raw).toString("base64");
}

app.use((req, res, next) => {
    if (req.path === "/") return next();

    const token = req.headers.authorization;

    if (!token || token !== `Bearer ${API_TOKEN}`) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    next();
});

/* ============================
   TEST
============================ */

app.get("/", (req, res) => {
    res.send("🚀 Backend Running");
});

/* ============================
   HELPER
============================ */

function getTicketAge(dateEntered) {
    if (!dateEntered) return "N/A";
    const created = new Date(dateEntered);
    const now = new Date();
    const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return `${diff} days`;
}

/* ============================
   MAIN API
============================ */

app.get("/tickets", async (req, res) => {
    try {
        let allTickets = [];
        let page = 1;

        while (true) {
            console.log("Fetching page:", page);

            const response = await fetch(
                `${cwConfig.url}/v4_6_release/apis/3.0/service/tickets?page=${page}&pageSize=100&conditions=status/name!="Closed"&fields=id,summary,status,priority,company,board,resources,owner,dateEntered`,
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

        /* ===== FILTER BOARDS ===== */

        const allowedBoards = [
            "HelpDesk IT",
            "Triage",
            "Backups",
            "Command Alerts",
            "AutoElevate",
            "Auvik",
            "Ninja RMM"
        ];

        const boardMap = {};
        const ownerMap = {};

        const tickets = allTickets
            .filter(t => {
                const boardName = (t.board?.name || "").toLowerCase();
                return allowedBoards.some(b =>
                    boardName.includes(b.toLowerCase())
                );
            })
            .map(t => {
                const board = t.board?.name || "Unknown";

                let owner = "Unassigned";

                if (Array.isArray(t.resources) && t.resources.length > 0) {
                    owner = t.resources.map(r => r.name).join(", ");
                } else if (t.owner && t.owner.name) {
                    owner = t.owner.name;
                }

                boardMap[board] = (boardMap[board] || 0) + 1;

                owner.split(", ").forEach(o => {
                    ownerMap[o] = (ownerMap[o] || 0) + 1;
                });

                return {
                    id: t.id,
                    summary: t.summary,
                    status: t.status?.name || "N/A",
                    priority: t.priority?.name || "N/A",
                    company: t.company?.name || "N/A",
                    board,
                    owner,
                    age: getTicketAge(t.dateEntered)
                };
            });

        const boards = Object.entries(boardMap).map(([name, count]) => ({ name, count }));
        const owners = Object.entries(ownerMap).map(([name, count]) => ({ name, count }));

        res.json({ boards, owners, tickets });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

/* ============================
   START
============================ */

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});