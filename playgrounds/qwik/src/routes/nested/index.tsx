import {
  Field,
  FieldArray,
  Form,
  insert,
  move,
  remove,
  replace,
  swap,
  useForm$,
} from '@formisch/qwik';
import autoAnimate from '@formkit/auto-animate';
import { $, component$, useSignal, useVisibleTask$ } from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import * as v from 'valibot';
import { ColorButton, FormFooter, FormHeader, TextInput } from '~/components';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

export default component$(() => {
  const nestedForm = useForm$({
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

  const allListElements = useSignal<HTMLDivElement[]>([]);
  const newListElements = useSignal<HTMLDivElement[] | null>(null);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(newListElements);
    if (newListElements.value) {
      newListElements.value.forEach((element) => autoAnimate(element));
      newListElements.value = null;
    }
  });

  const addListElements = $((element: HTMLDivElement) => {
    if (!allListElements.value.includes(element)) {
      allListElements.value = [...allListElements.value, element];
      if (newListElements.value) {
        newListElements.value = [...newListElements.value, element];
      } else {
        newListElements.value = [element];
      }
    }
  });

  return (
    <Form
      of={nestedForm}
      class="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit$={(output) => console.log(output)}
    >
      <FormHeader of={nestedForm} heading="Nested form" />

      <FieldArray
        of={nestedForm}
        path={['items']}
        render$={(fieldArray) => (
          <div class="space-y-7 px-10 lg:px-12">
            <div ref={addListElements} class="space-y-5">
              {fieldArray.items.value.map((item, itemIndex) => (
                <div
                  key={item}
                  class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                >
                  <div class="flex space-x-5 px-6">
                    <Field
                      of={nestedForm}
                      path={['items', itemIndex, 'label']}
                      render$={(field) => (
                        <TextInput
                          {...field.props}
                          input={field.input}
                          errors={field.errors}
                          type="text"
                          class="flex-1 p-0!"
                          placeholder="Enter item"
                        />
                      )}
                    />

                    <ColorButton
                      color="red"
                      label="Delete"
                      width="auto"
                      onClick$={() =>
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
                    render$={(fieldArray) => (
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
                              render$={(field) => (
                                <TextInput
                                  {...field.props}
                                  input={field.input}
                                  errors={field.errors}
                                  class="flex-1 p-0!"
                                  type="text"
                                  placeholder="Enter option"
                                />
                              )}
                            />

                            <ColorButton
                              color="red"
                              label="Delete"
                              width="auto"
                              onClick$={() =>
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
                            onClick$={() =>
                              insert(nestedForm, {
                                path: ['items', itemIndex, 'options'],
                                initialInput: '',
                              })
                            }
                          />
                          <ColorButton
                            color="yellow"
                            label="Move first to end"
                            onClick$={() =>
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
                            onClick$={() =>
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
                  />
                </div>
              ))}
            </div>

            <div class="flex flex-wrap gap-4">
              <ColorButton
                color="green"
                label="Add item"
                onClick$={() =>
                  insert(nestedForm, {
                    path: ['items'],
                    initialInput: { label: '', options: [''] },
                  })
                }
              />
              <ColorButton
                color="yellow"
                label="Move first to end"
                onClick$={() =>
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
                onClick$={() =>
                  swap(nestedForm, { path: ['items'], at: 0, and: 1 })
                }
              />
              <ColorButton
                color="blue"
                label="Replace first"
                onClick$={() =>
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
      />

      <FormFooter of={nestedForm} />
    </Form>
  );
});

export const head: DocumentHead = {
  title: 'Nested form',
};
