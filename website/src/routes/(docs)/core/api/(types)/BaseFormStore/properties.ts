import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FormSchema',
      href: '../FormSchema/',
    },
    default: {
      type: 'custom',
      name: 'FormSchema',
      href: '../FormSchema/',
    },
  },
  INTERNAL: {
    type: {
      type: 'custom',
      name: 'InternalFormStore',
      href: '../InternalFormStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
};
