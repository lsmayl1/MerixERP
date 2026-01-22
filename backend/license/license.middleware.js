const { checkLicense } = require("./license.service.js");

const licenseMiddleware = (req, res, next) => {
  // Bu endpoint lisanssız çalışabilir
  if (req.path === "/license-status") return next();

  try {
    checkLicense();
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      code: err.message,
      message: "Lisans süresi dolmuş veya geçersiz",
    });
  }
};

module.exports = { licenseMiddleware };
