const express = require("express");
const router = express.Router();
const {
  Products,
  Sequelize,
  Op,
  ProductStock,
  Category,
} = require("../../models");
const {
  CreateProduct,
  GetAllProducts,
  GetProductByIdOrBarcode,
  DeleteProduct,
  UpdateProduct,
  GenerateBarcode,
  UpdateStockValue,
} = require("../../services/Product/ProductService");

// Create a new product
router.post("/", async (req, res, next) => {
  try {
    const product = await CreateProduct(req.body);
    if (product) {
      return res.json(product);
    }
  } catch (error) {
    next(error);
  }
});

// Get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await GetAllProducts(req.query);
    if (products) {
      return res.json(products);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "Arama kelimesi en az 2 karakter olmalıdır." });
    }

    const products = await Products.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${query}%`, // İstənilən yerində
            },
          },
          {
            barcode: {
              [Op.iLike]: `%${query}%`, // Barkod üçün də
            },
          },
        ],
      },
      order: [["name", "ASC"]],
      limit: 50, // En fazla 20 ürün getir
      include: [
        {
          model: ProductStock,
          as: "stock",
          attributes: ["current_stock"],
        },
      ],
    });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found matching the query." });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const param = req.params.id;
    let product;
    let unit = "piece";
    let quantity = 1;
    let originalBarcode = param; // okutulan barkodu döneceğiz
    let productBarcode = null;

    // Eğer ID olarak aramak istiyorsan
    if (!isNaN(param)) {
      product = await Products.findByPk(Number(param));
      if (product) productBarcode = product.barcode;
    }

    // Tartım barkodu ise
    if (!product && param.length === 13 && param.startsWith("22")) {
      const productCode = param.substring(0, 7); // ilk 7 hane ürün kodu
      const weightStr = param.substring(7, 12); // 7-11 arası son 5 hane ağırlık
      const weightGrams = parseInt(weightStr, 10);
      quantity = weightGrams / 1000;
      unit = "kg";

      product = await Products.findOne({
        where: {
          barcode: {
            [Op.like]: `${productCode}%`,
          },
        },
        include: [
          {
            model: ProductStock,
            as: "stock",
          },
        ],
      });

      if (product) productBarcode = product.barcode;
    }

    // Normal barkod
    if (!product) {
      product = await Products.findOne({
        where: { barcode: param },
        include: [
          {
            model: Category,
            as: "category",
          },
        ],
      });
      if (product) productBarcode = product.barcode;
    }

    const category = await Category.findByPk(product.category_id);

    if (product) {
      const stock = await ProductStock.findOne({
        where: { product_id: product.product_id },
      });

      const productData = product.get({ plain: true });
      console.log(productData.stock);

      // Eğer ürün piece ise sadece barcode dön
      if (unit === "piece") {
        res.json({
          product_id: productData.product_id,
          name: productData.name,
          sellPrice: parseFloat(productData.sellPrice),
          buyPrice: parseFloat(productData.buyPrice),
          barcode: productBarcode,
          quantity,
          unit,
          stock: stock?.current_stock,
          category: category || 0,
        });
      } else {
        // kg ise hem okutulan barkod hem veritabanı barkodu dön
        res.json({
          name: productData.name,
          sellPrice: parseFloat(productData.sellPrice),
          buyPrice: parseFloat(productData.buyPrice),
          barcode: originalBarcode, // okutulan barkod
          productBarcode: productBarcode, // veritabanındaki gerçek barkod
          quantity,
          unit,
          stock: stock.current_stock,
          category: productData.category || 0,
        });
      }
    } else {
      res.status(404).json({ error: "Product not found by ID or barcode" });
    }
  } catch (error) {
    console.error("Product get error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get("/v2/:id", async (req, res, next) => {
  try {
    const product = await GetProductByIdOrBarcode(
      req.params.id,
      req.query.fields,
    );
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Get multiple products by IDs or barcodes
router.post("/bulk", async (req, res) => {
  try {
    const { identifiers } = req.body; // Expects array ["1", "2", "ABC123"]

    if (!identifiers || !identifiers.length) {
      return res.status(400).json({ error: "No IDs or barcodes provided" });
    }

    // Separate numeric IDs from barcodes (strings)
    const numericIds = [];
    const barcodes = [];

    identifiers.forEach((id) => {
      // Hem ID hem de barcode olarak arama yapabilmek için her ikisini de ekle
      if (!isNaN(id)) {
        numericIds.push(Number(id));
        barcodes.push(id.toString());
      } else {
        barcodes.push(id);
      }
    });

    // Find products by both criteria
    const products = await Products.findAll({
      order: [["sellPrice", "DESC"]],
      where: {
        [Sequelize.Op.or]: [
          { product_id: { [Sequelize.Op.in]: numericIds } },
          { barcode: { [Sequelize.Op.in]: barcodes } },
        ],
      },
    });
    if (products.length > 0) {
      const modifiedData = products.map((data) => {
        const plain = data.toJSON();
        return {
          ...plain,
          sellPrice: parseFloat(plain.sellPrice),
        };
      });
      res.json(modifiedData);
    } else {
      res
        .status(404)
        .json({ error: "No products found with the provided identifiers" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product
router.put("/:id", async (req, res, next) => {
  try {
    // Find product by ID or barcode
    let product = null;

    if (!isNaN(req.params.id)) {
      product = await Products.findByPk(Number(req.params.id));
    }

    if (!product) {
      product = await Products.findOne({ where: { barcode: req.params.id } });
    }

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fields that can be updated directly
    const fields = [
      "name",
      "buyPrice",
      "sellPrice",
      "unit",
      "barcode",
      "category_id",
    ];

    const updateData = {};
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Barcode uniqueness check (only if changing)
    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingProduct = await Products.findOne({
        where: { barcode: updateData.barcode },
      });

      if (existingProduct && existingProduct.id !== product.id) {
        return res.status(400).json({
          error: "Barcode already in use by another product",
          conflictingProduct: {
            id: existingProduct.id,
            name: existingProduct.name,
          },
        });
      }
    }

    if (req.body.newStock != 0) {
      await UpdateStockValue(req.params.id, req.body.newStock);
    }
    // Update product
    await product.update(updateData);

    // Return the updated product with stock change information

    return res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    next(error);
  }
});

router.put("/v2/:id", async (req, res, next) => {
  try {
    const message = await UpdateProduct(req.params.id, req.body);
    return res.json(message);
  } catch (error) {
    next(error);
  }
});
// Delete a product
router.delete("/:id", async (req, res, next) => {
  try {
    const message = await DeleteProduct(req.params.id);
    return res.json(message);
  } catch (error) {
    next(error);
  }
});

router.post("/generate-barcode", async (req, res, next) => {
  try {
    const barcode = await GenerateBarcode(req.body.unit);
    return res.json(barcode);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
