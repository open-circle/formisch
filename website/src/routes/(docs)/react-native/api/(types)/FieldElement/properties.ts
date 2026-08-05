import type { PropertyProps } from '~/components';

export const properties: Record<string, PropertyProps> = {
  FieldElement: {
    type: {
      type: 'object',
      entries: [
        {
          key: 'focus',
          value: {
            type: 'function',
            params: [],
            return: 'void',
          },
        },
        {
          key: 'blur',
          optional: true,
          value: {
            type: 'function',
            params: [],
            return: 'void',
          },
        },
        {
          key: 'isFocused',
          optional: true,
          value: {
            type: 'function',
            params: [],
            return: 'boolean',
          },
        },
      ],
    },
  },
  focus: {
    type: {
      type: 'function',
      params: [],
      return: 'void',
    },
  },
  blur: {
    type: {
      type: 'union',
      options: [
        {
          type: 'function',
          params: [],
          return: 'void',
        },
        'undefined',
      ],
    },
  },
  isFocused: {
    type: {
      type: 'union',
      options: [
        {
          type: 'function',
          params: [],
          return: 'boolean',
        },
        'undefined',
      ],
    },
  },
};
