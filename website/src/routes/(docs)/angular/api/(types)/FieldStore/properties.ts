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
  path: {
    type: {
      type: 'custom',
      name: 'ValidPath',
      href: '/core/api/ValidPath/',
      generics: [
        {
          type: 'custom',
          name: 'v.InferInput',
          href: 'https://valibot.dev/api/InferInput/',
          generics: [{ type: 'custom', name: 'TSchema' }],
        },
        { type: 'custom', name: 'TFieldPath' },
      ],
    },
  },
  name: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: ['string'],
    },
  },
  input: {
    type: {
      type: 'custom',
      name: 'Signal',
      href: 'https://angular.dev/api/core/Signal',
      generics: [
        {
          type: 'custom',
          name: 'PartialValues',
          href: '/core/api/PartialValues/',
          generics: [
            {
              type: 'custom',
              name: 'PathValue',
              href: '/core/api/PathValue/',
              generics: [
                {
                  type: 'custom',
                  name: 'v.InferInput',
                  href: 'https://valibot.dev/api/InferInput/',
                  generics: [{ type: 'custom', name: 'TSchema' }],
                },
                { type: 'custom', name: 'TFieldPath' },
              ],
            },
          ],
        },
      ],
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
  setInput: {
    type: {
      type: 'function',
      params: [
        {
          name: 'value',
          type: {
            type: 'custom',
            name: 'PartialValues',
            href: '/core/api/PartialValues/',
            generics: [
              {
                type: 'custom',
                name: 'PathValue',
                href: '/core/api/PathValue/',
                generics: [
                  {
                    type: 'custom',
                    name: 'v.InferInput',
                    href: 'https://valibot.dev/api/InferInput/',
                    generics: [{ type: 'custom', name: 'TSchema' }],
                  },
                  { type: 'custom', name: 'TFieldPath' },
                ],
              },
            ],
          },
        },
      ],
      return: 'void',
    },
  },
};
