import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FormSchema',
      href: '/core/api/FormSchema/',
    },
  },
  TFieldPath: {
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
      name: 'ValidPath',
      href: '/core/api/ValidPath/',
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
          name: 'TFieldPath',
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
              name: 'FieldStore',
              href: '../FieldStore/',
              generics: [
                {
                  type: 'custom',
                  name: 'TSchema',
                },
                {
                  type: 'custom',
                  name: 'TFieldPath',
                },
              ],
            },
          ],
        },
      ],
    },
  },
};
