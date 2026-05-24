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
  TFieldArrayPath: {
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
  config: {
    type: {
      type: 'custom',
      name: 'MaybeGetter',
      href: '../MaybeGetter/',
      generics: [
        {
          type: 'custom',
          name: 'UseFieldArrayConfig',
          href: '../UseFieldArrayConfig/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
            {
              type: 'custom',
              name: 'TFieldArrayPath',
            },
          ],
        },
      ],
    },
  },
  FieldArrayStore: {
    type: {
      type: 'custom',
      name: 'FieldArrayStore',
      href: '../FieldArrayStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
        {
          type: 'custom',
          name: 'TFieldArrayPath',
        },
      ],
    },
  },
};
