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
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        {
          type: 'custom',
          name: 'TFieldPath',
        },
      ],
    },
  },
  initialInput: {
    type: {
      type: 'custom',
      name: 'DeepPartial',
      href: '/core/api/DeepPartial/',
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
              generics: [
                {
                  type: 'custom',
                  name: 'TSchema',
                },
              ],
            },
            {
              type: 'custom',
              name: 'TFieldPath',
            },
          ],
        },
      ],
    },
    default: 'undefined',
  },
  keepErrors: {
    type: 'boolean',
    default: { type: 'boolean', value: false },
  },
  keepInput: {
    type: 'boolean',
    default: { type: 'boolean', value: false },
  },
  keepTouched: {
    type: 'boolean',
    default: { type: 'boolean', value: false },
  },
};
