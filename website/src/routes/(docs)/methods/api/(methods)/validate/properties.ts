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
          name: 'ValidateFormConfig',
          href: '../ValidateFormConfig/',
        },
        {
          type: 'custom',
          name: 'undefined',
        },
      ],
    },
  },
  result: {
    type: {
      type: 'custom',
      name: 'Promise',
      generics: [
        {
          type: 'custom',
          name: 'SafeParseResult',
          href: 'https://valibot.dev/api/SafeParseResult/',
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
};
