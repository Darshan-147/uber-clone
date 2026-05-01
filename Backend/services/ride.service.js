const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const crypto = require("crypto");
const driverModel = require("../models/driver.model");
const {
  DRIVER_VEHICLE_TO_RIDE_TYPE,
  DRIVER_SEARCH_RADIUS_METERS,
  FARE_RATES,
  MAX_AVAILABLE_RIDES,
  MAX_OTP_ATTEMPTS,
  OTP_LENGTH,
  RIDE_STATUSES,
  VEHICLE_TYPES,
} = require("../config/ride.config");

const ACTIVE_RIDE_STATUSES = [
  RIDE_STATUSES.ACCEPTED,
  RIDE_STATUSES.IN_PROGRESS,
];

const toPoint = (coords) => ({
  type: "Point",
  coordinates: [coords.lng, coords.lat],
});

const calculateFare = (distanceTime) =>
  Object.fromEntries(
    VEHICLE_TYPES.map((vehicleType) => {
      const rates = FARE_RATES[vehicleType];
      if (!rates) {
        throw new Error(`Fare rates are missing for ${vehicleType}`);
      }

      return [
        vehicleType,
        Math.round(
          rates.base +
            (distanceTime.distance.value / 1000) * rates.perKm +
            (distanceTime.duration.value / 60) * rates.perMinute,
        ),
      ];
    }),
  );

module.exports.getFare = async ({ pickup, destination }) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  return calculateFare(await mapService.getDistanceTime(pickup, destination));
};

function generateOTP(num) {
  const min = 10 ** (num - 1);
  const max = 10 ** num;
  return crypto.randomInt(min, max).toString();
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  if (!VEHICLE_TYPES.includes(vehicleType)) {
    throw new Error("Invalid vehicle type");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  const fare = calculateFare(distanceTime);

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    vehicleType,
    pickupLocation: toPoint(distanceTime.origin),
    destinationLocation: toPoint(distanceTime.destination),
    distance: distanceTime.distance.value,
    duration: distanceTime.duration.value,
    otp: generateOTP(OTP_LENGTH),
    fare: fare[vehicleType],
  });

  return ride;
};

module.exports.acceptRide = async ({ rideId, driverId }) => {
  if (!rideId || !driverId) {
    throw new Error("Ride ID and Driver ID are required");
  }

  // Check if driver is already on another ride
  const existingRide = await rideModel.findOne({
    driver: driverId,
    status: { $in: ACTIVE_RIDE_STATUSES },
  });

  if (existingRide) {
    throw new Error("Driver already has an active ride");
  }

  const driver = await driverModel.findById(driverId);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const rideVehicleType =
    DRIVER_VEHICLE_TO_RIDE_TYPE[driver.vehicle?.vehicleType];

  if (!rideVehicleType) {
    throw new Error("Driver vehicle type is not eligible for rides");
  }

  const ride = await rideModel
    .findOneAndUpdate(
      {
        _id: rideId,
        status: RIDE_STATUSES.PENDING,
        vehicleType: rideVehicleType,
      },
      {
        $set: {
          driver: driverId,
          status: RIDE_STATUSES.ACCEPTED,
          acceptedAt: new Date(),
        },
      },
      { new: true },
    )
    .populate("user", "fullname email")
    .populate("driver", "fullname email vehicle");

  if (!ride) {
    throw new Error("Ride is not available");
  }

  return ride;
};

module.exports.verifyOTP = async ({ rideId, otp, driverId }) => {
  if (!rideId || !otp) {
    throw new Error("Ride ID and OTP are required");
  }

  const ride = await rideModel.findById(rideId).select("+otp +otpAttempts");
  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== RIDE_STATUSES.ACCEPTED) {
    throw new Error("Ride must be in accepted status");
  }

  if (!ride.driver || ride.driver.toString() !== driverId.toString()) {
    throw new Error("You are not assigned to this ride");
  }

  // Prevent brute force
  if (ride.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many OTP attempts. Contact support.");
  }

  if (ride.otp !== otp.toString()) {
    ride.otpAttempts = (ride.otpAttempts || 0) + 1;
    await ride.save();
    throw new Error("Invalid OTP");
  }

  ride.otpVerified = true;
  ride.status = RIDE_STATUSES.IN_PROGRESS;
  ride.startedAt = new Date();
  ride.otpAttempts = 0;
  await ride.save();

  return ride.populate([
    { path: "user", select: "fullname email" },
    { path: "driver", select: "fullname email vehicle" },
  ]);
};

