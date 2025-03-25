import { Platform } from "react-native";
import * as Device from "expo-device";
import { getDateForApi, logError, logEvent } from "./utils";
import { uuidv7 } from "uuidv7";
import {
  ActionEvent,
  ErrorEvent,
  ExpoFastAnalyticsConfig,
  ExpoFastAnalyticsEvent,
  ExpoFastClient,
  IdentifyEvent,
  NavigationEvent,
  StateEvent,
} from "./types";
import type { AsyncStorageStatic } from "@react-native-async-storage/async-storage";

const DEFAULT_API_URL = "https://expofast.app/api/analytics/push";

let events: ExpoFastAnalyticsEvent[] = [];

export let config: ExpoFastAnalyticsConfig;

let identifyId: string;
let userId: string;

export const createAnalyticsClient = (
  configuration: ExpoFastAnalyticsConfig,
): ExpoFastClient => {
  if (!configuration) {
    throw new Error("ExpoFast Analytics configuration is missing");
  }
  if (!configuration.apiKey) {
    throw new Error("ExpoFast Analytics configuration apiKey is missing");
  }

  void setIdentifyId(configuration.asyncStorageInstance);

  config = {
    url: DEFAULT_API_URL,
    ...configuration,
  } satisfies ExpoFastAnalyticsConfig;

  return config;
};

export const setIdentifyId = async (
  asyncStorageInstance: AsyncStorageStatic,
) => {
  const key = "expofast-analytics_identify-id";
  try {
    identifyId = await asyncStorageInstance.getItem(key);
    if (!identifyId) {
      identifyId = uuidv7();
      void asyncStorageInstance.setItem(key, identifyId);
      console.log(identifyId, "after");
    }
  } catch (e) {
    console.error(`ExpoFast Analytics`, e);
  }
};

let isPushingEvents = false;
let consecutiveFailures = 0;
let backoffUntil = 0;

const pushEvents = async () => {
  try {
    if (Date.now() < backoffUntil) {
      return false;
    }

    const info = {
      platform: Platform.OS,
      osVersion: Device.osVersion,
      brand: Device.brand,
      modelName: Device.modelName,
      isSimulator: !Device.isDevice,
      androidPlatformApiLevel: Device.platformApiLevel,
    };

    const body = JSON.stringify({
      apiKey: config.apiKey,
      appVersion: config.appVersion,
      identifyId,
      userId,
      info,
      events: events,
    });

    const response = await fetch(config.url, {
      method: "POST",
      body,
    });

    if (!response.ok) {
      throw new Error(`Could not push events. API status: ${response.status}`);
    }

    consecutiveFailures = 0;
    return true;
  } catch (error) {
    consecutiveFailures++;

    if (config.debug) logError(`On push event`, error);

    if (consecutiveFailures >= 5) {
      backoffUntil = Date.now() + 60 * 1000;
    }

    return false;
  }
};

export const tryToPushEvents = async () => {
  if (!config || isPushingEvents || !events.length || !identifyId) return;
  isPushingEvents = true;

  if (await pushEvents()) {
    events = [];
  }

  isPushingEvents = false;
};

export const startPushingEventsQueue = () => {
  return setInterval(tryToPushEvents, 5000);
};

const identify = (id: string, properties?: Record<string, unknown>) => {
  userId = id;

  const event = {
    type: "identify",
    id,
    date: getDateForApi(),
    properties,
  } satisfies IdentifyEvent;

  if (config.debug) logEvent(event);
  events.push(event);
};

export const state = (active?: boolean) => {
  const event = {
    type: "state",
    active,
    date: getDateForApi(),
  } satisfies StateEvent;

  if (config.debug) logEvent(event);

  events.push(event);
};

export const navigation = (
  path?: string,
  properties?: Record<string, unknown>,
) => {
  const event = {
    type: "navigation",
    path,
    date: getDateForApi(),
    properties,
  } satisfies NavigationEvent;

  if (config.debug) logEvent(event);

  events.push(event);
};

const action = (name: string, properties?: Record<string, unknown>) => {
  const event = {
    type: "action",
    name,
    date: getDateForApi(),
    properties,
  } satisfies ActionEvent;

  if (config.debug) logEvent(event);

  const lastEvent = events[events?.length - 1];

  if (lastEvent?.type === "identify") {
    events[events?.length - 1] = {
      ...event,
      properties: { ...lastEvent?.properties, ...event?.properties },
    };
  } else {
    events.push(event);
  }
};

const error = (message: string, properties?: Record<string, unknown>) => {
  const safeMessage =
    typeof message === "string" ? message : JSON.stringify(message);
  const cutMessage =
    safeMessage.length > 150 ? safeMessage.slice(0, 150) : message;

  const event = {
    type: "error",
    message: cutMessage,
    date: getDateForApi(),
    properties: {
      message,
      ...properties,
    },
  } satisfies ErrorEvent;

  if (config.debug) logEvent(event);
  events.push(event);
};

export const analytics = {
  action,
  identify,
  error,
};
