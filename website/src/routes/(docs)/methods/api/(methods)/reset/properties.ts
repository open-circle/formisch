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
          name: 'ResetFormConfig',
          href: '../ResetFormConfig/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        {
          type: 'custom',
          name: 'ResetFieldConfig',
          href: '../ResetFieldConfig/',
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
