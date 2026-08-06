import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  RequiredPath: {
    type: {
      type: 'tuple',
      modifier: 'readonly',
      items: [
        {
          type: 'custom',
          name: 'PathKey',
          href: '../PathKey/',
        },
        {
          type: 'custom',
          spread: true,
          name: 'Path',
          href: '../Path/',
        },
      ],
    },
  },
};
