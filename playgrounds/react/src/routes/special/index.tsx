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
} from '../../components';

const SpecialFormSchema = v.object({
  number: v.optional(v.string()),
  range: v.optional(v.string(), '50'),
  checkbox: v.object({
    array: v.array(v.string()),
    boolean: v.optional(v.boolean(), false),
  }),
  radio: v.optional(v.string()),
  select: v.object({
    array: v.array(v.string()),
    string: v.optional(v.string()),
  }),
  file: v.object({
    list: v.array(v.file()),
    item: v.optional(v.file()),
  }),
});

export default function Page() {
  const specialForm = useForm({
    schema: SpecialFormSchema,
  });

  return (
    <Form
      of={specialForm}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={specialForm} heading="Special form" />
      <div className="space-y-8 md:space-y-10 lg:space-y-12">
        <Field of={specialForm} path={['number']}>
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

        <Field of={specialForm} path={['range']}>
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
            <Field of={specialForm} path={['checkbox', 'array']} key={value}>
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

        <Field of={specialForm} path={['checkbox', 'boolean']}>
          {(field) => (
            <Checkbox
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="Checkbox boolean"
            />
          )}
        </Field>

        <Field of={specialForm} path={['radio']}>
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

        <Field of={specialForm} path={['select', 'array']}>
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

        <Field of={specialForm} path={['select', 'string']}>
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

        <Field of={specialForm} path={['file', 'list']}>
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

        <Field of={specialForm} path={['file', 'item']}>
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
      <FormFooter of={specialForm} />
    </Form>
  );
}
