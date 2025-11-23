import { component$, Slot } from '@qwik.dev/core';
import type { LinkProps } from '@qwik.dev/router';
import { Link as RouterLink } from '@qwik.dev/router';

/**
 * Thin wrapper around Qwik's Link component prefetching disabled by default.
 */
export const Link = component$<LinkProps>((props) => {
  return (
    <RouterLink {...props} prefetch={props.prefetch ?? false}>
      <Slot />
    </RouterLink>
  );
});
