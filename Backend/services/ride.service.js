const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const crypto = require("crypto");

module.exports.getFare = async ({ pickup, destination }) => {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);
  console.log(distanceTime);

  const baseFare = {
    auto: 30,
    car: 50,
    bike: 20,
  };

  const perKmRate = {
    auto: 15,
    car: 20,
    bike: 10,
  };

  const perMinuteRate = {
    auto: 2,
    car: 3,
    bike: 1,
  };

  const fare = {
    auto: Math.round(
      baseFare.auto +
        (distanceTime.distance.value / 1000) * perKmRate.auto +
        (distanceTime.duration.value / 60) * perMinuteRate.auto
    ),
    car: Math.round(
      baseFare.car +
        (distanceTime.distance.value / 1000) * perKmRate.car +
        (distanceTime.duration.value / 60) * perMinuteRate.car
    ),
    bike: Math.round(
      baseFare.bike +
        (distanceTime.distance.value / 1000) * perKmRate.bike +
        (distanceTime.duration.value / 60) * perMinuteRate.bike
    ),
  };
  console.log(fare)

  return fare;
};

function generateOTP(num) {
  const bytes = crypto.randomBytes(Math.ceil(num / 2));
  const otp = parseInt(bytes.toString("hex"), 16).toString().slice(0, num);
  return otp.padStart(num, "0");
}

module.exports.createRide = async ({
  user,
  pickup,
  destination,
  vehicleType,
}) => {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("All fields are required");
  }

  const fare = await module.exports.getFare({ pickup, destination });

  const ride = rideModel.create({
    user,
    pickup,
    destination,
    otp: generateOTP(6),
    fare: fare[vehicleType],
  });

  return ride;
};
