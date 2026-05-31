import { component$, useComputed$ } from '@qwik.dev/core';
import { useDocumentHead, useLocation } from '@qwik.dev/router';
import { CHAPTERS_HIDDEN_CLASS, CHAPTERS_KEY } from '~/routes/plugin@chapters';
import { FRAMEWORK_LIST } from '~/routes/plugin@framework';
import { THEME_KEY } from '~/routes/plugin@theme';
import { getAreaName, getFrameworkName } from '~/utils';

// Keys and classes are imported from the plugins so these pre-hydration
// scripts can never drift from the runtime stores that read the same values.
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.classList.toggle('dark',t==='dark'||t!=='light'&&!matchMedia('(prefers-color-scheme:light)').matches);}catch(e){}`;

const CHAPTERS_INIT_SCRIPT = `try{document.documentElement.classList.toggle('${CHAPTERS_HIDDEN_CLASS}',localStorage.getItem('${CHAPTERS_KEY}')==='false');}catch(e){}`;

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
    // Create title variable
    let title = '';

    // Get framework, area and page from pathname
    const [, framework, area, page] = location.url.pathname.split('/');

    // Add area name if available
    const areaName = getAreaName(area);
    if (areaName && page) {
      title += `${areaName}: `;
    }

    // Add actual page title
    title += head.title;

    // Add framework name if available
    const frameworkName = getFrameworkName(framework);
    if (frameworkName) {
      title += ` (${frameworkName})`;
    }

    // Add suffix for non-homepage pages
    if (location.url.pathname !== '/') {
      title += ' | Formisch';
    }

    // Return title
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

      {/* Pre-hydration chapters visibility to avoid a layout shift */}
      <script dangerouslySetInnerHTML={CHAPTERS_INIT_SCRIPT} />

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
