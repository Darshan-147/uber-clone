const http = require("http");
const app = require("./app.js");
const { initializeSocket } = require("./socket.js");
const port = process.env.PORT || 3000;

const createServer = () => {
  const httpServer = http.createServer(app);
  initializeSocket(httpServer);
  return httpServer;
};

let server = createServer();

const startServer = (port) => {
  server.listen(port, () => {
    const address = server.address();
    console.log(`Server is running on http://localhost:${address.port}`);
  });
};

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${port} is already in use, trying another port...`);
    server.close(() => {
      server = createServer();
      server.listen(0, () => {
        console.log(
          `Server is running on http://localhost:${server.address().port}`,
        );
      });
    });
  } else {
    throw err;
  }
});

// Start the server
startServer(port);
