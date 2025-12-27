const pdf2printer = require("pdf-to-printer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const PrintReceipt = (data) => {
  try {
    const { date, details, totalAmount, discountAmount } = data;
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
      size: [width, dynamicHeight + 100],
      margin,
    });

    doc.registerFont("Inter", path.join(__dirname, "../utils/fonts/Inter.ttf"));
    doc.font("Inter");

    let currentY = margin;
    currentY += lineHeight;
    // === Header ===
    doc.fontSize(boldFontSize + 2);
    doc.text("Qlobus Məktəb Ləvazimatları", margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.fontSize(boldFontSize - 2);
    doc.text("Ünvan : Xəzər Rayonu, Binə Atçıliq", margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.text("Tel : 099-331-38-35", margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    const line = "*".repeat(42); // 80mm için ideal (58mm ise 32–36)

    doc.fontSize(12).text("Satiş çeki", margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 5;

    doc.fontSize(8);
    doc.text(`Tarix: ${date}`, margin, currentY, {
      align: "center",
    });
    currentY += lineHeight;

    // doc.text(`Çek No: ${data?.dataId}`, margin, currentY);
    // currentY += lineHeight + 3;

    doc.fontSize(10).text(line, margin, currentY, {
      align: "center",
      width: width - 2 * margin,
    });
    currentY += lineHeight + 2;
    // === Table Header ===
    doc.fontSize(fontSize);
    doc.text("Məhsul", col.name, currentY);
    doc.text("Qiymət", col.price - 46, currentY);
    doc.text("Miqdar", col.qty - 36, currentY);
    doc.text("Məbləğ", col.total - 40, currentY);
    currentY += lineHeight + 4;

    // doc
    //   .dash(1, { space: 2 }) // 1px nokta, 2px boşluk
    //   .moveTo(margin, currentY)
    //   .lineTo(width - margin, currentY)
    //   .stroke()
    //   .undash();
    // currentY += 3;

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

          doc.text(priceText, col.price - priceWidth - 10, itemStartY);
          doc.text(qtyText, col.qty - qtyWidth - 10, itemStartY);
          doc.text(totalText, col.total - totalWidth - 4, itemStartY);
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
    doc.text("ÖDƏNİŞ ÜSULU", margin, currentY);
    currentY += 13;
    doc.text("ENDIRIM:", margin, currentY, { continued: true });
    doc.text(`${discountAmount || 0} ₼`, { align: "right" });
    currentY += 13;
    // NAĞD
    doc.text("NAĞD:", margin, currentY, { continued: true });
    doc.text(`${totalAmount} ₼`, { align: "right" });

    currentY += 13;

    // KART
    doc.text("KART:", margin, currentY, { continued: true });
    doc.text("0.00 ₼", { align: "right" });

    currentY += 10;
    currentY += boldFontSize + 8;

    const stream = fs.createWriteStream(tempPath);
    doc.pipe(stream);
    doc.end();

    stream.on("finish", async () => {
      try {
        // Print using pdf-to-printer

        const options = {
          printer: "POS-80C", // kendi yazıcınızın adı
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

        res.json({ success: true, message: "Fiş yazıcıya gönderildi" });
      } catch (printError) {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        res.status(500).json({
          error: "Yazdırma başarısız",
          details: printError.message,
        });
      }
    });

    stream.on("error", (streamError) => {
      res.status(500).json({
        error: "PDF oluşturulamadı",
        details: streamError.message,
      });
    });
  } catch (error) {
    console.log("Print error" + error);
  }
};

module.exports = {
  PrintReceipt,
};
