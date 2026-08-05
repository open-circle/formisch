import { Redirect } from 'expo-router';

/**
 * Redirects the start route to the login form.
 */
export default function IndexScreen() {
  return <Redirect href="/login" />;
}
