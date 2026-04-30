import { Field, Form, getInput, useForm } from '@formisch/react';
import * as v from 'valibot';
import { FormFooter, FormHeader, RadioGroup, TextInput } from '../components';

// Fields
const size = v.pipe(
  v.string('Specify how big the property is in square meters.'),
  v.nonEmpty('Specify how big the property is in square meters.')
);
const rooms = v.pipe(
  v.string('Specify how many rooms the property has.'),
  v.nonEmpty('Specify how many rooms the property has.')
);
const operating_costs = v.pipe(
  v.string('Specify the operating costs'),
  v.nonEmpty('Specify the operating costs.')
);
const monthly_fee = v.pipe(
  v.string('Specify the monthly fee'),
  v.nonEmpty('Specify the monthly fee.')
);

// Variants (tenancy only)
const agreement = v.object({
  tenancy_type: v.literal('agreement'),
  monthly_fee,
});
const ownership = v.object({
  tenancy_type: v.literal('ownership'),
  operating_costs,
});

function getSchema(property: 'home' | 'apartment' | 'tenancy') {
  const staticFields = { size, rooms };

  if (property === 'home') {
    return v.object({ ...staticFields, operating_costs });
  }

  if (property === 'apartment') {
    return v.object({ ...staticFields, monthly_fee });
  }

  return v.intersect([
    v.object(staticFields),
    v.variant(
      'tenancy_type',
      [agreement, ownership],
      'Specify the type of lease.'
    ),
  ]);
}

interface Props {
  property: 'home' | 'apartment' | 'tenancy';
}

export default function Homes({ property }: Props) {
  const form = useForm({ schema: getSchema(property) });

  // Properties
  const isTenancy = property === 'tenancy';
  const tenancyType = isTenancy
    ? getInput(form, { path: ['tenancy_type'] })
    : undefined;
  const hasMonthlyFee = property === 'apartment' || tenancyType === 'agreement';
  const hasOperatingCost = property === 'home' || tenancyType === 'ownership';

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading={`Property details (${property})`} />

      <section className="space-y-8 md:space-y-10 lg:space-y-12">
        {/* Static Fields (Always visible) */}
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

        {isTenancy && (
          <Field of={form} path={['tenancy_type']}>
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
        )}

        {hasMonthlyFee && (
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

        {hasOperatingCost && (
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
