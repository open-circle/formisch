import { Field, getInput, handleSubmit, useForm } from '@formisch/react-native';
import { View } from 'react-native';
import * as v from 'valibot';
import {
  FormFooter,
  FormHeader,
  Select,
  TextInput,
} from '../components/index.ts';

const PaymentFormSchema = v.intersect([
  v.object({
    owner: v.pipe(v.string(), v.nonEmpty('Please enter your name.')),
  }),
  v.variant(
    'type',
    [
      v.object({
        type: v.literal('card'),
        card: v.object({
          number: v.pipe(
            v.string(),
            v.nonEmpty('Please enter your card number.'),
            v.creditCard('The card number is badly formatted.')
          ),
          expiration: v.pipe(
            v.string(),
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
            v.string(),
            v.nonEmpty('Please enter your PayPal email.'),
            v.email('The email address is badly formatted.')
          ),
        }),
      }),
    ],
    'Please select the payment type.'
  ),
]);

export default function PaymentScreen() {
  const paymentForm = useForm({
    schema: PaymentFormSchema,
  });

  const submitForm = handleSubmit(paymentForm, (output) => console.log(output));

  const type = getInput(paymentForm, { path: ['type'] });

  return (
    <View className="gap-12 md:gap-14 lg:gap-16">
      <FormHeader
        of={paymentForm}
        heading="Payment form"
        onSubmit={submitForm}
      />
      <View className="gap-8 md:gap-10 lg:gap-12">
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
              required
              onValueChange={field.onChange}
            />
          )}
        </Field>
        {type === 'card' && (
          <>
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
      </View>
      <FormFooter of={paymentForm} onSubmit={submitForm} />
    </View>
  );
}
