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
  TFieldPath: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'RequiredPath',
      href: '/core/api/RequiredPath/',
    },
  },
  FieldStore: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'path',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: [
              {
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
            ],
          },
        },
        {
          key: 'input',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: [
              {
                type: 'custom',
                name: 'PartialValues',
                href: '/core/api/PartialValues/',
                generics: [
                  {
                    type: 'custom',
                    name: 'PathValue',
                    href: '/core/api/PathValue/',
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
                ],
              },
            ],
          },
        },
        {
          key: 'errors',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: [
              {
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
            ],
          },
        },
        {
          key: 'isTouched',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isDirty',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isValid',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'onInput',
          value: {
            type: 'function',
            params: [
              {
                name: 'value',
                type: {
                  type: 'custom',
                  name: 'PartialValues',
                  href: '/core/api/PartialValues/',
                  generics: [
                    {
                      type: 'custom',
                      name: 'PathValue',
                      href: '/core/api/PathValue/',
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
                  ],
                },
              },
            ],
            return: 'void',
          },
        },
        {
          key: 'props',
          value: {
            type: 'custom',
            name: 'FieldElementProps',
            href: '../FieldElementProps/',
          },
        },
      ],
    },
  },
  path: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: [
        {
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
      ],
    },
  },
  input: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: [
        {
          type: 'custom',
          name: 'PartialValues',
          href: '/core/api/PartialValues/',
          generics: [
            {
              type: 'custom',
              name: 'PathValue',
              href: '/core/api/PathValue/',
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
          ],
        },
      ],
    },
  },
  errors: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: [
        {
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
      ],
    },
  },
  isTouched: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isDirty: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isValid: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  onInput: {
    type: {
      type: 'function',
      params: [
        {
          name: 'value',
          type: {
            type: 'custom',
            name: 'PartialValues',
            href: '/core/api/PartialValues/',
            generics: [
              {
                type: 'custom',
                name: 'PathValue',
                href: '/core/api/PathValue/',
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
            ],
          },
        },
      ],
      return: 'void',
    },
  },
  props: {
    type: {
      type: 'custom',
      name: 'FieldElementProps',
      href: '../FieldElementProps/',
    },
  },
};
