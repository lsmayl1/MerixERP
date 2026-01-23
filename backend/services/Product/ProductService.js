const { Products, Op, ProductStock } = require("../../models/index");
const AppError = require("../../utils/AppError");

const GetAllProducts = async (data) => {
  try {
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 50;
    const fields = data?.fields?.split(",") || [
      "product_id",
      "name",
      "barcode",
      "buyPrice",
      "sellPrice",
      "category_id",
      "unit",
    ];
    const order =
      data.sort === "Z-A" ? [["product_id", "DESC"]] : [["product_id", "ASC"]];
    const offset = (page - 1) * limit;

    const products = await Products.findAll({
      attributes: fields,
      order,
      offset: offset,
      include: [
        {
          model: ProductStock,
          as: "stock",
          attributes: ["current_stock"],
        },
      ],
      limit: limit,
    });

    return products;
  } catch (error) {
    throw error;
  }
};

const CreateProduct = async (product) => {
  try {
    const { name, barcode, unit, buyPrice, sellPrice } = product;

    if (!name || !barcode || !unit || !buyPrice || !sellPrice) {
      throw new AppError("All Fields Required", 404);
    }
    if (!barcode) {
      throw new AppError("Barcode not reconized", 404);
    }
    const existingProduct = await Products.findOne({
      where: { barcode: barcode },
    });
    if (existingProduct) {
      throw new AppError("This product already exist");
    }
    if (!["piece", "kg"].includes(unit)) {
      throw new AppError("Type of unit need to be piece or kg");
    }

    const newProduct = await Products.create(product);
    await ProductStock.create({
      product_id: newProduct.product_id,
      current_stock: 0,
    });
    if (newProduct) {
      return {
        ...newProduct.toJSON(),
        sellPrice: parseFloat(newProduct.sellPrice),
        buyPrice: parseFloat(newProduct.buyPrice),
      };
    }
  } catch (error) {
    throw error;
  }
};

const UpdateProduct = async (id, product) => {
  try {
    const { name, barcode, unit, buyPrice, sellPrice } = product;
    const existingProduct = await GetProductByIdOrBarcode(id);
    if (!existingProduct) {
      throw new AppError("Product not Found", 404);
    }
    await Products.update(
      {
        name: name || existingProduct.name,
        unit: unit || existingProduct.unit,
        buyPrice: buyPrice || existingProduct.buyPrice,
        sellPrice: sellPrice || existingProduct.sellPrice,
        barcode: barcode || existingProduct.barcode,
      },
      {
        where: {
          [Op.or]: [{ product_id: id }],
        },
      },
    );
    return {
      product_id: id,
      name: name || existingProduct.name,
      unit: unit || existingProduct.unit,
      buyPrice: buyPrice || existingProduct.buyPrice,
      sellPrice: sellPrice || existingProduct.sellPrice,
      barcode: barcode || existingProduct.barcode,
    };
  } catch (error) {
    throw error;
  }
};

const GetProductByIdOrBarcode = async (id, fields) => {
  try {
    if (!id) {
      throw new AppError("Id not reconized", 404);
    }

    const attributes = fields?.split(",") || [
      "product_id",
      "name",
      "barcode",
      "buyPrice",
      "sellPrice",
    ];
    const product = await Products.findOne({
      where: {
        [Op.or]: [{ barcode: String(id) }, { product_id: Number(id) }],
      },
      attributes: attributes,
    });

    if (!product) {
      throw new AppError("Product Not Found", 404);
    }
    return product;
  } catch (error) {
    throw error;
  }
};

const DeleteProduct = async (id) => {
  try {
    if (!id) {
      throw new AppError("Id not reconized", 404);
    }
    const existingProduct = await GetProductByIdOrBarcode(
      id,
      "product_id,barcode",
    );
    if (!existingProduct) {
      throw new AppError("This Product not exist", 404);
    }
    await Products.destroy({
      where: {
        [Op.or]: [{ barcode: id }, { product_id: id }],
      },
    });
    return { message: "Deleting Success" };
  } catch (error) {
    throw error;
  }
};

const GenerateBarcode = async (unit) => {
  try {
    if (!unit || !["piece", "kg"].includes(unit)) {
      throw new AppError("Unit can be Kg or Piece", 400);
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
          100000000000 + Math.random() * 900000000000,
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
        throw new AppError("Cant generate unic barcode");
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
          10,
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

    return { barcode: newBarcode };
  } catch (error) {
    throw error;
  }
};

const UpdateStockValue = async (product_id, value) => {
  try {
    const product = await Products.findOne({
      where: {
        product_id,
      },
      include: [
        {
          model: ProductStock,
          as: "stock",
        },
      ],
    });
    if (!product) {
      throw AppError(404, "Product Not Found");
    }
    let newStock = 0;
    if (!product.stock) {
      newStock = Number(value);
    } else {
      newStock = Number(product.stock.current_stock) + Number(value);
    }

    await ProductStock.update(
      {
        current_stock: newStock,
      },
      {
        where: {
          id: product.stock.id,
        },
      },
    );

    console.log(product.toJSON());
  } catch (error) {
    throw error;
  }
};

module.exports = {
  CreateProduct,
  GetAllProducts,
  GetProductByIdOrBarcode,
  DeleteProduct,
  UpdateProduct,
  GenerateBarcode,
  UpdateStockValue,
};
