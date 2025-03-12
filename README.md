# Expofast Analytics

Track your React Native app like a pro with **Expofast Analytics**.

Get real-time 📈 insights on navigation, user actions, app state changes, and errors—all in one place.

Works seamlessly with `expo-router` and sends events straight to [expofast.app](https://expofast.app).

Dev mode? Prod mode? We've got both. 🚀

## Features

- Lightweight and efficient event tracking
- Supports navigation, action, state, and error events
- Works with `expo-router`
- Uses `expo-device` to gather device information
- Stores and retrieves user identifiers using `expo-secure-store`
- Sends events automatically to `expofast.app`

## Installation

```sh
npm install expofast-analytics expo-secure-store
```

or using yarn:

```sh
yarn add expofast-analytics expo-secure-store
```

> ✅ You must also add `expo-secure-store` to your `app.json` plugins:

```json
{
  "expo": {
    "plugins": [
      "expo-secure-store"
    ]
  }
}
```

> 🔧 Then rebuild your app using:
```sh
npx expo run:ios
# or
npx expo run:android
```

## Setup

To use Expofast Analytics, you need to create an analytics client and wrap your app with the `ExpofastAnalyticsProvider`.

### Create an AnalyticsClient and wrap your app with the provider

Use `useMemo` to initialize the client only once during the app lifecycle.

Make sure to wrap your app with the `ExpofastAnalyticsProvider` at the top level.
If you're using `expo-router`, do this inside your root `_layout.tsx` file.
This ensures all navigation and state events are properly tracked automatically.

```tsx
import { useMemo } from "react";
import { createAnalyticsClient } from "expofast-analytics";
import * as Application from "expo-application";

export default function RootLayout() {
  const analyticsClient = useMemo(
    () =>
      createAnalyticsClient({
        apiKey: process.env.EXPO_PUBLIC_EXPOFAST_ANALYTICS_KEY as string,
        appVersion: Application.nativeApplicationVersion as string,
      }),
    []
  );

  return (
    <ExpofastAnalyticsProvider client={analyticsClient}>
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
};
```

#### Using useEffect with User Data

If you're retrieving the user data asynchronously, for example from an authentication provider, you can use `useEffect` to set the user information once available.

```tsx
import { analytics } from "expofast-analytics";
import { useEffect } from "react";

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

These are handled internally by the `ExpofastAnalyticsProvider` so you don’t need to do anything extra.

## Viewing Events

All tracked events are sent to [expofast.app](https://expofast.app), where you can visualize the analytics data. You can use separate API keys for **development** and **production** modes to differentiate between test and live data.

## Configuration Options

When creating the analytics client, you can pass the following options:

| Option          | Type      | Required | Description |
|----------------|-----------|----------|-------------|
| `apiKey`       | `string`  | ✅        | API key for `expofast.app` |
| `appVersion`   | `string`  | ✅        | Version of the app |
| `debug`        | `boolean` | ❌        | Enables debug logs |
| `events`       | `object`  | ❌        | Disable specific event tracking |

## Example Configuration

```tsx
const client = createAnalyticsClient({
  apiKey: "your-api-key",
  appVersion: "1.0.0",
  debug: true,
  events: {
    disableNavigationEvents: false,
    disableStateEvents: false,
  },
});
```

## Contribution

If you encounter any issues or have feature requests, feel free to open an issue.

## License

This project is licensed under ISC.
