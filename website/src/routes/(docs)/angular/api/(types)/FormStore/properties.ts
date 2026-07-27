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
  isSubmitting: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
  isSubmitted: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
    },
  },
  isValidating: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['boolean'],
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
                {
                  type: 'array',
                  spread: true,
                  item: 'string',
                },
              ],
            },
            'null',
          ],
        },
      ],
    },
  },
};
