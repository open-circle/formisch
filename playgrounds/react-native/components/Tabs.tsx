import { clsx } from 'clsx';
import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

type TabsProps = {
  items: string[];
};

/**
 * Tabs organize content into multiple sections and allow users to navigate
 * between them.
 */
export function Tabs({ items }: TabsProps) {
  // Use pathname to determine the active tab
  const pathname = usePathname();

  return (
    <ScrollView
      className="grow-0"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="min-w-full px-8"
    >
      <View className="flex-1 flex-row gap-8 border-b-2 border-b-slate-200 lg:gap-14 dark:border-b-slate-800">
        {items.map((item) => {
          const href = `/${item.toLowerCase().replace(/ /g, '-')}`;
          const active = href === pathname;
          return (
            <Link key={href} href={href} asChild>
              <Pressable
                className={clsx(
                  '-mb-0.5 border-b-2 pb-4',
                  active
                    ? 'border-b-sky-600 dark:border-b-sky-400'
                    : 'border-b-transparent'
                )}
              >
                <Text
                  className={clsx(
                    'font-lexend lg:text-lg',
                    active
                      ? 'text-sky-600 dark:text-sky-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  )}
                >
                  {item}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}
