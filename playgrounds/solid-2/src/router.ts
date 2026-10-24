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
  const nextPathname = normalizePathname(pathname);
  // Hint: The location is compared instead of the signal, because Solid 2
  // only commits the signal on the next flush
  if (nextPathname !== window.location.pathname) {
    window.history.pushState(null, '', nextPathname);
    setPathname(nextPathname);
  }
}
