import { createForm, Field, Form, getInput } from '@formisch/solid';
import { createMemo, Show } from 'solid-js';
import * as v from 'valibot';
import { FormFooter, FormHeader, Select, TextInput, Title } from '~/components';

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

export default function PaymentPage() {
  const paymentForm = createForm({
    schema: PaymentFormSchema,
  });

  const getType = createMemo(() => getInput(paymentForm, { path: ['type'] }));

  return (
    <>
      <Title>Payment form</Title>
      <Form
        of={paymentForm}
        class="space-y-12 md:space-y-14 lg:space-y-16"
        onSubmit={(output, _) => console.log(output)}
      >
        <FormHeader of={paymentForm} heading="Payment form" />
        <div class="space-y-8 md:space-y-10 lg:space-y-12">
          <Field of={paymentForm} path={['owner']}>
            {(field) => (
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
          </Field>
          <Field of={paymentForm} path={['type']}>
            {(field) => (
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
          </Field>
          <Show when={getType() === 'card'}>
            <Field of={paymentForm} path={['card', 'number']}>
              {(field) => (
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
            </Field>
            <Field of={paymentForm} path={['card', 'expiration']}>
              {(field) => (
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
            </Field>
          </Show>
          <Show when={getType() === 'paypal'}>
            <Field of={paymentForm} path={['paypal', 'email']}>
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
          </Show>
        </div>
        <FormFooter of={paymentForm} />
      </Form>
    </>
  );
}
