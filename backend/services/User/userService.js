const { User } = require("../../models");
const AppError = require("../../utils/AppError");
const bcrypt = require("bcryptjs");
const createUser = async (userData) => {
  try {
    const { username, email, password, phoneNumber, role } = userData;
    if (!username || !password) {
      throw new AppError("Username and password are required", 400);
    }
    // Doğrudan findOne kullan, error throw etme
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: passwordHash,
      phoneNumber,
      role: role || "user",
    });
    return newUser;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (username) => {
  try {
    if (!username) {
      throw new AppError("User ID is required", 400);
    }
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw error;
  }
};

const deleteUserById = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    await user.destroy();
    return { message: "User deleted success" };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  deleteUserById,
};
