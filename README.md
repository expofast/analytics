# Expofast Analytics

Expofast Analytics is an easy-to-use analytics library for React Native apps using Expo. It helps track user activity, including navigation events, user actions, app state changes, and errors, providing valuable insights into user behavior.

This package integrates seamlessly with `expo-router` and supports event tracking via `expofast.app`, where you can monitor data in both development and production environments.

## Features

- Lightweight and efficient event tracking
- Supports navigation, action, state, and error events
- Works with `expo-router`
- Uses `expo-device` to gather device information
- Stores and retrieves user identifiers using AsyncStorage (or a custom storage system)
- Sends events automatically to `expofast.app`

## Installation

```sh
npm install expofast-analytics
```

or using yarn:

```sh
yarn add expofast-analytics
```

## Setup

To use Expofast Analytics, you need to create an analytics client and wrap your app with the `ExpofastAnalyticsProvider`.

### 1. Create an Analytics Client

```tsx
import { createAnalyticsClient } from "expofast-analytics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";

const client = createAnalyticsClient({
  apiKey: process.env.EXPO_PUBLIC_EXPOFAST_ANALYTICS_KEY as string,
  appVersion: Application.nativeApplicationVersion as string,
  storage: {
    setItem: AsyncStorage.setItem,
    getItem: AsyncStorage.getItem,
  },
});
```

### 2. Wrap Your App with the Provider

To ensure that analytics work correctly across all pages, wrap your app with the `ExpofastAnalyticsProvider` at the top level. If you're using `expo-router`, the best place to do this is inside the `_layout.tsx` file at the root level of your app. This will make sure that all navigation events are properly tracked across your app's screens.

```tsx
import { ExpofastAnalyticsProvider } from "expofast-analytics";

export default function RootLayout() {
  return (
    <ExpofastAnalyticsProvider client={client}>
      <Content />
    </ExpofastAnalyticsProvider>
  );
}
```

## Tracking User Events

### Identify Users

You can identify users by calling `analytics.identify(userId)`. You may pass additional properties such as `email`, `firstName`, `lastName`, and `avatarUrl`. If these properties are provided, the UI in Expofast will adjust accordingly to display this information.

#### Basic Example

```tsx
import { analytics } from "expofast-analytics";

const handleOnSignedIn = () => {
    analytics.identify("user-123");
}
```

#### Using useEffect with User Data

If you're retrieving the user data asynchronously, for example from an authentication provider, you can use `useEffect` to set the user information once available.

```tsx
import { analytics } from "expofast-analytics";
import { useEffect, useState } from "react";

const user = useUser();

useEffect(() => {
  if (user?.id) {
    analytics.identify(user.id, {
      email: user?.email,
      firstName: user?.firstName,
      lastName: user?.lastName,
      avatarUrl: user?.imageUrl,
    });
  }
}, [user?.id, user?.email, user?.firstName, user?.lastName, user?.imageUrl]);
```

You can pass any property along with the user identification, but if `email`, `firstName`, `lastName`, or `avatarUrl` are provided, Expofast will use these to enhance the analytics UI by displaying user details.

### Log Custom Actions

```tsx
analytics.action("button_click", { buttonName: "Login" });
```

### Log Errors

```tsx
analytics.error("Unexpected API failure", { endpoint: "/user/profile" });
```

## Automatic Tracking

Expofast Analytics automatically tracks:

- **Navigation events**: Captures route changes when using `expo-router`.
- **App state changes**: Detects when the app goes active/inactive.
- **User actions**: You can log specific user interactions.
- **Errors**: Log handled and unhandled errors in your app.

## Viewing Events

All tracked events are sent to `expofast.app`, where you can visualize the analytics data. You can use separate API keys for **development** and **production** modes to differentiate between test and live data.

## Configuration Options

When creating the analytics client, you can pass the following options:

| Option          | Type      | Required | Description |
|----------------|----------|----------|-------------|
| `apiKey`       | `string`  | ✅        | API key for `expofast.app` |
| `appVersion`   | `string`  | ✅        | Version of the app |
| `storage`      | `object`  | ✅        | Storage system for user identification |
| `debug`        | `boolean` | ❌        | Enables debug logs |
| `events`       | `object`  | ❌        | Disable specific event tracking |

## Example Configuration

```tsx
const client = createAnalyticsClient({
    apiKey: "your-api-key",
    appVersion: "1.0.0",
    storage: {
        setItem: AsyncStorage.setItem,
        getItem: AsyncStorage.getItem,
    },
    debug: true,
    events: {
        disableNavigationEvents: false,
        disableStateEvents: false,
    },
});
```

## Contribution

If you encounter any issues or have feature requests, feel free to open an issue in the GitHub repository.

## License

This project is licensed under ISC.

