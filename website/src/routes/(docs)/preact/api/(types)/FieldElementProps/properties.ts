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
            type: 'custom',
            name: 'JSX.FocusEventHandler',
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
            type: 'custom',
            name: 'JSX.FocusEventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
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
  },
  onFocus: {
    type: {
      type: 'custom',
      name: 'JSX.FocusEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
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
      type: 'custom',
      name: 'JSX.FocusEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
    },
  },
};
