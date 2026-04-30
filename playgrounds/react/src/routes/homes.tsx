import { Field, Form, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, RadioGroup, TextInput } from '../components';

const schema = v.object({
  tenant_ownership: v.string(),
  size: v.string(),
  rooms: v.string(),
  operating_costs: v.optional(v.string()),
  monthly_fee: v.optional(v.string()),
});

export default function Homes() {
  const form = useForm({ schema: schema });
  const options = [
    { label: '⛵️ Boat', value: 'boat' },
    { label: '🚗 Car', value: 'car' },
    { label: '✈️ Plane', value: 'plane' },
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
