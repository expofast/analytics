# Expofast Analytics

A lightweight analytics library for React Native apps using Expo.
Tracks navigation, actions, app state, and error events with minimal setup.

Events are sent to [expofast.app](https://expofast.app) where you can filter by environment and analyze usage.

## Installation

```sh
npm install expofast-analytics
```

## Setup

Wrap your root layout with the provider and memoize the client. You must provide an instance of `AsyncStorage` via the `asyncStorageInstance` option.

```tsx
import { useMemo } from "react";
import { createAnalyticsClient, ExpofastAnalyticsProvider } from "expofast-analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

export default function RootLayout() {
  const client = useMemo(
    () =>
      createAnalyticsClient({
        apiKey: process.env.EXPO_PUBLIC_EXPOFAST_ANALYTICS_KEY!,
        appVersion: Application.nativeApplicationVersion,
        asyncStorageInstance: AsyncStorage,
      }),
    []
  );

  return (
    <ExpofastAnalyticsProvider client={client}>
      <Content />
    </ExpofastAnalyticsProvider>
  );
}
```

## Manual Events

### Identify user

You can call `identify(userId, properties)` to link analytics to a user.
The optional properties `email`, `firstName`, `lastName`, and `avatarUrl` enhance the user profile shown in the dashboard.

```tsx
analytics.identify("user-id", {
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Doe",
  avatarUrl: "https://example.com/avatar.jpg",
});
```

### Track actions
```tsx
analytics.action("button_press", { value: "login" });
```

### Track handled errors
```tsx
analytics.error("Request failed", { statusCode: 500 });
```

## Automatic Tracking

Handled by the provider:
- Navigation via `expo-router`
- App state changes (active/inactive)

## Configuration

```ts
createAnalyticsClient({
    apiKey: "string",
    appVersion: "string",
    asyncStorageInstance: AsyncStorage,
    debug?: boolean,
    events?: {
        disableNavigationEvents?: boolean,
        disableStateEvents?: boolean
    }
})
```

## License

ISC