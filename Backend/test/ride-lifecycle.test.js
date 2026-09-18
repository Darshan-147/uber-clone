const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const rideService = require("../services/ride.service");
const userModel = require("../models/user.model");
const driverModel = require("../models/driver.model");
const {
  isValidGeoPoint,
  isValidRideTransition,
  isValidVehicleType,
} = require("../utils/ride.constants");

test("fare calculation uses all canonical vehicle types", () => {
  const fare = rideService.calculateFare({ distance: { value: 10_000 }, duration: { value: 600 } });
  assert.deepEqual(fare, { auto: 200, car: 280, motorcycle: 130 });
  assert.equal(isValidVehicleType("motorcycle"), true);
  assert.equal(isValidVehicleType("bike"), false);
});

test("ride transitions only allow the legal lifecycle", () => {
  assert.equal(isValidRideTransition("pending", "accepted"), true);
  assert.equal(isValidRideTransition("accepted", "arriving"), true);
  assert.equal(isValidRideTransition("arriving", "in_progress"), true);
  assert.equal(isValidRideTransition("in_progress", "completed"), true);
  assert.equal(isValidRideTransition("pending", "completed"), false);
  assert.equal(isValidRideTransition("completed", "accepted"), false);
});

test("GeoJSON validation accepts zero coordinates and rejects malformed points", () => {
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [0, 0] }), true);
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [181, 0] }), false);
  assert.equal(isValidGeoPoint({ type: "Point", coordinates: [72.8] }), false);
  assert.equal(isValidGeoPoint({ lat: 0, lng: 0 }), false);
});

test("user and driver tokens include a non-interchangeable role", () => {
  process.env.JWT_SECRET = "test-only-secret";
  const user = new userModel({
    fullname: { firstname: "Test", lastname: "User" },
    email: "user@example.test",
    password: "hashed-password",
  });
  const driver = new driverModel({
    fullname: { firstname: "Test", lastname: "Driver" },
    email: "driver@example.test",
    password: "hashed-password",
    vehicle: { color: "Blue", plate: "TEST-1", capacity: 4, vehicleType: "car" },
  });

  assert.equal(jwt.verify(user.generateAuthToken(), process.env.JWT_SECRET).role, "user");
  assert.equal(jwt.verify(driver.generateAuthToken(), process.env.JWT_SECRET).role, "driver");
});

test("one-time OTP generator always returns six numeric characters", () => {
  const otp = rideService.generateOTP();
  assert.match(otp, /^\d{6}$/);
});
