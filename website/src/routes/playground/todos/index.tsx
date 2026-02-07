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
import {
  component$,
  useContext,
  useSignal,
  useTask$,
  useVisibleTask$,
} from '@qwik.dev/core';
import { type DocumentHead } from '@qwik.dev/router';
import * as v from 'valibot';
import {
  ColorButton,
  FormFooter,
  FormHeader,
  InputErrors,
  InputLabel,
  TextInput,
} from '~/components';
import { FormStoreContext } from '../layout';

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

export const head: DocumentHead = {
  title: 'Todo form',
  meta: [
    {
      name: 'description',
      content: 'A todo form playground with dynamic task management.',
    },
  ],
};

export default component$(() => {
  const todoForm = useForm$({
    schema: TodoFormSchema,
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });

  const formContext = useContext(FormStoreContext);
  useTask$(() => {
    formContext.value = todoForm;
  });

  const listElement = useSignal<HTMLDivElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    autoAnimate(listElement.value!);
  });

  return (
    <Form
      of={todoForm}
      class="flex flex-col gap-12 md:gap-14 lg:gap-16"
      onSubmit$={(output, _) => alert(JSON.stringify(output, null, 2))}
    >
      <FormHeader of={todoForm} heading="Todo form" />

      <div class="flex flex-col gap-8 md:gap-10 lg:gap-12">
        <Field
          of={todoForm}
          path={['heading']}
          render$={(field) => (
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
        />

        <FieldArray
          of={todoForm}
          path={['todos']}
          render$={(fieldArray) => (
            <div class="flex flex-col gap-5 px-8 lg:px-10">
              <InputLabel label="Todos" margin="none" required />

              <div>
                <div ref={listElement} class="flex flex-col gap-5">
                  {fieldArray.items.value.map((item, index) => (
                    <div
                      key={item}
                      class="flex flex-wrap gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                    >
                      <Field
                        of={todoForm}
                        path={['todos', index, 'label']}
                        render$={(field) => (
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
                      />

                      <Field
                        of={todoForm}
                        path={['todos', index, 'deadline']}
                        render$={(field) => (
                          <TextInput
                            {...field.props}
                            class="flex-1 p-0!"
                            type="date"
                            input={field.input}
                            errors={field.errors}
                            required
                          />
                        )}
                      />

                      <ColorButton
                        color="red"
                        label="Delete"
                        width="auto"
                        onClick$={() =>
                          remove(todoForm, { path: ['todos'], at: index })
                        }
                      />
                    </div>
                  ))}
                </div>
                <InputErrors name="todos" errors={fieldArray.errors} />
              </div>

              <div class="flex flex-wrap gap-5">
                <ColorButton
                  color="green"
                  label="Add new"
                  onClick$={() =>
                    insert(todoForm, {
                      path: ['todos'],
                      initialInput: { label: '', deadline: '' },
                    })
                  }
                />
                <ColorButton
                  color="yellow"
                  label="Move first to end"
                  onClick$={() =>
                    move(todoForm, {
                      path: ['todos'],
                      from: 0,
                      to: fieldArray.items.value.length - 1,
                    })
                  }
                />
                <ColorButton
                  color="purple"
                  label="Swap first two"
                  onClick$={() =>
                    swap(todoForm, { path: ['todos'], at: 0, and: 1 })
                  }
                />
                <ColorButton
                  color="blue"
                  label="Replace first"
                  onClick$={() =>
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
        />
      </div>

      <FormFooter of={todoForm} />
    </Form>
  );
});
