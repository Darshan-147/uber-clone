const crypto = require("crypto");
const rideModel = require("../models/ride.model");
const driverModel = require("../models/driver.model");
const mapService = require("./maps.service");
const {
  FARE_RATES,
  isValidRideTransition,
  isValidVehicleType,
} = require("../utils/ride.constants");

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function generateOTP(length = 6) {
  return crypto.randomInt(0, 10 ** length).toString().padStart(length, "0");
}

function calculateFare(distanceTime) {
  const distanceInKm = distanceTime.distance.value / 1000;
  const durationInMinutes = distanceTime.duration.value / 60;

  return Object.fromEntries(
    Object.entries(FARE_RATES).map(([vehicleType, rate]) => [
      vehicleType,
      Math.round(rate.base + distanceInKm * rate.perKm + durationInMinutes * rate.perMinute),
    ])
  );
}

async function getFare({ pickup, destination }) {
  if (!pickup || !destination) {
    throw httpError("Pickup and destination are required", 400);
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  return calculateFare(distanceTime);
}

async function createRide({ user, pickup, destination, vehicleType }) {
  if (!user || !pickup || !destination || !isValidVehicleType(vehicleType)) {
    throw httpError("Valid pickup, destination, and vehicle type are required", 400);
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const fare = calculateFare(distanceTime);

  return rideModel.create({
    user,
    pickup,
    destination,
    vehicleType,
    fare: fare[vehicleType],
    distance: distanceTime.distance.value,
    duration: distanceTime.duration.value,
    otp: generateOTP(),
  });
}

async function findNearbyAvailableDrivers({ latitude, longitude, vehicleType, radius = 6000 }) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !isValidVehicleType(vehicleType)) {
    throw httpError("Invalid driver search parameters", 400);
  }

  return driverModel.find({
    status: "available",
    socketId: { $exists: true, $ne: null },
    "vehicle.vehicleType": vehicleType,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [longitude, latitude] },
        $maxDistance: radius,
      },
    },
  });
}

async function populateRide(ride) {
  if (!ride) return null;
  return ride.populate([
    { path: "user", select: "fullname email socketId" },
    { path: "driver", select: "fullname email vehicle location socketId status" },
  ]);
}

async function acceptRide({ rideId, driverId }) {
  const driver = await driverModel.findOneAndUpdate(
    { _id: driverId, status: "available" },
    { $set: { status: "busy" } },
    { new: true }
  );

  if (!driver) {
    throw httpError("Driver must be available before accepting a ride", 409);
  }

  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId, status: "pending", driver: { $exists: false }, rejectedDrivers: { $ne: driverId } },
    { $set: { driver: driverId, status: "accepted", acceptedAt: new Date() } },
    { new: true }
  );

  if (!ride) {
    await driverModel.updateOne({ _id: driverId, status: "busy" }, { $set: { status: "available" } });
    throw httpError("This ride is no longer available", 409);
  }

  return populateRide(ride);
}

async function rejectRide({ rideId, driverId }) {
  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId, status: "pending", driver: { $exists: false } },
    { $addToSet: { rejectedDrivers: driverId } },
    { new: true }
  );

  if (!ride) throw httpError("This ride is no longer available", 409);
  return ride;
}

async function moveRide({ rideId, driverId, from, to, extra = {} }) {
  if (!isValidRideTransition(from, to)) {
    throw httpError("Invalid ride transition", 400);
  }

  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId, driver: driverId, status: from },
    { $set: { status: to, ...extra } },
    { new: true }
  );

  if (!ride) throw httpError("Ride was not found or cannot be updated", 409);
  return populateRide(ride);
}

async function arriveRide({ rideId, driverId }) {
  return moveRide({ rideId, driverId, from: "accepted", to: "arriving", extra: { arrivedAt: new Date() } });
}

async function verifyRideOtp({ rideId, driverId, otp }) {
  if (!/^\d{6}$/.test(String(otp))) throw httpError("A six digit OTP is required", 400);

  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId, driver: driverId, status: "arriving", otp: String(otp), otpVerifiedAt: { $exists: false } },
    { $set: { otpVerifiedAt: new Date() } },
    { new: true }
  ).select("+otp");

  if (!ride) throw httpError("Invalid OTP or ride cannot be verified", 409);
  return populateRide(ride);
}

async function startRide({ rideId, driverId }) {
  const ride = await rideModel.findOneAndUpdate(
    { _id: rideId, driver: driverId, status: "arriving", otpVerifiedAt: { $exists: true } },
    { $set: { status: "in_progress", startedAt: new Date() } },
    { new: true }
  );
  if (!ride) throw httpError("Verify the OTP before starting this ride", 409);
  return populateRide(ride);
}

async function completeRide({ rideId, driverId }) {
  const ride = await moveRide({
    rideId,
    driverId,
    from: "in_progress",
    to: "completed",
    extra: { completedAt: new Date() },
  });
  await driverModel.updateOne({ _id: driverId }, { $set: { status: "available" } });
  return ride;
}

async function cancelRide({ rideId, actorId, actorType }) {
  const permittedStatuses = ["pending", "accepted", "arriving"];
  const query = actorType === "user"
    ? { _id: rideId, user: actorId, status: { $in: permittedStatuses } }
    : { _id: rideId, driver: actorId, status: { $in: permittedStatuses } };

  const ride = await rideModel.findOneAndUpdate(
    query,
    { $set: { status: "cancelled", cancelledAt: new Date(), cancelledBy: actorType } },
    { new: true }
  );
  if (!ride) throw httpError("Ride was not found or cannot be cancelled", 409);

  if (ride.driver) {
    await driverModel.updateOne({ _id: ride.driver }, { $set: { status: "available" } });
  }
  return populateRide(ride);
}

async function getRideForActor({ rideId, actorId, actorType }) {
  const query = actorType === "user" ? { _id: rideId, user: actorId } : { _id: rideId, driver: actorId };
  const ride = await rideModel.findOne(query).populate([
    { path: "user", select: "fullname email socketId" },
    { path: "driver", select: "fullname email vehicle location socketId status" },
  ]);
  if (!ride) throw httpError("Ride not found", 404);
  return ride;
}

async function getRideHistory({ actorId, actorType }) {
  const field = actorType === "user" ? "user" : "driver";
  return rideModel.find({ [field]: actorId })
    .sort({ createdAt: -1 })
    .populate([
      { path: "user", select: "fullname email" },
      { path: "driver", select: "fullname vehicle location" },
    ]);
}

async function getRideOtp({ rideId, userId }) {
  const ride = await rideModel.findOne({ _id: rideId, user: userId }).select("+otp");
  if (!ride) throw httpError("Ride not found", 404);
  if (["completed", "cancelled"].includes(ride.status)) {
    throw httpError("The ride OTP is no longer available", 409);
  }
  return ride.otp;
}

module.exports = {
  acceptRide,
  arriveRide,
  calculateFare,
  cancelRide,
  completeRide,
  createRide,
  findNearbyAvailableDrivers,
  generateOTP,
  getFare,
  getRideForActor,
  getRideHistory,
  getRideOtp,
  rejectRide,
  startRide,
  verifyRideOtp,
};
