import { afterEach, describe, expect, it, vi } from 'vitest';
import { observeSelectMutations } from './observeSelectMutations.ts';

function flushMutations(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve));
}

describe('observeSelectMutations', () => {
  const cleanups: ((() => void) | undefined)[] = [];

  afterEach(() => {
    while (cleanups.length) {
      cleanups.pop()?.();
    }
  });

  function setup() {
    const element = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'option_1';
    element.append(option);
    const onMutation = vi.fn();
    cleanups.push(observeSelectMutations(element, onMutation));
    return { element, option, onMutation };
  }

  it('invokes the callback when an option is added', async () => {
    const { element, onMutation } = setup();
    element.append(document.createElement('option'));
    await flushMutations();
    expect(onMutation).toHaveBeenCalledTimes(1);
  });

  it('invokes the callback when an option is removed', async () => {
    const { option, onMutation } = setup();
    option.remove();
    await flushMutations();
    expect(onMutation).toHaveBeenCalledTimes(1);
  });

  it('invokes the callback when an option value changes', async () => {
    const { option, onMutation } = setup();
    option.setAttribute('value', 'option_2');
    await flushMutations();
    expect(onMutation).toHaveBeenCalledTimes(1);
  });

  it('invokes the callback when option text content changes', async () => {
    const { option, onMutation } = setup();
    option.append(document.createTextNode('Option 1'));
    await flushMutations();
    onMutation.mockClear();
    option.firstChild!.nodeValue = 'Option 2';
    await flushMutations();
    expect(onMutation).toHaveBeenCalledTimes(1);
  });

  it('ignores mutations that only touch comments', async () => {
    const { element, onMutation } = setup();
    const comment = document.createComment('anchor');
    element.append(comment);
    await flushMutations();
    comment.remove();
    await flushMutations();
    expect(onMutation).not.toHaveBeenCalled();
  });

  it('stops observing after cleanup', async () => {
    const { element, onMutation } = setup();
    cleanups.pop()?.();
    element.append(document.createElement('option'));
    await flushMutations();
    expect(onMutation).not.toHaveBeenCalled();
  });
});
