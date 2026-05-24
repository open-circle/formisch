import { A } from '@solidjs/router';
import clsx from 'clsx';
import { createSignal, type JSX, Match, Switch } from 'solid-js';
import { Spinner } from './Spinner';

type LinkProps = {
  type: 'link';
  href: string;
  download?: string;
  target?: '_blank';
};

type ButtonProps = {
  type: 'button' | 'reset' | 'submit';
  onClick?: () => unknown;
  loading?: boolean;
  form?: string;
};

export type DefaultButtonProps = LinkProps | ButtonProps;

type UnstyledButtonProps = DefaultButtonProps & {
  class?: string;
  children: JSX.Element;
  'aria-label'?: string;
};

/**
 * Basic button component that contains important functionality and is used to
 * build more complex components on top of it.
 */
export function UnstyledButton(props: UnstyledButtonProps) {
  // Use loading signal
  const [getLoading, setLoading] = createSignal(false);

  return (
    <Switch>
      {/* Link button */}
      <Match when={props.type === 'link' && props} keyed>
        {(link) => (
          <A
            {...link}
            rel={link.target === '_blank' ? 'noreferrer' : undefined}
          >
            {link.children}
          </A>
        )}
      </Match>

      {/* Normal button */}
      <Match when={props.type !== 'link' && props} keyed>
        {(button) => (
          <button
            {...button}
            disabled={getLoading() || button.loading}
            // Start and stop loading if function is async
            onClick={
              button.onClick &&
              (async () => {
                setLoading(true);
                await button.onClick!();
                setLoading(false);
              })
            }
          >
            <span
              class={clsx(
                'transition-[opacity,transform,visibility] duration-200',
                getLoading() || button.loading
                  ? 'invisible translate-x-5 opacity-0'
                  : 'visible delay-300'
              )}
            >
              {button.children}
            </span>
            <span
              class={clsx(
                'absolute duration-200',
                getLoading() || button.loading
                  ? 'visible delay-300'
                  : 'invisible -translate-x-5 opacity-0'
              )}
            >
              <Spinner />
            </span>
          </button>
        )}
      </Match>
    </Switch>
  );
}
