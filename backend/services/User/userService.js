const { User } = require("../../models");
const AppError = require("../../utils/AppError");

const createUser = async (userData) => {
  try {
    const { username, email, password, role } = userData;
    if (!username || !password) {
      throw new AppError("Username and password are required", 400);
    }
    const existingUser = await getUserById(username);
    if (existingUser) {
      throw new AppError("Username already exists", 409);
    }
    const newUser = await User.create({
      username,
      email,
      password,
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

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
};
