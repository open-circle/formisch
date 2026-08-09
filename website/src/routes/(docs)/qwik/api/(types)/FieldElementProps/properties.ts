import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FieldElementProps: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'name',
          value: 'string',
        },
        {
          key: 'autofocus',
          value: 'boolean',
        },
        {
          key: 'ref',
          value: {
            type: 'custom',
            name: 'QRL',
            generics: [
              {
                type: 'function',
                params: [
                  {
                    name: 'element',
                    type: {
                      type: 'custom',
                      name: 'FieldElement',
                      href: '/core/api/FieldElement/',
                    },
                  },
                ],
                return: 'void',
              },
            ],
          },
        },
        {
          key: 'onFocus$',
          value: {
            type: 'custom',
            name: 'QRL',
            generics: [
              {
                type: 'function',
                params: [],
                return: 'void',
              },
            ],
          },
        },
        {
          key: 'onInput$',
          value: {
            type: 'custom',
            name: 'QRL',
            generics: [
              {
                type: 'function',
                params: [
                  {
                    name: 'event',
                    type: {
                      type: 'custom',
                      name: 'InputEvent',
                    },
                  },
                  {
                    name: 'element',
                    type: {
                      type: 'custom',
                      name: 'FieldElement',
                      href: '/core/api/FieldElement/',
                    },
                  },
                ],
                return: 'void',
              },
            ],
          },
        },
        {
          key: 'onChange$',
          value: {
            type: 'custom',
            name: 'QRL',
            generics: [
              {
                type: 'function',
                params: [
                  {
                    name: 'event',
                    type: {
                      type: 'custom',
                      name: 'Event',
                    },
                  },
                  {
                    name: 'element',
                    type: {
                      type: 'custom',
                      name: 'FieldElement',
                      href: '/core/api/FieldElement/',
                    },
                  },
                ],
                return: 'void',
              },
            ],
          },
        },
        {
          key: 'onBlur$',
          value: {
            type: 'custom',
            name: 'QRL',
            generics: [
              {
                type: 'function',
                params: [],
                return: 'void',
              },
            ],
          },
        },
      ],
    },
  },
  name: {
    type: 'string',
  },
  autofocus: {
    type: 'boolean',
  },
  ref: {
    type: {
      type: 'custom',
      name: 'QRL',
      generics: [
        {
          type: 'function',
          params: [
            {
              name: 'element',
              type: {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
            },
          ],
          return: 'void',
        },
      ],
    },
  },
  onFocus$: {
    type: {
      type: 'custom',
      name: 'QRL',
      generics: [
        {
          type: 'function',
          params: [],
          return: 'void',
        },
      ],
    },
  },
  onInput$: {
    type: {
      type: 'custom',
      name: 'QRL',
      generics: [
        {
          type: 'function',
          params: [
            {
              name: 'event',
              type: {
                type: 'custom',
                name: 'InputEvent',
              },
            },
            {
              name: 'element',
              type: {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
            },
          ],
          return: 'void',
        },
      ],
    },
  },
  onChange$: {
    type: {
      type: 'custom',
      name: 'QRL',
      generics: [
        {
          type: 'function',
          params: [
            {
              name: 'event',
              type: {
                type: 'custom',
                name: 'Event',
              },
            },
            {
              name: 'element',
              type: {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
            },
          ],
          return: 'void',
        },
      ],
    },
  },
  onBlur$: {
    type: {
      type: 'custom',
      name: 'QRL',
      generics: [
        {
          type: 'function',
          params: [],
          return: 'void',
        },
      ],
    },
  },
};
