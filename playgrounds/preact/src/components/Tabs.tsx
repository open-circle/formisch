import { useSignal } from '@preact/signals';
import clsx from 'clsx';
import type { TargetedMouseEvent } from 'preact';
import { useLocation } from 'preact-iso';
import { useEffect, useRef } from 'preact/hooks';
import { useEventListener } from '../hooks';

type TabsProps = {
  items: string[];
};

/**
 * Tabs organize content into multiple sections and allow users to navigate
 * between them.
 */
export function Tabs(props: TabsProps) {
  // Use location
  const location = useLocation();

  // Use navigation element and indicator style signal
  const navElement = useRef<HTMLElement>(null);
  const indicatorStyle = useSignal<
    | {
        left: string;
        width: string;
      }
    | undefined
  >(undefined);

  /**
   * Updates the indicator style position.
   */
  const updateIndicatorStyle = () => {
    // Get active navigation element by pathname and href
    const activeElement = [...navElement.current!.children].find(
      (e) => (e as HTMLAnchorElement).pathname === location.path
    ) as HTMLAnchorElement | undefined;

    // Update indicator style to active element or reset it to undefined
    indicatorStyle.value = activeElement
      ? {
          left: `${activeElement.offsetLeft || 0}px`,
          width: `${activeElement.offsetWidth || 0}px`,
        }
      : undefined;
  };

  // Update indicator style when active element changes
  useEffect(updateIndicatorStyle, [location.path]);

  // Update indicator style when window size change
  useEventListener('resize', updateIndicatorStyle);

  /**
   * Scrolls the current target into the view.
   *
   * @param event A mouse event.
   */
  const scrollIntoView = (event: TargetedMouseEvent<EventTarget>) => {
    (event.currentTarget as HTMLAnchorElement).scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8">
      <div class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800">
        <nav class="flex space-x-8 lg:space-x-14" ref={navElement}>
          {props.items.map((item) => {
            const href = `/${item.toLowerCase().replace(/ /g, '-')}`;
            return (
              <a
                key={href}
                class={clsx(
                  'block pb-4 lg:text-lg',
                  href === location.path
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                )}
                href={`..${href}`}
                onClick={scrollIntoView}
              >
                {item}
              </a>
            );
          })}
        </nav>
        <div
          class="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={indicatorStyle.value}
        />
      </div>
    </div>
  );
}
