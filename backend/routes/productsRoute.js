const express = require("express");
const router = express.Router();
const {
  Products,
  Sequelize,
  Op,
  ProductStock,
  Category,
} = require("../models");
const {
  CreateProduct,
  GetAllProducts,
  GetProductByIdOrBarcode,
  DeleteProduct,
  UpdateProduct,
  GenerateBarcode,
  UpdateStockValue,
} = require("../services/ProductService");
const { getCategoryById } = require("../services/CategoryService");

// Create a product
router.post("/", async (req, res) => {
  try {
    const { name, barcode, sellPrice, buyPrice, unit, category_id, newStock } =
      req.body;

    if (!barcode) {
      return res.status(400).json({ error: "Barkod yoxdur !" });
    }
    // Zorunlu alanları kontrol et
    if (!name || !unit) {
      return res.status(400).json({ error: "Ad veya Vahid teyin olunmuyub" });
    }

    if (!sellPrice || !buyPrice) {
      return res
        .status(400)
        .json({ error: "Alis ve Satis qiymetleri teyin olunmalidir!" });
    }

    // Unit’in geçerli bir ENUM değeri olduğundan emin ol
    if (!["piece", "kg"].includes(unit)) {
      return res.status(400).json({ error: 'Unit "piece" veya "kg" olmalı' });
    }
    if (category_id) {
      const category = await getCategoryById(category_id);

      if (!category) {
        return res.status(404).json({ error: "Category Not Valid" });
      }
    }

    // Barkodun uzunluğunu kontrol et (isteğe bağlı, 13 hane istiyorsanız)
    if (
      barcode &&
      unit === "kg" &&
      barcode.length !== 13 &&
      !barcode.startsWith("22")
    ) {
      return res.status(400).json({
        error:
          "barokdunu teyin etmek ucun barkodun yanindaki boz knopkaya basin ve emeliyyati tekrarlayin ",
      });
    }

    // Check if barcode already exists in Products table
    const existingProduct = await Products.findOne({
      where: { barcode: barcode },
    });

    if (existingProduct) {
      return res.status(400).json({
        error: "Bu barkod  başka bir mehsulda var ferqli barkod yaradin",
      });
    }

    // Veri türlerini düzenle
    const productData = {
      name,
      barcode: barcode || null,
      sellPrice: sellPrice ? parseFloat(sellPrice) : null,
      buyPrice: buyPrice ? parseFloat(buyPrice) : null,
      unit,
      category_id,
    };

    const product = await Products.create(productData);
    await ProductStock.create({
      product_id: product.product_id,
      current_stock: newStock || 0,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Hata:", error);
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Doğrulama hatası",
        errors: error.errors.map((e) => e.message),
      });
    } else if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Bu barkod zaten kullanılıyor" });
    }
    res.status(400).json({ error: error.message });
  }
});
router.post("/v2/", async (req, res, next) => {
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
router.get("/", async (req, res) => {
  try {
    // Query parametreleri (Varsayılan: page=1, limit=20)
    let { page, limit, sort = "A-Z" } = req.query;
    const order =
      sort === "Z-A" ? [["product_id", "DESC"]] : [["product_id", "ASC"]];
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 50;
    const offset = (page - 1) * limit;

    // Veriyi getir (SQL seviyesinde sıralama yaparak hızlandır)
    const products = await Products.findAll({
      order,
      limit,
      offset: offset,
      attributes: [
        "product_id",
        "name",
        "barcode",
        "sellPrice",
        "buyPrice",
        "unit",
      ],
    });

    // Tüm ürünlerin stoklarını ProductStock tablosundan çek
    const productIds = products.map((p) => p.product_id);
    const stocks = await ProductStock.findAll({
      where: {
        product_id: {
          [Op.in]: productIds,
        },
      },
      attributes: ["product_id", "current_stock"],
    });

    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[String(s.product_id)] = s.current_stock;
    });

    const transformedProducts = products.map((product) => ({
      ...product.get({ plain: true }),
      buyPrice: parseFloat(product.buyPrice),
      sellPrice: parseFloat(product.sellPrice),
      stock: parseInt(stockMap[String(product.product_id)] ?? 0).toFixed(2),
    }));

    res.json(transformedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/v2/", async (req, res, next) => {
  try {
    const products = await GetAllProducts(req.query);
    if (products) {
      return res.json(products);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/v2/", async (req, res) => {
  try {
    const products = await GetAllProducts(req.query);
  } catch (error) {}
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
    });

    // 2. Ürün ID'lerini al
    const productIds = products.map((p) => p.product_id);

    // 3. Stokları al
    const stocks = await ProductStock.findAll({
      where: {
        product_id: {
          [Op.in]: productIds,
        },
      },
      attributes: ["product_id", "current_stock"],
    });

    // 4. Stokları map'e çevir
    const stockMap = {};
    stocks.forEach((s) => {
      stockMap[s.product_id] = s.current_stock;
    });

    // 5. Dönüştürülmüş ürün listesi
    const transformedProducts = products.map((product) => ({
      ...product.get({ plain: true }),
      buyPrice: parseFloat(product.buyPrice),
      sellPrice: parseFloat(product.sellPrice),
      stock: stockMap[product.product_id] ?? 0,
    }));

    res.json(transformedProducts);
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
          stock: stock.current_stock,
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
      req.query.fields
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
router.put("/:id", async (req, res) => {
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
    const response = product.toJSON();

    return res.json(response);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      error: "Failed to update product",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
router.delete(
  "/:id",
  // validateIdOrBarcode,

  async (req, res) => {
    try {
      let product = null;
      if (!isNaN(req.params.id)) {
        product = await Products.findByPk(Number(req.params.id));
      }

      // If not found by ID, try barcode
      if (!product) {
        product = await Products.findOne({ where: { barcode: req.params.id } });
      }

      // If no product found, send error
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (product) {
        await product.destroy();
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete("/v2/:id", async (req, res, next) => {
  try {
    const message = await DeleteProduct(req.params.id);
    return res.json(message);
  } catch (error) {
    next(error);
  }
});

router.post("/generate-barcode", async (req, res) => {
  try {
    const { unit } = req.body;

    if (!unit || !["piece", "kg"].includes(unit)) {
      return res.status(400).json({
        message: 'Geçersiz veya eksik unit değeri. "piece" veya "kg" olmalı.',
      });
    }

    const existingBarcodes = (
      await Products.findAll({ attributes: ["barcode"] })
    ).map((p) => p.barcode);

    let newBarcodeBase; // 12 haneli temel barkod
    let newBarcode; // 13 haneli son barkod

    const calculateCheckDigit = (barcode) => {
      const digits = barcode.split("").map(Number);
      const evenSum =
        digits[1] + digits[3] + digits[5] + digits[7] + digits[9] + digits[11];
      const oddSum =
        digits[0] + digits[2] + digits[4] + digits[6] + digits[8] + digits[10];
      const total = evenSum * 3 + oddSum;
      const nextTen = Math.ceil(total / 10) * 10;
      return (nextTen - total) % 10;
    };

    if (unit === "piece") {
      do {
        newBarcodeBase = Math.floor(
          100000000000 + Math.random() * 900000000000
        ).toString(); // 12 haneli rastgele
        const checkDigit = calculateCheckDigit(newBarcodeBase);
        newBarcode = newBarcodeBase + checkDigit; // 13 haneli barkod
      } while (existingBarcodes.includes(newBarcode));
    } else if (unit === "kg") {
      const kgProducts = await Products.findAll({
        where: { unit: "kg", barcode: { [Op.like]: "22%" } },
        attributes: ["barcode"],
        order: [["barcode", "DESC"]],
      });

      let nextCode;
      if (kgProducts.length === 0) {
        nextCode = "00001"; // İlk kg ürünü için başlangıç
      } else {
        const lastKgBarcode = kgProducts[0].barcode;
        const lastCode = parseInt(lastKgBarcode.slice(2, 7), 10); // 3-7. haneler
        nextCode = String(lastCode + 1).padStart(5, "0"); // +1 ve 5 haneli sıfır dolgulu
      }

      newBarcodeBase = `22${nextCode}00000`; // 12 haneli: 2 + 5 + 5
      const checkDigit = calculateCheckDigit(newBarcodeBase);
      newBarcode = newBarcodeBase + checkDigit; // 13 haneli tam barkod

      if (existingBarcodes.includes(newBarcode)) {
        return res.status(500).json({
          message: "Benzersiz barkod üretilemedi, tüm kodlar dolu olabilir.",
        });
      }
    } else if (unit === "kg") {
      const kgProducts = await Products.findAll({
        where: { unit: "kg", barcode: { [Op.like]: "22%" } },
        attributes: ["barcode"],
        order: [["barcode", "DESC"]],
      });

      let nextCode;
      if (kgProducts.length === 0) {
        nextCode = "00001"; // İlk kg ürünü için başlangıç
      } else {
        const lastKgBarcode = kgProducts[0].barcode;
        let lastCode = parseInt(
          lastKgBarcode && lastKgBarcode.length >= 7
            ? lastKgBarcode.slice(2, 7)
            : "0",
          10
        );
        if (isNaN(lastCode)) lastCode = 0;
        nextCode = String(lastCode + 1).padStart(5, "0");
      }

      newBarcodeBase = `22${nextCode}00000`; // 12 haneli: 2 + 5 + 5
      const checkDigit = calculateCheckDigit(newBarcodeBase);
      newBarcode = newBarcodeBase + checkDigit; // 13 haneli tam barkod

      if (existingBarcodes.includes(newBarcode)) {
        return res.status(500).json({
          message: "Benzersiz barkod üretilemedi, tüm kodlar dolu olabilir.",
        });
      }
    }

    res.status(200).json({
      message: "Yeni barkod başarıyla oluşturuldu",
      barcode: newBarcode,
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({
      message: "Barkod oluşturma hatası",
      error: error.message,
    });
  }
});

router.post("/v2/generate-barcode", async (req, res, next) => {
  try {
    const barcode = await GenerateBarcode(req.body.unit);
    return res.json(barcode);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
