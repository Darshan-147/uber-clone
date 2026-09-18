const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const blacklistTokenModel = require("../models/blacklistToken.model");

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

function validationError(req) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return null;
  const error = new Error("Validation failed");
  error.statusCode = 400;
  error.details = errors.array();
  return error;
}

function sendAuth(res, status, token, user) {
  res.cookie("token", token, cookieOptions);
  res.status(status).json({ data: { token, user } });
}

module.exports.registerUser = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const { fullname, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    if (await userModel.exists({ email: normalizedEmail })) {
      const conflict = new Error("Unable to create account with these details");
      conflict.statusCode = 409;
      throw conflict;
    }

    const user = await userService.createUser({
      firstname: fullname.firstname.trim(),
      lastname: fullname.lastname.trim(),
      email: normalizedEmail,
      password: await userModel.hashPassword(password),
    });
    sendAuth(res, 201, user.generateAuthToken(), user);
  } catch (error) {
    next(error);
  }
};

module.exports.loginUser = async (req, res, next) => {
  try {
    const error = validationError(req);
    if (error) throw error;
    const user = await userModel.findOne({ email: req.body.email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password))) {
      const unauthorized = new Error("Invalid email or password");
      unauthorized.statusCode = 401;
      throw unauthorized;
    }
    sendAuth(res, 200, user.generateAuthToken(), user);
  } catch (error) {
    next(error);
  }
};

module.exports.getUserProfile = (req, res) => res.json({ data: { user: req.user } });

module.exports.logoutUser = async (req, res, next) => {
  try {
    await blacklistTokenModel.updateOne(
      { token: req.auth.token },
      { $setOnInsert: { token: req.auth.token } },
      { upsert: true }
    );
    res.clearCookie("token", cookieOptions);
    res.json({ data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
};

module.exports.validationError = validationError;
