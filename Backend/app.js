const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectToDB = require("./database/db");
const userRoutes = require("./routes/user.routes");
const driverRoutes = require("./routes/driver.routes");
const mapRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");

connectToDB();

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: !allowedOrigins.includes("*"),
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// For testing purposes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/rides", rideRoutes);

module.exports = app;
