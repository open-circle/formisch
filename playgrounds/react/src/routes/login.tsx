import { Field, Form, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '../components';

const schema = v.object({
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
  const form = useForm({ schema: schema });

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading="Login form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={form} path={['email']}>
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
        <Field of={form} path={['password']}>
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
      <FormFooter of={form} />
    </Form>
  );
}
