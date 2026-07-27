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
  FormConfig: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'schema',
          value: {
            type: 'custom',
            name: 'TSchema',
          },
        },
        {
          key: 'initialInput',
          optional: true,
          value: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'DeepPartial',
                href: '/core/api/DeepPartial/',
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
                ],
              },
              'undefined',
            ],
          },
        },
        {
          key: 'emptyInput',
          optional: true,
          value: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'EmptyInput',
                href: '/core/api/EmptyInput/',
              },
              'undefined',
            ],
          },
        },
        {
          key: 'validate',
          optional: true,
          value: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'ValidationMode',
                href: '/core/api/ValidationMode/',
              },
              'undefined',
            ],
          },
        },
        {
          key: 'revalidate',
          optional: true,
          value: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'ValidationMode',
                href: '/core/api/ValidationMode/',
              },
              'undefined',
            ],
          },
        },
      ],
    },
  },
  schema: {
    type: {
      type: 'custom',
      name: 'TSchema',
    },
  },
  initialInput: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'DeepPartial',
          href: '/core/api/DeepPartial/',
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
          ],
        },
        'undefined',
      ],
    },
  },
  emptyInput: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'EmptyInput',
          href: '/core/api/EmptyInput/',
        },
        'undefined',
      ],
    },
  },
  validate: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'ValidationMode',
          href: '/core/api/ValidationMode/',
        },
        'undefined',
      ],
    },
  },
  revalidate: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'Exclude',
          generics: [
            {
              type: 'custom',
              name: 'ValidationMode',
              href: '/core/api/ValidationMode/',
            },
            {
              type: 'string',
              value: 'initial',
            },
          ],
        },
        'undefined',
      ],
    },
  },
};
