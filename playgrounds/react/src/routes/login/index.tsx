import { Field, Form, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '../../components';

const LoginSchema = v.object({
  email: v.pipe(
    v.string('Please enter your email.'),
    v.nonEmpty('Please enter your email.'),
    v.email('The email address is badly formatted.')
  ),
  password: v.pipe(
    v.string('Please enter your password.'),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.')
  ),
});

export default function LoginPage() {
  const loginForm = useForm({
    schema: LoginSchema,
  });

  return (
    <Form
      of={loginForm}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={loginForm} heading="Login form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
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
      </div>
      <FormFooter of={loginForm} />
    </Form>
  );
}
