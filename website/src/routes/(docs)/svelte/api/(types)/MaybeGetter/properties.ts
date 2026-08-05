import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  MaybeGetter: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'TValue',
        },
        {
          type: 'function',
          params: [],
          return: {
            type: 'custom',
            name: 'TValue',
          },
        },
      ],
    },
  },
  TValue: {
    modifier: 'extends',
    type: 'unknown',
  },
};
