// @vitest-environment jsdom
import * as qwik from '@qwik.dev/core';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { flushUpdates } from './index.qwik.ts';

vi.mock('@qwik.dev/core', async () => {
  const { createRequire } = await import('node:module');
  const { dirname, join } = await import('node:path');
  const { pathToFileURL } = await import('node:url');

  // Enable browser detection in `@qwik.dev/core/build` under jsdom and define
  // the experimental flags object that Qwik's Vite plugin injects in browser
  // production bundles
  const globals = globalThis as { __EXPERIMENTAL__?: Record<string, unknown> };
  globals.__EXPERIMENTAL__ ??= {};
  Object.defineProperty(HTMLElement, 'toString', {
    configurable: true,
    value: () => 'function HTMLElement() { [native code] }',
  });

  const require = createRequire(import.meta.url);
  const qwikPkgPath = require.resolve('@qwik.dev/core/package.json');
  const prodModuleUrl = pathToFileURL(
    join(dirname(qwikPkgPath), 'dist', 'core.prod.mjs')
  ).href;
  return import(/* @vite-ignore */ prodModuleUrl);
});

interface QwikContainerElement extends HTMLDivElement {
  qContainer?: object;
}

interface ProdQwikRuntime {
  _waitUntilRendered: (container: object) => Promise<void>;
  createSignal: <T>(value: T) => { value: T };
  h: (
    type: string,
    props: Record<string, unknown> | null,
    ...children: unknown[]
  ) => unknown;
  isBrowser: boolean;
  render: (
    parent: Element,
    jsxNode: unknown
  ) => Promise<{ cleanup: () => void }>;
}

describe('index.qwik flushUpdates (production build)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterAll(() => {
    delete (HTMLElement as unknown as { toString?: unknown }).toString;
  });

  test('should await real production Qwik container renders via _waitUntilRendered', async () => {
    const prodQwik = qwik as unknown as ProdQwikRuntime;
    expect(prodQwik.isBrowser).toBe(true);

    const host = document.createElement('div') as QwikContainerElement;
    document.body.appendChild(host);

    const errorSignal = prodQwik.createSignal('');
    const result = await prodQwik.render(
      host,
      prodQwik.h(
        'form',
        {},
        prodQwik.h('input', { id: 'email-input', type: 'text' }),
        prodQwik.h('div', { id: 'email-error' }, errorSignal)
      )
    );

    try {
      const container = host.closest<QwikContainerElement>('[q\\:container]');
      expect(container?.qContainer).toBeDefined();
      // Confirm the production build does not expose the dev-only
      // `$renderPromise$` property on the runtime container
      expect('$renderPromise$' in (container?.qContainer ?? {})).toBe(false);

      const input = host.querySelector('#email-input')!;
      const errorElement = host.querySelector('#email-error')!;
      expect(errorElement.textContent).toBe('');

      errorSignal.value = 'Email is required';
      expect(errorElement.textContent).toBe('');

      // Verify `_waitUntilRendered` observes the active production render
      // promise on the mangled container before the render settles
      const waitA = prodQwik._waitUntilRendered(container!.qContainer!);
      const waitB = prodQwik._waitUntilRendered(container!.qContainer!);
      expect(waitA).toBe(waitB);

      await flushUpdates([input]);
      expect(errorElement.textContent).toBe('Email is required');
    } finally {
      result.cleanup();
    }
  });
});
