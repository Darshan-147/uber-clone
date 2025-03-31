const http = require("http");
const app = require("./app.js");
const {initializeSocket} = require("./socket.js");
const port = process.env.PORT || 3000;

let server = http.createServer(app);

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
      server = http.createServer(app);
      server.listen(0);
      console.log(`Server is running on http://localhost:${server.address().port}`);
    });
  } else {
    throw err;
  }
});

// Initialize socket.io
initializeSocket(server);

// Start the server
startServer(port);