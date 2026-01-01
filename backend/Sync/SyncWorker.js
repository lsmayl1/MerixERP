const axios = require("axios");
const { checkHealth } = require("./HealthCheck");
const { SyncQueue } = require("../models");
const { Op } = require("sequelize");
async function SyncWorker() {
  const online = await checkHealth();
  if (!online) {
    console.log("❌ Offline, gözləyirəm...");
    return;
  }

  console.log("✅ Online, SyncQueue işlənir...");

  const items = await SyncQueue.findAll({
    where: { status: { [Op.in]: ["pending", "failed"] } },
    limit: 20, // batch göndərmək üçün
  });

  for (const item of items) {
    try {
      const response = await axios.post("http://8.222.237.126:3000/api/sync", {
        entity: item.entity,
        action: item.action,
        record_id: item.record_id,
        payload: item.payload,
      });
      if (response.status === 200) {
        await item.update({ status: "success" });
        console.log(`✔️ Sync edildi: ${item.id}`);
      } else {
        throw new Error("Server cavabı 200 deyil");
      }
    } catch (err) {
      await item.update({
        status: "failed",
        attempts: item.attempts + 1,
        last_error: err.message,
      });
      console.error(`⚠️ Sync xətası: ${item.id}`, err.message);
    }
  }
}

function startSyncWorker() {
  SyncWorker(); // dərhal işə sal
  setInterval(SyncWorker, 10000 * 6);
}

module.exports = { startSyncWorker };
