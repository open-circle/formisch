import { Field, Form, getInput, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, Select, TextInput } from '../../components';

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
  v.creditCard('The card number is badly formatted.')
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
  credit_card: v.object({ number, expiration }),
});
const paypal = v.object({
  payment_type: v.literal('paypal'),
  paypal: v.object({ email }),
});

const PaymentFormSchema = v.intersect([
  v.object({ name_on_card }),
  v.variant(
    'payment_type',
    [credit_card, paypal],
    'Please select the payment type.'
  ),
]);

export default function PaymentPage() {
  const paymentForm = useForm({ schema: PaymentFormSchema });
  const type = getInput(paymentForm, { path: ['payment_type'] });

  return (
    <Form
      of={paymentForm}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={paymentForm} heading="Payment form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={paymentForm} path={['name_on_card']}>
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
        <Field of={paymentForm} path={['payment_type']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={[
                { label: 'Card', value: 'credit_card' },
                { label: 'PayPal', value: 'paypal' },
              ]}
              errors={field.errors}
              label="Type"
              placeholder="Card or PayPal?"
              required
            />
          )}
        </Field>
        {type === 'credit_card' && (
          <>
            <Field of={paymentForm} path={['credit_card', 'number']}>
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
            <Field of={paymentForm} path={['credit_card', 'expiration']}>
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
        {type === 'paypal' && (
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
        )}
      </div>
      <FormFooter of={paymentForm} />
    </Form>
  );
}
