import { Field, handleSubmit, useForm } from '@formisch/react-native';
import { View } from 'react-native';
import * as v from 'valibot';
import {
  Checkbox,
  FileInput,
  FormFooter,
  FormHeader,
  InputLabel,
  RadioGroup,
  Select,
  Slider,
  TextInput,
} from '../components/index.ts';

// Hint: Unlike the DOM playgrounds files are plain asset objects, as React
// Native has no `File` and document pickers return URI descriptors instead
const FileAssetSchema = v.object({
  uri: v.string(),
  name: v.string(),
  mimeType: v.optional(v.string()),
  size: v.optional(v.number()),
});

const SpecialFormSchema = v.object({
  number: v.optional(v.string()),
  // Hint: Unlike the DOM playgrounds the range is a number instead of a
  // string, as React Native's slider emits real numbers
  range: v.optional(v.number(), 50),
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
    list: v.array(FileAssetSchema),
    item: v.optional(FileAssetSchema),
  }),
});

export default function SpecialScreen() {
  const specialForm = useForm({
    schema: SpecialFormSchema,
  });

  const submitForm = handleSubmit(specialForm, (output) => console.log(output));

  return (
    <View className="gap-12 md:gap-14 lg:gap-16">
      <FormHeader
        of={specialForm}
        heading="Special form"
        onSubmit={submitForm}
      />
      <View className="gap-8 md:gap-10 lg:gap-12">
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
              onValueChange={field.onChange}
            />
          )}
        </Field>

        <View className="px-8 lg:px-10">
          <InputLabel label="Checkbox array" />
          <View className="flex-row flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800">
            {[
              { label: 'Option 1', value: 'option_1' },
              { label: 'Option 2', value: 'option_2' },
              { label: 'Option 3', value: 'option_3' },
            ].map(({ label, value }) => (
              <Field of={specialForm} path={['checkbox', 'array']} key={value}>
                {(field) => (
                  <Checkbox
                    {...field.props}
                    padding="none"
                    label={label}
                    input={field.input.includes(value)}
                    errors={field.errors}
                    onValueChange={(checked) =>
                      field.onChange(
                        checked
                          ? [...field.input, value]
                          : field.input.filter((item) => item !== value)
                      )
                    }
                  />
                )}
              </Field>
            ))}
          </View>
        </View>

        <Field of={specialForm} path={['checkbox', 'boolean']}>
          {(field) => (
            <Checkbox
              {...field.props}
              input={field.input}
              errors={field.errors}
              label="Checkbox boolean"
              onValueChange={field.onChange}
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
              onValueChange={field.onChange}
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
              onValueChange={field.onChange}
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
              onValueChange={field.onChange}
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
              onValueChange={field.onChange}
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
              onValueChange={field.onChange}
            />
          )}
        </Field>
      </View>
      <FormFooter of={specialForm} onSubmit={submitForm} />
    </View>
  );
}
