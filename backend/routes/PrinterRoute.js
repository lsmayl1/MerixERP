const express = require("express");
const router = express.Router();
const pdf2printer = require("pdf-to-printer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { GetProductByIdOrBarcode } = require("../services/ProductService");
const { getSaleById } = require("../services/SaleService");
const bwipjs = require("bwip-js");
const { PrintReceipt } = require("../services/PrinterService");
async function generateBarcode(text) {
  return bwipjs.toBuffer({
    bcid: "code128", // EAN13 varsa "ean13"
    text: String(text),
    scale: 2,
    height: 10,
    includetext: false,
  });
}
// Using pdf-to-printer
router.post("/label-print", async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: "Barcode is required" });
    }
    const product = await GetProductByIdOrBarcode(barcode);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const mmToPt = (mm) => (mm / 25.4) * 72;
    const width = mmToPt(40);
    const height = mmToPt(20);

    // Create temp directory if it doesn't exist
    const labelsDir = path.join(__dirname, "labels");
    if (!fs.existsSync(labelsDir)) {
      fs.mkdirSync(labelsDir, { recursive: true });
    }

    const fileName = `label_${product.barcode}_${Date.now()}.pdf`;
    const pdfPath = path.join(labelsDir, fileName);
    // Create PDF
    const doc = new PDFDocument({
      size: [width, height],
      margin: 0,
    });

    doc.registerFont("Inter", "./utils/fonts/Inter.ttf");
    doc.registerFont("Inter-Bold", "./utils/fonts/Inter-Bold.ttf");
    // Set font and size before measuring text so widthOfString matches rendering
    doc.font("Inter-Bold").fontSize(6);

    function wrapTextByWidth(doc, text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let line = "";

      words.forEach((word) => {
        const testLine = line ? line + " " + word : word;
        const testWidth = doc.widthOfString(testLine);

        if (testWidth <= maxWidth) {
          line = testLine;
        } else {
          if (line) lines.push(line);

          // If the single word is wider than maxWidth, split it into chunks
          if (doc.widthOfString(word) > maxWidth) {
            let chunk = "";
            for (let i = 0; i < word.length; i++) {
              const char = word[i];
              const testChunk = chunk + char;
              if (doc.widthOfString(testChunk) <= maxWidth) {
                chunk = testChunk;
              } else {
                if (chunk) lines.push(chunk);
                chunk = char;
              }
            }
            if (chunk) {
              // Start new current line with the last chunk (so following words can append)
              line = chunk;
            } else {
              line = "";
            }
          } else {
            line = word;
          }
        }
      });

      if (line) lines.push(line);
      return lines;
    }

    // ...existing code...
    const productName = product.name || "Ürün Adı";

    const leftMargin = 4; // small left margin for label text
    const maxTextWidth = width - leftMargin * 2; // available width for text
    const nameLines = wrapTextByWidth(doc, productName, maxTextWidth);

    let currentY = 2;

    nameLines.forEach((line) => {
      doc.text(line, leftMargin, currentY, {
        width: maxTextWidth,
        align: "left",
      });
      currentY += 9; // sətirlər arası məsafə
    });

    doc.fontSize(9);

    const priceText = `${product.sellPrice} ₼`;
    const priceWidth = doc.widthOfString(priceText);

    doc.text(priceText, (width - priceWidth) / 2, currentY + 2);

    // Barcode
    const barcodeBuffer = await generateBarcode(product.barcode);
    const barcodeWidth = width; // %80 genişlik
    const barcodeX = (width - barcodeWidth) / 2;

    const barcodeY = currentY + 18;

    doc.image(barcodeBuffer, barcodeX, barcodeY, {
      width: barcodeWidth,
    });

    // Save PDF to file
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.end();

    // stream.on("finish", async () => {
    //   try {
    //     // Print using pdf-to-printer with exact size settings

    //     const options = {
    //       printer: "Barkod", // Your thermal printer
    //       pages: "1",
    //       orientation: "landscape",
    //       monochrome: false,
    //       silent: true,
    //       printDialog: false,
    //       copies: 1,
    //       // For thermal printers, these are the key settings:
    //       paperSize: "Custom", // Use custom paper size
    //     };

    //     console.log("Printing with options:", options);
    //     await pdf2printer.print(pdfPath, options);

    //     // Clean up temp file
    //     fs.unlinkSync(pdfPath);

    //     console.log("PDF printed successfully");
    //     res.json({ success: true, message: "PDF printed successfully" });
    //   } catch (printError) {
    //     console.error("Print error:", printError);
    //     // Clean up temp file even on error
    //     if (fs.existsSync(pdfPath)) {
    //       fs.unlinkSync(pdfPath);
    //     }
    //     res.status(500).json({
    //       error: "Print failed",
    //       details: printError.message,
    //     });
    //   }
    // });

    stream.on("error", (streamError) => {
      console.error("PDF creation error:", streamError);
      res.status(500).json({
        error: "Failed to create PDF",
        details: streamError.message,
      });
    });
  } catch (error) {
    console.error("General error:", error);
    res.status(500).json({
      error: "Failed to create and print PDF",
      details: error.message,
    });
  }
});

router.get("/sale-receipt/:id", async (req, res, next) => {
  try {
    const sale = await getSaleById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    PrintReceipt({
      date: sale.date,
      details: sale.details,
      totalAmount: sale.totalAmount || 0,
      discountAmount: sale.discountedAmount,
      payments: sale.payments,
    });
    res.json({ success: true, message: "Receipt sent to printer" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
