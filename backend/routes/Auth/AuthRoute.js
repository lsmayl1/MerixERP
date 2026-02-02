const express = require("express");
const router = express.Router();
const { CreateUser, LoginUser } = require("../../services/Auth/authService");

router.post("/register", async (req, res, next) => {
  try {
    const user = await CreateUser(req.body);
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await LoginUser(req.body);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
