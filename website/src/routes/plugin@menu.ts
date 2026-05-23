import { type ContentMenu, routeLoader$ } from '@qwik.dev/router';
import { type Framework, FRAMEWORK_LIST } from './plugin@framework';

const DEFAULT_FRAMEWORK: Framework = 'solid';

function frameworkFromPathname(pathname: string): Framework {
  const first = pathname.split('/')[1];
  return (FRAMEWORK_LIST as string[]).includes(first)
    ? (first as Framework)
    : DEFAULT_FRAMEWORK;
}

/**
 * Returns the current menu based on the framework in the URL and the docs area.
 */
export const useMenu = routeLoader$(async ({ pathname }) => {
  const area = pathname.split('/')[2];
  const framework = frameworkFromPathname(pathname);

  // Load all menus and find correct one
  const menuEntry = Object.entries(
    import.meta.glob<{ default: ContentMenu }>('./**/menu.md')
  ).find(([path]) => path.includes(`/${framework}/${area}/`));

  if (menuEntry) {
    const [, readFile] = menuEntry;
    return (await readFile()).default;
  }
  return null;
});

/**
 * Returns all hrefs from other menus in the same area but different frameworks.
 */
export const useOtherMenuHrefs = routeLoader$(async ({ pathname }) => {
  const area = pathname.split('/')[2];
  const framework = frameworkFromPathname(pathname);

  const menus = await Promise.all(
    Object.entries(import.meta.glob<{ default: ContentMenu }>('./**/menu.md'))
      .filter(
        ([path]) =>
          !path.includes(`/${framework}/`) && path.includes(`/${area}/`)
      )
      .map(async ([, readFile]) => (await readFile()).default)
  );

  return menus.flatMap((menu) =>
    menu.items?.flatMap((item) => item.items).map((item) => item?.href)
  );
});
