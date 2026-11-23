// @vitest-environment jsdom
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { beforeEach, describe, expect, test, vi } from 'vitest';

interface QwikContainerElement extends HTMLDivElement {
  qContainer?: object;
}

describe('index.qwik flushUpdates (production build)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should await real production Qwik container renders via _waitUntilRendered', async () => {
    const hadExperimental = Reflect.has(globalThis, '__EXPERIMENTAL__');
    const prevExperimental: unknown = Reflect.get(
      globalThis,
      '__EXPERIMENTAL__'
    );
    const hadQwik = Reflect.has(globalThis, '__qwik__');
    const prevQwik: unknown = Reflect.get(globalThis, '__qwik__');
    const prevToStringDesc = Object.getOwnPropertyDescriptor(
      HTMLElement,
      'toString'
    );

    let cleanup: (() => void) | undefined;
    try {
      // Enable browser detection in `@qwik.dev/core/build` under jsdom, define
      // the experimental flags object that Qwik's Vite plugin injects in
      // browser production bundles, and isolate Qwik's global runtime registry
      // while `isolate: false` is active
      Reflect.deleteProperty(globalThis, '__qwik__');
      Reflect.set(globalThis, '__EXPERIMENTAL__', {});
      Object.defineProperty(HTMLElement, 'toString', {
        configurable: true,
        value: () => 'function HTMLElement() { [native code] }',
      });

      const require = createRequire(import.meta.url);
      const qwikPkgPath = require.resolve('@qwik.dev/core/package.json');
      const prodModuleUrl = pathToFileURL(
        join(dirname(qwikPkgPath), 'dist', 'core.prod.mjs')
      ).href;

      vi.resetModules();
      vi.doMock(
        '@qwik.dev/core',
        async () => import(/* @vite-ignore */ prodModuleUrl)
      );

      const qwik = await import('@qwik.dev/core');
      const { flushUpdates } = await import('./index.qwik.ts');

      expect(qwik.isBrowser).toBe(true);

      const host: QwikContainerElement = document.createElement('div');
      const resumed = new Promise<void>((resolve) => {
        host.addEventListener('qresume', () => resolve(), { once: true });
      });
      document.body.appendChild(host);

      const errorSignal = qwik.createSignal('');
      const result = await qwik.render(
        host,
        qwik.jsx('form', {
          children: [
            qwik.jsx('input', { id: 'email-input', type: 'text' }),
            qwik.jsx('div', { id: 'email-error', children: errorSignal }),
          ],
        })
      );
      cleanup = result.cleanup;

      const container = host.closest<QwikContainerElement>('[q\\:container]');
      expect(container?.qContainer).toBeDefined();
      // Confirm the production build does not expose the dev-only
      // `$renderPromise$` property on the runtime container
      expect('$renderPromise$' in (container?.qContainer ?? {})).toBe(false);

      const input = host.querySelector('#email-input');
      const errorElement = host.querySelector('#email-error');
      expect(input).not.toBeNull();
      expect(errorElement?.textContent).toBe('');

      errorSignal.value = 'Email is required';
      expect(errorElement?.textContent).toBe('');

      // Verify `_waitUntilRendered` observes the active production render
      // promise on the mangled container before the render settles
      const waitUntilRendered: unknown = Reflect.get(
        qwik,
        '_waitUntilRendered'
      );
      expect(typeof waitUntilRendered).toBe('function');
      if (typeof waitUntilRendered === 'function' && container?.qContainer) {
        const waitA: unknown = waitUntilRendered(container.qContainer);
        const waitB: unknown = waitUntilRendered(container.qContainer);
        expect(waitA).toBe(waitB);
      }

      await flushUpdates([input]);
      expect(errorElement?.textContent).toBe('Email is required');
      await resumed;
    } finally {
      cleanup?.();
      vi.doUnmock('@qwik.dev/core');
      vi.resetModules();
      if (prevToStringDesc) {
        Object.defineProperty(HTMLElement, 'toString', prevToStringDesc);
      } else {
        Reflect.deleteProperty(HTMLElement, 'toString');
      }
      if (hadExperimental) {
        Reflect.set(globalThis, '__EXPERIMENTAL__', prevExperimental);
      } else {
        Reflect.deleteProperty(globalThis, '__EXPERIMENTAL__');
      }
      if (hadQwik) {
        Reflect.set(globalThis, '__qwik__', prevQwik);
      } else {
        Reflect.deleteProperty(globalThis, '__qwik__');
      }
    }
  });
});
