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
                  type: 'custom',
                  name: 'FieldElement',
                  href: '/core/api/FieldElement/',
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
            name: 'EventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
              {
                type: 'custom',
                name: 'FocusEvent',
              },
            ],
          },
        },
        {
          key: 'onInput',
          value: {
            type: 'custom',
            name: 'EventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
              {
                type: 'custom',
                name: 'InputEvent',
              },
            ],
          },
        },
        {
          key: 'onChange',
          value: {
            type: 'custom',
            name: 'EventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
              {
                type: 'custom',
                name: 'Event',
              },
            ],
          },
        },
        {
          key: 'onBlur',
          value: {
            type: 'custom',
            name: 'EventHandler',
            generics: [
              {
                type: 'custom',
                name: 'FieldElement',
                href: '/core/api/FieldElement/',
              },
              {
                type: 'custom',
                name: 'FocusEvent',
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
      name: 'EventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
        {
          type: 'custom',
          name: 'FocusEvent',
        },
      ],
    },
  },
  onInput: {
    type: {
      type: 'custom',
      name: 'EventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
        {
          type: 'custom',
          name: 'InputEvent',
        },
      ],
    },
  },
  onChange: {
    type: {
      type: 'custom',
      name: 'EventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
        {
          type: 'custom',
          name: 'Event',
        },
      ],
    },
  },
  onBlur: {
    type: {
      type: 'custom',
      name: 'EventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
        {
          type: 'custom',
          name: 'FocusEvent',
        },
      ],
    },
  },
};
