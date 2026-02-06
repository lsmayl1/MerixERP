const { Shifts, sequelize } = require("../../models");
const AppError = require("../../utils/AppError");
const openShift = async ({ userId, openingCash = 0, note = null }) => {
  return await sequelize.transaction(async (t) => {
    // 1️⃣ Kullanıcının açık vardiyası var mı?
    if (!userId) {
      throw new AppError("User id not found");
    }

    const activeShift = await Shifts.findOne({
      where: {
        userId,
        status: "open",
      },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (activeShift) {
      throw new AppError("User already has an open shift", 404);
    }

    // 2️⃣ Yeni vardiya oluştur
    const shift = await Shifts.create(
      {
        userId,
        openedAt: new Date(),
        openingCash,
        status: "open",
        note,
      },
      { transaction: t },
    );

    return shift;
  });
};

const getShiftStatus = async (userId) => {
  try {
    if (!userId) {
      throw new AppError("User id not defined", 404);
    }
    const activeShift = await Shifts.findOne({
      where: {
        userId,
        status: "open",
      },
    });
    if (!activeShift) {
      throw new AppError("No active Shift", 401);
    }

    return activeShift;
  } catch (error) {
    throw error;
  }
};

module.exports = { openShift, getShiftStatus };
