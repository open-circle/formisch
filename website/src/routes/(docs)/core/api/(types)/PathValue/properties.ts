import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    modifier: 'extends',
    type: 'unknown',
  },
  TPath: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Path',
      href: '/core/api/Path/',
    },
  },
  PathValue: {
    type: {
      type: 'custom',
      name: 'PathValue',
      generics: [
        {
          type: 'custom',
          name: 'TValue',
        },
        {
          type: 'custom',
          name: 'TPath',
        },
      ],
    },
  },
};
