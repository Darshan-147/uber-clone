const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");
const {
  DRIVER_SEARCH_RADIUS_METERS,
  DRIVER_VEHICLE_TO_RIDE_TYPE,
} = require("../config/ride.config");

module.exports.createRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;

    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    res.status(201).json(ride);

    try {
      const [pickupLng, pickupLat] = ride.pickupLocation.coordinates;

      const driversInRadius = await mapService.getDriversInTheRadius(
        pickupLat,
        pickupLng,
        DRIVER_SEARCH_RADIUS_METERS,
      );

      if (driversInRadius.length === 0) {
        return;
      } else {
        const driverRidePayload = await rideModel
          .findById(ride._id)
          .populate("user", "fullname email");

        for (const driverData of driversInRadius) {
          const driverRideType =
            DRIVER_VEHICLE_TO_RIDE_TYPE[driverData?.vehicle?.vehicleType];

          if (
            driverData &&
            driverData.socketId &&
            driverRideType === vehicleType
          ) {
            sendMessageToSocketId(driverData.socketId, {
              event: "new-ride",
              data: driverRidePayload,
            });
          }
        }
      }
    } catch (notificationError) {
      console.error("Ride notification error:", notificationError.message);
    }
  } catch (error) {
    console.error("Ride creation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    const fare = await rideService.getFare({ pickup, destination });

    return res.status(200).json(fare);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.acceptRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    const driverId = req.driver._id;

    const ride = await rideService.acceptRide({
      rideId,
      driverId,
    });

    const rideWithUser = await rideModel.findById(rideId).populate("user", "socketId");

    if (rideWithUser && rideWithUser.user && rideWithUser.user.socketId) {
      const userRidePayload = await rideModel
        .findById(rideId)
        .select("+otp")
        .populate("driver", "fullname email vehicle");

      sendMessageToSocketId(rideWithUser.user.socketId, {
        event: "ride-accepted",
        data: userRidePayload,
      });
    }

    res.status(200).json(ride);
  } catch (error) {
    console.error("Accept ride error:", error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports.verifyOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.body;

    const ride = await rideService.verifyOTP({
      rideId,
      otp,
      driverId: req.driver._id,
    });

    // Notify user
    const rideWithUser = await rideModel
      .findById(rideId)
      .populate("user", "socketId");

    if (rideWithUser && rideWithUser.user && rideWithUser.user.socketId) {
      sendMessageToSocketId(rideWithUser.user.socketId, {
        event: "otp-verified",
        data: { message: "Ride started", ride },
      });
    }

    res.status(200).json({ message: "OTP verified, ride started", ride });
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports.finishRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.finishRide({
      rideId,
      driverId: req.driver._id,
    });

    // Notify user
    const rideWithUser = await rideModel
      .findById(rideId)
      .populate("user", "socketId");

    if (rideWithUser && rideWithUser.user && rideWithUser.user.socketId) {
      sendMessageToSocketId(rideWithUser.user.socketId, {
        event: "ride-completed",
        data: ride,
      });
    }

    res.status(200).json({ message: "Ride completed", ride });
  } catch (error) {
    console.error("Finish ride error:", error);
    return res.status(400).json({ message: error.message });
  }
};

module.exports.getAvailableRides = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const driverId = req.driver._id;
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const rides = await rideService.getAvailableRides({
      driverId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    res.status(200).json(rides);
  } catch (error) {
    console.error("Get available rides error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getDriverRides = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const driverId = req.driver._id;
    const { status } = req.query;

    const rides = await rideService.getDriverRides({ driverId, status });
    res.status(200).json(rides);
  } catch (error) {
    console.error("Get driver rides error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getUserRides = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user._id;
    const { status } = req.query;

    const rides = await rideService.getUserRides({ userId, status });
    res.status(200).json(rides);
  } catch (error) {
    console.error("Get user rides error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getRideDetails = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.params;

    const ride = await rideService.getRideDetails({
      rideId,
      userId: req.user?._id,
    });
    res.status(200).json(ride);
  } catch (error) {
    console.error("Get ride details error:", error);
    return res.status(404).json({ message: error.message });
  }
};

module.exports.cancelRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;
    const { reason } = req.body;

    const ride = await rideService.cancelRide({
      rideId,
      reason,
      userId: req.user._id,
    });

    // Notify involved parties
    const rideDetails = await rideModel
      .findById(rideId)
      .populate("user", "socketId")
      .populate("driver", "socketId");

    if (rideDetails && rideDetails.user && rideDetails.user.socketId) {
      sendMessageToSocketId(rideDetails.user.socketId, {
        event: "ride-cancelled",
        data: { message: "Ride has been cancelled", reason },
      });
    }

    if (rideDetails && rideDetails.driver && rideDetails.driver.socketId) {
      sendMessageToSocketId(rideDetails.driver.socketId, {
        event: "ride-cancelled",
        data: { message: "Ride has been cancelled", reason },
      });
    }

    res.status(200).json({ message: "Ride cancelled", ride });
  } catch (error) {
    console.error("Cancel ride error:", error);
    return res.status(400).json({ message: error.message });
  }
};
