"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var calculationService_exports = {};
__export(calculationService_exports, {
  calculateEnergy: () => calculateEnergy,
  calculateSocAndEnergy: () => calculateSocAndEnergy,
  resetTodaysValues: () => resetTodaysValues,
  setEnergyWhMax: () => setEnergyWhMax,
  setSocToZero: () => setSocToZero
});
module.exports = __toCommonJS(calculationService_exports);
var import_timeHelper = require("../helpers/timeHelper");
const calculationStateKeys = [
  "packInput",
  "outputHome",
  "outputPack",
  "outputPack",
  "solarInput",
  "gridInput",
  "pvPower1",
  "pvPower2"
];
const setEnergyWhMax = async (adapter, productKey, deviceKey) => {
  const currentEnergyState = await (adapter == null ? void 0 : adapter.getStateAsync(
    productKey + "." + deviceKey + ".calculations.energyWh"
  ));
  if (currentEnergyState) {
    await (adapter == null ? void 0 : adapter.setState(
      `${productKey}.${deviceKey}.calculations.energyWhMax`,
      currentEnergyState == null ? void 0 : currentEnergyState.val,
      true
    ));
  }
};
const setSocToZero = async (adapter, productKey, deviceKey) => {
  await (adapter == null ? void 0 : adapter.setState(
    `${productKey}.${deviceKey}.calculations.soc`,
    0,
    true
  ));
  const energyWhState = await adapter.getStateAsync(
    `${productKey}.${deviceKey}.calculations.energyWh`
  );
  const energyWhMaxState = await adapter.getStateAsync(
    `${productKey}.${deviceKey}.calculations.energyWhMax`
  );
  const newMax = Number(energyWhMaxState == null ? void 0 : energyWhMaxState.val) - Number(energyWhState == null ? void 0 : energyWhState.val);
  await (adapter == null ? void 0 : adapter.setState(
    `${productKey}.${deviceKey}.calculations.energyWhMax`,
    newMax,
    true
  ));
  await (adapter == null ? void 0 : adapter.setState(
    `${productKey}.${deviceKey}.calculations.energyWh`,
    0,
    true
  ));
};
const calculateSocAndEnergy = async (adapter, productKey, deviceKey, stateKey, value) => {
  var _a;
  let energyWhMax = 0;
  const productName = (_a = await adapter.getStateAsync(`${productKey}.${deviceKey}.productName`)) == null ? void 0 : _a.val;
  const currentEnergyState = await (adapter == null ? void 0 : adapter.getStateAsync(
    productKey + "." + deviceKey + ".calculations.energyWh"
  ));
  const currentEnergyMaxState = await (adapter == null ? void 0 : adapter.getStateAsync(
    productKey + "." + deviceKey + ".calculations.energyWhMax"
  ));
  const currentMaxValue = Number(
    currentEnergyMaxState ? currentEnergyMaxState.val : 0
  );
  const currentValue = (currentEnergyState == null ? void 0 : currentEnergyState.val) ? Number(currentEnergyState == null ? void 0 : currentEnergyState.val) : 0;
  const batteries = adapter.pack2Devices.filter(
    (x) => x.deviceKey == deviceKey
  );
  let isAio = false;
  if (productName == null ? void 0 : productName.toString().toLowerCase().includes("aio")) {
    isAio = true;
  }
  if (isAio) {
    energyWhMax = 1920;
  } else {
    for (let i = 0; i < batteries.length; i++) {
      if (batteries[i].type == "AB1000") {
        energyWhMax = energyWhMax + 960;
      } else if (batteries[i].type == "AB2000") {
        energyWhMax = energyWhMax + 1920;
      }
    }
  }
  let newValue = stateKey == "outputPack" ? currentValue + value : currentValue - value;
  if (stateKey == "outputPack" && newValue > energyWhMax) {
    newValue = energyWhMax;
  }
  if (newValue > 0) {
    adapter == null ? void 0 : adapter.setState(
      `${productKey}.${deviceKey}.calculations.energyWh`,
      newValue,
      true
    );
    if (currentEnergyMaxState) {
      const soc = Number((newValue / currentMaxValue * 100).toFixed(1));
      await (adapter == null ? void 0 : adapter.setState(
        `${productKey}.${deviceKey}.calculations.soc`,
        soc > 100 ? 100 : soc,
        true
      ));
      if (newValue > currentMaxValue) {
        await (adapter == null ? void 0 : adapter.setState(
          `${productKey}.${deviceKey}.calculations.energyWhMax`,
          newValue,
          true
        ));
      }
      const currentOutputPackPower = await (adapter == null ? void 0 : adapter.getStateAsync(
        `${productKey}.${deviceKey}.outputPackPower`
      ));
      const currentPackInputPower = await (adapter == null ? void 0 : adapter.getStateAsync(
        productKey + "." + deviceKey + ".packInputPower"
      ));
      if (stateKey == "outputPack" && (currentOutputPackPower == null ? void 0 : currentOutputPackPower.val) != null && currentOutputPackPower != void 0) {
        const toCharge = currentMaxValue - newValue;
        const remainHoursAsDecimal = toCharge / Number(currentOutputPackPower.val);
        if (remainHoursAsDecimal < 48) {
          const remainFormatted = (0, import_timeHelper.toHoursAndMinutes)(
            Math.round(remainHoursAsDecimal * 60)
          );
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainInputTime`,
            remainFormatted,
            true
          ));
        } else {
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainInputTime`,
            "",
            true
          ));
        }
      } else if (stateKey == "packInput" && currentPackInputPower != null && currentPackInputPower != void 0) {
        const remainHoursAsDecimal = newValue / Number(currentPackInputPower.val);
        const remainFormatted = (0, import_timeHelper.toHoursAndMinutes)(
          Math.round(remainHoursAsDecimal * 60)
        );
        if (remainHoursAsDecimal < 48) {
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainOutTime`,
            remainFormatted,
            true
          ));
        } else {
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainOutTime`,
            "",
            true
          ));
        }
      }
    }
  } else if (newValue <= 0 && stateKey == "outputPack") {
    await (adapter == null ? void 0 : adapter.setState(
      `${productKey}.${deviceKey}.calculations.remainInputTime`,
      "",
      true
    ));
  } else if (newValue <= 0 && stateKey == "packInput") {
    await (adapter == null ? void 0 : adapter.setState(
      `${productKey}.${deviceKey}.calculations.remainOutTime`,
      "",
      true
    ));
  }
};
const calculateEnergy = async (adapter, productKey, deviceKey) => {
  calculationStateKeys.forEach(async (stateKey) => {
    let stateNameEnergyWh = "";
    let stateNameEnergykWh = "";
    let stateNamePower = "";
    if (stateKey == "pvPower1") {
      stateNameEnergyWh = `${productKey}.${deviceKey}.calculations.solarInputPv1EnergyTodayWh`;
      stateNameEnergykWh = `${productKey}.${deviceKey}.calculations.solarInputPv1EnergyTodaykWh`;
      stateNamePower = `${productKey}.${deviceKey}.pvPower1`;
    } else if (stateKey == "pvPower2") {
      stateNameEnergyWh = `${productKey}.${deviceKey}.calculations.solarInputPv2EnergyTodayWh`;
      stateNameEnergykWh = `${productKey}.${deviceKey}.calculations.solarInputPv2EnergyTodaykWh`;
      stateNamePower = `${productKey}.${deviceKey}.pvPower2`;
    } else {
      stateNameEnergyWh = `${productKey}.${deviceKey}.calculations.${stateKey}EnergyTodayWh`;
      stateNameEnergykWh = `${productKey}.${deviceKey}.calculations.${stateKey}EnergyTodaykWh`;
      stateNamePower = `${productKey}.${deviceKey}.${stateKey}Power`;
    }
    const currentPowerState = await (adapter == null ? void 0 : adapter.getStateAsync(stateNamePower));
    const currentEnergyState = await (adapter == null ? void 0 : adapter.getStateAsync(stateNameEnergyWh));
    if ((currentEnergyState == null ? void 0 : currentEnergyState.val) == 0) {
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergyWh, 1e-6, true));
    } else if (currentEnergyState && currentEnergyState.lc && currentPowerState && currentPowerState.val != void 0 && currentPowerState.val != null) {
      const timeFrame = 3e4;
      let addEnergyValue = Number(currentPowerState.val) * timeFrame / 36e5;
      const chargingFactor = 0.96;
      const dischargingFactor = 1.08 - addEnergyValue / 1e4;
      addEnergyValue = stateKey == "outputPack" && addEnergyValue > 0 ? addEnergyValue * chargingFactor : addEnergyValue;
      addEnergyValue = stateKey == "packInput" && addEnergyValue > 0 ? addEnergyValue * dischargingFactor : addEnergyValue;
      let newEnergyValue = Number(currentEnergyState.val) + addEnergyValue;
      if (newEnergyValue < 0) {
        newEnergyValue = 0;
      }
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergyWh, newEnergyValue, true));
      await (adapter == null ? void 0 : adapter.setState(
        stateNameEnergykWh,
        Number((newEnergyValue / 1e3).toFixed(2)),
        true
      ));
      if ((stateKey == "outputPack" || stateKey == "packInput") && addEnergyValue > 0) {
        await calculateSocAndEnergy(
          adapter,
          productKey,
          deviceKey,
          stateKey,
          addEnergyValue
        );
      } else {
        if (stateKey == "outputPack") {
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainInputTime`,
            "",
            true
          ));
        } else if (stateKey == "packInput") {
          await (adapter == null ? void 0 : adapter.setState(
            `${productKey}.${deviceKey}.calculations.remainOutTime`,
            "",
            true
          ));
        }
      }
    } else {
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergyWh, 0, true));
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergykWh, 0, true));
    }
  });
};
const resetTodaysValues = async (adapter) => {
  adapter.deviceList.forEach((device) => {
    calculationStateKeys.forEach(async (stateKey) => {
      let stateNameEnergyWh = "";
      let stateNameEnergykWh = "";
      if (stateKey == "pvPower1") {
        stateNameEnergyWh = `${device.productKey}.${device.deviceKey}.calculations.solarInputPv1EnergyTodayWh`;
        stateNameEnergykWh = `${device.productKey}.${device.deviceKey}.calculations.solarInputPv1EnergyTodaykWh`;
      } else if (stateKey == "pvPower2") {
        stateNameEnergyWh = `${device.productKey}.${device.deviceKey}.calculations.solarInputPv2EnergyTodayWh`;
        stateNameEnergykWh = `${device.productKey}.${device.deviceKey}.calculations.solarInputPv2EnergyTodaykWh`;
      } else {
        stateNameEnergyWh = `${device.productKey}.${device.deviceKey}.calculations.${stateKey}EnergyTodayWh`;
        stateNameEnergykWh = `${device.productKey}.${device.deviceKey}.calculations.${stateKey}EnergyTodaykWh`;
      }
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergyWh, 0, true));
      await (adapter == null ? void 0 : adapter.setState(stateNameEnergykWh, 0, true));
    });
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  calculateEnergy,
  calculateSocAndEnergy,
  resetTodaysValues,
  setEnergyWhMax,
  setSocToZero
});
//# sourceMappingURL=calculationService.js.map
