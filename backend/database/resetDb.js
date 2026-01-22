const { sequelize } = require("../models/index");

async function resetDatabase() {
  try {
    // Veritabanını sıfırla ve tüm tabloları yeniden oluştur
    await sequelize.sync({ alter: true });
    console.log("Veritabanı başarıyla sıfırlandı ve yeniden yapılandırıldı.");
  } catch (error) {
    console.error("Veritabanı sıfırlanırken bir hata oluştu:", error);
  } finally {
    // Veritabanı bağlantısını kapat
    await sequelize.close();
  }
}

resetDatabase();
