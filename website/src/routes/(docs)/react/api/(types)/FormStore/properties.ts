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
  FormStore: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'isSubmitting',
          value: 'boolean',
        },
        {
          key: 'isSubmitted',
          value: 'boolean',
        },
        {
          key: 'isValidating',
          value: 'boolean',
        },
        {
          key: 'isTouched',
          value: 'boolean',
        },
        {
          key: 'isDirty',
          value: 'boolean',
        },
        {
          key: 'isValid',
          value: 'boolean',
        },
        {
          key: 'errors',
          value: {
            type: 'union',
            options: [
              {
                type: 'tuple',
                items: [
                  'string',
                  {
                    type: 'array',
                    modifier: '...',
                    item: 'string',
                  },
                ],
              },
              'null',
            ],
          },
        },
      ],
    },
  },
  isSubmitting: {
    type: 'boolean',
  },
  isSubmitted: {
    type: 'boolean',
  },
  isValidating: {
    type: 'boolean',
  },
  isTouched: {
    type: 'boolean',
  },
  isDirty: {
    type: 'boolean',
  },
  isValid: {
    type: 'boolean',
  },
  errors: {
    type: {
      type: 'union',
      options: [
        {
          type: 'tuple',
          items: [
            'string',
            {
              type: 'array',
              modifier: '...',
              item: 'string',
            },
          ],
        },
        'null',
      ],
    },
  },
};
