const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { VEHICLE_TYPES } = require("../utils/ride.constants");

const driverSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minLength: [3, "First name should be at least 3 characters long"],
    },
    lastname: {
      type: String,
      required: true,
      minlength: [3, "Last name must be at least 3 characters long"],
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, "Last name must be at least 3 characters long"],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  // this is used for live-tracking of driver
  socketId: {
    type: String,
  },

  // whether the driver can give rides or not
  status: {
    type: String,
    enum: ["available", "busy", "offline"],
    default: "offline",
    index: true,
  },

  vehicle: {
    color: {
      type: String,
      required: true,
      minLength: [3, "Color name must be at least 3 characters long"],
    },
    plate: {
      type: String,
      required: true,
      minLength: [3, "Plate must be at least 3 characters long"],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Capacity must be at least 1 passenger"],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: VEHICLE_TYPES,
    },
  },

  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: false,
    }
  },
}, { timestamps: true });

driverSchema.index({ location: "2dsphere", status: 1, "vehicle.vehicleType": 1 });
driverSchema.set("toJSON", {
  transform: (document, returned) => {
    delete returned.password;
    delete returned.__v;
    return returned;
  },
});

driverSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: "driver" }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
  return token;
};

driverSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

driverSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const driverModel = mongoose.model("Driver", driverSchema, "drivers");

module.exports = driverModel;
