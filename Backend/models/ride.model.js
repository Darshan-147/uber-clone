const mongoose = require("mongoose");
const { RIDE_STATUSES, VEHICLE_TYPES } = require("../utils/ride.constants");

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
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
  vehicleType: {
    type: String,
    enum: VEHICLE_TYPES,
    required: true,
  },
  status: {
    type: String,
    enum: RIDE_STATUSES,
    default: "pending",
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
  otpVerifiedAt: Date,
  acceptedAt: Date,
  arrivedAt: Date,
  startedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: { type: String, enum: ["user", "driver"] },
  rejectedDrivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Driver" }],
}, { timestamps: true });

rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ driver: 1, status: 1, createdAt: -1 });
rideSchema.index({ status: 1, createdAt: -1 });

rideSchema.set("toJSON", {
  transform: (document, returned) => {
    delete returned.otp;
    delete returned.__v;
    return returned;
  },
});

module.exports = mongoose.model("Ride", rideSchema, "rides");
