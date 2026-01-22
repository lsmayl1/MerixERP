const { machineIdSync } = require("node-machine-id");

const getMachineId = () => {
  return machineIdSync(true); // hashed machine id
};

module.exports = { getMachineId };
