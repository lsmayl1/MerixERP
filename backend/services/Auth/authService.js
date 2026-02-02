const { User, Op } = require("../../models");
const AppError = require("../../utils/AppError.js");
const joi = require("joi");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  verifyToken,
  signRefreshToken,
} = require("../Jwt/jwtService.js");
const registerSchema = joi.object({
  firstName: joi.string().min(2).required(),
  lastName: joi.string().min(2).required(),
  username: joi.string().min(2).required(),
  email: joi.string().email().required(),
  phoneNumber: joi
    .string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required(),
  password: joi.string().min(6).required(),
  confirmPassword: joi.string().valid(joi.ref("password")).required(),
});

const LoginShcema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

const CreateUser = async (userData) => {
  try {
    const { error } = registerSchema.validate(userData);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    // Check if user with the same email or phone number already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: userData.email },
          { phoneNumber: userData.phoneNumber },
        ],
      },
    });
    if (existingUser) {
      throw new AppError(
        "User with this email or phone number already exists",
        400,
      );
    }
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await User.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      username: userData.username,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      password: passwordHash,
    });
    return user;
  } catch (error) {
    throw error;
  }
};

const LoginUser = async (userData) => {
  try {
    const { error } = LoginShcema.validate(userData);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: userData.email },
          { phoneNumber: userData.phoneNumber || null },
        ],
      },
    });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const isPasswordValid = await bcrypt.compare(
      userData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }
    const token = generateToken({ userId: user.id, role: "user" });
    const refreshToken = signRefreshToken(
      { userId: user.id, role: "user" },
      "7d",
    );
    user.refreshToken = refreshToken;
    await user.save();
    return { user, token, refreshToken };
  } catch (error) {
    throw error;
  }
};

module.exports = { CreateUser, LoginUser };
