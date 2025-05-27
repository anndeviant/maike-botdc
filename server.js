require("dotenv").config();
const http = require("http");
const axios = require("axios");

function createHealthServer(client) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "healthy",
          bot: client.user ? client.user.tag : "not ready",
          uptime: process.uptime(),
          lastPing: new Date().toISOString(),
        })
      );
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  const PORT = process.env.PORT;
  server.listen(PORT, () => {
    console.log(`🌐 HTTP server running on port ${PORT}`);

    // Start self-ping setelah server siap
    startSelfPing();
  });

  return server;
}

function startSelfPing() {
  const SELF_URL = process.env.CLOUD_RUN_URL;

  // Ping pertama setelah 1 menit
  setTimeout(async () => {
    await performPing(SELF_URL);

    // Lalu ping setiap 270 detik
    setInterval(() => performPing(SELF_URL), 270000);
  }, 60000);

  console.log("🔄 Self-ping service initialized");
}

async function performPing(url) {
  try {
    const response = await axios.get(url, {
      timeout: 25000,
      headers: {
        "User-Agent": "Self-Ping-Service/1.0",
      },
    });
    console.log(
      `🔄 Self-ping OK: ${response.status} | Uptime: ${Math.floor(
        process.uptime()
      )}s`
    );
  } catch (error) {
    console.error(`❌ Self-ping failed: ${error.message}`);
  }
}

module.exports = { createHealthServer };
