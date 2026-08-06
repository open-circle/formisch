import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
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
