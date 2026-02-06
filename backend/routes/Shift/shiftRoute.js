const express = require("express");
const router = express.Router();
const {
  openShift,
  getShiftStatus,
} = require("../../services/Shifts/shiftService");
router.post("/", async (req, res, next) => {
  try {
    const userId = req.user.id;
    const shift = await openShift({
      userId,
      openingCash: req.openingCash,
    });
    res.json(shift);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const activeShift = await getShiftStatus(req.user.id);
    res.json(activeShift);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
