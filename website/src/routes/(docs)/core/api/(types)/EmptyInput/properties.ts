import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  EmptyInput: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'string',
          optional: true,
          value: {
            type: 'union',
            options: ['string', 'undefined'],
          },
        },
        {
          key: 'number',
          optional: true,
          value: {
            type: 'union',
            options: ['number', 'undefined'],
          },
        },
        {
          key: 'boolean',
          optional: true,
          value: {
            type: 'union',
            options: ['boolean', 'undefined'],
          },
        },
        {
          key: 'date',
          optional: true,
          value: {
            type: 'union',
            options: [{ type: 'custom', name: 'Date' }, 'undefined'],
          },
        },
      ],
    },
  },
  string: {
    type: {
      type: 'union',
      options: ['string', 'undefined'],
    },
  },
  number: {
    type: {
      type: 'union',
      options: ['number', 'undefined'],
    },
  },
  boolean: {
    type: {
      type: 'union',
      options: ['boolean', 'undefined'],
    },
  },
  date: {
    type: {
      type: 'union',
      options: [{ type: 'custom', name: 'Date' }, 'undefined'],
    },
  },
};
