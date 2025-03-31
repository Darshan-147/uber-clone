const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");

module.exports.createRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, vehicleType } = req.body;
    console.log("Create ride request:", { pickup, destination, vehicleType }); // Debug log

    const ride = await rideService.createRide({
      user: req.user._id,
      pickup,
      destination,
      vehicleType,
    });

    console.log("Created ride:", ride); // Debug log
    return res.status(201).json(ride);
  } catch (error) {
    console.error("Ride creation error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getFare = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;
    console.log("Fare request:", { pickup, destination });

    const fare = await rideService.getFare({ pickup, destination });
    console.log("Calculated fare:", fare);

    return res.status(200).json(fare);
  } catch (error) {
    console.log('Fare calculation error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};
