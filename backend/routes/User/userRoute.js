const express = require("express");
const { createUser } = require("../../services/User/userService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    return user;
  } catch (error) {
    next(error);
  }
});

module.exports = router;
