import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Spinner } from './Spinner';

type LinkProps = {
  type: 'link';
  href: string;
  download?: boolean | string;
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
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
};

/**
 * Basic button component that contains important functionality and is used to
 * build more complex components on top of it.
 */
export function UnstyledButton(props: UnstyledButtonProps) {
  // Use loading state
  const [loading, setLoading] = useState(false);

  // Return link button
  if (props.type === 'link') {
    return (
      <a {...props} rel={props.target === '_blank' ? 'noreferrer' : undefined}>
        {props.children}
      </a>
    );
  }

  return (
    <button
      {...props}
      disabled={loading || props.loading}
      // Start and stop loading if function is async
      onClick={
        props.onClick &&
        (async () => {
          setLoading(true);
          await props.onClick!();
          setLoading(false);
        })
      }
    >
      <span
        className={clsx(
          'transition-[opacity,transform,visibility] duration-200',
          loading || props.loading
            ? 'invisible translate-x-5 opacity-0'
            : 'visible delay-300'
        )}
      >
        {props.children}
      </span>
      <span
        className={clsx(
          'absolute duration-200',
          loading || props.loading
            ? 'visible delay-300'
            : 'invisible -translate-x-5 opacity-0'
        )}
      >
        <Spinner />
      </span>
    </button>
  );
}