module.exports.finishRide = async ({ rideId, driverId }) => {
  if (!rideId) {
    throw new Error("Ride ID is required");
  }

  const ride = await rideModel.findById(rideId);
  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== RIDE_STATUSES.IN_PROGRESS) {
    throw new Error("Ride is not in progress");
  }

  if (!ride.driver || ride.driver.toString() !== driverId.toString()) {
    throw new Error("You are not assigned to this ride");
  }

  ride.status = RIDE_STATUSES.COMPLETED;
  ride.completedAt = new Date();
  await ride.save();

  return ride.populate([
    { path: "user", select: "fullname email" },
    { path: "driver", select: "fullname email vehicle" },
  ]);
};

module.exports.cancelRide = async ({ rideId, reason, userId }) => {
  if (!rideId) {
    throw new Error("Ride ID is required");
  }

  const ride = await rideModel.findById(rideId);
  if (!ride) {
    throw new Error("Ride not found");
  }

  if (
    ride.status === RIDE_STATUSES.COMPLETED ||
    ride.status === RIDE_STATUSES.CANCELLED
  ) {
    throw new Error("Cannot cancel this ride");
  }

  if (userId && ride.user.toString() !== userId.toString()) {
    throw new Error("You can only cancel your own ride");
  }

  ride.status = RIDE_STATUSES.CANCELLED;
  await ride.save();

  return ride;
};

module.exports.getAvailableRides = async ({
  driverId,
  latitude,
  longitude,
}) => {
  if (!driverId || latitude === undefined || longitude === undefined) {
    throw new Error("Driver ID and location are required");
  }

  const driver = await driverModel.findById(driverId);
  if (!driver) {
    throw new Error("Driver not found");
  }

  const rideVehicleType =
    DRIVER_VEHICLE_TO_RIDE_TYPE[driver.vehicle?.vehicleType];

  if (!rideVehicleType) {
    throw new Error("Driver vehicle type is not eligible for rides");
  }

  const rides = await rideModel
    .find({
      status: RIDE_STATUSES.PENDING,
      vehicleType: rideVehicleType,
      pickupLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: DRIVER_SEARCH_RADIUS_METERS,
        },
      },
    })
    .populate("user", "fullname email")
    .sort({ createdAt: -1 })
    .limit(MAX_AVAILABLE_RIDES);

  return rides;
};

module.exports.getDriverRides = async ({ driverId, status }) => {
  if (!driverId) {
    throw new Error("Driver ID is required");
  }

  const query = { driver: driverId };
  if (status) {
    query.status = status;
  }

  const rides = await rideModel
    .find(query)
    .populate("user", "fullname email")
    .sort({ createdAt: -1 });

  return rides;
};

module.exports.getUserRides = async ({ userId, status }) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  const rides = await rideModel
    .find(query)
    .populate("driver", "fullname email vehicle")
    .sort({ createdAt: -1 });

  return rides;
};

module.exports.getRideDetails = async ({ rideId, userId, driverId }) => {
  if (!rideId) {
    throw new Error("Ride ID is required");
  }

  const ride = await rideModel
    .findById(rideId)
    .populate("user", "fullname email")
    .populate("driver", "fullname email vehicle");

  if (!ride) {
    throw new Error("Ride not found");
  }

  const isUser = userId && ride.user?._id?.toString() === userId.toString();
  const isDriver =
    driverId && ride.driver?._id?.toString() === driverId.toString();

  if (!isUser && !isDriver) {
    throw new Error("You do not have access to this ride");
  }

  return ride;
};
