const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectToDB = require("./database/db");
const userRoutes = require("./routes/user.routes");

connectToDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// For testing purposes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", userRoutes);

module.exports = app;
