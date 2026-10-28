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
      type: 'custom',
      name: 'RequiredPath',
      href: '/core/api/RequiredPath/',
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
  config: {
    type: {
      type: 'custom',
      name: 'UseFieldConfig',
      href: '../UseFieldConfig/',
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
  },
  FieldStore: {
    type: {
      type: 'custom',
      name: 'FieldStore',
      href: '../FieldStore/',
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
  },
};
