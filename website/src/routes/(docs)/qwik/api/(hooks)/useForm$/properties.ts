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
  configFn: {
    type: {
      type: 'function',
      params: [],
      return: {
        type: 'custom',
        name: 'FormConfig',
        href: '../FormConfig/',
        generics: [
          {
            type: 'custom',
            name: 'TSchema',
          },
        ],
      },
    },
  },
  FormStore: {
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
};
