import { Field, Form, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, RadioGroup, TextInput } from '../components';

// Fields
const size = v.string('Specify how big is the property in square meters');
const rooms = v.string('Specify how many rooms the property has.');
const operating_costs = v.optional(v.string('How much it cost to operate?'));
const monthly_fee = v.optional(v.string('How much it cost to operate?'));

// Variants
const has_tenant_ownership_yes = v.object({
  tenant_ownership: v.literal('yes'),
  operating_costs,
});
const has_tenant_ownership_no = v.object({
  tenant_ownership: v.literal('no'),
  monthly_fee,
});

// Schema
const schema = v.intersect([
  // static fields
  v.object({ size, rooms }),

  // dynamic fields
  v.variant(
    'tenant_ownership',
    [has_tenant_ownership_yes, has_tenant_ownership_no],
    'Specify the type ownership.'
  ),
]);

export default function Homes() {
  const form = useForm({ schema: schema });
  const options = [
    { label: 'Self owned', value: 'yes' },
    { label: 'Rented', value: 'no' },
  ];

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading="Home property types form" />

      <section className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={form} path={['tenant_ownership']}>
          {(field) => (
            <RadioGroup
              {...field.props}
              label="Tennant ownership"
              options={options}
              input={field.input}
              errors={field.errors}
            />
          )}
        </Field>

        <Field of={form} path={['size']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="number"
              label="Size"
            />
          )}
        </Field>

        <Field of={form} path={['rooms']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="number"
              label="Number of rooms"
            />
          )}
        </Field>

        <Field of={form} path={['operating_costs']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="number"
              label="Operating cost"
            />
          )}
        </Field>

        <Field of={form} path={['monthly_fee']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="number"
              label="Monthly fee"
            />
          )}
        </Field>
      </section>

      <FormFooter of={form} />
    </Form>
  );
}
