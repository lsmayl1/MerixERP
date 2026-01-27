const pdf2printer = require("pdf-to-printer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const AppError = require("../utils/AppError");
const bwipjs = require("bwip-js");
const {
  GetProductByIdOrBarcode,
} = require("../services/Product/ProductService");
const config = require("../database/config.json");
async function generateBarcode(text) {
  return bwipjs.toBuffer({
    bcid: "code128", // EAN13 varsa "ean13"
    text: String(text),
    scale: 2,
    height: 10,
    includetext: false,
  });
}
const PrintReceipt = (data) => {
  try {
    const {
      date,
      details,
      totalAmount,
      discountAmount,
      transactionType,
      payments = [],
    } = data;
    const mmToPt = (mm) => (mm / 25.4) * 72;
    const width = mmToPt(75);
    const margin = 0;
    const lineHeight = 12;
    const fontSize = 10;
    const boldFontSize = 10;
    const maxCharsPerLine = 16;

    // Column positions - better distributed
    const col = {
      name: margin,
      qty: width - 90,
      price: width - 35,
      total: width - 2,
    };

    // Calculate dynamic height more accurately
    let totalProductLines = 0;
    details.forEach((item) => {
      const nameLines = Math.ceil(item.name.length / maxCharsPerLine);
      totalProductLines += nameLines;
    });

    const headerHeight = 65;
    const productHeight = totalProductLines * lineHeight + details.length * 1;
    const footerHeight = 35;
    const dynamicHeight = headerHeight + productHeight + footerHeight;

    // Temp PDF path
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempPath = path.join(tempDir, `receipt_${Date.now()}.pdf`);

    const doc = new PDFDocument({
      size: [width, dynamicHeight + 130],
      margin,
    });

    doc.registerFont("Inter", path.join(__dirname, "../utils/fonts/Inter.ttf"));
    doc.font("Inter");

    let currentY = margin;
    currentY += lineHeight;
    // === Header ===
    doc.fontSize(boldFontSize + 2);
    const companyName = config.server.COMPANY_NAME || "Example";
    const companyAddress = config.server.COMPANY_ADDRESS || "123 Main St, City";
    const companyPhone = config.server.COMPANY_PHONE || "+1234567890";
    const printerInvoice = config.server.PRINTER_INVOICE || "XP-58IIH";
    doc.text(companyName, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.fontSize(boldFontSize - 2);
    doc.text(companyAddress, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.text(`Tel : ${companyPhone}`, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    const line = "*".repeat(42); // 80mm için ideal (58mm ise 32–36)

    let receiptType = "Satiş çeki";
    if (transactionType === "return") {
      receiptType = "Qaytarılma çeki";
    }

    doc.fontSize(12).text(receiptType, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.fontSize(8);
    doc.text(`Tarix: ${date}`, margin, currentY, {
      align: "center",
    });
    currentY += lineHeight;

    doc.fontSize(10).text(line, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 2;
    // === Table Header ===
    doc.fontSize(fontSize);
    doc.text("Məhsul", col.name, currentY);
    doc.text("Qiymət", col.price - 50, currentY);
    doc.text("Miqdar", col.qty - 36, currentY);
    doc.text("Məbləğ", col.total - 40, currentY);
    currentY += lineHeight + 4;

    // === Product List ===
    doc.fontSize(fontSize - 2);

    details.forEach((item) => {
      const nameLines = Math.ceil(item.name.length / maxCharsPerLine);
      let itemStartY = currentY;

      for (let i = 0; i < nameLines; i++) {
        const start = i * maxCharsPerLine;
        const textLine = item.name.substring(start, start + maxCharsPerLine);

        doc.text(textLine, col.name, currentY);

        // Only show qty, price, total on first line of product
        if (i === 0) {
          // Right align numbers
          const priceText = item.sellPrice.toString() + " ₼";
          const qtyText = item.quantity.toString();
          const totalText = item.subtotal.toString() + " ₼";

          const qtyWidth = doc.widthOfString(qtyText);
          const priceWidth = doc.widthOfString(priceText);
          const totalWidth = doc.widthOfString(totalText);

          doc.text(priceText, col.price - priceWidth - 15, itemStartY);
          doc.text(qtyText, col.qty - qtyWidth - 18, itemStartY);
          doc.text(totalText, col.total - totalWidth - 5, itemStartY);
        }

        currentY += lineHeight;
      }
      currentY += 4; // Small gap between products
    });

    // === Footer ===
    currentY += 3;

    doc.fontSize(10).text(line, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 2;

    // Total (right aligned)
    doc.fontSize(boldFontSize - 2);

    doc.text("ENDIRIM:", margin, currentY, { continued: true });
    doc.text(`${discountAmount || 0} ₼`, { align: "right" });
    currentY += 13;
    doc.text("YEKUN MƏBLƏG :", margin, currentY, { continued: true });
    doc.text(`${totalAmount || 0} ₼`, { align: "right" });
    currentY += 13;

    if (payments.length > 0) {
      doc.fontSize(10).text(line, margin, currentY, {
        align: "center",
        width: width - 2 * margin,
      });
      currentY += lineHeight + 2;
      doc.text("ÖDƏNİŞ ÜSULU", margin, currentY);
      currentY += 13;
      payments.forEach((payment) => {
        let method = payment.payment_type === "cash" ? "NAĞD" : "KART";

        doc.text(method, margin, currentY);

        doc.text(
          `${payment.amount} ₼`,
          doc.page.width - margin - 50,
          currentY,
          { width: 50, align: "right" },
        );

        currentY += 13;
      });
    }

    currentY += 10;
    currentY += boldFontSize + 8;

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);
    doc.end();

    stream.on("finish", async () => {
      try {
        // Print using pdf-to-printer

        const options = {
          printer: printerInvoice, // kendi yazıcınızın adı
          pages: "1",
          orientation: "portrait", // fiş yatay
          scale: "noscale", // Ölçeklendirme
          monochrome: false,
          silent: true,
          printDialog: false,
          copies: 1,
          paperSize: "Custom",
          fit: "actualsize",
        };

        await pdf2printer.print(tempPath, options);

        // Temizle
        fs.unlinkSync(tempPath);

        return { success: true, message: "Fiş yazıcıya gönderildi" };
      } catch (printError) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return {
          error: "Yazdırma başarısız",
          details: printError.message,
        };
      }
    });

    stream.on("error", (streamError) => {
      return {
        error: "PDF oluşturulamadı",
        details: streamError.message,
      };
    });
  } catch (error) {
    console.log("Print error" + error);
  }
};

const PrintLabel = async (labelData) => {
  try {
    const { barcode, name, sellPrice } = labelData;

    if (!barcode) {
      throw new AppError("Barcode is required", 400);
    }
    let productBarcode = barcode;
    let productName = name;
    let productSellPrice = sellPrice;
    if (!name || !sellPrice) {
      const ExistProduct = await GetProductByIdOrBarcode(barcode);
      if (!ExistProduct) {
        throw new AppError("Product not found", 404);
      } else {
        productBarcode = ExistProduct.barcode;
        productName = ExistProduct.name;
        productSellPrice = ExistProduct.sellPrice;
      }
    }

    const mmToPt = (mm) => (mm / 25.4) * 72;
    const width = mmToPt(50);
    const height = mmToPt(40);

    // Create temp directory if it doesn't exist
    const labelsDir = path.join(__dirname, "labels");
    if (!fs.existsSync(labelsDir)) {
      fs.mkdirSync(labelsDir, { recursive: true });
    }

    const fileName = `label_${barcode}_${Date.now()}.pdf`;
    const pdfPath = path.join(labelsDir, fileName);
    // Create PDF
    const doc = new PDFDocument({
      size: [width, height],
      margin: 0,
    });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    doc.registerFont("Inter", "./utils/fonts/Inter.ttf");
    doc.registerFont("Inter-Bold", "./utils/fonts/Inter-Bold.ttf");
    // Set font and size before measuring text so widthOfString matches rendering
    doc.font("Inter-Bold").fontSize(12);

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

    const leftMargin = 4; // small left margin for label text
    const maxTextWidth = width - leftMargin * 2; // available width for text
    const nameLines = wrapTextByWidth(doc, productName, maxTextWidth);

    let currentY = 5;

    nameLines.forEach((line) => {
      doc.text(line, leftMargin, currentY, {
        width: maxTextWidth,
        align: "left",
      });
      currentY += 12; // sətirlər arası məsafə
    });

    doc.fontSize(16);

    const priceText = `${productSellPrice} ₼`;
    const priceWidth = doc.widthOfString(priceText);

    doc.text(priceText, (width - priceWidth) / 2, currentY + 6);

    // Barcode
    const barcodeBuffer = await generateBarcode(productBarcode);
    const barcodeWidth = width; // %80 genişlik
    const barcodeX = (width - barcodeWidth) / 2;

    const barcodeY = currentY + 30;

    doc.image(barcodeBuffer, barcodeX, barcodeY, {
      width: barcodeWidth,
    });

    doc.fontSize(12);
    doc.text(productBarcode, barcodeX + 5, barcodeY + 34);

    // Save PDF to file
    doc.end();
    const printerLabel = config.server.PRINTER_LABEL || "XP-360B";
    // await new Promise((resolve, reject) => {
    //   stream.on("finish", async () => {
    //     const options = {
    //       printer: printerLabel, // Your thermal printer
    //       pages: "1",
    //       orientation: "landscape",
    //       monochrome: false,
    //       silent: true,
    //       printDialog: false,
    //       copies: 1,
    //       paperSize: "Custom", // Use custom paper size
    //     };

    //     try {
    //       await pdf2printer.print(pdfPath, options);
    //       fs.unlinkSync(pdfPath);
    //       resolve();
    //     } catch (err) {
    //       if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    //       reject(err);
    //     }
    //   });

    //   stream.on("error", (err) => {
    //     reject(err);
    //   });
    // });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  PrintReceipt,
  PrintLabel,
};
