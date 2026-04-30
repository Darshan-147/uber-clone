const socketIO = require("socket.io");
const userModel = require("./models/user.model");
const driverModel = require("./models/driver.model");

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      if (userType === "user") {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        console.log(`User ${userId} joined with socket ID: ${socket.id}`);
      } else if (userType === "driver") {
        await driverModel.findByIdAndUpdate(userId, { socketId: socket.id });
        console.log(`Driver ${userId} joined with socket ID: ${socket.id}`);
      }
    });

    socket.on("update-driver-location", async (data) => {
      const { userId, location } = data;

      if (!location || !location.lat || !location.lng) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await driverModel.findByIdAndUpdate(userId, {
        location: {
          lat: location.lat,
          lng: location.lng,
        },
      });
      console.log(`User ${userId} updated location to latitude: ${location.lat}, longitude: ${location.lng}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function sendMessageToSocketId(socketId, message) {
  if (io) {
    io.to(socketId).emit("message", message);
  } else {
    console.log("Socket.io not initialized");
  }
}

module.exports = { initializeSocket, sendMessageToSocketId };
