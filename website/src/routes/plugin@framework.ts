import {
  $,
  type Component,
  createContextId,
  type QRL,
  type Signal,
  useContext,
  useContextProvider,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import type { SVGProps } from '@qwik.dev/core/internal';
import { useLocation } from '@qwik.dev/router';
import {
  AngularIcon,
  PreactIcon,
  QwikIcon,
  ReactIcon,
  SolidIcon,
  SvelteIcon,
  VueIcon,
} from '~/icons';
import {
  AngularLogo,
  PreactLogo,
  QwikLogo,
  ReactLogo,
  ReactNativeLogo,
  SolidLogo,
  SvelteLogo,
  VueLogo,
} from '~/logos';

const FRAMEWORK_KEY = 'framework';
export const DEFAULT_FRAMEWORK: Framework = 'react';

export type Framework =
  | 'angular'
  | 'preact'
  | 'qwik'
  | 'react'
  | 'react-native'
  | 'solid'
  | 'svelte'
  | 'vue';

export const FRAMEWORK_LIST: Framework[] = [
  'angular',
  'preact',
  'qwik',
  'react',
  'react-native',
  'solid',
  'svelte',
  'vue',
];

export const FRAMEWORK_NAME_MAP: Record<Framework, string> = {
  angular: 'Angular',
  preact: 'Preact',
  qwik: 'Qwik',
  react: 'React',
  'react-native': 'React Native',
  solid: 'SolidJS',
  svelte: 'Svelte',
  vue: 'Vue',
};

const FRAMEWORK_LOGO_MAP: Record<
  Framework,
  Component<SVGProps<SVGSVGElement>>
> = {
  angular: AngularLogo,
  preact: PreactLogo,
  qwik: QwikLogo,
  react: ReactLogo,
  'react-native': ReactNativeLogo,
  solid: SolidLogo,
  svelte: SvelteLogo,
  vue: VueLogo,
};

const FRAMEWORK_ICON_MAP: Record<
  Framework,
  Component<SVGProps<SVGSVGElement>>
> = {
  angular: AngularIcon,
  preact: PreactIcon,
  qwik: QwikIcon,
  react: ReactIcon,
  // Hint: React Native shares the React atom, as it has no icon of its own
  'react-native': ReactIcon,
  solid: SolidIcon,
  svelte: SvelteIcon,
  vue: VueIcon,
};

export function isFramework(
  value: string | null | undefined
): value is Framework {
  return !!value && (FRAMEWORK_LIST as string[]).includes(value);
}

const FrameworkContext = createContextId<Signal<Framework>>(FRAMEWORK_KEY);

/**
 * Provides the framework signal. Mounted once near the root of the app.
 *
 * - Tracks the first URL segment when it matches a framework slug.
 * - Otherwise falls back to the user's last choice from `localStorage` once
 *   hydration runs, defaulting to `react` during SSG.
 */
export const useFrameworkProvider = () => {
  const location = useLocation();
  const framework = useSignal<Framework>(DEFAULT_FRAMEWORK);

  useContextProvider(FrameworkContext, framework);

  // Track URL changes so docs routes drive the framework
  useTask$(({ track }) => {
    const pathname = track(() => location.url.pathname);
    const firstSegment = pathname.split('/')[1];
    if (isFramework(firstSegment) && framework.value !== firstSegment) {
      framework.value = firstSegment;
    }
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    // Re-run on client-side navigation so the stored slug never goes stale
    const pathname = track(() => location.url.pathname);

    // If URL already dictates the framework, persist it
    const firstSegment = pathname.split('/')[1];
    if (isFramework(firstSegment)) {
      try {
        localStorage.setItem(FRAMEWORK_KEY, firstSegment);
      } catch {
        // ignore
      }

      // Otherwise restore from localStorage
    } else {
      try {
        const stored = localStorage.getItem(FRAMEWORK_KEY);
        if (isFramework(stored)) {
          framework.value = stored;
        }
      } catch {
        // ignore
      }
    }
  });
};

/**
 * Returns the current framework.
 */
export const useFramework = () => useContext(FrameworkContext);

/**
 * Returns a function that updates the preferred framework.
 */
export const useSetFramework = (): QRL<(value: Framework) => void> => {
  const framework = useFramework();
  return $((value: Framework) => {
    framework.value = value;
    try {
      localStorage.setItem(FRAMEWORK_KEY, value);
    } catch {
      // ignore
    }
  });
};

/**
 * Returns the display name of the framework.
 */
export const getFrameworkName = (framework: Framework): string =>
  FRAMEWORK_NAME_MAP[framework];

/**
 * Returns the logo component of the framework.
 */
export const getFrameworkLogo = (framework: Framework) =>
  FRAMEWORK_LOGO_MAP[framework];

/**
 * Returns the icon component of the framework.
 */
export const getFrameworkIcon = (framework: Framework) =>
  FRAMEWORK_ICON_MAP[framework];
