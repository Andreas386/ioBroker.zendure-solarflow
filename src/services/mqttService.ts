/* eslint-disable @typescript-eslint/indent */
import { MqttClient } from "mqtt";
import * as mqtt from "mqtt";
import { ZendureSolarflow } from "../main";
import { ISolarFlowDeviceDetails } from "../models/ISolarFlowDeviceDetails";
import { createSolarFlowStates, updateSolarFlowState } from "./adapterService";

let client: MqttClient | undefined = undefined;
let adapter: ZendureSolarflow | undefined = undefined;

const onConnected = () => {
  adapter?.log.info("Connected with MQTT!");
};

const onError = (error: any) => {
  adapter?.log.error("Connection to MQTT failed! Error: " + error);
};

const onSubscribe = (err: Error | null) => {
  if (err) {
    adapter?.log.error("Subscription to MQTT failed! Error: " + err);
  } else {
    adapter?.log.info("Subscription successful!");
  }
};

const onMessage = async (topic: string, message: Buffer) => {
  if (adapter) {
    const splitted = topic.split("/");
    const productKey = splitted[1];
    const deviceKey = splitted[2];

    const obj = JSON.parse(message.toString());

    if (
      obj.properties?.electricLevel != null &&
      obj.properties?.electricLevel != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "electricLevel",
        obj.properties.electricLevel,
      );
    }

    if (
      obj.properties?.outputHomePower != null &&
      obj.properties?.outputHomePower != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "outputHomePower",
        obj.properties.outputHomePower,
      );
    }

    if (
      obj.properties?.outputLimit != null &&
      obj.properties?.outputLimit != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "outputLimit",
        obj.properties.outputLimit,
      );
    }

    if (
      obj.properties?.outputPackPower != null &&
      obj.properties?.outputPackPower != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "outputPackPower",
        obj.properties.outputPackPower,
      );

      // if outPutPackPower set packInputPower to 0
      updateSolarFlowState(adapter, productKey, deviceKey, "packInputPower", 0);
    }

    if (
      obj.properties?.packInputPower != null &&
      obj.properties?.packInputPower != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "packInputPower",
        obj.properties.packInputPower,
      );

      // if packInputPower set outputPackPower to 0
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "outputPackPower",
        0,
      );
    }

    if (
      obj.properties?.solarInputPower != null &&
      obj.properties?.solarInputPower != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "solarInputPower",
        obj.properties.solarInputPower,
      );
    }

    if (
      obj.properties?.remainInputTime != null &&
      obj.properties?.remainInputTime != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "remainInputTime",
        obj.properties.remainInputTime,
      );
    }

    if (
      obj.properties?.remainOutTime != null &&
      obj.properties?.remainOutTime != undefined
    ) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "remainOutTime",
        obj.properties.remainOutTime,
      );
    }

    if (obj.properties?.socSet != null && obj.properties?.socSet != undefined) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "socSet",
        Number(obj.properties.socSet) / 10,
      );
    }

    if (obj.properties?.minSoc != null && obj.properties?.minSoc != undefined) {
      updateSolarFlowState(
        adapter,
        productKey,
        deviceKey,
        "minSoc",
        Number(obj.properties.minSoc) / 10,
      );
    }

    if (obj.packData) {
      console.log(obj.packData);
    }
  }

  if (client) {
    //client.end();
  }
};

export const setOutputLimit = (
  adapter: ZendureSolarflow,
  productKey: string,
  deviceKey: string,
  limit: number,
) => {
  if (client && productKey && deviceKey) {
    // Das Limit kann unter 100 nur in 30er Schritten gesetzt werden, dH. 30/60/90/100, wir rechnen das also um
    if (
      limit < 100 &&
      limit != 90 &&
      limit != 60 &&
      limit != 30 &&
      limit != 0
    ) {
      if (limit < 100 && limit > 90) {
        limit = 90;
      } else if (limit < 90 && limit > 60) {
        limit = 60;
      } else if (limit < 60 && limit > 30) {
        limit = 30;
      } else if (limit < 30) {
        limit = 30;
      }
    }

    // 'iot/{auth.productKey}/{auth.deviceKey}/properties/write' == Topic? Oder productKey,deviceKey aus Device Details?
    const topic = `iot/${productKey}/${deviceKey}/properties/write`;

    const outputlimit = { properties: { outputLimit: limit } };
    adapter.log.info(
      `Setting Output Limit for device key ${deviceKey} to ${limit}!`,
    );
    client?.publish(topic, JSON.stringify(outputlimit));
  }
};

export const connectMqttClient = (_adapter: ZendureSolarflow) => {
  adapter = _adapter;

  const options: mqtt.IClientOptions = {
    clientId: adapter.accessToken,
    username: "zenApp",
    password: "oK#PCgy6OZxd",
    clean: true,
    protocolVersion: 5,
  };

  if (mqtt && adapter && adapter.paths) {
    client = mqtt.connect(
      "mqtt://" + adapter.paths.mqttUrl + ":" + adapter.paths.mqttPort,
      options,
    ); // create a client

    if (client && adapter) {
      client.on("connect", onConnected);
      client.on("error", onError);

      // Subscribe to Topic (appkey von Zendure)
      adapter.deviceList.forEach((device: ISolarFlowDeviceDetails) => {
        // States erstellen
        if (adapter) {
          createSolarFlowStates(adapter, device.productKey, device.deviceKey);

          const reportTopic = `/${device.productKey}/${device.deviceKey}/properties/report`;
          const iotTopic = `iot/${device.productKey}/${device.deviceKey}/#`;

          adapter.log.info(`Subscribing to MQTT Topic: ${reportTopic}`);

          adapter.log.info(`Subscribing to MQTT Topic: ${iotTopic}`);

          client?.subscribe(reportTopic, onSubscribe);
          client?.subscribe(iotTopic, onSubscribe);
        }
      });

      client.on("message", onMessage);
    }
  }
};
