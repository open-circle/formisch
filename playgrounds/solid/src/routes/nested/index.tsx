import {
  createForm,
  Field,
  FieldArray,
  Form,
  insert,
  move,
  remove,
  replace,
  swap,
} from '@formisch/solid';
import autoAnimate from '@formkit/auto-animate';
import { For } from 'solid-js';
import * as v from 'valibot';
import {
  ColorButton,
  FormFooter,
  FormHeader,
  TextInput,
  Title,
} from '~/components';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

export default function NestedPage() {
  const nestedForm = createForm({
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

  return (
    <>
      <Title>Nested form</Title>
      <Form
        of={nestedForm}
        class="space-y-12 md:space-y-14 lg:space-y-16"
        onSubmit={(output) => console.log(output)}
      >
        <FormHeader of={nestedForm} heading="Nested form" />

        <FieldArray of={nestedForm} path={['items']}>
          {(fieldArray) => (
            <div class="space-y-7 px-8 lg:px-10">
              <div
                class="space-y-5"
                ref={(element) => setTimeout(() => autoAnimate(element))}
              >
                <For each={fieldArray.items}>
                  {(_, getItemIndex) => (
                    <div class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700">
                      <div class="flex space-x-5 px-6">
                        <Field
                          of={nestedForm}
                          path={['items', getItemIndex(), 'label']}
                        >
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
                            remove(nestedForm, {
                              path: ['items'],
                              at: getItemIndex(),
                            })
                          }
                        />
                      </div>

                      <div
                        class="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                        role="separator"
                      />

                      <FieldArray
                        of={nestedForm}
                        path={['items', getItemIndex(), 'options']}
                      >
                        {(fieldArray) => (
                          <div
                            class="space-y-5 px-6"
                            ref={(element) =>
                              setTimeout(() => autoAnimate(element))
                            }
                          >
                            <For each={fieldArray.items}>
                              {(_, getOptionIndex) => (
                                <div class="flex space-x-5">
                                  <Field
                                    of={nestedForm}
                                    path={[
                                      'items',
                                      getItemIndex(),
                                      'options',
                                      getOptionIndex(),
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
                                        path: [
                                          'items',
                                          getItemIndex(),
                                          'options',
                                        ],
                                        at: getOptionIndex(),
                                      })
                                    }
                                  />
                                </div>
                              )}
                            </For>

                            <div class="flex flex-wrap gap-4">
                              <ColorButton
                                color="green"
                                label="Add option"
                                onClick={() =>
                                  insert(nestedForm, {
                                    path: ['items', getItemIndex(), 'options'],
                                    initialInput: '',
                                  })
                                }
                              />
                              <ColorButton
                                color="yellow"
                                label="Move first to end"
                                onClick={() =>
                                  move(nestedForm, {
                                    path: ['items', getItemIndex(), 'options'],
                                    from: 0,
                                    to: fieldArray.items.length - 1,
                                  })
                                }
                              />
                              <ColorButton
                                color="purple"
                                label="Swap first two"
                                onClick={() =>
                                  swap(nestedForm, {
                                    path: ['items', getItemIndex(), 'options'],
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
                  )}
                </For>
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
                      to: fieldArray.items.length - 1,
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
    </>
  );
}
