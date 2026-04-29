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
} from '@formisch/react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import * as v from 'valibot';
import { ColorButton, FormFooter, FormHeader, TextInput } from '../components';

const schema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

const initialInput = {
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
};

export default function NestedPage() {
  const form = useForm({ schema: schema, initialInput: initialInput });

  const [itemsListElement] = useAutoAnimate();

  return (
    <Form
      of={form}
      className="space-y-12 md:space-y-14 lg:space-y-16"
      onSubmit={(output) => console.log(output)}
    >
      <FormHeader of={form} heading="Nested form" />

      <FieldArray of={form} path={['items']}>
        {(fieldArray) => (
          <div className="space-y-7 px-8 lg:px-10">
            <div ref={itemsListElement} className="space-y-5">
              {fieldArray.items.map((item, itemIndex) => (
                <div
                  key={item}
                  className="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                >
                  <div className="flex space-x-5 px-6">
                    <Field of={form} path={['items', itemIndex, 'label']}>
                      {(field) => (
                        <TextInput
                          {...field.props}
                          input={field.input}
                          errors={field.errors}
                          type="text"
                          className="flex-1 p-0!"
                          placeholder="Enter item"
                        />
                      )}
                    </Field>

                    <ColorButton
                      color="red"
                      label="Delete"
                      width="auto"
                      onClick={() =>
                        remove(form, { path: ['items'], at: itemIndex })
                      }
                    />
                  </div>

                  <div
                    className="border-t-2 border-t-slate-200 dark:border-t-slate-800"
                    role="separator"
                  />

                  <FieldArray of={form} path={['items', itemIndex, 'options']}>
                    {(fieldArray) => {
                      // eslint-disable-next-line react-hooks/rules-of-hooks
                      const [optionsListElement] = useAutoAnimate();
                      return (
                        <div
                          ref={optionsListElement}
                          className="space-y-5 px-6"
                        >
                          {fieldArray.items.map((item, optionIndex) => (
                            <div key={item} className="flex space-x-5">
                              <Field
                                of={form}
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
                                    className="flex-1 p-0!"
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
                                  remove(form, {
                                    path: ['items', itemIndex, 'options'],
                                    at: optionIndex,
                                  })
                                }
                              />
                            </div>
                          ))}

                          <div className="flex flex-wrap gap-4">
                            <ColorButton
                              color="green"
                              label="Add option"
                              onClick={() =>
                                insert(form, {
                                  path: ['items', itemIndex, 'options'],
                                  initialInput: '',
                                })
                              }
                            />
                            <ColorButton
                              color="yellow"
                              label="Move first to end"
                              onClick={() =>
                                move(form, {
                                  path: ['items', itemIndex, 'options'],
                                  from: 0,
                                  to: fieldArray.items.length - 1,
                                })
                              }
                            />
                            <ColorButton
                              color="purple"
                              label="Swap first two"
                              onClick={() =>
                                swap(form, {
                                  path: ['items', itemIndex, 'options'],
                                  at: 0,
                                  and: 1,
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    }}
                  </FieldArray>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <ColorButton
                color="green"
                label="Add item"
                onClick={() =>
                  insert(form, {
                    path: ['items'],
                    initialInput: { label: '', options: [''] },
                  })
                }
              />
              <ColorButton
                color="yellow"
                label="Move first to end"
                onClick={() =>
                  move(form, {
                    path: ['items'],
                    from: 0,
                    to: fieldArray.items.length - 1,
                  })
                }
              />
              <ColorButton
                color="purple"
                label="Swap first two"
                onClick={() => swap(form, { path: ['items'], at: 0, and: 1 })}
              />
              <ColorButton
                color="blue"
                label="Replace first"
                onClick={() =>
                  replace(form, {
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

      <FormFooter of={form} />
    </Form>
  );
}
