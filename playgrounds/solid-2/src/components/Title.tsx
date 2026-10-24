import { createEffect } from 'solid-js';

type TitleProps = {
  children: string;
};

/**
 * Title of the page that is displayed in the browser tab, for example.
 */
export function Title(props: TitleProps) {
  createEffect(
    () => props.children,
    (title) => {
      document.title = `${title} | Formisch`;
    }
  );
  return null;
}
