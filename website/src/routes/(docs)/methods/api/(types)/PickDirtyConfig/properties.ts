import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    type: {
      type: 'custom',
      name: 'unknown',
    },
  },
  from: {
    type: {
      type: 'custom',
      name: 'TValue',
    },
  },
};
