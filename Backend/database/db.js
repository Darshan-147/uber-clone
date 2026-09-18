const mongoose = require("mongoose");

function connectToDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not configured; database-backed endpoints are unavailable.");
    return Promise.resolve(null);
  }

  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return mongoose.connection.asPromise();
  }

  return mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to database"))
    .catch((error) => {
      console.error("Database connection failed", { message: error.message });
      return null;
    });
}

connectToDB.connection = mongoose.connection;
module.exports = connectToDB;
