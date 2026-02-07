const express = require("express");
const { createUser, getAllUsers } = require("../../services/User/userService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
