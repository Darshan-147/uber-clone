const mongoose = require("mongoose");
const { RIDE_STATUSES, VEHICLE_TYPES } = require("../config/ride.config");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "drivers",
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RIDE_STATUSES),
      default: RIDE_STATUSES.PENDING,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    destinationLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    duration: {
      // in seconds
      type: Number,
    },
    distance: {
      // in meters
      type: Number,
    },
    paymentID: {
      type: String,
    },
    orderID: {
      type: String,
    },
    signature: {
      type: String,
    },
    otp: {
      type: String,
      select: false,
      required: true,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true },
);

rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ driver: 1, createdAt: -1 });
rideSchema.index({ status: 1 });
rideSchema.index({ pickupLocation: "2dsphere" });

module.exports = mongoose.model("ride", rideSchema);
