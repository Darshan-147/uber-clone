const http = require("http");
const app = require("./app.js");
const {initializeSocket} = require("./socket.js");
const port = Number(process.env.PORT || 4000);

let server = http.createServer(app);

const startServer = () => {
  server.listen(port, () => {
    const address = server.address();
    console.log(`Server is running on http://localhost:${address.port}`);
  });
};

server.on("error", (err) => {
  console.error("Server failed to start", { message: err.message });
  process.exitCode = 1;
});

// Initialize socket.io
initializeSocket(server);

// Start the server
startServer();

function shutdown(signal) {
  console.log(`${signal} received; closing server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
