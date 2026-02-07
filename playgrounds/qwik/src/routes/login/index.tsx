import { Field, Form, useForm$ } from '@formisch/qwik';
import { component$ } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '~/components';

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

export default component$(() => {
  const loginForm = useForm$({
    schema: LoginSchema,
  });

  return (
    <Form
      of={loginForm}
      class="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit$={(output, _) => console.log(output)}
    >
      <FormHeader of={loginForm} heading="Login form" />
      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <Field
          of={loginForm}
          path={['email']}
          render$={(field) => (
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
        />
        <Field
          of={loginForm}
          path={['password']}
          render$={(field) => (
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
        />
      </div>
      <FormFooter of={loginForm} />
    </Form>
  );
});

export const head: DocumentHead = {
  title: 'Login form',
};
