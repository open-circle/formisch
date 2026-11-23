// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from 'vitest';
import { flushUpdates } from './index.qwik.ts';

interface QwikContainerElement extends HTMLDivElement {
  qContainer?: {
    $renderPromise$?: Promise<void> | null;
  };
}

describe('index.qwik flushUpdates', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('should wait for active Qwik container render promises including follow-up renders', async () => {
    const container = document.createElement('div') as QwikContainerElement;
    container.setAttribute('q:container', 'resumed');
    document.body.appendChild(container);

    let resolveFirst!: () => void;
    let resolveSecond!: () => void;
    let settled = false;

    container.qContainer = {
      $renderPromise$: new Promise<void>((resolve) => {
        resolveFirst = resolve;
      }),
    };

    const flushPromise = Promise.resolve(flushUpdates()).then(() => {
      settled = true;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    // Queue a second render pass right before the first pass finishes
    container.qContainer.$renderPromise$ = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });
    resolveFirst();

    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    container.qContainer.$renderPromise$ = null;
    resolveSecond();
    await flushPromise;

    expect(settled).toBe(true);
  });
});
