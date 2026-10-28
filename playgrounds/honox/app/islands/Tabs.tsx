import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'hono/jsx';
import { useElementRef, useEventListener } from '../hooks';

type TabsProps = {
  items: string[];
  pathname: string;
};

/**
 * Tabs organize content into multiple sections and allow users to navigate
 * between them.
 */
export default function Tabs(props: TabsProps) {
  // Use scroll and navigation element refs and indicator style state
  const [scrollElement, setScrollElement] = useElementRef<HTMLDivElement>();
  const [navElement, setNavElement] = useElementRef<HTMLElement>();
  const [indicatorStyle, setIndicatorStyle] = useState<
    | {
        left: string;
        width: string;
      }
    | undefined
  >(undefined);

  /**
   * Updates the indicator style position.
   */
  const updateIndicatorStyle = useCallback(() => {
    if (!navElement.current) return;
    // Get active navigation element by pathname and href
    const activeElement = [...navElement.current.children].find(
      (e) => (e as HTMLAnchorElement).pathname === props.pathname
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
  }, [props.pathname]);

  // Update indicator style when active element changes
  useEffect(updateIndicatorStyle, [props.pathname, updateIndicatorStyle]);

  // Update indicator style when window size change
  useEventListener('resize', updateIndicatorStyle);

  // Scroll active element into view after page load
  //
  // Hint: Unlike the React playground, each tab is a separate page in HonoX,
  // so the scroll position of the navigation is lost when navigating. The
  // scroll element is scrolled directly instead of using `scrollIntoView` to
  // not interfere with the scroll restoration of the page.
  useEffect(() => {
    const activeElement = [...(navElement.current?.children ?? [])].find(
      (e) => (e as HTMLAnchorElement).pathname === props.pathname
    );
    if (scrollElement.current && activeElement) {
      const scrollRect = scrollElement.current.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();
      scrollElement.current.scrollTo({
        left:
          scrollElement.current.scrollLeft +
          activeRect.left +
          activeRect.width / 2 -
          (scrollRect.left + scrollRect.width / 2),
        behavior: 'instant',
      });
    }
  }, []);

  /**
   * Scrolls the current target into the view.
   *
   * @param event A mouse event.
   */
  const scrollIntoView = (event: MouseEvent) => {
    (event.currentTarget as HTMLAnchorElement).scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div
      class="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8"
      ref={setScrollElement}
    >
      <div class="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800">
        <nav class="flex space-x-8 lg:space-x-14" ref={setNavElement}>
          {props.items.map((item) => {
            const href = `/${item.toLowerCase().replace(/ /g, '-')}`;
            return (
              <a
                key={href}
                class={clsx(
                  'block pb-4 lg:text-lg',
                  href === props.pathname
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                )}
                href={href}
                onClick={scrollIntoView}
              >
                {item}
              </a>
            );
          })}
        </nav>
        <div
          class="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={indicatorStyle}
        />
      </div>
    </div>
  );
}
