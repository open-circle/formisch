import { Field, Form, getInput, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, RadioGroup, TextInput } from '../components';

// Fields
const size = v.pipe(
  v.string('Specify how big is the property in square meters.'),
  v.nonEmpty('Specify how big is the property in square meters.')
);
const rooms = v.pipe(
  v.string('Specify how many rooms the property has.'),
  v.nonEmpty('Specify how many rooms the property has.')
);
const operating_costs = v.pipe(
  v.string('Specify the operating costs'),
  v.nonEmpty('Specify how many rooms the property has.')
);
const monthly_fee = v.pipe(
  v.string('Specify the monthly fee'),
  v.nonEmpty('Specify how many rooms the property has.')
);

// Variants
const has_tenant_agreement = v.object({
  tenant_ownership: v.literal('agreement'),
  operating_costs,
});
const has_tenant_ownership = v.object({
  tenant_ownership: v.literal('ownership'),
  monthly_fee,
});

// Schema
const schema = v.intersect([
  // static fields
  v.object({ size, rooms }),

  // dynamic fields
  v.variant(
    'tenant_ownership',
    [has_tenant_agreement, has_tenant_ownership],
    'Specify the type ownership.'
  ),
]);

export default function Homes() {
  const form = useForm({ schema: schema });
  const tenantOwnershipType = getInput(form, { path: ['tenant_ownership'] });

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
              label="What type of lease does the townhouse have?"
              options={[
                { label: 'Tenancy agreement', value: 'agreement' },
                { label: 'Ownership', value: 'ownership' },
              ]}
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

        {tenantOwnershipType === 'agreement' && (
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
        )}

        {tenantOwnershipType === 'ownership' && (
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
        )}
      </section>

      <FormFooter of={form} />
    </Form>
  );
}
