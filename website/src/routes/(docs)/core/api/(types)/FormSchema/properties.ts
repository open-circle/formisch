import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FormSchema: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'LooseObjectSchema',
          href: 'https://valibot.dev/api/LooseObjectSchema/',
        },
        {
          type: 'custom',
          name: 'LooseObjectSchemaAsync',
          href: 'https://valibot.dev/api/LooseObjectSchemaAsync/',
        },
        {
          type: 'custom',
          name: 'ObjectSchema',
          href: 'https://valibot.dev/api/ObjectSchema/',
        },
        {
          type: 'custom',
          name: 'ObjectSchemaAsync',
          href: 'https://valibot.dev/api/ObjectSchemaAsync/',
        },
        {
          type: 'custom',
          name: 'StrictObjectSchema',
          href: 'https://valibot.dev/api/StrictObjectSchema/',
        },
        {
          type: 'custom',
          name: 'StrictObjectSchemaAsync',
          href: 'https://valibot.dev/api/StrictObjectSchemaAsync/',
        },
      ],
    },
  },
};
