const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseFareRates = () => {
  if (!process.env.RIDE_FARE_RATES_JSON) {
    return {
      auto: { base: 30, perKm: 15, perMinute: 2 },
      car: { base: 50, perKm: 20, perMinute: 3 },
      bike: { base: 20, perKm: 10, perMinute: 1 },
    };
  }

  try {
    return JSON.parse(process.env.RIDE_FARE_RATES_JSON);
  } catch (error) {
    throw new Error("Invalid RIDE_FARE_RATES_JSON");
  }
};

const RIDE_STATUSES = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
});

const VEHICLE_TYPES = Object.freeze(["auto", "car", "bike"]);

const DRIVER_VEHICLE_TO_RIDE_TYPE = Object.freeze({
  auto: "auto",
  car: "car",
  motorcycle: "bike",
});

module.exports = {
  RIDE_STATUSES,
  VEHICLE_TYPES,
  DRIVER_VEHICLE_TO_RIDE_TYPE,
  FARE_RATES: parseFareRates(),
  DRIVER_SEARCH_RADIUS_METERS: parsePositiveNumber(
    process.env.DRIVER_SEARCH_RADIUS_METERS,
    6000,
  ),
  MAX_AVAILABLE_RIDES: parsePositiveNumber(process.env.MAX_AVAILABLE_RIDES, 20),
  OTP_LENGTH: parsePositiveNumber(process.env.RIDE_OTP_LENGTH, 6),
  MAX_OTP_ATTEMPTS: parsePositiveNumber(process.env.MAX_OTP_ATTEMPTS, 3),
};
