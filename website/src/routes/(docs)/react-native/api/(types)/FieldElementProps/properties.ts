import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FieldElementProps: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'ref',
          value: {
            type: 'function',
            params: [
              {
                name: 'element',
                type: {
                  type: 'union',
                  options: [
                    {
                      type: 'custom',
                      name: 'FieldElement',
                      href: '../FieldElement/',
                    },
                    'null',
                  ],
                },
              },
            ],
            return: {
              type: 'union',
              options: [
                'void',
                {
                  type: 'function',
                  params: [],
                  return: 'void',
                },
              ],
            },
          },
        },
        {
          key: 'onFocus',
          value: {
            type: 'function',
            params: [],
            return: 'void',
          },
        },
        {
          key: 'onBlur',
          value: {
            type: 'function',
            params: [],
            return: 'void',
          },
        },
        {
          key: 'onChangeText',
          value: {
            type: 'function',
            params: [
              {
                name: 'text',
                type: 'string',
              },
            ],
            return: 'void',
          },
        },
      ],
    },
  },
  ref: {
    type: {
      type: 'function',
      params: [
        {
          name: 'element',
          type: {
            type: 'union',
            options: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '../FieldElement/',
              },
              'null',
            ],
          },
        },
      ],
      return: {
        type: 'union',
        options: [
          'void',
          {
            type: 'function',
            params: [],
            return: 'void',
          },
        ],
      },
    },
  },
  onFocus: {
    type: {
      type: 'function',
      params: [],
      return: 'void',
    },
  },
  onBlur: {
    type: {
      type: 'function',
      params: [],
      return: 'void',
    },
  },
  onChangeText: {
    type: {
      type: 'function',
      params: [
        {
          name: 'text',
          type: 'string',
        },
      ],
      return: 'void',
    },
  },
};
