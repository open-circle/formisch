import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TValue: {
    modifier: 'extends',
    type: 'object',
  },
  from: {
    type: {
      type: 'custom',
      name: 'TValue',
    },
  },
};
