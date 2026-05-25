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
  TValue: {
    type: {
      type: 'custom',
      name: 'unknown',
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
      type: 'custom',
      name: 'PickDirtyConfig',
      href: '../PickDirtyConfig/',
      generics: [
        {
          type: 'custom',
          name: 'TValue',
        },
      ],
    },
  },
  result: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'DeepPartial',
          href: '/core/api/DeepPartial/',
          generics: [
            {
              type: 'custom',
              name: 'TValue',
            },
          ],
        },
        'undefined',
      ],
    },
  },
};
