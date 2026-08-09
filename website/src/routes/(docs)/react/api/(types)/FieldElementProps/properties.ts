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
          key: 'autoFocus',
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
            return: 'void',
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
            type: 'custom',
            name: 'ChangeEventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
            ],
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
  autoFocus: {
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
      return: 'void',
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
      type: 'custom',
      name: 'ChangeEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
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
