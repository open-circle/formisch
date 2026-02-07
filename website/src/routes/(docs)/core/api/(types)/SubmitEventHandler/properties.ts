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
