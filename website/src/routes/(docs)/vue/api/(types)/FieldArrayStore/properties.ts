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
  FieldArrayStore: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'path',
          value: {
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
        {
          key: 'items',
          value: {
            type: 'array',
            item: 'string',
          },
        },
        {
          key: 'errors',
          value: {
            type: 'union',
            options: [
              {
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
              'null',
            ],
          },
        },
        {
          key: 'isTouched',
          value: 'boolean',
        },
        {
          key: 'isDirty',
          value: 'boolean',
        },
        {
          key: 'isValid',
          value: 'boolean',
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
  items: {
    type: {
      type: 'array',
      item: 'string',
    },
  },
  errors: {
    type: {
      type: 'union',
      options: [
        {
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
        'null',
      ],
    },
  },
  isTouched: {
    type: 'boolean',
  },
  isDirty: {
    type: 'boolean',
  },
  isValid: {
    type: 'boolean',
  },
};
