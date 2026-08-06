import { Field, handleSubmit, useForm } from '@formisch/react-native';
import { View } from 'react-native';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '../components/index.ts';

const LoginSchema = v.object({
  email: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your email.'),
    v.email('The email address is badly formatted.')
  ),
  password: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.')
  ),
});

export default function LoginScreen() {
  const loginForm = useForm({
    schema: LoginSchema,
  });

  const submitForm = handleSubmit(loginForm, (output) => console.log(output));

  return (
    <View className="gap-12 md:gap-14 lg:gap-16">
      <FormHeader of={loginForm} heading="Login form" onSubmit={submitForm} />
      <View className="gap-8 md:gap-10 lg:gap-12">
        <Field of={loginForm} path={['email']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="email"
              label="Email"
              placeholder="example@email.com"
              required
            />
          )}
        </Field>
        <Field of={loginForm} path={['password']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="password"
              label="Password"
              placeholder="********"
              required
            />
          )}
        </Field>
      </View>
      <FormFooter of={loginForm} onSubmit={submitForm} />
    </View>
  );
}
