const jwt = require("jsonwebtoken");
const socketIO = require("socket.io");
const userModel = require("./models/user.model");
const driverModel = require("./models/driver.model");
const rideModel = require("./models/ride.model");
const rideService = require("./services/ride.service");
const { isValidGeoPoint } = require("./utils/ride.constants");

let io;

function getAllowedOrigins() {
  return (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim());
}

function sendMessageToSocketId(socketId, event, payload) {
  if (io && socketId) io.to(socketId).emit(event, payload);
}

function publicRide(ride) {
  if (!ride) return ride;
  const payload = ride.toObject ? ride.toObject({ transform: false }) : { ...ride };
  delete payload.otp;
  delete payload.__v;
  return payload;
}

function emitRideUpdate(ride, event = "ride-status-updated") {
  if (!ride) return;
  const payload = { ride: publicRide(ride) };
  const userSocketId = ride.user?.socketId;
  const driverSocketId = ride.driver?.socketId;
  sendMessageToSocketId(userSocketId, event, payload);
  sendMessageToSocketId(driverSocketId, event, payload);
}

async function authenticateJoin(socket, { token, userType }) {
  if (!token || !userType) throw new Error("Authentication is required");
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded.role && decoded.role !== userType) throw new Error("Role does not match token");

  const Model = userType === "user" ? userModel : userType === "driver" ? driverModel : null;
  if (!Model) throw new Error("Invalid user type");
  const account = await Model.findById(decoded._id);
  if (!account) throw new Error("Account was not found");

  socket.data.identity = { id: account._id.toString(), role: userType };
  await Model.updateOne({ _id: account._id }, { $set: { socketId: socket.id } });
  return account;
}

function requireSocketRole(socket, role) {
  if (!socket.data.identity || socket.data.identity.role !== role) {
    throw new Error("Socket is not authorized for this action");
  }
  return socket.data.identity.id;
}

function socketError(socket, error) {
  socket.emit("socket-error", { message: error.message || "Socket request failed" });
}

function initializeSocket(server) {
  io = socketIO(server, {
    cors: { origin: getAllowedOrigins(), methods: ["GET", "POST"], credentials: true },
  });

  io.on("connection", (socket) => {
    socket.on("join", async (data = {}, callback) => {
      try {
        const account = await authenticateJoin(socket, data);
        callback?.({ ok: true, id: account._id.toString() });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("driver-online", async (callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        const driver = await driverModel.findById(driverId);
        if (!isValidGeoPoint(driver?.location)) throw new Error("Share a valid location before going online");
        await driverModel.updateOne({ _id: driverId }, { $set: { status: "available" } });
        callback?.({ ok: true });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("driver-offline", async (callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        await driverModel.updateOne({ _id: driverId, status: { $ne: "busy" } }, { $set: { status: "offline" } });
        callback?.({ ok: true });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("update-driver-location", async (data = {}, callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        const latitude = Number(data.location?.lat);
        const longitude = Number(data.location?.lng);
        const location = { type: "Point", coordinates: [longitude, latitude] };
        if (!isValidGeoPoint(location)) throw new Error("Latitude or longitude is invalid");

        await driverModel.updateOne({ _id: driverId }, { $set: { location } });
        const activeRide = await rideModel.findOne({
          driver: driverId,
          status: { $in: ["accepted", "arriving", "in_progress"] },
        }).populate("user", "socketId");
        if (activeRide?.user?.socketId) {
          sendMessageToSocketId(activeRide.user.socketId, "driver-location-updated", {
            rideId: activeRide._id.toString(),
            location,
          });
        }
        callback?.({ ok: true, location });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("accept-ride", async ({ rideId } = {}, callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        const ride = await rideService.acceptRide({ rideId, driverId });
        emitRideUpdate(ride, "ride-accepted");
        sendMessageToSocketId(ride.user?.socketId, "driver-assigned", { ride });
        callback?.({ ok: true, ride });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("reject-ride", async ({ rideId } = {}, callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        await rideService.rejectRide({ rideId, driverId });
        callback?.({ ok: true });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("update-ride-status", async ({ rideId, status } = {}, callback) => {
      try {
        const driverId = requireSocketRole(socket, "driver");
        if (status !== "arriving") throw new Error("Use the protected API for this ride update");
        const ride = await rideService.arriveRide({ rideId, driverId });
        emitRideUpdate(ride);
        callback?.({ ok: true, ride });
      } catch (error) {
        socketError(socket, error);
        callback?.({ ok: false, message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      const identity = socket.data.identity;
      if (!identity) return;
      const Model = identity.role === "driver" ? driverModel : userModel;
      await Model.updateOne({ _id: identity.id, socketId: socket.id }, {
        $unset: { socketId: "" },
        ...(identity.role === "driver" ? { $set: { status: "offline" } } : {}),
      });
    });
  });
}

module.exports = { emitRideUpdate, initializeSocket, sendMessageToSocketId };
