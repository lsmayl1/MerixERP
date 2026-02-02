const { ShortCut, Products, ProductStock } = require("../../models");
const AppError = require("../../utils/AppError");

const getAllShortCuts = async () => {
  try {
    const shortCuts = await ShortCut.findAll({
      include: [
        {
          model: Products,
          as: "product",
          include: [
            {
              model: ProductStock,
              as: "stock",
            },
          ],
        },
      ],
    });
    if (!shortCuts) {
      return [];
    }

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

const deleteShortCut = async (productId) => {
  try {
    if (!productId) {
      throw new AppError("Product ID is required to delete a shortcut.", 400);
    }
    const existingShortCut = await getShortCutByProductId(productId);
    if (!existingShortCut) {
      throw new AppError("Shortcut for this product does not exist.", 404);
    }
    await ShortCut.destroy({
      where: { product_id: productId },
    });
    return;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  getAllShortCuts,
  createShortCut,
  getShortCutByProductId,
  deleteShortCut,
};
