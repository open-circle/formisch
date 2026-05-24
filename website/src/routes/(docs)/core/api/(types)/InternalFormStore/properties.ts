import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  TSchema: {
    modifier: 'extends',
    type: {
      type: 'custom',
      name: 'FormSchema',
      href: '../FormSchema/',
    },
    default: {
      type: 'custom',
      name: 'FormSchema',
      href: '../FormSchema/',
    },
  },
  element: {
    type: {
      type: 'union',
      options: [
        {
          type: 'custom',
          name: 'HTMLFormElement',
        },
        'undefined',
      ],
    },
  },
  validators: {
    type: 'number',
  },
  validate: {
    type: {
      type: 'custom',
      name: 'ValidationMode',
      href: '../ValidationMode/',
    },
  },
  revalidate: {
    type: {
      type: 'custom',
      name: 'Exclude',
      generics: [
        {
          type: 'custom',
          name: 'ValidationMode',
          href: '../ValidationMode/',
        },
        {
          type: 'string',
          value: 'initial',
        },
      ],
    },
  },
  parse: {
    type: {
      type: 'function',
      params: [
        {
          name: 'input',
          type: 'unknown',
        },
      ],
      return: {
        type: 'custom',
        name: 'Promise',
        generics: [
          {
            type: 'custom',
            name: 'SafeParseResult',
            generics: [
              {
                type: 'custom',
                name: 'TSchema',
              },
            ],
            href: 'https://valibot.dev/api/SafeParseResult/',
          },
        ],
      },
    },
  },
  isSubmitting: {
    type: {
      type: 'custom',
      name: 'Signal',
      generics: ['boolean'],
    },
  },
  isSubmitted: {
    type: {
      type: 'custom',
      name: 'Signal',
      generics: ['boolean'],
    },
  },
  isValidating: {
    type: {
      type: 'custom',
      name: 'Signal',
      generics: ['boolean'],
    },
  },
};
