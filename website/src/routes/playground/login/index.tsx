import { Field, Form, useForm$ } from '@formisch/qwik';
import { component$, useContext, useTask$ } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '~/components';
import { FormStoreContext } from '../layout';

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

export const head: DocumentHead = {
  title: 'Login form',
  meta: [
    {
      name: 'description',
      content: 'A login form playground with email and password validation.',
    },
  ],
};

export default component$(() => {
  const loginForm = useForm$({
    schema: LoginSchema,
  });

  const formContext = useContext(FormStoreContext);
  useTask$(() => {
    formContext.value = loginForm;
  });

  return (
    <Form
      of={loginForm}
      class="flex flex-col gap-12 md:gap-14 lg:gap-16"
      onSubmit$={(output, _) => alert(JSON.stringify(output, null, 2))}
    >
      <FormHeader of={loginForm} heading="Login form" />
      <div class="flex flex-col gap-8 md:gap-10 lg:gap-12">
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
