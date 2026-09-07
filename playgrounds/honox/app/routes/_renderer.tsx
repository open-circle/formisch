import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script } from 'honox/server';
import Tabs from '../islands/Tabs';

export default jsxRenderer(({ children, title }, c) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ?? 'HonoX Playground | Formisch'}</title>
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.ts" />
      </head>
      <body class="font-lexend bg-white py-12 text-slate-600 md:py-14 lg:py-16 dark:bg-gray-900 dark:text-slate-400">
        <div class="space-y-12 md:space-y-14 lg:mx-auto lg:max-w-6xl lg:space-y-16">
          <Tabs
            items={['Login', 'Payment', 'Todos', 'Special', 'Nested']}
            pathname={c.req.path}
          />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
});
