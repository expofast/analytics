export type ErrorEvent = {
  type: "error";
  message: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type NavigationEvent = {
  type: "navigation";
  path: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type ActionEvent = {
  type: "action";
  name: string;
  date: string;
  properties?: Record<string, unknown>;
};

export type IdentifyEvent = {
  type: "identify";
  id: string;
  date: string;
  properties?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  } & Record<string, unknown>;
};

export type StateEvent = {
  type: "state";
  active: boolean;
  date: string;
  properties?: Record<string, unknown>;
};

export type ExpoFastAnalyticsEvent =
  | NavigationEvent
  | ActionEvent
  | IdentifyEvent
  | StateEvent
  | ErrorEvent;

export type ExpoFastAnalyticsConfig = {
  apiKey: string;
  url?: string;
  appVersion?: string;
  debug?: boolean;
  events?: {
    disableNavigationEvents?: boolean;
    disableStateEvents?: boolean;
  };
};

export type ExpoFastClient = ExpoFastAnalyticsConfig;
