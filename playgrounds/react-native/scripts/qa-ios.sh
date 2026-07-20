#!/usr/bin/env bash
# Automated golden-path QA for this playground on an iOS Simulator, driven by
# the agent-device CLI (https://github.com/callstack/agent-device). Boots a
# specific simulator by UDID, starts the Expo dev server, deep-links Expo Go
# on that exact device (the Simulator app shares the host's loopback
# interface, so exp://127.0.0.1 always reaches it -- this sidesteps Expo
# CLI's own simulator auto-selection, which picks whichever simulator
# happens to be first in `simctl list`, not necessarily this one), then
# exercises both the empty-submit validation path and the valid-submit
# success path using the field-email / field-password / submit-button
# testIDs set in App.tsx.
#
# Requires: Xcode + an iOS Simulator runtime, the agent-device CLI, pnpm, node.
set -euo pipefail

DEVICE="${QA_IOS_DEVICE:-iPhone 17 Pro}"
SESSION="rn-playground-qa"
PLAYGROUND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPO_LOG="$(mktemp -t formisch-qa-ios-expo).log"

cleanup() {
  agent-device close --session "$SESSION" >/dev/null 2>&1 || true
  if [[ -n "${EXPO_PID:-}" ]]; then
    # $EXPO_PID is a job leader (see `set -m` below), so this signals the
    # whole pnpm/expo/Metro process tree, not just the one PID.
    kill -- -"$EXPO_PID" >/dev/null 2>&1 || kill "$EXPO_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

DEVICE_UDID="$(xcrun simctl list devices -j | node -e '
  const data = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const name = process.argv[1];
  for (const runtime of Object.values(data.devices)) {
    for (const device of runtime) {
      if (device.name === name && device.isAvailable) {
        console.log(device.udid);
        process.exit(0);
      }
    }
  }
  process.exit(1);
' "$DEVICE")"
[[ -n "$DEVICE_UDID" ]] || {
  echo "No available iOS Simulator named '$DEVICE' (see: xcrun simctl list devices available)" >&2
  exit 1
}

echo "==> Booting $DEVICE ($DEVICE_UDID)"
BOOT_OUTPUT="$(xcrun simctl boot "$DEVICE_UDID" 2>&1)" && BOOT_STATUS=0 || BOOT_STATUS=$?
if [[ $BOOT_STATUS -ne 0 && "$BOOT_OUTPUT" != *"current state: Booted"* ]]; then
  echo "Failed to boot '$DEVICE' ($DEVICE_UDID):" >&2
  echo "$BOOT_OUTPUT" >&2
  exit 1
fi
open -a Simulator --args -CurrentDeviceUDID "$DEVICE_UDID"

# `simctl boot` returns as soon as the boot is *requested*, well before
# SpringBoard is actually up. Deep-linking Expo Go before that point fails
# with "Could not connect to the server" even though Metro is already
# serving -- bootstatus blocks until the device can actually handle it.
xcrun simctl bootstatus "$DEVICE_UDID"

echo "==> Starting Expo dev server"
set -m
(cd "$PLAYGROUND_DIR" && exec pnpm exec expo start >"$EXPO_LOG" 2>&1) &
EXPO_PID=$!
set +m

echo "==> Waiting for dev server"
for _ in $(seq 1 60); do
  grep -q "Waiting on http://localhost:8081" "$EXPO_LOG" && break
  sleep 1
done
grep -q "Waiting on http://localhost:8081" "$EXPO_LOG" || {
  echo "Dev server did not come up, see $EXPO_LOG" >&2
  exit 1
}

echo "==> Opening on $DEVICE ($DEVICE_UDID) in Expo Go"
xcrun simctl openurl "$DEVICE_UDID" "exp://127.0.0.1:8081"

echo "==> Waiting for bundle"
for _ in $(seq 1 60); do
  grep -q "Bundled" "$EXPO_LOG" && break
  sleep 2
done
grep -q "Bundled" "$EXPO_LOG" || {
  echo "Bundle did not complete, see $EXPO_LOG" >&2
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
# The on-screen keyboard fully covers the submit button (there's no
# onSubmitEditing/toolbar wired up, and `keyboard dismiss` has no safe
# control to tap), so the tap silently lands on the keyboard instead of the
# button. Pressing the keyboard's own return key dismisses it without
# submitting, uncovering the button for the next press.
agent-device press 'label="return"' --session "$SESSION"
agent-device press 'id="submit-button"' --session "$SESSION"
agent-device wait text "Logged in as user@example.com" 5000 --session "$SESSION"

echo "==> iOS QA passed"
