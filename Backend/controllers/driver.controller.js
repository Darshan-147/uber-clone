const driverModel = require("../models/driver.model");
const driverService = require("../services/driver.service");
const { validationResult } = require("express-validator");

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
