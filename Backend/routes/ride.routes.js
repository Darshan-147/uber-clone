const express = require("express");
const { body, param, query } = require("express-validator");
const rideController = require("../controllers/ride.controller");
const auth = require("../middlewares/auth.middleware");
const { VEHICLE_TYPES } = require("../utils/ride.constants");

const router = express.Router();
const rideId = param("rideId").isMongoId().withMessage("Invalid ride id");
const placeValidation = [
  body("pickup").trim().isLength({ min: 3 }).withMessage("Invalid pickup location"),
  body("destination").trim().isLength({ min: 3 }).withMessage("Invalid destination location"),
];

router.post(
  "/create-ride",
  auth.authUser,
  ...placeValidation,
  body("vehicleType").isIn(VEHICLE_TYPES).withMessage("Invalid vehicle type"),
  rideController.createRide
);

router.get(
  "/get-fare",
  auth.authUser,
  query("pickup").trim().isLength({ min: 3 }).withMessage("Invalid pickup location"),
  query("destination").trim().isLength({ min: 3 }).withMessage("Invalid destination location"),
  rideController.getFare
);

router.get("/user/history", auth.authUser, rideController.userHistory);
router.get("/driver/history", auth.authDriver, rideController.driverHistory);
router.get("/:rideId/otp", auth.authUser, rideId, rideController.getRideOtp);
router.post("/:rideId/accept", auth.authDriver, rideId, rideController.acceptRide);
router.post("/:rideId/reject", auth.authDriver, rideId, rideController.rejectRide);
router.post("/:rideId/arrive", auth.authDriver, rideId, rideController.arriveRide);
router.post(
  "/:rideId/verify-otp",
  auth.authDriver,
  rideId,
  body("otp").isString().matches(/^\d{6}$/).withMessage("OTP must be six digits"),
  rideController.verifyOtp
);
router.post("/:rideId/start", auth.authDriver, rideId, rideController.startRide);
router.post("/:rideId/complete", auth.authDriver, rideId, rideController.completeRide);
router.post("/:rideId/cancel", auth.authAny, rideId, rideController.cancelRide);
router.get("/:rideId", auth.authAny, rideId, rideController.getRide);

module.exports = router;
