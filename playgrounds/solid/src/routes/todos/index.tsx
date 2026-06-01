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
  InputErrors,
  InputLabel,
  TextInput,
  Title,
} from '~/components';

const TodoFormSchema = v.object({
  heading: v.pipe(
    v.string('Please enter a heading.'),
    v.nonEmpty('Please enter a heading.')
  ),
  todos: v.pipe(
    v.array(
      v.object({
        label: v.pipe(
          v.string('Please enter a label.'),
          v.nonEmpty('Please enter a label.')
        ),
        deadline: v.pipe(
          v.string('Please enter a deadline.'),
          v.nonEmpty('Please enter a deadline.')
        ),
      })
    ),
    v.nonEmpty('Please add at least one todo.'),
    v.maxLength(4, 'You can only add up to 4 todos.')
  ),
});

export default function TodosPage() {
  const todoForm = createForm({
    schema: TodoFormSchema,
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });

  return (
    <>
      <Title>Todo form</Title>
      <Form
        of={todoForm}
        class="space-y-12 md:space-y-14 lg:space-y-16"
        onSubmit={(output) => console.log(output)}
      >
        <FormHeader of={todoForm} heading="Todo form" />

        <div class="space-y-8 md:space-y-10 lg:space-y-12">
          <Field of={todoForm} path={['heading']}>
            {(field) => (
              <TextInput
                {...field.props}
                input={field.input}
                errors={field.errors}
                type="text"
                label="Heading"
                placeholder="Shopping list"
                required
              />
            )}
          </Field>

          <FieldArray of={todoForm} path={['todos']}>
            {(fieldArray) => (
              <div class="space-y-5 px-8 lg:px-10">
                <InputLabel label="Todos" margin="none" required />

                <div>
                  <div
                    ref={(element) => setTimeout(() => autoAnimate(element))}
                    class="space-y-5"
                  >
                    <For each={fieldArray.items}>
                      {(_, getIndex) => (
                        <div class="flex flex-wrap gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700">
                          <Field
                            of={todoForm}
                            path={['todos', getIndex(), 'label']}
                          >
                            {(field) => (
                              <TextInput
                                {...field.props}
                                class="w-full p-0! md:w-auto md:flex-1"
                                input={field.input}
                                errors={field.errors}
                                type="text"
                                placeholder="Enter task"
                                required
                              />
                            )}
                          </Field>

                          <Field
                            of={todoForm}
                            path={['todos', getIndex(), 'deadline']}
                          >
                            {(field) => (
                              <TextInput
                                {...field.props}
                                class="flex-1 p-0!"
                                type="date"
                                input={field.input}
                                errors={field.errors}
                                required
                              />
                            )}
                          </Field>

                          <ColorButton
                            color="red"
                            label="Delete"
                            width="auto"
                            onClick={() =>
                              remove(todoForm, {
                                path: ['todos'],
                                at: getIndex(),
                              })
                            }
                          />
                        </div>
                      )}
                    </For>
                  </div>
                  <InputErrors name="todos" errors={fieldArray.errors} />
                </div>

                <div class="flex flex-wrap gap-5">
                  <ColorButton
                    color="green"
                    label="Add new"
                    onClick={() =>
                      insert(todoForm, {
                        path: ['todos'],
                        initialInput: { label: '', deadline: '' },
                      })
                    }
                  />
                  <ColorButton
                    color="yellow"
                    label="Move first to end"
                    onClick={() =>
                      move(todoForm, {
                        path: ['todos'],
                        from: 0,
                        to: fieldArray.items.length - 1,
                      })
                    }
                  />
                  <ColorButton
                    color="purple"
                    label="Swap first two"
                    onClick={() =>
                      swap(todoForm, { path: ['todos'], at: 0, and: 1 })
                    }
                  />
                  <ColorButton
                    color="blue"
                    label="Replace first"
                    onClick={() =>
                      replace(todoForm, {
                        path: ['todos'],
                        at: 0,
                        initialInput: {
                          label: Math.random().toString(36).slice(2),
                          deadline: new Date().toISOString().split('T')[0],
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </FieldArray>
        </div>

        <FormFooter of={todoForm} />
      </Form>
    </>
  );
}
