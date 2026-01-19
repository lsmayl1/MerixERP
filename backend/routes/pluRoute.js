const express = require("express");
const router = express.Router();
const Products = require("../models/products");
const { Plu } = require("../models");
const { sequelize, Op } = require("../models/index");

// PLU tablosunu otomatik doldurma
router.get("/generate-plu", async (req, res) => {
  try {
    // Kg bazlı ürünleri al
    const kgProducts = await Products.findAll({
      where: {
        unit: "kg",
        barcode: { [Op.like]: "22%" },
        [Op.and]: [
          sequelize.where(sequelize.fn("LENGTH", sequelize.col("barcode")), 13),
        ],
      },
    });

    if (kgProducts.length === 0) {
      return res.status(200).json({ message: "Kg bazlı ürün bulunamadı" });
    }

    const pluData = kgProducts.map((product, index) => {
      const no = index + 1;
      const rawCode = product.barcode.slice(2, 7); // Barkodun 3-7. haneleri
      const code = parseInt(rawCode, 10).toString(); // Öndeki sıfırları kaldır+
      const lfcode = index + 1;

      return {
        no,
        name: product.name,
        lfcode,
        code, // Sıfırsız code
        barcode_type: 7,
        unit_price: Math.round(product.sellPrice * 100) || 0,
        weight_unit: 4,
        deptment: 22,
        tare: 0,
        shelf_time: 0,
        packagetype: 0,
        packagetolerance: 0,
        zero_data_k: 0,
        zero_data_l: 0,
        zero_data_m: 0,
        zero_data_s: 0,
        zero_data_q: 0,
        zero_data_p: 1,
        message1: 0,
        message2: 0,
        message3: 0,
      };
    });

    // Yeni verileri PLU tablosuna ekle
    await Plu.bulkCreate(pluData, { ignoreDuplicates: true });

    res.status(200).json({
      message: "PLU tablosu başarıyla sıfırlandı ve güncellendi",
      pluData: pluData.map((item) => ({
        name: item.name,
        code: item.code,
        no: item.no,
        lfcode: item.lfcode,
        unit_price: parseFloat(item.unit_price.toFixed(2) / 100),
      })),
    });
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({
      message: "Bir hata oluştu",
      error: error.message,
    });
  }
});

// CSV olarak dışa aktarma
router.get("/export-plu", async (req, res) => {
  try {
    const pluRecords = await Plu.findAll({
      order: [["no", "ASC"]],
    });

    // CSV verisini tam olarak istenen formatta oluştur (21 sütun)
    const csvData = pluRecords
      .map((p) => {
        return [
          p.no,
          p.name,
          p.lfcode,
          p.code, // Öndeki sıfırlar olmadan
          p.barcode_type,
          p.unit_price,
          p.weight_unit,
          p.deptment,
          p.tare,
          String(p.shelf_time).padStart(3, "0"), // 000 formatı
          p.packagetype,
          p.packagetolerance,
          String(p.zero_data_k).padStart(3, "0"), // 000 formatı
          p.zero_data_l,
          p.zero_data_m,
          p.zero_data_s,
          p.zero_data_q,
          p.zero_data_p,
          p.message1,
          p.message2,
          p.message3,
        ].join(",");
      })
      .join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment("newpluTableData.csv");
    res.send(csvData);
  } catch (error) {
    console.error("Hata:", error);
    res
      .status(500)
      .json({ message: "CSV dışa aktarma hatası", error: error.message });
  }
});

router.get("/update-units", async (req, res) => {
  try {
    // Önce şartlara uyan ürünleri buluyoruz
    const products = await Products.findAll({
      where: {
        barcode: {
          [Op.and]: [
            { [Op.like]: "22%" },
            sequelize.where(
              sequelize.fn("LENGTH", sequelize.col("barcode")),
              13,
            ),
          ],
        },
      },
    });

    // Sonra her birini güncelliyoruz
    for (const product of products) {
      await product.update({ unit: "kg" });
    }

    res.json({ message: "Units updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

module.exports = router;
