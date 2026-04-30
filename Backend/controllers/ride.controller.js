const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");

module.exports.createRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
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

    const pickupCoordinates = await mapService.getAddressCoordinates(pickup);
    console.log("Here is the pickup location: ", pickupCoordinates);

    const driversInRadius = await mapService.getDriversInTheRadius(
      pickupCoordinates.lat,
      pickupCoordinates.lng,
      6000
    );

    if (driversInRadius.length === 0) {
      console.log("No drivers found in the radius");
    } else {
      console.log("Drivers nearby:", driversInRadius);
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
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;
    console.log("Fare request:", { pickup, destination });

    const fare = await rideService.getFare({ pickup, destination });
    console.log("Calculated fare:", fare);

    return res.status(200).json(fare);
  } catch (error) {
    console.log("Fare calculation error:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
