// const axios = require("axios");

let isOnline = false;

const checkHealth = async () => {
  try {
    // await axios.get("https://www.google.com");

    isOnline = true;
    return true;
  } catch (err) {
    console.error("❌ Offline mode:", err.message);
    isOnline = false;
    return false;
  }
};

module.exports = {
  checkHealth,
};
// hər 30 saniyədən bir yoxla
