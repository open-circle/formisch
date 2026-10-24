import clsx from 'clsx';
import { createEffect, createSignal, For, untrack } from 'solid-js';
import { getPathname, navigate } from '~/router';
import { makeEventListener } from '~/utils';

type TabsProps = {
  items: string[];
};

/**
 * Tabs organize content into multiple sections and allow users to navigate
 * between them.
 */
export function Tabs(props: TabsProps) {
  // Create navigation element variable and indicator style signal
  let navElement!: HTMLElement;
  const [getIndicatorStyle, setIndicatorStyle] = createSignal<{
    left: string;
    width: string;
  }>();

  /**
   * Updates the indicator style position.
   */
  const updateIndicatorStyle = (pathname: string) => {
    // Get active navigation element by pathname and href
    const activeElement = [...navElement.children].find(
      (element) => element.getAttribute('href') === pathname
    ) as HTMLAnchorElement | undefined;

    // Update indicator style to active element or reset it to undefined
    setIndicatorStyle(
      activeElement
        ? {
            left: `${activeElement.offsetLeft || 0}px`,
            width: `${activeElement.offsetWidth || 0}px`,
          }
        : undefined
    );
  };

  // Update indicator style when active element changes
  createEffect(getPathname, updateIndicatorStyle);

  // Update indicator style when window size change
  makeEventListener(window, 'resize', () =>
    updateIndicatorStyle(untrack(getPathname))
  );

  return (
    <div class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8">
      <div class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800">
        <nav
          class="flex space-x-8 lg:space-x-14"
          ref={(element) => (navElement = element)}
        >
          <For each={props.items}>
            {(item) => {
              const href = `/${item.toLowerCase().replace(/ /g, '-')}`;
              return (
                <a
                  class={clsx(
                    'block pb-4 lg:text-lg',
                    getPathname() === href
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'hover:text-slate-900 dark:hover:text-slate-200'
                  )}
                  href={href}
                  onClick={(event) => {
                    // Let browser handle modified and non-primary clicks, for
                    // example to open tab in new window
                    if (
                      event.button !== 0 ||
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey
                    ) {
                      return;
                    }
                    event.preventDefault();
                    navigate(href);
                    event.currentTarget.scrollIntoView({
                      block: 'nearest',
                      inline: 'center',
                    });
                  }}
                >
                  {item}
                </a>
              );
            }}
          </For>
        </nav>
        <div
          class="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={getIndicatorStyle()}
        />
      </div>
    </div>
  );
}
