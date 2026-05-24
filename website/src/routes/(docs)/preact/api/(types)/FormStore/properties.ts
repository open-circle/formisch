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
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isSubmitted',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isValidating',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isTouched',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isDirty',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'isValid',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: ['boolean'],
          },
        },
        {
          key: 'errors',
          value: {
            type: 'custom',
            name: 'ReadonlySignal',
            generics: [
              {
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
            ],
          },
        },
      ],
    },
  },
  isSubmitting: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isSubmitted: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isValidating: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isTouched: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isDirty: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  isValid: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: ['boolean'],
    },
  },
  errors: {
    type: {
      type: 'custom',
      name: 'ReadonlySignal',
      generics: [
        {
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
      ],
    },
  },
};
