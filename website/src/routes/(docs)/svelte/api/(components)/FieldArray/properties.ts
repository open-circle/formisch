import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Schema',
      href: '/core/api/Schema/',
    },
  },
  TFieldArrayPath: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'RequiredPath',
      href: '/core/api/RequiredPath/',
    },
  },
  of: {
    type: {
      type: 'custom',
      name: 'FormStore',
      href: '../FormStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
  path: {
    type: {
      type: 'custom',
      name: 'ValidArrayPath',
      href: '/core/api/ValidArrayPath/',
      generics: [
        {
          type: 'custom',
          name: 'v.InferInput',
          href: 'https://valibot.dev/api/InferInput/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        {
          type: 'custom',
          name: 'TFieldArrayPath',
        },
      ],
    },
  },
  children: {
    type: {
      type: 'custom',
      name: 'Snippet',
      generics: [
        {
          type: 'tuple',
          items: [
            {
              type: 'custom',
              name: 'FieldArrayStore',
              href: '../FieldArrayStore/',
              generics: [
                {
                  type: 'custom',
                  name: 'TSchema',
                },
                {
                  type: 'custom',
                  name: 'TFieldArrayPath',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
