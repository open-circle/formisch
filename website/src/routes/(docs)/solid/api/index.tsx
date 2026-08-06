import { component$, Fragment } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import { ApiList } from '~/components';
import { useMenu } from '~/routes/plugin@menu';

export const head: DocumentHead = {
  title: 'API reference',
  meta: [
    {
      name: 'description',
      content:
        'This section of our website contains detailed reference documentation for working with Formisch in SolidJS.',
    },
  ],
  frontmatter: {
    contributors: ['fabian-hiller'],
  },
};

export default component$(() => {
  // Use menu
  const menu = useMenu();

  return (
    <>
      <h1>API reference</h1>
      <p>
        This section of our website contains detailed reference documentation
        for working with Formisch. Please create an{' '}
        <a
          href={`${import.meta.env.PUBLIC_GITHUB_URL}/issues/new`}
          target="_blank"
          rel="noreferrer"
        >
          issue
        </a>{' '}
        if you are missing any information.
      </p>

      {menu.value?.items?.map(
        (item) =>
          item.items && (
            <Fragment key={item.text}>
              <h2 id={item.text.toLowerCase()}>{item.text}</h2>
              <ApiList items={item.items} />
            </Fragment>
          )
      )}
    </>
  );
});
