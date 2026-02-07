<script setup lang="ts">
import { Field, Form, useForm } from '@formisch/vue';
import * as v from 'valibot';
import { FormFooter, FormHeader, TextInput } from '../components';

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

const loginForm = useForm({
  schema: LoginSchema,
});
</script>

<template>
  <Form
    :of="loginForm"
    class="space-y-12 md:space-y-14 lg:space-y-16"
    @submit="(output, _) => console.log(output)"
  >
    <FormHeader :of="loginForm" heading="Login form" />
    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field :of="loginForm" :path="['email']" v-slot="field">
        <TextInput
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          type="email"
          label="Email"
          placeholder="example@email.com"
          required
        />
      </Field>
      <Field :of="loginForm" :path="['password']" v-slot="field">
        <TextInput
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          type="password"
          label="Password"
          placeholder="********"
          required
        />
      </Field>
    </div>
    <FormFooter :of="loginForm" />
  </Form>
</template>
