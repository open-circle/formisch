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
  of: {
    type: {
      type: 'custom',
      name: 'FormStore',
      href: '../FormStore/',
      generics: [
        {
          type: 'custom',
          name: 'TSchema',
        },
      ],
    },
  },
  children: {
    type: {
      type: 'custom',
      name: 'JSX.Element',
    },
  },
  onSubmit: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'SubmitHandler',
          href: '/core/api/SubmitHandler/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
        {
          type: 'custom',
          name: 'SubmitEventHandler',
          href: '/core/api/SubmitEventHandler/',
          generics: [
            {
              type: 'custom',
              name: 'TSchema',
            },
          ],
        },
      ],
    },
  },
};
