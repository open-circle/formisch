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
          key: '[ref: symbol]',
          optional: true,
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
            return: {
              type: 'function',
              params: [],
              return: 'void',
            },
          },
        },
        {
          key: 'onfocus',
          optional: true,
          value: {
            type: 'custom',
            name: 'FocusEventHandler',
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
          key: 'oninput',
          optional: true,
          value: {
            type: 'custom',
            name: 'FormEventHandler',
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
          key: 'onchange',
          optional: true,
          value: {
            type: 'custom',
            name: 'FormEventHandler',
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
          key: 'onblur',
          optional: true,
          value: {
            type: 'custom',
            name: 'FocusEventHandler',
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
      return: {
        type: 'function',
        params: [],
        return: 'void',
      },
    },
  },
  onfocus: {
    type: {
      type: 'custom',
      name: 'FocusEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
    },
  },
  oninput: {
    type: {
      type: 'custom',
      name: 'FormEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
    },
  },
  onchange: {
    type: {
      type: 'custom',
      name: 'FormEventHandler',
      generics: [
        {
          type: 'custom',
          name: 'FieldElement',
          href: '/core/api/FieldElement/',
        },
      ],
    },
  },
  onblur: {
    type: {
      type: 'custom',
      name: 'FocusEventHandler',
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
