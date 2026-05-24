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
  initialInput: {
    type: {
      type: 'custom',
      name: 'DeepPartial',
      href: '/core/api/DeepPartial/',
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
  keepSubmitted: {
    type: 'boolean',
    default: { type: 'boolean', value: false },
  },
  keepTouched: {
    type: 'boolean',
    default: { type: 'boolean', value: false },
  },
};
