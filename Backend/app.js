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
const { errorHandler, notFound } = require("./middlewares/error.middleware");

connectToDB();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// For testing purposes
app.get("/", (req, res) => {
  res.json({ data: { service: "ride-hailing-api", status: "ok" } });
});

app.get("/health", (req, res) => {
  const databaseReady = connectToDB.connection?.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    data: { status: databaseReady ? "ok" : "degraded", database: databaseReady ? "connected" : "disconnected" },
  });
});

app.use("/api/users", userRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/maps", mapRoutes);
app.use("/api/rides", rideRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
