<script lang="ts">
  import { Field, Form, createForm } from '@formisch/svelte';
  import * as v from 'valibot';
  import { FormFooter, FormHeader, TextInput } from '$lib/components';

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

  const loginForm = createForm({
    schema: LoginSchema,
  });
</script>

<svelte:head>
  <title>Login form</title>
</svelte:head>

<Form of={loginForm} onsubmit={(output, _) => console.log(output)}>
  <div class="space-y-12 md:space-y-14 lg:space-y-16">
    <FormHeader of={loginForm} heading="Login form" />
    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field of={loginForm} path={['email']}>
        {#snippet children(field)}
          <TextInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            type="email"
            label="Email"
            placeholder="example@email.com"
            required
          />
        {/snippet}
      </Field>
      <Field of={loginForm} path={['password']}>
        {#snippet children(field)}
          <TextInput
            {...field.props}
            input={field.input}
            errors={field.errors}
            type="password"
            label="Password"
            placeholder="********"
            required
          />
        {/snippet}
      </Field>
    </div>
    <FormFooter of={loginForm} />
  </div>
</Form>
