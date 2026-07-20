#!/usr/bin/env bash
# Automated golden-path QA for this playground on an iOS Simulator, driven by
# the agent-device CLI (https://github.com/callstack/agent-device). Boots a
# simulator, starts the Expo dev server, opens the app in Expo Go, then
# exercises both the empty-submit validation path and the valid-submit
# success path using the field-email / field-password / submit-button
# testIDs set in App.tsx.
#
# Requires: Xcode + an iOS Simulator runtime, the agent-device CLI, pnpm.
set -euo pipefail

DEVICE="${QA_IOS_DEVICE:-iPhone 17 Pro}"
SESSION="rn-playground-qa"
PLAYGROUND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPO_LOG="$(mktemp -t formisch-qa-ios-expo).log"

cleanup() {
  agent-device close --session "$SESSION" >/dev/null 2>&1 || true
  pkill -f "expo start --ios" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "==> Booting $DEVICE"
xcrun simctl boot "$DEVICE" >/dev/null 2>&1 || true
open -a Simulator

echo "==> Starting Expo (iOS)"
(cd "$PLAYGROUND_DIR" && pnpm exec expo start --ios >"$EXPO_LOG" 2>&1 &)

echo "==> Waiting for bundle"
for _ in $(seq 1 60); do
  grep -q "Bundled" "$EXPO_LOG" && break
  sleep 2
done
grep -q "Bundled" "$EXPO_LOG" || {
  echo "Bundle did not complete, see $EXPO_LOG"
  exit 1
}

echo "==> Attaching agent-device session"
agent-device open host.exp.Exponent --session "$SESSION" --platform ios --device "$DEVICE"

echo "==> Empty submit: expect validation errors"
agent-device press 'id="submit-button"' --session "$SESSION"
agent-device wait text "Please enter your email." 5000 --session "$SESSION"
agent-device wait text "Please enter your password." 5000 --session "$SESSION"

echo "==> Valid submit: expect success message"
agent-device fill 'id="field-email"' "user@example.com" --session "$SESSION"
agent-device fill 'id="field-password"' "password123" --session "$SESSION"
agent-device press 'id="submit-button"' --session "$SESSION"
agent-device wait text "Logged in as user@example.com" 5000 --session "$SESSION"

echo "==> iOS QA passed"
