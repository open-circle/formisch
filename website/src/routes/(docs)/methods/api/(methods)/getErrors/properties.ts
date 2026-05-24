import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FormSchema',
      href: '/core/api/FormSchema/',
    },
  },
  TFieldPath: {
    modifier: 'extends',
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'RequiredPath',
          href: '/core/api/RequiredPath/',
        },
        'undefined',
      ],
    },
    default: 'undefined',
  },
  form: {
    type: {
      type: 'custom',
      name: 'BaseFormStore',
      href: '/core/api/BaseFormStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
  config: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'GetFormErrorsConfig',
          href: '../GetFormErrorsConfig/',
        },
        {
          type: 'custom',
          name: 'GetFieldErrorsConfig',
          href: '../GetFieldErrorsConfig/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
            {
              type: 'custom',
              name: 'TFieldPath',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  result: {
    type: {
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
  },
};
