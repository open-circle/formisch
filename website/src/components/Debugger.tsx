import { type FormStore, getInput } from '@formisch/qwik';
import { component$, useComputed$ } from '@qwik.dev/core';
import { useLocation } from '@qwik.dev/router';
import clsx from 'clsx';
import { useFramework } from '~/routes/plugin@framework';
import { FrameworkPicker } from './FrameworkPicker';
import { TextLink } from './TextLink';

type DebuggerProps = {
  of: FormStore | undefined;
};

/**
 * Displays the current form status and values. Useful to find bugs during
 * development.
 */
export const Debugger = component$((props: DebuggerProps) => {
  // Get location
  const location = useLocation();
  const framework = useFramework();

  // Get values of form
  const values = useComputed$(() => props.of && getInput(props.of));

  // Get path to GitHub file
  const gitHubHref = useComputed$(() => {
    const path = location.url.pathname.split('/')[2] || '';
    if (framework.value === 'vue') {
      return `${import.meta.env.PUBLIC_GITHUB_URL}/tree/main/playgrounds/vue/src/views/${path.charAt(0).toUpperCase() + path.slice(1)}View.vue`;
    } else if (framework.value === 'svelte') {
      return `${import.meta.env.PUBLIC_GITHUB_URL}/tree/main/playgrounds/svelte/src/routes/${path}/+page.svelte`;
    } else {
      return `${import.meta.env.PUBLIC_GITHUB_URL}/tree/main/playgrounds/${framework.value}/src/routes/${path}/index.tsx`;
    }
  });

  // Get path to Stackblitz file
  const stackBlitzHref = useComputed$(() => {
    const path = location.url.pathname.split('/')[2] || '';
    if (framework.value === 'vue') {
      return `${import.meta.env.PUBLIC_STACKBLITZ_VUE_URL}?file=src/views/${path.charAt(0).toUpperCase() + path.slice(1)}View.vue`;
    } else if (framework.value === 'svelte') {
      return `${import.meta.env.PUBLIC_STACKBLITZ_SVELTE_URL}?file=src/routes/${path}/+page.svelte`;
    } else if (framework.value === 'qwik') {
      return `${import.meta.env.PUBLIC_STACKBLITZ_QWIK_URL}?file=src/routes/${path}/index.tsx`;
    } else if (framework.value === 'react') {
      return `${import.meta.env.PUBLIC_STACKBLITZ_REACT_URL}?file=src/routes/${path}/index.tsx`;
    } else if (framework.value === 'solid') {
      return `${import.meta.env.PUBLIC_STACKBLITZ_SOLID_URL}?file=src/routes/${path}/index.tsx`;
    } else {
      return `${import.meta.env.PUBLIC_STACKBLITZ_PREACT_URL}?file=src/routes/${path}/index.tsx`;
    }
  });

  return (
    <div class="flex h-full flex-col gap-9 overflow-auto overscroll-contain px-8 py-10 lg:sticky lg:top-32 lg:mx-10 lg:mt-24 lg:h-auto lg:max-h-[60vh] lg:w-80 lg:rounded-3xl lg:border-2 lg:border-slate-200 lg:p-10 xl:top-40 xl:mt-32 xl:w-96 lg:dark:border-slate-800">
      <div>
        <h3 class="text-xl font-medium text-slate-900 dark:text-slate-200">
          Debugger
        </h3>
        <FrameworkPicker class="mt-6 w-full" />
        <p class="mt-4">
          See code on{' '}
          <TextLink href={gitHubHref.value} target="_blank" colored underlined>
            GitHub
          </TextLink>{' '}
          or{' '}
          <TextLink
            href={stackBlitzHref.value}
            target="_blank"
            colored
            underlined
          >
            Stackblitz
          </TextLink>
          .
        </p>
      </div>
      <div class="flex flex-col gap-6">
        <h4 class="text-lg font-medium text-slate-900 dark:text-slate-200">
          Form state
        </h4>
        <ul class="flex flex-col gap-5">
          {[
            {
              label: 'Submitting',
              value: props.of?.isSubmitting.value,
            },
            {
              label: 'Submitted',
              value: props.of?.isSubmitted.value,
            },
            {
              label: 'Validating',
              value: props.of?.isValidating.value,
            },
            {
              label: 'Dirty',
              value: props.of?.isDirty.value,
            },
            {
              label: 'Touched',
              value: props.of?.isTouched.value,
            },
            {
              label: 'Valid',
              value: props.of?.isValid.value,
            },
          ].map(({ label, value }) => (
            <li class="flex justify-between" key={label}>
              <span>{label}:</span>
              <span
                class={
                  value === false
                    ? 'text-red-600 dark:text-red-400'
                    : value === true
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : ''
                }
              >
                {value?.toString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div class="flex flex-col gap-6">
        <h4 class="text-lg font-medium text-slate-900 dark:text-slate-200">
          Form inputs
        </h4>
        {Object.keys(values.value || {}).length ? (
          <FieldValueList values={values.value} />
        ) : (
          <p>Wait for input...</p>
        )}
      </div>
    </div>
  );
});

type FieldValuesProps = {
  class?: string;
  values: any;
};

/**
 * Recusive component that displays individual form values.
 */
export const FieldValueList = component$((props: FieldValuesProps) => {
  return (
    <ul class={clsx('flex flex-col gap-5', props.class)}>
      {Object.entries(props.values).map(([key, value]) => (
        <li
          key={key}
          class={
            !value ||
            typeof value !== 'object' ||
            value instanceof File ||
            value instanceof Date
              ? 'flex justify-between gap-4'
              : ''
          }
        >
          <span>{key}:</span>
          {!value ||
          typeof value !== 'object' ||
          value instanceof File ||
          value instanceof Date ? (
            <span
              class={clsx('overflow-hidden text-ellipsis whitespace-nowrap', {
                'text-yellow-600 dark:text-amber-200':
                  typeof value === 'string',
                'text-purple-600 dark:text-purple-400':
                  typeof value === 'number',
                'text-red-600 dark:text-red-400': value === false,
                'text-emerald-600 dark:text-emerald-400': value === true,
                'text-teal-600 dark:text-teal-400': value === null,
                'text-sky-600 dark:text-sky-400': value instanceof File,
              })}
            >
              {value instanceof File ? value.name : String(value)}
            </span>
          ) : (
            <FieldValueList class="mt-3 ml-2" values={value} />
          )}
        </li>
      ))}
    </ul>
  );
});
