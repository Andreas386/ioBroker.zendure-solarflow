import { ZendureSolarflow } from "../main";

/* eslint-disable @typescript-eslint/indent */
export const createCalculationStates = async (
  adapter: ZendureSolarflow,
  productKey: string,
  deviceKey: string,
): Promise<void> => {
  /*
    Start Solar Input Energy states
    */
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.solarInputEnergyTodayWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutiger Solarertrag (Wh)",
          en: "Todays solar input (Wh)",
        },
        type: "number",
        desc: "solarInputEnergyTodayWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "Wh",
      },
      native: {},
    },
  );

  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.solarInputEnergyTodaykWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutiger Solarertrag (kWh)",
          en: "Todays solar input (kWh)",
        },
        type: "number",
        desc: "solarInputEnergyTodaykWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "kWh",
      },
      native: {},
    },
  );

  /*
    Start output pack Energy states
    */
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.outputPackEnergyTodayWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Ladung zum Akku (Wh)",
          en: "Todays charge energy to battery (Wh)",
        },
        type: "number",
        desc: "outputPackEnergyTodayWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "Wh",
      },
      native: {},
    },
  );

  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.outputPackEnergyTodaykWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Ladung zum Akku (kWh)",
          en: "todays charge energy to battery (kWh)",
        },
        type: "number",
        desc: "outputPackEnergyTodaykWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "kWh",
      },
      native: {},
    },
  );

  /*
    Start Pack Input Energy states
    */
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.packInputEnergyTodayWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Einspeisung aus Akku (Wh)",
          en: "Todays discharge energy from battery (Wh)",
        },
        type: "number",
        desc: "packInputEnergyTodayWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "Wh",
      },
      native: {},
    },
  );

  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.packInputEnergyTodaykWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Einspeisung aus Akku (kWh)",
          en: "Todays discharge energy from battery (kWh)",
        },
        type: "number",
        desc: "packInputEnergyTodaykWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "kWh",
      },
      native: {},
    },
  );

  /*
    Start outputHome Energy states
    */
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.outputHomeEnergyTodayWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Einspeisung ins Haus (Wh)",
          en: "Todays input energy to home (Wh)",
        },
        type: "number",
        desc: "outputHomeEnergyTodayWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "Wh",
      },
      native: {},
    },
  );

  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.outputHomeEnergyTodaykWh",
    {
      type: "state",
      common: {
        name: {
          de: "Heutige Einspeisung ins Haus (kWh)",
          en: "Todays input energy to home (kWh)",
        },
        type: "number",
        desc: "outputHomeEnergyTodaykWh",
        role: "value.energy",
        read: true,
        write: false,
        unit: "kWh",
      },
      native: {},
    },
  );
  /*
    End Energy states
    */

  // Calculation input time
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.remainInputTime",
    {
      type: "state",
      common: {
        name: {
          de: "Erwartete Ladedauer (hh:mm)",
          en: "remaining charge time (hh:mm)",
        },
        type: "string",
        desc: "calcRemainInputTime",
        role: "value",
        read: true,
        write: false,
      },
      native: {},
    },
  );

  // Calculation remainOutTime
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.remainOutTime",
    {
      type: "state",
      common: {
        name: {
          de: "Erwartete Entladedauer (hh:mm)",
          en: "remaining discharge time (hh:mm)",
        },
        type: "string",
        desc: "calcRemainOutTime",
        role: "value",
        read: true,
        write: false,
      },
      native: {},
    },
  );

  // Calculation SOC
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.soc",
    {
      type: "state",
      common: {
        name: {
          de: "Ladezustand in %",
          en: "State of Charge %",
        },
        type: "string",
        desc: "soc",
        role: "value",
        read: true,
        write: false,
        unit: "%",
      },
      native: {},
    },
  );

  // Energy Wh
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.energyWh",
    {
      type: "state",
      common: {
        name: {
          de: "Energie in den Batterien (Wh)",
          en: "Energy in battery (Wh)",
        },
        type: "string",
        desc: "energyWh",
        role: "value",
        read: true,
        write: false,
        unit: "%",
      },
      native: {},
    },
  );

  // Max. Energy for alle batteries Wh
  await adapter?.extendObjectAsync(
    productKey + "." + deviceKey + ".calculations.energyWhMax",
    {
      type: "state",
      common: {
        name: {
          de: "Max. Energie in allen Batterien (Wh)",
          en: "Max. Energy in battery (Wh)",
        },
        type: "string",
        desc: "energyWhMax",
        role: "value",
        read: true,
        write: false,
        unit: "%",
      },
      native: {},
    },
  );
};
