import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FormSchema: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'IntersectSchema',
          href: 'https://valibot.dev/api/IntersectSchema/',
        },
        {
          type: 'custom',
          name: 'IntersectSchemaAsync',
          href: 'https://valibot.dev/api/IntersectSchemaAsync/',
        },
        {
          type: 'custom',
          name: 'LazySchema',
          href: 'https://valibot.dev/api/LazySchema/',
        },
        {
          type: 'custom',
          name: 'LazySchemaAsync',
          href: 'https://valibot.dev/api/LazySchemaAsync/',
        },
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
        {
          type: 'custom',
          name: 'UnionSchema',
          href: 'https://valibot.dev/api/UnionSchema/',
        },
        {
          type: 'custom',
          name: 'UnionSchemaAsync',
          href: 'https://valibot.dev/api/UnionSchemaAsync/',
        },
        {
          type: 'custom',
          name: 'VariantSchema',
          href: 'https://valibot.dev/api/VariantSchema/',
        },
        {
          type: 'custom',
          name: 'VariantSchemaAsync',
          href: 'https://valibot.dev/api/VariantSchemaAsync/',
        },
      ],
    },
  },
};
