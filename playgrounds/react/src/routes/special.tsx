import { Field, Form, useForm } from '@formisch/react';
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
  number: v.optional(v.string()),
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

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading="Special form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={form} path={['number']}>
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

        <Field of={form} path={['range']}>
          {(field) => (
            <Slider
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="Range"
            />
          )}
        </Field>

        <label className="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl">
          Checkbox array
        </label>

        <div className="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
          {[
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
            { label: 'Option 3', value: 'option_3' },
          ].map(({ label, value }) => (
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

        <Field of={form} path={['radio']}>
          {(field) => (
            <RadioGroup
              {...field.props}
              label="Radio group"
              options={[
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]}
              input={field.input}
              errors={field.errors}
            />
          )}
        </Field>

        <Field of={form} path={['select_list']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={[
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]}
              errors={field.errors}
              label="Select array"
              multiple
            />
          )}
        </Field>

        <Field of={form} path={['select_item']}>
          {(field) => (
            <Select
              {...field.props}
              input={field.input}
              options={[
                { label: 'Option 1', value: 'option_1' },
                { label: 'Option 2', value: 'option_2' },
                { label: 'Option 3', value: 'option_3' },
              ]}
              errors={field.errors}
              label="Select string"
            />
          )}
        </Field>

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
