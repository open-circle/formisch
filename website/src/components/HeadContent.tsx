import { component$, useComputed$ } from '@qwik.dev/core';
import { useDocumentHead, useLocation } from '@qwik.dev/router';
import { FRAMEWORK_LIST } from '~/routes/plugin@framework';
import { getAreaName, getFrameworkName } from '~/utils';

const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}`;

function ogImagePath(pathname: string): string {
  if (pathname === '/') return '/og/index.png';
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '_');
  return `/og/${slug}.png`;
}

/**
 * Head content with title, meta, link, script and style elements.
 */
export const HeadContent = component$(() => {
  // Use head and location
  const head = useDocumentHead();
  const location = useLocation();

  // Compute document title
  const documentTitle = useComputed$(() => {
    let title = '';

    const [, framework, area, page] = location.url.pathname.split('/');

    const areaName = getAreaName(area);
    if (areaName && page) {
      title += `${areaName}: `;
    }

    title += head.title;

    const frameworkName = getFrameworkName(framework);
    if (frameworkName) {
      title += ` (${frameworkName})`;
    }

    if (location.url.pathname !== '/') {
      title += ' | Formisch';
    }

    return title;
  });

  // Compute Open Graph type
  const ogType = useComputed$(() =>
    location.url.pathname === '/' || location.url.pathname === '/playground/'
      ? 'website'
      : 'article'
  );

  // Compute description from metadata
  const description = useComputed$(
    // eslint-disable-next-line qwik/valid-lexical-scope
    () => head.meta.find((item) => item.name === 'description')?.content
  );

  // Compute Open Graph image URL (points to pre-generated static PNG)
  const imageUrl = useComputed$(
    () => `${location.url.origin}${ogImagePath(location.url.pathname)}`
  );

  // Compute docsearch framework
  const docsearchFramework = useComputed$(() => {
    const framework = location.url.pathname.split('/')[1];
    if ((FRAMEWORK_LIST as string[]).includes(framework)) {
      return framework;
    }
    return 'none';
  });

  return (
    <>
      {/* Pre-hydration theme + FOUC fix */}
      <script dangerouslySetInnerHTML={THEME_INIT_SCRIPT} />

      {/* Document title */}
      <title>{documentTitle.value}</title>

      {/* Default metadata */}
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: light)"
        content="#fff"
      />
      <meta
        name="theme-color"
        media="(prefers-color-scheme: dark)"
        content="#111827"
      />
      <link rel="canonical" href={location.url.href} />
      <link rel="manifest" href="/manifest.json" />

      {/* Icon metadata */}
      <link rel="icon" type="image/png" sizes="32x32" href="/icon-32px.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon-16px.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icon-180px.jpg" />

      {/* Preload fonts */}
      <link
        rel="preload"
        href="/fonts/lexend-exa-600.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
      <link
        rel="preload"
        href="/fonts/lexend-500.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
      <link
        rel="preload"
        href="/fonts/lexend-400.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />

      {/* Open Graph metadata */}
      <meta property="og:type" content={ogType.value} />
      <meta property="og:url" content={location.url.href} />
      <meta property="og:title" content={head.title} />
      {description.value && (
        <meta property="og:description" content={description.value} />
      )}
      <meta property="og:image" content={imageUrl.value} />
      <meta name="twitter:card" content="summary_large_image" />

      {/* Algolia DocSearch facets */}
      <meta name="docsearch:framework" content={docsearchFramework.value} />

      {/* Dynamic metadata */}
      {head.meta.map((props) => (
        <meta key={props.content} {...props} />
      ))}

      {/* Umami tracking script */}
      <script
        async
        src="https://umami.formisch.dev/script.js"
        data-website-id="c4666473-a1b7-4c55-8fd4-f991de13b541"
        data-domains="formisch.dev"
        data-strip-search="true"
      />
    </>
  );
});
