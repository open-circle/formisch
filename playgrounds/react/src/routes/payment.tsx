import { Field, Form, getInput, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, Select, TextInput } from '../components';

// Helpers
const expirationRegex: RegExp = /^(?:0[1-9]|1[0-2])\/(?:2[5-9]|3[0-9])$/;

// Fields
const name_on_card = v.pipe(
  v.string('Please enter your name.'),
  v.nonEmpty('Please enter your name.')
);
const number = v.pipe(
  v.string('Please enter your card number.'),
  v.nonEmpty('Please enter your card number.'),
  v.minLength(8, 'The card number must be 8 digits.')
);
const expiration = v.pipe(
  v.string('Please enter the expiration date.'),
  v.nonEmpty('Please enter the expiration date.'),
  v.regex(expirationRegex, 'The expiration date is badly formatted.')
);
const email = v.pipe(
  v.string('Please enter your PayPal email.'),
  v.nonEmpty('Please enter your PayPal email.'),
  v.email('The email address is badly formatted.')
);

// Variants
const credit_card = v.object({
  payment_type: v.literal('credit_card'),
  number,
  expiration,
});
const paypal = v.object({
  payment_type: v.literal('paypal'),
  email,
});

const schema = v.intersect([
  // static fields
  v.object({ name_on_card }),

  // dynamic fields
  v.variant(
    'payment_type',
    [credit_card, paypal],
    'Please select the payment type.'
  ),
]);

export default function PaymentPage() {
  const form = useForm({ schema: schema });
  const paymentType = getInput(form, { path: ['payment_type'] });
  const paymentOptions = [
    { label: 'Card', value: 'credit_card' },
    { label: 'PayPal', value: 'paypal' },
  ];

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading="Payment form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={form} path={['name_on_card']}>
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
        <Field of={form} path={['payment_type']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={paymentOptions}
              errors={field.errors}
              label="Type"
              placeholder="Card or PayPal?"
              required
            />
          )}
        </Field>
        {paymentType === 'credit_card' && (
          <>
            <Field of={form} path={['number']}>
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
            <Field of={form} path={['expiration']}>
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
          </>
        )}
        {paymentType === 'paypal' && (
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
        )}
      </div>
      <FormFooter of={form} />
    </Form>
  );
}
