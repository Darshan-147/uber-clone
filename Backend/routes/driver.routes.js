const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const driverController = require("../controllers/driver.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const authRateLimit = require("../middlewares/auth-rate-limit.middleware");
const { VEHICLE_TYPES } = require("../utils/ride.constants");

router.post(
  "/register",
  authRateLimit,
  [
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color name must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be of at least 1 passenger"),
    body("vehicle.vehicleType")
      .isIn(VEHICLE_TYPES)
      .withMessage("Invalid vehicle type"),
  ],
  driverController.registerDriver
);

router.post(
  "/login",
  authRateLimit,
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be atleast 6 characters long"),
  ],
  driverController.loginDriver
);

router.get("/profile", authMiddleware.authDriver, driverController.getDriverProfile);

router.post("/logout", authMiddleware.authDriver, driverController.logoutDriver);
router.patch(
  "/status",
  authMiddleware.authDriver,
  body("status").isIn(["available", "offline"]).withMessage("Invalid driver status"),
  driverController.updateDriverStatus
);

module.exports = router;
