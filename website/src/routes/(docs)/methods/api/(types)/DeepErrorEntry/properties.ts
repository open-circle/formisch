import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    modifier: 'extends',
    type: 'unknown',
  },
  path: {
    type: {
      type: 'conditional',
      conditions: [
        {
          type: 'unknown',
          extends: {
            type: 'custom',
            name: 'TValue',
          },
          true: {
            type: 'custom',
            name: 'Path',
            href: '/core/api/Path/',
          },
        },
      ],
      false: {
        type: 'union',
        options: [
          {
            type: 'tuple',
            modifier: 'readonly',
            items: [],
          },
          {
            type: 'custom',
            name: 'FieldPath',
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
  },
  errors: {
    type: {
      type: 'tuple',
      items: [
        'string',
        {
          type: 'array',
          spread: true,
          item: 'string',
        },
      ],
    },
  },
};
