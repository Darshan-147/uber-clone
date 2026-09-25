const { validationResult } = require("express-validator");
const rideService = require("../services/ride.service");
const mapService = require("../services/maps.service");
const { emitRideUpdate, sendMessageToSocketId } = require("../socket");

function validationError(req) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;
  const error = new Error("Validation failed");
  error.statusCode = 400;
  error.details = errors.array();
  return error;
}

function sendRide(res, status, ride, includeOtp = false) {
  const payload = ride.toObject ? ride.toObject({ transform: false }) : ride;
  delete payload.__v;
  if (!includeOtp) delete payload.otp;
  res.status(status).json({ data: { ride: payload } });
}

async function notifyNearbyDrivers(ride) {
  try {
    const pickup = await mapService.getAddressCoordinates(ride.pickup);
    const drivers = await rideService.findNearbyAvailableDrivers({
      latitude: pickup.lat,
      longitude: pickup.lng,
      vehicleType: ride.vehicleType,
    });
    const rideRequest = { ride: ride.toObject({ transform: false }) };
    delete rideRequest.ride.otp;
    delete rideRequest.ride.__v;
    drivers.forEach((driver) => sendMessageToSocketId(driver.socketId, "ride-request", rideRequest));
  } catch (error) {
    // A ride remains pending when routing or driver discovery is temporarily unavailable.
    console.warn("Unable to notify nearby drivers", { message: error.message });
  }
}

module.exports.createRide = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const ride = await rideService.createRide({ user: req.user._id, ...req.body });
    await ride.populate("user", "fullname email socketId");
    sendRide(res, 201, ride, true);
    notifyNearbyDrivers(ride);
  } catch (error) {
    next(error);
  }
};

module.exports.getFare = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const fare = await rideService.getFare(req.query);
    res.json({ data: { fare } });
  } catch (error) {
    next(error);
  }
};

module.exports.acceptRide = async (req, res, next) => {
  try {
    const ride = await rideService.acceptRide({ rideId: req.params.rideId, driverId: req.driver._id });
    emitRideUpdate(ride, "ride-accepted", true);
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.rejectRide = async (req, res, next) => {
  try {
    await rideService.rejectRide({ rideId: req.params.rideId, driverId: req.driver._id });
    res.json({ data: { message: "Ride request dismissed" } });
  } catch (error) {
    next(error);
  }
};

module.exports.arriveRide = async (req, res, next) => {
  try {
    const ride = await rideService.arriveRide({ rideId: req.params.rideId, driverId: req.driver._id });
    emitRideUpdate(ride);
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.verifyOtp = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const ride = await rideService.verifyRideOtp({
      rideId: req.params.rideId,
      driverId: req.driver._id,
      otp: req.body.otp,
    });
    emitRideUpdate(ride);
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.startRide = async (req, res, next) => {
  try {
    const ride = await rideService.startRide({ rideId: req.params.rideId, driverId: req.driver._id });
    emitRideUpdate(ride);
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.completeRide = async (req, res, next) => {
  try {
    const ride = await rideService.completeRide({ rideId: req.params.rideId, driverId: req.driver._id });
    emitRideUpdate(ride, "ride-completed");
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.cancelRide = async (req, res, next) => {
  try {
    const ride = await rideService.cancelRide({
      rideId: req.params.rideId,
      actorId: req.auth.id,
      actorType: req.auth.role,
    });
    emitRideUpdate(ride);
    sendRide(res, 200, ride);
  } catch (error) {
    next(error);
  }
};

module.exports.getRide = async (req, res, next) => {
  try {
    const ride = await rideService.getRideForActor({
      rideId: req.params.rideId,
      actorId: req.auth.id,
      actorType: req.auth.role,
    });
    sendRide(res, 200, ride, req.auth.role === "user");
  } catch (error) {
    next(error);
  }
};

module.exports.getRideOtp = async (req, res, next) => {
  try {
    const otp = await rideService.getRideOtp({ rideId: req.params.rideId, userId: req.user._id });
    res.json({ data: { otp } });
  } catch (error) {
    next(error);
  }
};

module.exports.userHistory = async (req, res, next) => {
  try {
    const rides = await rideService.getRideHistory({ actorId: req.user._id, actorType: "user" });
    res.json({ data: { rides } });
  } catch (error) {
    next(error);
  }
};

module.exports.driverHistory = async (req, res, next) => {
  try {
    const rides = await rideService.getRideHistory({ actorId: req.driver._id, actorType: "driver" });
    res.json({ data: { rides } });
  } catch (error) {
    next(error);
  }
};
