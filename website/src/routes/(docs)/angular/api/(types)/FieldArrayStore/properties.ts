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
  path: {
    type: {
      type: 'custom',
      name: 'ValidArrayPath',
      href: '/core/api/ValidArrayPath/',
      generics: [
        {
          type: 'custom',
          name: 'v.InferInput',
          href: 'https://valibot.dev/api/InferInput/',
          generics: [{ type: 'custom', name: 'TSchema' }],
        },
        { type: 'custom', name: 'TFieldArrayPath' },
      ],
    },
  },
  items: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: [{ type: 'array', item: 'string' }],
    },
  },
  errors: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: [
        {
          type: 'union',
          options: [
            {
              type: 'tuple',
              items: [
                'string',
                { type: 'array', spread: true, item: 'string' },
              ],
            },
            'null',
          ],
        },
      ],
    },
  },
  isTouched: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
  isEdited: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
  isDirty: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
  isValid: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
};
