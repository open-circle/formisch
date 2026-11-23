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
    const container = document.createElement('div') as QwikContainerElement;
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
    const formContainer = document.createElement('div') as QwikContainerElement;
    formContainer.setAttribute('q:container', 'resumed');
    const form = document.createElement('form');
    const input = document.createElement('input');
    form.appendChild(input);
    formContainer.appendChild(form);
    document.body.appendChild(formContainer);

    const unrelatedContainer = document.createElement(
      'div'
    ) as QwikContainerElement;
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
});
