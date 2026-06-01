import {
  Field,
  FieldArray,
  Form,
  insert,
  move,
  remove,
  replace,
  swap,
  useForm,
} from '@formisch/preact';
import autoAnimate from '@formkit/auto-animate';
import { useSignal, useSignalEffect } from '@preact/signals';
import * as v from 'valibot';
import {
  ColorButton,
  FormFooter,
  FormHeader,
  TextInput,
} from '../../components';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

export default function NestedPage() {
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

  const listElements = useSignal<HTMLDivElement[] | null>(null);

  useSignalEffect(() => {
    if (listElements.value) {
      listElements.value.forEach((element) => autoAnimate(element));
      listElements.value = null;
    }
  });

  const addListElements = (element: HTMLDivElement | null) => {
    if (element) {
      if (listElements.value) {
        listElements.value = [...listElements.value, element];
      } else {
        listElements.value = [element];
      }
    }
  };

  return (
    <Form
      of={nestedForm}
      class="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={nestedForm} heading="Nested form" />

      <FieldArray of={nestedForm} path={['items']}>
        {(fieldArray) => (
          <div class="space-y-7 px-8 lg:px-10">
            <div ref={addListElements} class="space-y-5">
              {fieldArray.items.value.map((item, itemIndex) => (
                <div
                  key={item}
                  class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                >
                  <div class="flex space-x-5 px-6">
                    <Field of={nestedForm} path={['items', itemIndex, 'label']}>
                      {(field) => (
                        <TextInput
                          {...field.props}
                          input={field.input}
                          errors={field.errors}
                          type="text"
                          class="flex-1 p-0!"
                          placeholder="Enter item"
                        />
                      )}
                    </Field>

                    <ColorButton
                      color="red"
                      label="Delete"
                      width="auto"
                      onClick={() =>
                        remove(nestedForm, { path: ['items'], at: itemIndex })
                      }
                    />
                  </div>

                  <div
                    class="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                    role="separator"
                  />

                  <FieldArray
                    of={nestedForm}
                    path={['items', itemIndex, 'options']}
                  >
                    {(fieldArray) => (
                      <div ref={addListElements} class="space-y-5 px-6">
                        {fieldArray.items.value.map((item, optionIndex) => (
                          <div key={item} class="flex space-x-5">
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
                                  class="flex-1 p-0!"
                                  type="text"
                                  placeholder="Enter option"
                                />
                              )}
                            </Field>

                            <ColorButton
                              color="red"
                              label="Delete"
                              width="auto"
                              onClick={() =>
                                remove(nestedForm, {
                                  path: ['items', itemIndex, 'options'],
                                  at: optionIndex,
                                })
                              }
                            />
                          </div>
                        ))}

                        <div class="flex flex-wrap gap-4">
                          <ColorButton
                            color="green"
                            label="Add option"
                            onClick={() =>
                              insert(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                initialInput: '',
                              })
                            }
                          />
                          <ColorButton
                            color="yellow"
                            label="Move first to end"
                            onClick={() =>
                              move(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                from: 0,
                                to: fieldArray.items.value.length - 1,
                              })
                            }
                          />
                          <ColorButton
                            color="purple"
                            label="Swap first two"
                            onClick={() =>
                              swap(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                at: 0,
                                and: 1,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                  </FieldArray>
                </div>
              ))}
            </div>

            <div class="flex flex-wrap gap-4">
              <ColorButton
                color="green"
                label="Add item"
                onClick={() =>
                  insert(nestedForm, {
                    path: ['items'],
                    initialInput: { label: '', options: [''] },
                  })
                }
              />
              <ColorButton
                color="yellow"
                label="Move first to end"
                onClick={() =>
                  move(nestedForm, {
                    path: ['items'],
                    from: 0,
                    to: fieldArray.items.value.length - 1,
                  })
                }
              />
              <ColorButton
                color="purple"
                label="Swap first two"
                onClick={() =>
                  swap(nestedForm, { path: ['items'], at: 0, and: 1 })
                }
              />
              <ColorButton
                color="blue"
                label="Replace first"
                onClick={() =>
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
            </div>
          </div>
        )}
      </FieldArray>

      <FormFooter of={nestedForm} />
    </Form>
  );
}
