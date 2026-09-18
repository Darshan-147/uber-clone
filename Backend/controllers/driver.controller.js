const { validationResult } = require("express-validator");
const driverModel = require("../models/driver.model");
const driverService = require("../services/driver.service");
const blacklistTokenModel = require("../models/blacklistToken.model");
const { isValidGeoPoint } = require("../utils/ride.constants");

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

function validationError(req) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;
  const error = new Error("Validation failed");
  error.statusCode = 400;
  error.details = errors.array();
  return error;
}

function sendAuth(res, status, token, driver) {
  res.cookie("token", token, cookieOptions);
  res.status(status).json({ data: { token, driver } });
}

module.exports.registerDriver = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const { fullname, email, password, vehicle } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    if (await driverModel.exists({ email: normalizedEmail })) {
      const conflict = new Error("Unable to create account with these details");
      conflict.statusCode = 409;
      throw conflict;
    }
    const driver = await driverService.createDriver({
      firstname: fullname.firstname.trim(),
      lastname: fullname.lastname.trim(),
      email: normalizedEmail,
      password: await driverModel.hashPassword(password),
      color: vehicle.color.trim(),
      plate: vehicle.plate.trim(),
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });
    sendAuth(res, 201, driver.generateAuthToken(), driver);
  } catch (error) {
    next(error);
  }
};

module.exports.loginDriver = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const driver = await driverModel.findOne({ email: req.body.email.trim().toLowerCase() }).select("+password");
    let passwordMatches = false;
    if (driver) {
      try {
        passwordMatches = await driver.comparePassword(req.body.password);
      } catch {
        passwordMatches = false;
      }
    }
    if (!driver || !passwordMatches) {
      const unauthorized = new Error("Invalid email or password");
      unauthorized.statusCode = 401;
      throw unauthorized;
    }
    sendAuth(res, 200, driver.generateAuthToken(), driver);
  } catch (error) {
    next(error);
  }
};

module.exports.getDriverProfile = (req, res) => res.json({ data: { driver: req.driver } });

module.exports.logoutDriver = async (req, res, next) => {
  try {
    await blacklistTokenModel.updateOne(
      { token: req.auth.token },
      { $setOnInsert: { token: req.auth.token } },
      { upsert: true }
    );
    await driverModel.updateOne({ _id: req.driver._id }, { $set: { status: "offline" }, $unset: { socketId: "" } });
    res.clearCookie("token", cookieOptions);
    res.json({ data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
};

module.exports.updateDriverStatus = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const { status } = req.body;
    if (status === "available" && !isValidGeoPoint(req.driver.location)) {
      const locationError = new Error("Share a valid location before going online");
      locationError.statusCode = 400;
      throw locationError;
    }
    if (status === "offline" && req.driver.status === "busy") {
      const busyError = new Error("Cannot go offline during an active ride");
      busyError.statusCode = 409;
      throw busyError;
    }
    const driver = await driverModel.findByIdAndUpdate(req.driver._id, { status }, { new: true });
    res.json({ data: { driver } });
  } catch (error) {
    next(error);
  }
};
