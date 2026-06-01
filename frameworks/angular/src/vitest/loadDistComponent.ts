import type { Type } from '@angular/core';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * Loads a compiled Angular component from the bundled package dist output.
 *
 * @param exportName - Name of the component export to load.
 *
 * @returns The compiled Angular component type.
 */
export async function loadDistComponent(
  exportName: string
): Promise<Type<unknown>> {
  const moduleUrl = import.meta.url.replace(
    /\/src\/vitest\/loadDistComponent\.ts$/,
    '/dist/index.js'
  );
  const module: unknown = await import(/* @vite-ignore */ moduleUrl);

  if (!isRecord(module)) {
    throw new Error(`Expected ${exportName} module to load.`);
  }

  const component = module[exportName];
  if (typeof component !== 'function') {
    throw new Error(`Expected ${exportName} component to load.`);
  }

  return component as Type<unknown>;
}
