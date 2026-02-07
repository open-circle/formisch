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
  handler: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'SubmitHandler',
          href: '/core/api/SubmitHandler/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        {
          type: 'custom',
          name: 'SubmitEventHandler',
          href: '/core/api/SubmitEventHandler/',
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
  result: {
    type: {
      type: 'union',
      options: [
        {
          type: 'function',
          params: [],
          return: {
            type: 'custom',
            name: 'Promise',
            generics: ['void'],
          },
        },
        {
          type: 'function',
          params: [
            {
              name: 'event',
              type: {
                type: 'custom',
                name: 'SubmitEvent',
              },
            },
          ],
          return: {
            type: 'custom',
            name: 'Promise',
            generics: ['void'],
          },
        },
      ],
    },
  },
};
