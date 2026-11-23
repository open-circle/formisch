// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('should wait for active Qwik container render promises including follow-up renders', async () => {
    const container: QwikContainerElement = document.createElement('div');
    container.setAttribute('q:container', 'resumed');
    document.body.appendChild(container);

    const querySelectorAllSpy = vi.spyOn(document, 'querySelectorAll');

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

    await vi.waitFor(() => {
      expect(querySelectorAllSpy).toHaveBeenCalledTimes(1);
    });
    expect(settled).toBe(false);

    // Queue a second render pass right before the first pass finishes
    container.qContainer.$renderPromise$ = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });
    resolveFirst();

    // Wait until the follow-up container scan actually runs before asserting
    // that flushUpdates is still waiting on the second render promise
    await vi.waitFor(() => {
      expect(querySelectorAllSpy).toHaveBeenCalledTimes(2);
    });
    expect(settled).toBe(false);

    container.qContainer.$renderPromise$ = null;
    resolveSecond();
    await flushPromise;

    expect(settled).toBe(true);
  });

  test('should scope waiting to containers holding the provided elements', async () => {
    const formContainer: QwikContainerElement = document.createElement('div');
    formContainer.setAttribute('q:container', 'resumed');
    const form = document.createElement('form');
    const input = document.createElement('input');
    form.appendChild(input);
    formContainer.appendChild(form);
    document.body.appendChild(formContainer);

    const unrelatedContainer: QwikContainerElement =
      document.createElement('div');
    unrelatedContainer.setAttribute('q:container', 'resumed');
    unrelatedContainer.qContainer = {
      $renderPromise$: new Promise<void>(() => {}),
    };
    document.body.appendChild(unrelatedContainer);

    let resolveFormRender!: () => void;
    let settled = false;
    formContainer.qContainer = {
      $renderPromise$: new Promise<void>((resolve) => {
        resolveFormRender = resolve;
      }),
    };

    const flushPromise = Promise.resolve(flushUpdates([form, input])).then(
      () => {
        settled = true;
      }
    );

    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    formContainer.qContainer.$renderPromise$ = null;
    resolveFormRender();
    await flushPromise;

    expect(settled).toBe(true);
  });

  test('should resolve the enclosing Qwik container across nested shadow DOM boundaries', async () => {
    const container: QwikContainerElement = document.createElement('div');
    container.setAttribute('q:container', 'resumed');
    const outerHost = document.createElement('div');
    const outerShadow = outerHost.attachShadow({ mode: 'open' });
    const innerHost = document.createElement('div');
    const innerShadow = innerHost.attachShadow({ mode: 'open' });
    const input = document.createElement('input');
    innerShadow.appendChild(input);
    outerShadow.appendChild(innerHost);
    container.appendChild(outerHost);
    document.body.appendChild(container);

    let resolveRender!: () => void;
    let settled = false;
    container.qContainer = {
      $renderPromise$: new Promise<void>((resolve) => {
        resolveRender = resolve;
      }),
    };

    const flushPromise = Promise.resolve(flushUpdates([input])).then(() => {
      settled = true;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(settled).toBe(false);

    container.qContainer.$renderPromise$ = null;
    resolveRender();
    await flushPromise;

    expect(settled).toBe(true);
  });
});
