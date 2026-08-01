import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    modifier: 'extends',
    type: 'unknown',
  },
  SignalOrValue: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'TValue',
        },
        {
          type: 'custom',
          name: 'Signal',
          href: 'https://angular.dev/api/core/Signal',
          generics: [
            {
              type: 'custom',
              name: 'TValue',
            },
          ],
        },
      ],
    },
  },
};
