import { useSignal, useTask$ } from '@qwik.dev/core';
import { type ContentMenu, useContent, useLocation } from '@qwik.dev/router';
import { useFramework } from '~/routes/plugin@framework';

// Lazily import all menus so that only the needed one is loaded
const MENUS = import.meta.glob<{ default: ContentMenu }>(
  '../routes/**/menu.md'
);

/**
 * Returns the menu of the current docs area.
 *
 * Note: The menu is resolved by Qwik Router from the nearest `menu.md` file
 * instead of a `routeLoader$`, because the website is statically generated
 * and loader data can't be fetched per page during client navigation.
 * Framework-agnostic routes like `/methods/api/` have no menu of their own,
 * so the menu of the same area of the selected framework is used instead.
 *
 * @returns The menu signal.
 */
export function useMenu() {
  // Use content, location, framework and menu signal
  const content = useContent();
  const location = useLocation();
  const framework = useFramework();
  const menu = useSignal<ContentMenu | null>(content.menu ?? null);

  // Update menu when route or framework changes
  useTask$(async ({ track }) => {
    // Track content menu, pathname and framework
    const contentMenu = track(() => content.menu);
    const pathname = track(() => location.url.pathname);
    const frameworkValue = track(() => framework.value);

    // Use menu of route if it exists
    if (contentMenu) {
      menu.value = contentMenu;

      // Otherwise, use menu of same area of selected framework
    } else {
      const area = pathname.split('/')[2];
      const readMenu = Object.entries(MENUS).find(([path]) =>
        path.endsWith(`/${frameworkValue}/${area}/menu.md`)
      )?.[1];
      menu.value = readMenu ? (await readMenu()).default : null;
    }
  });

  // Return menu signal
  return menu;
}
