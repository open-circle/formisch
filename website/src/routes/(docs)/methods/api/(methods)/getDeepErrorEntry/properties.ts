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
          name: 'GetFormDeepErrorEntryConfig',
          href: '../GetFormDeepErrorEntryConfig/',
        },
        {
          type: 'custom',
          name: 'GetFieldDeepErrorEntryConfig',
          href: '../GetFieldDeepErrorEntryConfig/',
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
          type: 'custom',
          name: 'DeepErrorEntry',
          href: '../DeepErrorEntry/',
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
        'null',
      ],
    },
  },
};
