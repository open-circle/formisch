import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  path: {
    type: 'undefined',
    default: 'undefined',
  },
  dirtyOnly: {
    type: 'boolean',
    default: {
      type: 'boolean',
      value: false,
    },
  },
};
