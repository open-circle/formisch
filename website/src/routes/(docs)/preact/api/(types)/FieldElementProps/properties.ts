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
          key: 'onInput',
          value: {
            type: 'custom',
            name: 'JSX.InputEventHandler',
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
          key: 'onChange',
          value: {
            type: 'custom',
            name: 'JSX.GenericEventHandler',
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
  onInput: {
    type: {
      type: 'custom',
      name: 'JSX.InputEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
    },
  },
  onChange: {
    type: {
      type: 'custom',
      name: 'JSX.GenericEventHandler',
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
