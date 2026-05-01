const axios = require("axios");
const driverModel = require("../models/driver.model");

module.exports.getAddressCoordinates = async (address) => {
  if (!address) {
    throw new Error("Address is required");
  }
  const apiKey = process.env.ORS_MAPS_API;
  if (!apiKey) {
    throw new Error("ORS_MAPS_API is not configured");
  }
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(
    address
  )}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    if (response.data.features && response.data.features.length > 0) {
      const location = response.data.features[0].geometry.coordinates;
      return {
        lat: location[1],
        lng: location[0],
      };
    } else {
      throw new Error("Could not find location for the specified address");
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  try {
    const apiKey = process.env.ORS_MAPS_API;

    // Convert place names to coordinates
    const originCoords = await module.exports.getAddressCoordinates(origin);
    const destinationCoords = await module.exports.getAddressCoordinates(
      destination
    );

    const url = `https://api.openrouteservice.org/v2/directions/driving-car`;

    const response = await axios.get(url, {
      params: {
        api_key: apiKey,
        start: `${originCoords.lng},${originCoords.lat}`,
        end: `${destinationCoords.lng},${destinationCoords.lat}`,
      },
      headers: {
        Accept:
          "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
      },
      timeout: 10000,
    });

    if (response.data && response.data.features && response.data.features[0]) {
      const properties = response.data.features[0].properties;

      return {
        distance: {
          value: properties.segments[0].distance,
          text: `${(properties.segments[0].distance / 1000).toFixed(1)} km`,
        },
        duration: {
          value: properties.segments[0].duration,
          text: `${Math.round(properties.segments[0].duration / 60)} mins`,
        },
        origin: originCoords,
        destination: destinationCoords,
      };
    }

    throw new Error("Invalid response format from directions API");
  } catch (error) {
    console.error("Distance Time Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error("Failed to calculate distance and time");
  }
};

module.exports.getSuggestions = async (input) => {
  if (!input) {
    throw new Error("Query is required");
  }

  const apiKey = process.env.ORS_MAPS_API;
  if (!apiKey) {
    throw new Error("ORS_MAPS_API is not configured");
  }
  const url = `https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(
    input
  )}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.features && response.data.features.length > 0) {
      return response.data.features.map((feature) => ({
        name: feature.properties.label,
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0],
      }));
    } else {
      throw new Error("Could not find suggestions for the specified input");
    }
  } catch (error) {
    console.error(
      "Error fetching suggestions:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports.getDriversInTheRadius = async (lat, lng, radius) => {
  try {
    const drivers = await driverModel.find({
      status: "active",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    });

    return drivers;
  } catch (error) {
    console.error("Error fetching drivers in radius:", error.message);
    throw new Error("Failed to fetch drivers in the radius");
  }
};
