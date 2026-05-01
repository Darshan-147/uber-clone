const socketIO = require("socket.io");
const userModel = require("./models/user.model");
const driverModel = require("./models/driver.model");
const rideModel = require("./models/ride.model");

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;

      try {
        if (userType === "user") {
          const user = await userModel.findByIdAndUpdate(
            userId,
            { socketId: socket.id },
            { new: true },
          );

          if (!user) {
            return socket.emit("error", { message: "User not found" });
          }

          socket.data.userId = userId;
          socket.data.userType = userType;
          socket.emit("joined", { message: "User connected" });
        } else if (userType === "driver") {
          const driver = await driverModel.findByIdAndUpdate(
            userId,
            {
              socketId: socket.id,
              status: "active",
            },
            { new: true },
          );

          if (!driver) {
            return socket.emit("error", { message: "Driver not found" });
          }

          socket.data.userId = userId;
          socket.data.userType = userType;
          socket.emit("joined", { message: "Driver connected" });
        }
      } catch (error) {
        socket.emit("error", { message: "Unable to join socket session" });
      }
    });

    socket.on("update-driver-location", async (data) => {
      const { userId, location } = data;

      if (
        socket.data.userType !== "driver" ||
        socket.data.userId?.toString() !== userId?.toString()
      ) {
        return socket.emit("error", { message: "Unauthorized location update" });
      }

      if (
        !location ||
        location.lat === undefined ||
        location.lng === undefined ||
        !Number.isFinite(Number(location.lat)) ||
        !Number.isFinite(Number(location.lng))
      ) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      await driverModel.findByIdAndUpdate(userId, {
        status: "active",
        location: {
          type: "Point",
          coordinates: [Number(location.lng), Number(location.lat)],
        },
      });
    });

    // Ride events
    socket.on("ride-requested", async (data) => {
      const { rideId } = data;
      try {
        const ride = await rideModel
          .findById(rideId)
          .populate("driver", "socketId");

        if (!ride || ride.user.toString() !== socket.data.userId?.toString()) {
          return socket.emit("error", { message: "Unauthorized ride event" });
        }

        if (ride && ride.driver && ride.driver.socketId) {
          io.to(ride.driver.socketId).emit("new-ride-notification", {
            ride,
            message: "New ride request",
          });
        }
      } catch (error) {
        console.error("Error in ride-requested:", error);
      }
    });

    socket.on("ride-status-update", async (data) => {
      const { rideId, status } = data;
      try {
        const ride = await rideModel
          .findById(rideId)
          .populate("user", "socketId")
          .populate("driver", "socketId");

        const isRideUser =
          ride?.user?._id?.toString() === socket.data.userId?.toString();
        const isRideDriver =
          ride?.driver?._id?.toString() === socket.data.userId?.toString();

        if (!isRideUser && !isRideDriver) {
          return socket.emit("error", { message: "Unauthorized ride event" });
        }

        if (ride && ride.user && ride.user.socketId) {
          io.to(ride.user.socketId).emit("ride-status", {
            rideId,
            status,
            ride,
          });
        }

        if (ride && ride.driver && ride.driver.socketId) {
          io.to(ride.driver.socketId).emit("ride-status", {
            rideId,
            status,
            ride,
          });
        }
      } catch (error) {
        console.error("Error in ride-status-update:", error);
      }
    });

    socket.on("driver-location-update", async (data) => {
      const { rideId, location } = data;
      try {
        const ride = await rideModel
          .findById(rideId)
          .populate("user", "socketId")
          .populate("driver", "socketId");

        if (
          !ride?.driver ||
          ride.driver._id.toString() !== socket.data.userId?.toString()
        ) {
          return socket.emit("error", { message: "Unauthorized location event" });
        }

        if (ride && ride.user && ride.user.socketId && location) {
          io.to(ride.user.socketId).emit("driver-location", {
            rideId,
            location,
          });
        }
      } catch (error) {
        console.error("Error in driver-location-update:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Optionally update status in DB
      await userModel.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null },
      );
      await driverModel.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null, status: "inactive" },
      );
    });
  });
}

function sendMessageToSocketId(socketId, message) {
  if (io) {
    if (message && message.event) {
      io.to(socketId).emit(message.event, message.data);
      return;
    }

    io.to(socketId).emit("message", message);
  } else {
    console.log("Socket.io not initialized");
  }
}

function emitToRoom(roomId, eventName, data) {
  if (io) {
    io.to(roomId).emit(eventName, data);
  }
}

module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  emitToRoom,
  getIO: () => io,
};
