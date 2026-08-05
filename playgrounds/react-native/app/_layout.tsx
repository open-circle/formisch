import {
  Lexend_400Regular,
  Lexend_500Medium,
  useFonts,
} from '@expo-google-fonts/lexend';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Tabs } from '../components/index.ts';
import '../global.css';

/**
 * Root layout with the tab navigation shared by all forms.
 */
export default function RootLayout() {
  // Load the Lexend font used by all other playgrounds
  const [fontsLoaded] = useFonts({ Lexend_400Regular, Lexend_500Medium });
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <StatusBar style="auto" />
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-12 py-12 md:gap-14 md:py-14 lg:mx-auto lg:w-full lg:max-w-6xl lg:gap-16 lg:py-16"
        >
          <Tabs items={['Login', 'Payment', 'Todos', 'Special', 'Nested']} />
          <Slot />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
