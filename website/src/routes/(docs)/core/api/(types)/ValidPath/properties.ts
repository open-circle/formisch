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
      name: 'RequiredPath',
      href: '/core/api/RequiredPath/',
    },
  },
  ValidPath: {
    type: {
      type: 'conditional',
      conditions: [
        {
          type: {
            type: 'custom',
            name: 'TPath',
          },
          extends: {
            type: 'custom',
            name: 'LazyPath',
            generics: [
              {
                type: 'custom',
                name: 'Required',
                generics: [
                  {
                    type: 'custom',
                    name: 'TValue',
                  },
                ],
              },
              {
                type: 'custom',
                name: 'TPath',
              },
            ],
          },
          true: {
            type: 'custom',
            name: 'TPath',
          },
        },
      ],
      false: {
        type: 'custom',
        name: 'LazyPath',
        generics: [
          {
            type: 'custom',
            name: 'Required',
            generics: [
              {
                type: 'custom',
                name: 'TValue',
              },
            ],
          },
          {
            type: 'custom',
            name: 'TPath',
          },
        ],
      },
    },
  },
};
