import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FormSchema: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'GenericSchema',
          href: 'https://valibot.dev/api/GenericSchema/',
          generics: [
            {
              type: 'custom',
              name: 'Record',
              generics: ['string', 'unknown'],
            },
          ],
        },
        {
          type: 'custom',
          name: 'GenericSchemaAsync',
          href: 'https://valibot.dev/api/GenericSchemaAsync/',
          generics: [
            {
              type: 'custom',
              name: 'Record',
              generics: ['string', 'unknown'],
            },
          ],
        },
      ],
    },
  },
};
