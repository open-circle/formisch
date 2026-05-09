import { mount, type VueWrapper } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

/**
 * Mounts a Vue component that invokes the hook in setup() and returns the
 * hook's result alongside the test wrapper.
 *
 * @param hook The composable to invoke inside a Vue component setup.
 *
 * @returns An object with `result.current`, `unmount`, and `wrapper`.
 */
export function renderHook<T>(hook: () => T): {
  result: { current: T };
  unmount: () => void;
  wrapper: VueWrapper;
} {
  const result = { current: undefined as unknown as T };
  const wrapper = mount(
    defineComponent({
      setup() {
        result.current = hook();
        return () => h('div');
      },
    })
  );
  return { result, unmount: () => wrapper.unmount(), wrapper };
}
