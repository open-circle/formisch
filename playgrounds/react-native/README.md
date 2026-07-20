# Formisch React Native Playground

A minimal [Expo](https://expo.dev/) app demonstrating `@formisch/react-native` with a login form (email + password).

## Development

From the repository root:

```bash
pnpm install
pnpm -C playgrounds/react-native web     # run in the browser via react-native-web
pnpm -C playgrounds/react-native start   # run with the Expo dev server (scan the QR code, or press i/a for a simulator)
```

## QA tooling

The email/password fields and the submit button expose `testID`s
(`field-email`, `field-password`, `submit-button`) so automation tools can
target them with stable selectors instead of ambiguous text/label matching.

- **Web** — the `@playwright/cli` CLI (`playwright-cli`) drives a real
  browser against the `react-native-web` build (`pnpm -C
  playgrounds/react-native web`).
- **iOS Simulator** — [`agent-device`](https://github.com/callstack/agent-device)
  drives Expo Go on a booted simulator:

  ```bash
  pnpm -C playgrounds/react-native qa:ios:doctor   # once per machine, preflight + warm the XCTest runner
  pnpm -C playgrounds/react-native qa:ios          # boots a simulator, starts Expo, runs the golden path
  ```

  `qa:ios` (`scripts/qa-ios.sh`) boots `iPhone 17 Pro` by default (override
  with `QA_IOS_DEVICE`), then exercises both the empty-submit validation path
  and the valid-submit success path.
