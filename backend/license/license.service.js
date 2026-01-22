const fs = require("fs");
const path = require("path");
const { getMachineId } = require("./machine.js");

const LICENSE_PATH = path.resolve(__dirname, "license.json");

const checkLicense = () => {
  if (!fs.existsSync(LICENSE_PATH)) {
    throw new Error("LICENSE_NOT_FOUND");
  }

  const license = JSON.parse(fs.readFileSync(LICENSE_PATH, "utf8"));

  if (license.machineId !== getMachineId()) {
    throw new Error("LICENSE_MACHINE_MISMATCH");
  }

  if (new Date() > new Date(license.expireAt)) {
    throw new Error("LICENSE_EXPIRED");
  }

  return license;
};

module.exports = { checkLicense };
