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
  output: {
    type: {
      type: 'custom',
      name: 'InferOutput',
      href: 'https://valibot.dev/api/InferOutput/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
  event: {
    type: {
      type: 'custom',
      name: 'SubmitEvent',
    },
  },
};
