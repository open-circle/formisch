<script lang="ts" generics="T">
  // Test host: invokes a function inside a Svelte component context (so that
  // `onMount`, `$derived`, and other lifecycle/rune APIs work) and forwards
  // the result to the test via `onResult`.
  let { run, onResult }: { run: () => T; onResult: (result: T) => void } =
    $props();
  onResult(run());
</script>
