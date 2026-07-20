import { Field, Form, handleSubmit, useForm } from '@formisch/react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.nonEmpty('Please enter your email.'), v.email('The email is badly formatted.')),
  password: v.pipe(v.string(), v.nonEmpty('Please enter your password.'), v.minLength(8, 'Your password must have 8 characters or more.')),
});

export default function App() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const loginForm = useForm({ schema: LoginSchema });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Login</Text>

      <Form of={loginForm} style={styles.form}>
        <Field of={loginForm} path={['email']}>
          {(field) => (
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                {...field.props}
                value={field.input ?? ''}
                style={styles.input}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="you@example.com"
              />
              {field.errors && (
                <Text style={styles.error}>{field.errors[0]}</Text>
              )}
            </View>
          )}
        </Field>

        <Field of={loginForm} path={['password']}>
          {(field) => (
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                {...field.props}
                value={field.input ?? ''}
                style={styles.input}
                autoComplete="password"
                secureTextEntry
                placeholder="••••••••"
              />
              {field.errors && (
                <Text style={styles.error}>{field.errors[0]}</Text>
              )}
            </View>
          )}
        </Field>

        <Button
          title="Login"
          onPress={handleSubmit(loginForm, (output) => {
            setSubmittedEmail(output.email);
          })}
        />
      </Form>

      {submittedEmail && (
        <Text testID="submitted" style={styles.success}>
          Logged in as {submittedEmail}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
  },
  success: {
    marginTop: 24,
    color: '#16a34a',
    fontSize: 16,
  },
});
