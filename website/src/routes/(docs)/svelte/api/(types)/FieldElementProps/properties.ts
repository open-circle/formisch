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
          value: {
            type: 'function',
            params: [],
            return: 'void',
          },
        },
        {
          key: 'oninput',
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
      type: 'function',
      params: [],
      return: 'void',
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
      type: 'function',
      params: [],
      return: 'void',
    },
  },
};
