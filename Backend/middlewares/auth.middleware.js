const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const driverModel = require("../models/driver.model");
const blacklistTokenModel = require("../models/blacklistToken.model");

function getToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.cookies?.token;
}

async function authenticate(req, expectedRole) {
  const token = getToken(req);
  if (!token) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  if (await blacklistTokenModel.exists({ token })) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  const role = decoded.role;
  if (!role || (expectedRole && role !== expectedRole)) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  const Model = role === "user" ? userModel : role === "driver" ? driverModel : null;
  if (!Model) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  const account = await Model.findById(decoded._id);
  if (!account) {
    const error = new Error("Authentication is required");
    error.statusCode = 401;
    throw error;
  }

  req.auth = { id: account._id.toString(), role, token };
  req[role] = account;
}

function authForRole(role) {
  return async (req, res, next) => {
    try {
      await authenticate(req, role);
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  authAny: authForRole(),
  authDriver: authForRole("driver"),
  authUser: authForRole("user"),
  getToken,
};
