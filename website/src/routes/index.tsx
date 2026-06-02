import { component$, createComputed$, useSignal } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import clsx from 'clsx';
import { ActionButton, ButtonGroup, Expandable, TextLink } from '~/components';
import { PlusIcon } from '~/icons';
import { blurredCodeDarkUrl, blurredCodeLightUrl } from '~/images';
import {
  PreactLogo,
  QwikLogo,
  ReactLogo,
  SolidLogo,
  SvelteLogo,
  VueLogo,
} from '~/logos';
import { useFramework } from './plugin@framework';

export const head: DocumentHead = {
  title:
    'Formisch: The lightweight, schema-first, and fully type-safe form library for React, Solid, Vue, Svelte and more',
  meta: [
    {
      name: 'description',
      content:
        'Formisch is a schema-based, headless form library for JS frameworks. It manages form state and validation. It is type-safe, fast by default and its bundle size is small due to its modular design. ',
    },
  ],
};

export default component$(() => {
  // Use current framework
  const framework = useFramework();

  // Index of the currently open FAQ entry
  const faqIndex = useSignal(0);

  return (
    <main class="flex flex-1 flex-col items-center gap-24 py-24 md:gap-36 md:py-36 xl:gap-52 xl:py-52">
      {/* Pitch */}
      <section class="px-4 text-center">
        <h1 class="text-[min(5vw,30px)] font-medium leading-normal text-slate-900 md:text-[34px] lg:text-[40px] xl:text-5xl dark:text-slate-200">
          Modular and type-safe forms
        </h1>
        <p class="mt-6 max-w-4xl leading-loose md:mt-10 md:text-[17px] lg:mt-14 lg:text-lg xl:text-2xl xl:leading-loose">
          Build your next form with Formisch, the open source form library with
          performance, type safety and bundle size in mind.
        </p>
        <ButtonGroup class="mt-8 justify-center md:mt-12 lg:mt-16">
          <ActionButton
            variant="primary"
            label="Get started"
            type="link"
            href={`/${framework.value}/guides/introduction/`}
          />
          <ActionButton
            variant="secondary"
            label="Playground"
            type="link"
            href="/playground/login/"
          />
        </ButtonGroup>
        <div class="absolute left-0 top-0 -z-10 flex w-full justify-center overflow-x-clip">
          <div class="relative w-full xl:w-0">
            <div class="absolute -right-[300px] -top-[250px] h-[600px] w-[600px] bg-[radial-gradient(theme(--color-yellow-500/.08),transparent_70%)] md:-right-[500px] md:-top-[500px] md:h-[1000px] md:w-[1000px] xl:-right-[1100px] xl:-top-[500px] dark:bg-[radial-gradient(theme(--color-yellow-300/.08),transparent_70%)]" />
            <div class="absolute -left-[370px] top-[200px] h-[600px] w-[600px] bg-[radial-gradient(theme(--color-sky-600/.08),transparent_70%)] md:-left-[550px] md:top-[100px] md:h-[1000px] md:w-[1000px] lg:top-[200px] xl:-left-[1100px] xl:top-[300px] dark:bg-[radial-gradient(theme(--color-sky-400/.08),transparent_70%)]" />
          </div>
        </div>
      </section>

      {/* StackBlitz */}
      <section class="w-full px-3 md:max-w-5xl xl:max-w-[1360px] xl:px-10">
        <div class="relative z-0 flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border-[3px] border-slate-200 bg-white md:border-4 lg:aspect-video lg:rounded-[32px] dark:border-slate-800 dark:bg-gray-900">
          {[
            { theme: 'dark', url: blurredCodeDarkUrl },
            { theme: 'light', url: blurredCodeLightUrl },
          ].map(({ theme, url }) => (
            <img
              key={url}
              class={clsx(
                'absolute -z-10 h-full w-full object-cover object-left',
                theme === 'dark' ? 'hidden dark:block' : 'dark:hidden'
              )}
              src={url}
              alt="Blurred TypeScript JSX code"
            />
          ))}
          <div class="flex w-full flex-col items-center gap-8 px-8">
            <p class="text-center leading-loose md:text-lg md:leading-loose lg:text-xl lg:leading-loose">
              Select your framework to open a StackBlitz example project
            </p>
            <div class="flex flex-wrap justify-center gap-4 md:gap-8">
              {[
                {
                  Logo: ReactLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_REACT_URL
                  }?file=src%2Froutes%2Flogin%2Findex.tsx`,
                },
                {
                  Logo: SolidLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_SOLID_URL
                  }?file=src%2Froutes%2Flogin%2Findex.tsx`,
                },
                {
                  Logo: VueLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_VUE_URL
                  }?file=src%2Fviews%2FLoginView.vue`,
                },
                {
                  Logo: SvelteLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_SVELTE_URL
                  }?file=src%2Froutes%2Flogin%2F%2Bpage.svelte`,
                },
                {
                  Logo: QwikLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_QWIK_URL
                  }?file=src%2Froutes%2Flogin%2Findex.tsx`,
                },
                {
                  Logo: PreactLogo,
                  url: `${
                    import.meta.env.PUBLIC_STACKBLITZ_PREACT_URL
                  }?file=src%2Froutes%2Flogin%2Findex.tsx`,
                },
              ].map(({ Logo, url }) => (
                <a
                  key={url}
                  class="focus-ring group flex h-14 w-32 items-center justify-center rounded-xl border-2 border-slate-200 bg-white hover:border-sky-600/20 md:h-16 md:w-36 md:rounded-2xl md:border-[3px] dark:border-slate-800 dark:bg-gray-900 hover:dark:border-sky-400/20"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={url}
                >
                  <Logo class="h-9 text-slate-900 opacity-75 transition-opacity group-hover:opacity-100 md:h-12 dark:text-slate-200" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section class="lg:max-w-6xl">
        <h2 class="px-4 text-center text-xl font-medium text-slate-900 md:text-2xl lg:text-3xl xl:text-4xl dark:text-slate-200">
          Highlights you should not miss
        </h2>
        <ul class="mt-16 flex flex-wrap justify-center gap-16 px-8 md:mt-20 lg:mt-32 xl:mt-36 xl:gap-24">
          {[
            {
              emoji: '📦',
              heading: 'Small bundle size',
              text: 'Due to the modular design of our API the bundle size starts at 2.5 kB',
            },
            {
              emoji: '🔒',
              heading: 'Fully type safe',
              text: 'Enjoy the benefits of auto-completion and type safety in your editor',
            },
            {
              emoji: '🧩',
              heading: 'Fine-grained updates',
              text: 'Built on signals DOM updates are super fast and mostly fine-grained',
            },
            {
              emoji: '🤖',
              heading: 'Built on Valibot',
              text: (
                <>
                  The{' '}
                  <TextLink
                    href="https://valibot.dev/"
                    target="_blank"
                    underlined
                    colored
                  >
                    Valibot
                  </TextLink>{' '}
                  schema is the source of truth for validation and type
                  inference
                </>
              ),
            },
            {
              emoji: '🎨',
              heading: 'Headless design',
              text: 'Bring your own components or connect it to any pre-build component library',
            },
            {
              emoji: '🧨',
              heading: 'Powerful features',
              text: 'Add dynamic field arrays and nest your form values as deep as you like ',
            },
          ].map(({ emoji, heading, text }) => (
            <li
              key={emoji}
              class="flex flex-col items-center gap-6 text-center md:gap-7 lg:max-w-[45%] lg:flex-row lg:items-start lg:gap-8 lg:text-left"
            >
              <div class="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-sky-600/10 text-2xl dark:bg-sky-400/5">
                {emoji}
              </div>
              <div class="flex max-w-[370px] flex-col gap-4 md:gap-5">
                <h3 class="text-lg font-medium text-slate-900 md:text-xl dark:text-slate-200">
                  {heading}
                </h3>
                <p class="leading-loose md:text-lg md:leading-loose">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section class="flex flex-col gap-14 md:max-w-4xl md:gap-20 lg:gap-32">
        <h2 class="px-4 text-center text-xl font-medium text-slate-900 md:text-2xl lg:text-3xl xl:text-4xl dark:text-slate-200">
          Frequently asked questions
        </h2>
        <ul class="flex flex-col gap-12 md:gap-14 lg:gap-16">
          {[
            {
              heading: 'Where can I enter my credit card?',
              Text: () => (
                <>
                  You don't have to! Formisch is available free of charge and
                  licensed under the{' '}
                  <TextLink
                    href={`${import.meta.env.PUBLIC_GITHUB_URL}/blob/main/LICENSE.md`}
                    target="_blank"
                    underlined
                    colored
                  >
                    MIT License
                  </TextLink>
                  . However, we rely on partners and sponsors to fund the
                  project. If your company would like to support us, you can
                  take a look at our sponsor page on{' '}
                  <TextLink
                    href={import.meta.env.PUBLIC_GITHUB_SPONSORS_URL}
                    target="_blank"
                    underlined
                    colored
                  >
                    GitHub
                  </TextLink>
                  .
                </>
              ),
            },
            {
              heading: 'What exactly does Formisch do?',
              Text: () => (
                <>
                  Formisch is a framework-agnostic form library that helps you
                  build forms in a type-safe and performant way. It provides a
                  simple and intuitive API to manage form state, handle user
                  input, and perform validation. Formisch is built on top of{' '}
                  <TextLink
                    href="https://valibot.dev/"
                    target="_blank"
                    underlined
                    colored
                  >
                    Valibot
                  </TextLink>
                  , which is the source of truth for validation and type
                  inference.
                </>
              ),
            },
            {
              heading: 'How does a modular design reduce bundle size?',
              Text: () => (
                <>
                  Due to the modular design of our API, a bundler can use the
                  import statements to remove the code you don't need. This way,
                  only the code that is actually used ends up in your production
                  build. This also allows us to add new functionality to
                  Formisch without increasing the size for all users.
                </>
              ),
            },
            {
              heading: 'How is it different from others?',
              Text: () => (
                <>
                  What makes Formisch unique is its framework-agnostic core,
                  which is fully native to the framework you are using. It works
                  by inserting framework-specific reactivity blocks when the
                  core package is built. The result is a small bundle size and
                  native performance for any UI update. This feature, along with
                  a few others, distinguishes Formisch from other form
                  libraries. Our vision for Formisch is to create a
                  framework-agnostic platform similar to{' '}
                  <TextLink
                    href="https://vitejs.dev/"
                    target="_blank"
                    underlined
                    colored
                  >
                    Vite
                  </TextLink>
                  , but for forms.
                </>
              ),
            },
          ].map(({ heading, Text }, index) => {
            const isOpen = createComputed$(() => index === faqIndex.value);
            return (
              <li key={heading} class="flex flex-col px-8">
                <button
                  class={clsx(
                    'focus-ring flex w-full justify-between gap-4 rounded-md transition-colors focus-visible:outline-offset-[6px] focus-visible:ring-offset-8',
                    isOpen.value
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-800 hover:text-slate-700 dark:text-slate-300 hover:dark:text-slate-400'
                  )}
                  type="button"
                  disabled={isOpen.value}
                  aria-expanded={isOpen.value}
                  aria-controls={`faq-${index}`}
                  onClick$={() => {
                    faqIndex.value = index;
                  }}
                >
                  <span class="text-left font-medium leading-relaxed md:text-xl lg:text-2xl">
                    {heading}
                  </span>
                  <PlusIcon
                    class={clsx(
                      'mt-1.5 h-4 shrink-0 transition-transform lg:h-5',
                      isOpen.value && 'rotate-45'
                    )}
                    stroke-width={6}
                  />
                </button>
                <Expandable
                  id={`faq-${index}`}
                  class="overflow-hidden"
                  expanded={isOpen.value}
                >
                  <p class="pt-6 leading-loose md:pt-7 md:text-lg lg:pt-8 lg:text-xl lg:leading-loose">
                    <Text />
                  </p>
                </Expandable>
              </li>
            );
          })}
        </ul>
      </section>

      {/* CTA */}
      <ButtonGroup class="justify-center">
        <ActionButton
          variant="primary"
          label="Get started"
          type="link"
          href={`/${framework.value}/guides/introduction/`}
        />
        <ActionButton
          variant="secondary"
          label="Playground"
          type="link"
          href="/playground/login/"
        />
      </ButtonGroup>
    </main>
  );
});
