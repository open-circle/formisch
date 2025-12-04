import clsx from 'clsx';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  // Use navigation element ref and indicator style state
  const navElement = useRef<HTMLElement>(null);
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
      (e) => (e as HTMLAnchorElement).pathname === location.pathname
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
  }, [location.pathname]);

  // Update indicator style when active element changes
  useEffect(updateIndicatorStyle, [location.pathname, updateIndicatorStyle]);

  // Update indicator style when window size change
  useEventListener('resize', updateIndicatorStyle);

  /**
   * Scrolls the current target into the view.
   *
   * @param event A mouse event.
   */
  const scrollIntoView = ({ currentTarget }: MouseEvent<HTMLAnchorElement>) => {
    currentTarget.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <div className="scrollbar-none flex scroll-px-8 overflow-x-auto scroll-smooth px-8">
      <div className="relative flex-1 border-b-2 border-b-slate-200 dark:border-b-slate-800">
        <nav className="flex space-x-8 lg:space-x-14" ref={navElement}>
          {props.items.map((item) => {
            const href = `/${item.toLowerCase().replace(/ /g, '-')}`;
            return (
              <Link
                key={href}
                className={clsx(
                  'block pb-4 lg:text-lg',
                  href === location.pathname
                    ? 'text-sky-600 dark:text-sky-400'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                )}
                to={href}
                onClick={scrollIntoView}
              >
                {item}
              </Link>
            );
          })}
        </nav>
        <div
          className="absolute -bottom-0.5 m-0 h-0.5 rounded bg-sky-600 duration-200 dark:bg-sky-400"
          style={indicatorStyle}
        />
      </div>
    </div>
  );
}
