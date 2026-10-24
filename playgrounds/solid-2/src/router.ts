import { createSignal } from 'solid-js';

/**
 * Normalizes a pathname and redirects the root path to the login page.
 */
function normalizePathname(pathname: string) {
  return pathname === '/' ? '/login' : pathname.replace(/\/$/, '');
}

// Replace the root path so that browser history does not contain it
if (window.location.pathname === '/') {
  window.history.replaceState(null, '', '/login');
}

const [getPathname, setPathname] = createSignal(
  normalizePathname(window.location.pathname)
);

// Sync pathname when navigating with the browser history
window.addEventListener('popstate', () => {
  setPathname(normalizePathname(window.location.pathname));
});

export { getPathname };

/**
 * Navigates to the given pathname without reloading the page.
 */
export function navigate(pathname: string) {
  if (pathname !== getPathname()) {
    window.history.pushState(null, '', pathname);
    setPathname(pathname);
  }
}
