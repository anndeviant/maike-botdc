const http = require("http");

function createHealthServer(client) {
  const server = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "healthy",
          bot: client.user ? client.user.tag : "not ready",
          uptime: process.uptime(),
        })
      );
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🌐 HTTP server running on port ${PORT}`);
  });

  return server;
}

module.exports = { createHealthServer };
