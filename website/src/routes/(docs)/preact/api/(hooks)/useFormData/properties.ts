import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'Schema',
      href: '/core/api/Schema/',
    },
  },
  form: {
    type: {
      type: 'custom',
      name: 'FormStore',
      href: '../FormStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
  formData: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: [
        {
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
      ],
    },
  },
};
