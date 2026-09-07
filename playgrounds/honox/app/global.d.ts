/* eslint-disable @typescript-eslint/prefer-function-type */
// Hint: Hono types `ContextRenderer` as an interface so that apps can widen it
// through declaration merging, which a function type alias cannot do.
import type {} from 'hono';

type Head = {
  title?: string;
};

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response;
  }
}
