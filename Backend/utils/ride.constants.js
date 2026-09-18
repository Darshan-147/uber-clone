const VEHICLE_TYPES = ["auto", "car", "motorcycle"];

const RIDE_STATUSES = [
  "pending",
  "accepted",
  "arriving",
  "in_progress",
  "completed",
  "cancelled",
];

const NEXT_RIDE_STATUSES = {
  pending: ["accepted", "cancelled"],
  accepted: ["arriving", "cancelled"],
  arriving: ["in_progress", "cancelled"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

const FARE_RATES = {
  auto: { base: 30, perKm: 15, perMinute: 2 },
  car: { base: 50, perKm: 20, perMinute: 3 },
  motorcycle: { base: 20, perKm: 10, perMinute: 1 },
};

function isValidVehicleType(vehicleType) {
  return VEHICLE_TYPES.includes(vehicleType);
}

function isValidRideTransition(from, to) {
  return NEXT_RIDE_STATUSES[from]?.includes(to) ?? false;
}

function isValidGeoPoint(location) {
  if (!location || location.type !== "Point" || !Array.isArray(location.coordinates)) {
    return false;
  }

  const [longitude, latitude] = location.coordinates;
  return (
    location.coordinates.length === 2 &&
    Number.isFinite(longitude) &&
    Number.isFinite(latitude) &&
    longitude >= -180 && longitude <= 180 &&
    latitude >= -90 && latitude <= 90
  );
}

module.exports = {
  FARE_RATES,
  NEXT_RIDE_STATUSES,
  RIDE_STATUSES,
  VEHICLE_TYPES,
  isValidGeoPoint,
  isValidRideTransition,
  isValidVehicleType,
};
