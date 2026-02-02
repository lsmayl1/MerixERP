const {
  getAllShortCuts,
  createShortCut,
  getShortCutByProductId,
  deleteShortCut,
} = require("../../services/Product/ProductShortcutService");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const shortCuts = await getAllShortCuts();
    return res.json(shortCuts);
  } catch (error) {
    next(error);
  }
});
router.post("/", async (req, res, next) => {
  try {
    const { product_id, position } = req.body;
    const shortCut = await createShortCut(product_id, position);
    return res.status(201).json(shortCut);
  } catch (error) {
    next(error);
  }
});
router.delete("/:productId", async (req, res, next) => {
  try {
    const { productId } = req.params;
    await deleteShortCut(productId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});
module.exports = router;
