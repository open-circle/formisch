import { $, component$, Slot, useSignal } from '@qwik.dev/core';
import { IconButton } from '~/components';
import { useResetSignal } from '~/hooks';
import { CheckIcon, CopyIcon } from '~/icons';
import { trackEvent } from '~/utils';

/**
 * Pre component for rendering code snippets.
 */
const Pre = component$(() => {
  // Use element and copied signals
  const preElement = useSignal<HTMLPreElement>();
  const copied = useResetSignal(false);

  /**
   * Copies the current code of the <pre /> element to the clipboard.
   */
  const copyCode = $(() => {
    // Copy code to clipboard
    copied.value = true;
    navigator.clipboard.writeText(preElement.value!.innerText);

    // Track copy event
    trackEvent('copy_code_snippet');
  });

  return (
    <div class="code-wrapper group/code relative overflow-hidden rounded-2xl border-2 border-slate-200 lg:rounded-3xl lg:border-[3px] dark:border-slate-800">
      <div class="absolute top-5 right-5 hidden gap-5 group-hover/code:flex lg:top-10 lg:right-10">
        <IconButton
          type="button"
          variant="secondary"
          label="Copy code"
          hideLabel
          onClick$={copyCode}
        >
          {copied.value ? (
            <CheckIcon class="h-[18px]" />
          ) : (
            <CopyIcon class="h-[18px]" />
          )}
        </IconButton>
      </div>
      <pre
        ref={preElement}
        class="shiki flex min-h-20 items-center overflow-x-auto p-5 leading-relaxed text-slate-700 md:text-lg lg:min-h-[120px] lg:p-10 lg:text-xl dark:text-slate-300"
      >
        <Slot />
      </pre>
    </div>
  );
});

/**
 * Hook that provides custom MDX components.
 */
export function useMDXComponents() {
  return { pre: Pre };
}
