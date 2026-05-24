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
          name: 'GetFormInputConfig',
          href: '../GetFormInputConfig/',
        },
        {
          type: 'custom',
          name: 'GetFieldInputConfig',
          href: '../GetFieldInputConfig/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
            {
              type: 'custom',
              name: 'RequiredPath',
            },
          ],
        },
        'undefined',
      ],
    },
  },
  result: {
    type: {
      type: 'custom',
      name: 'PartialValues',
      href: '/core/api/PartialValues/',
      generics: [
        {
          type: 'custom',
          name: 'v.InferInput',
          href: 'https://valibot.dev/api/InferInput/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
      ],
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
};
