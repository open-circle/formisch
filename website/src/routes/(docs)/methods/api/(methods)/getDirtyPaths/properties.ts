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
          name: 'GetFormDirtyPathsConfig',
          href: '../GetFormDirtyPathsConfig/',
        },
        {
          type: 'custom',
          name: 'GetFieldDirtyPathsConfig',
          href: '../GetFieldDirtyPathsConfig/',
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
      type: 'array',
      item: {
        type: 'custom',
        name: 'RequiredPath',
        href: '/core/api/RequiredPath/',
      },
    },
  },
};
