const express = require("express");
const router = express.Router();
const { body, query, param } = require("express-validator");
const rideController = require("../controllers/ride.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { OTP_LENGTH, RIDE_STATUSES, VEHICLE_TYPES } = require("../config/ride.config");

// User routes
router.post(
  "/create-ride",
  authMiddleware.authUser,
  body("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid Pickup Location"),
  body("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid Destination Location"),
  body("vehicleType")
    .isString()
    .isIn(VEHICLE_TYPES)
    .withMessage("Invalid Vehicle Type"),
  rideController.createRide,
);

router.get(
  "/get-fare",
  authMiddleware.authUser,
  query("pickup")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid Pickup Location"),
  query("destination")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Invalid Destination Location"),
  rideController.getFare,
);

router.post(
  "/cancel-ride",
  authMiddleware.authUser,
  body("rideId").isMongoId().withMessage("Invalid Ride ID"),
  body("reason").optional().isString(),
  rideController.cancelRide,
);

router.get(
  "/get-user-rides",
  authMiddleware.authUser,
  query("status")
    .optional()
    .isIn(Object.values(RIDE_STATUSES)),
  rideController.getUserRides,
);

router.get(
  "/get-ride-details/:rideId",
  authMiddleware.authUser,
  param("rideId").isMongoId().withMessage("Invalid Ride ID"),
  rideController.getRideDetails,
);

// Driver routes
router.post(
  "/accept-ride",
  authMiddleware.authDriver,
  body("rideId").isMongoId().withMessage("Invalid Ride ID"),
  rideController.acceptRide,
);

router.post(
  "/verify-otp",
  authMiddleware.authDriver,
  body("rideId").isMongoId().withMessage("Invalid Ride ID"),
  body("otp")
    .isString()
    .isNumeric()
    .isLength({ min: OTP_LENGTH, max: OTP_LENGTH })
    .withMessage("Invalid OTP"),
  rideController.verifyOTP,
);

router.post(
  "/finish-ride",
  authMiddleware.authDriver,
  body("rideId").isMongoId().withMessage("Invalid Ride ID"),
  rideController.finishRide,
);

router.get(
  "/get-available-rides",
  authMiddleware.authDriver,
  query("latitude").isFloat().withMessage("Invalid latitude"),
  query("longitude").isFloat().withMessage("Invalid longitude"),
  rideController.getAvailableRides,
);

router.get(
  "/get-driver-rides",
  authMiddleware.authDriver,
  query("status")
    .optional()
    .isIn(Object.values(RIDE_STATUSES)),
  rideController.getDriverRides,
);

module.exports = router;
