import { Field, Form, getInput, useForm$ } from '@formisch/qwik';
import { component$, useComputed$, useContext, useTask$ } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import * as v from 'valibot';
import { FormFooter, FormHeader, Select, TextInput } from '~/components';
import { FormStoreContext } from '../layout';

const PaymentFormSchema = v.intersect([
  v.object({
    owner: v.pipe(
      v.string('Please enter your name.'),
      v.nonEmpty('Please enter your name.')
    ),
  }),
  v.variant(
    'type',
    [
      v.object({
        type: v.literal('card'),
        card: v.object({
          number: v.pipe(
            v.string('Please enter your card number.'),
            v.nonEmpty('Please enter your card number.'),
            v.creditCard('The card number is badly formatted.')
          ),
          expiration: v.pipe(
            v.string('Please enter the expiration date.'),
            v.nonEmpty('Please enter the expiration date.'),
            v.regex(
              /^(?:0[1-9]|1[0-2])\/(?:2[5-9]|3[0-9])$/,
              'The expiration date is badly formatted.'
            )
          ),
        }),
      }),
      v.object({
        type: v.literal('paypal'),
        paypal: v.object({
          email: v.pipe(
            v.string('Please enter your PayPal email.'),
            v.nonEmpty('Please enter your PayPal email.'),
            v.email('The email address is badly formatted.')
          ),
        }),
      }),
    ],
    'Please select the payment type.'
  ),
]);

export const head: DocumentHead = {
  title: 'Payment form',
  meta: [
    {
      name: 'description',
      content: 'A payment form playground supporting card and PayPal payments.',
    },
  ],
};

export default component$(() => {
  const paymentForm = useForm$({
    schema: PaymentFormSchema,
  });

  const formContext = useContext(FormStoreContext);
  useTask$(() => {
    formContext.value = paymentForm;
  });

  const type = useComputed$(() => getInput(paymentForm, { path: ['type'] }));

  return (
    <Form
      of={paymentForm}
      class="flex flex-col gap-12 md:gap-14 lg:gap-16"
      onSubmit$={(output, _) => alert(JSON.stringify(output, null, 2))}
    >
      <FormHeader of={paymentForm} heading="Payment form" />
      <div class="flex flex-col gap-8 md:gap-10 lg:gap-12">
        <Field
          of={paymentForm}
          path={['owner']}
          render$={(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="text"
              label="Owner"
              placeholder="John Doe"
              required
            />
          )}
        />
        <Field
          of={paymentForm}
          path={['type']}
          render$={(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={[
                { label: 'Card', value: 'card' },
                { label: 'PayPal', value: 'paypal' },
              ]}
              errors={field.errors}
              label="Type"
              placeholder="Card or PayPal?"
              required
            />
          )}
        />
        {type.value === 'card' && (
          <>
            <Field
              of={paymentForm}
              path={['card', 'number']}
              render$={(field) => (
                <TextInput
                  {...field.props}
                  input={field.input}
                  errors={field.errors}
                  type="text"
                  label="Number"
                  placeholder="1234 1234 1234 1234"
                  required
                />
              )}
            />
            <Field
              of={paymentForm}
              path={['card', 'expiration']}
              render$={(field) => (
                <TextInput
                  {...field.props}
                  input={field.input}
                  errors={field.errors}
                  type="text"
                  label="Expiration"
                  placeholder="MM/YY"
                  required
                />
              )}
            />
          </>
        )}
        {type.value === 'paypal' && (
          <Field
            of={paymentForm}
            path={['paypal', 'email']}
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
        )}
      </div>
      <FormFooter of={paymentForm} />
    </Form>
  );
});
