import { Field, Form, getInput, useForm } from '@formisch/react';
import * as v from 'valibot';
import {
  Checkbox,
  FileInput,
  FormFooter,
  FormHeader,
  RadioGroup,
  Select,
  Slider,
  TextInput,
} from '../components';

const schema = v.object({
  range: v.optional(v.string(), '50'),
  checkbox_list: v.array(v.string()),
  checkbox_item: v.optional(v.boolean(), false),
  radio: v.optional(v.string()),
  select_list: v.array(v.string()),
  select_item: v.optional(v.string()),
  file_list: v.array(v.file()),
  file_item: v.optional(v.file()),
});

export default function Page() {
  const form = useForm({ schema: schema });
  const rangeValue = getInput(form, { path: ['range'] });
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
      <FormHeader of={form} heading="Special form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        {/* Number */}
        <Field of={form} path={['range']}>
          {(field) => (
            <TextInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              type="number"
              label="Number"
            />
          )}
        </Field>

        {/* Range */}
        <Field of={form} path={['range']}>
          {(field) => (
            <Slider
              {...field.props}
              input={field.input}
              errors={field.errors}
              label={`Range: ${rangeValue}`}
            />
          )}
        </Field>

        {/* Checkox list */}
        <label className="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl">
          Checkbox array
        </label>
        <div className="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
          {options.map(({ label, value }) => (
            <Field of={form} path={['checkbox_list']} key={value}>
              {(field) => (
                <Checkbox
                  {...field.props}
                  className="p-0!"
                  label={label}
                  value={value}
                  input={field.input.includes(value)}
                  errors={field.errors}
                />
              )}
            </Field>
          ))}
        </div>

        {/* Checkbox item */}
        <Field of={form} path={['checkbox_item']}>
          {(field) => (
            <Checkbox
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="Checkbox boolean"
            />
          )}
        </Field>

        {/* Radio */}
        <Field of={form} path={['radio']}>
          {(field) => (
            <RadioGroup
              {...field.props}
              label="Radio group"
              options={options}
              input={field.input}
              errors={field.errors}
            />
          )}
        </Field>

        {/* Select list */}
        <Field of={form} path={['select_list']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={options}
              errors={field.errors}
              label="Select array"
              multiple
            />
          )}
        </Field>

        {/* Selecte item */}
        <Field of={form} path={['select_item']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={options}
              errors={field.errors}
              label="Select string"
            />
          )}
        </Field>

        {/* File list */}
        <Field of={form} path={['file_list']}>
          {(field) => (
            <FileInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="File list"
              multiple
            />
          )}
        </Field>

        {/* File item */}
        <Field of={form} path={['file_item']}>
          {(field) => (
            <FileInput
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="File item"
            />
          )}
        </Field>
      </div>
      <FormFooter of={form} />
    </Form>
  );
}
