import { FC, PropsWithChildren, useEffect, Fragment } from "react";
import { usePathname, useSegments } from "expo-router";
import { AppState } from "react-native";
import {
  config,
  pushNavigationEvent,
  pushStateEvent,
  startPushingEventsQueue,
  tryToPushEvents,
} from "./core";
import { getDateForApi, getPathParams } from "./utils";
import { ExpoFastClient } from "./types";

export interface ExpofastAnalyticsProps extends PropsWithChildren {
  client: ExpoFastClient;
}

const ExpofastAnalyticsProvider: FC<ExpofastAnalyticsProps> = ({
  client,
  children,
}) => {
  const segment = useSegments();
  const pathname = usePathname();

  if (!config) {
    console.warn(
      "ExpoFast Analytics is not properly configured, please call `createAnalyticsClient` before mounting the provider.",
    );
  }

  useEffect(() => {
    if (client?.events?.disableStateEvents) return;

    let lastActiveMovementDate: Date;
    let lastInactiveMovementDate: Date;

    const shouldFireActiveStateEvent = () => {
      if (!lastActiveMovementDate) return true;
      return lastActiveMovementDate.getTime() + 1000 < Date.now();
    };
    const shouldFireInactiveStateEvent = () => {
      if (!lastInactiveMovementDate) return true;
      return lastInactiveMovementDate.getTime() + 1000 < Date.now();
    };

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        if (!shouldFireActiveStateEvent()) return;

        lastActiveMovementDate = new Date();
        pushStateEvent({
          type: "state",
          date: getDateForApi(),
          active: true,
        });
      }

      if (nextAppState === "inactive") {
        if (!shouldFireInactiveStateEvent()) return;

        lastInactiveMovementDate = new Date();
        pushStateEvent({
          type: "state",
          date: getDateForApi(),
          active: false,
        });
      }

      void tryToPushEvents();
    });

    return () => {
      subscription.remove();
    };
  }, [client?.events.disableNavigationEvents]);

  useEffect(() => {
    if (client?.events?.disableNavigationEvents) return;

    const params = getPathParams(segment, pathname);
    pushNavigationEvent({
      type: "navigation",
      path: `/${segment.join("/")}`,
      date: getDateForApi(),
      properties: Object.keys(params).length
        ? {
            params,
          }
        : undefined,
    });
  }, [segment, pathname, client?.events?.disableNavigationEvents]);

  useEffect(() => {
    const interval = startPushingEventsQueue();
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <Fragment>{children}</Fragment>;
};

export default ExpofastAnalyticsProvider;
