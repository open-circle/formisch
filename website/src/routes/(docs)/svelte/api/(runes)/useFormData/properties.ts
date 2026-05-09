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
      name: 'MaybeGetter',
      href: '../MaybeGetter/',
      generics: [
        {
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
      ],
    },
  },
  formData: {
    type: {
      type: 'custom',
      name: 'FormDataStore',
      href: '../FormDataStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
};
