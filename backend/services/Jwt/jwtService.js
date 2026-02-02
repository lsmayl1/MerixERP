// utils/jwt.js
const jwt = require("jsonwebtoken");
const config = require("./config.json");

function generateToken({ userId, role }) {
  return jwt.sign({ id: userId, role: role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
}

function signRefreshToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn });
}

module.exports = { generateToken, verifyToken, signRefreshToken };
