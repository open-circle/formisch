import {
  Field,
  FieldArray,
  handleSubmit,
  insert,
  move,
  remove,
  replace,
  swap,
  useForm,
} from '@formisch/react-native';
import { View } from 'react-native';
import * as v from 'valibot';
import {
  ColorButton,
  FormFooter,
  FormHeader,
  TextInput,
} from '../components/index.ts';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

export default function NestedScreen() {
  const nestedForm = useForm({
    schema: NestedFormSchema,
    initialInput: {
      items: [
        {
          label: 'Item 1',
          options: ['Option 1', 'Option 2'],
        },
        {
          label: 'Item 2',
          options: ['Option 1', 'Option 2'],
        },
      ],
    },
  });

  const submitForm = handleSubmit(nestedForm, (output) => console.log(output));

  return (
    <View className="gap-12 md:gap-14 lg:gap-16">
      <FormHeader of={nestedForm} heading="Nested form" onSubmit={submitForm} />

      <FieldArray of={nestedForm} path={['items']}>
        {(fieldArray) => (
          <View className="gap-7 px-8 lg:px-10">
            <View className="gap-5">
              {fieldArray.items.map((item, itemIndex) => (
                <View
                  key={item}
                  className="flex-1 gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                >
                  <View className="flex-row gap-5 px-6">
                    <Field of={nestedForm} path={['items', itemIndex, 'label']}>
                      {(field) => (
                        <TextInput
                          {...field.props}
                          input={field.input}
                          errors={field.errors}
                          type="text"
                          className="flex-1"
                          padding="none"
                          placeholder="Enter item"
                        />
                      )}
                    </Field>

                    <ColorButton
                      color="red"
                      label="Delete"
                      width="auto"
                      onPress={() =>
                        remove(nestedForm, { path: ['items'], at: itemIndex })
                      }
                    />
                  </View>

                  <View
                    className="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                    role="none"
                  />

                  <FieldArray
                    of={nestedForm}
                    path={['items', itemIndex, 'options']}
                  >
                    {(fieldArray) => (
                      <View className="gap-5 px-6">
                        {fieldArray.items.map((item, optionIndex) => (
                          <View key={item} className="flex-row gap-5">
                            <Field
                              of={nestedForm}
                              path={[
                                'items',
                                itemIndex,
                                'options',
                                optionIndex,
                              ]}
                            >
                              {(field) => (
                                <TextInput
                                  {...field.props}
                                  input={field.input}
                                  errors={field.errors}
                                  className="flex-1"
                                  padding="none"
                                  type="text"
                                  placeholder="Enter option"
                                />
                              )}
                            </Field>

                            <ColorButton
                              color="red"
                              label="Delete"
                              width="auto"
                              onPress={() =>
                                remove(nestedForm, {
                                  path: ['items', itemIndex, 'options'],
                                  at: optionIndex,
                                })
                              }
                            />
                          </View>
                        ))}

                        <View className="flex-row flex-wrap gap-4">
                          <ColorButton
                            color="green"
                            label="Add option"
                            onPress={() =>
                              insert(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                initialInput: '',
                              })
                            }
                          />
                          <ColorButton
                            color="yellow"
                            label="Move first to end"
                            onPress={() =>
                              move(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                from: 0,
                                to: fieldArray.items.length - 1,
                              })
                            }
                          />
                          <ColorButton
                            color="purple"
                            label="Swap first two"
                            onPress={() =>
                              swap(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                at: 0,
                                and: 1,
                              })
                            }
                          />
                        </View>
                      </View>
                    )}
                  </FieldArray>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap gap-4">
              <ColorButton
                color="green"
                label="Add item"
                onPress={() =>
                  insert(nestedForm, {
                    path: ['items'],
                    initialInput: { label: '', options: [''] },
                  })
                }
              />
              <ColorButton
                color="yellow"
                label="Move first to end"
                onPress={() =>
                  move(nestedForm, {
                    path: ['items'],
                    from: 0,
                    to: fieldArray.items.length - 1,
                  })
                }
              />
              <ColorButton
                color="purple"
                label="Swap first two"
                onPress={() =>
                  swap(nestedForm, { path: ['items'], at: 0, and: 1 })
                }
              />
              <ColorButton
                color="blue"
                label="Replace first"
                onPress={() =>
                  replace(nestedForm, {
                    path: ['items'],
                    at: 0,
                    initialInput: {
                      label: '',
                      options: [''],
                    },
                  })
                }
              />
            </View>
          </View>
        )}
      </FieldArray>

      <FormFooter of={nestedForm} onSubmit={submitForm} />
    </View>
  );
}
