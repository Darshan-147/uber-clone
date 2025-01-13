const driverModel = require("../models/driver.model");
const driverService = require("../services/driver.service");
const { validationResult } = require("express-validator");
const blacklistTokenModel = require("../models/blacklistToken.model");

module.exports.registerDriver = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const existingDriver = await driverModel.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver already exists" });
    }

    const hashedPassword = await driverModel.hashPassword(password);

    const driver = await driverService.createDriver({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = driver.generateAuthToken();
    res.status(201).json({ token, driver });
  } catch (error) {
    next(error);
  }
};

module.exports.loginDriver = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const driver = await driverModel.findOne({ email }).select("+password");

    if (!driver) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await driver.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = driver.generateAuthToken();

    res.cookie("token", token);

    res.status(200).json({ token, driver });
  } catch (error) {
    next(error);
  }
};

module.exports.getDriverProfile = async (req, res, next) => {
  res.status(200).json(req.driver);
};

module.exports.logoutDriver = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blacklistTokenModel.create({ token });

  res.status(200).json({ message: "Logged Out Successfully" });
};
