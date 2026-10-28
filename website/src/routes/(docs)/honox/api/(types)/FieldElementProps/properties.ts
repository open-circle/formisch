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
                      href: '/core/api/FieldElement/',
                    },
                    'null',
                  ],
                },
              },
            ],
            return: {
              type: 'union',
              options: [
                {
                  type: 'function',
                  params: [],
                  return: 'void',
                },
                'undefined',
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
          key: 'onChange',
          value: {
            type: 'function',
            params: [
              {
                name: 'event',
                type: {
                  type: 'custom',
                  name: 'Event',
                },
              },
            ],
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
                href: '/core/api/FieldElement/',
              },
              'null',
            ],
          },
        },
      ],
      return: {
        type: 'union',
        options: [
          {
            type: 'function',
            params: [],
            return: 'void',
          },
          'undefined',
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
  onChange: {
    type: {
      type: 'function',
      params: [
        {
          name: 'event',
          type: {
            type: 'custom',
            name: 'Event',
          },
        },
      ],
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
};
