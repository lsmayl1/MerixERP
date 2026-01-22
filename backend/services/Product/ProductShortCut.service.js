const { ShortCut } = require("../../models");
const AppError = require("../../utils/AppError");

const getAllShortCuts = async () => {
  try {
    const shortCuts = await ShortCut.findAll();
    return shortCuts;
  } catch (error) {
    throw error;
  }
};

const createShortCut = async (productId, position) => {
  try {
    if (!productId) {
      throw new AppError("Product ID is required to create a shortcut.", 400);
    }
    const existingShortCut = await ShortCut.findOne({
      where: { product_id: productId },
    });
    if (existingShortCut) {
      throw new AppError("Shortcut for this product already exists.", 400);
    }
    const newShortCut = await ShortCut.create({
      product_id: productId,
      position: position,
    });
    return newShortCut;
  } catch (error) {
    throw error;
  }
};
const getShortCutByProductId = async (productId) => {
  try {
    const shortCut = await ShortCut.findOne({
      where: { product_id: productId },
    });
    return shortCut;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllShortCuts,
  createShortCut,
  getShortCutByProductId,
};
