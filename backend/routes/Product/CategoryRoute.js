const express = require("express");
const {
  getAllCategories,
  createCategory,
  getCategoryById,
} = require("../../services/CategoryService");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    return res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const category = await createCategory(req.body);
    return res.json(category);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    return res.json(category);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
