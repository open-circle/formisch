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
  InputErrors,
  InputLabel,
  TextInput,
} from '../components/index.ts';

const TodoFormSchema = v.object({
  heading: v.pipe(v.string(), v.nonEmpty('Please enter a heading.')),
  todos: v.pipe(
    v.array(
      v.object({
        label: v.pipe(v.string(), v.nonEmpty('Please enter a label.')),
        deadline: v.pipe(v.string(), v.nonEmpty('Please enter a deadline.')),
      })
    ),
    v.nonEmpty('Please add at least one todo.'),
    v.maxLength(4, 'You can only add up to 4 todos.')
  ),
});

export default function TodosScreen() {
  const todoForm = useForm({
    schema: TodoFormSchema,
    initialInput: {
      heading: '',
      todos: [{ label: '', deadline: '' }],
    },
  });

  const submitForm = handleSubmit(todoForm, (output) => console.log(output));

  return (
    <View className="gap-12 md:gap-14 lg:gap-16">
      <FormHeader of={todoForm} heading="Todo form" onSubmit={submitForm} />

      <View className="gap-8 md:gap-10 lg:gap-12">
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
            <View className="gap-5 px-8 lg:px-10">
              <InputLabel label="Todos" margin="none" required />

              <View>
                <View className="gap-5">
                  {fieldArray.items.map((item, index) => (
                    <View
                      key={item}
                      className="flex-row flex-wrap gap-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 p-5 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
                    >
                      <Field of={todoForm} path={['todos', index, 'label']}>
                        {(field) => (
                          <TextInput
                            {...field.props}
                            className="w-full md:w-auto md:flex-1"
                            padding="none"
                            input={field.input}
                            errors={field.errors}
                            type="text"
                            placeholder="Enter task"
                            required
                          />
                        )}
                      </Field>

                      <Field of={todoForm} path={['todos', index, 'deadline']}>
                        {(field) => (
                          <TextInput
                            {...field.props}
                            className="flex-1"
                            padding="none"
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
                        onPress={() =>
                          remove(todoForm, { path: ['todos'], at: index })
                        }
                      />
                    </View>
                  ))}
                </View>
                <InputErrors errors={fieldArray.errors} />
              </View>

              <View className="flex-row flex-wrap gap-5">
                <ColorButton
                  color="green"
                  label="Add new"
                  onPress={() =>
                    insert(todoForm, {
                      path: ['todos'],
                      initialInput: { label: '', deadline: '' },
                    })
                  }
                />
                <ColorButton
                  color="yellow"
                  label="Move first to end"
                  onPress={() =>
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
                  onPress={() =>
                    swap(todoForm, { path: ['todos'], at: 0, and: 1 })
                  }
                />
                <ColorButton
                  color="blue"
                  label="Replace first"
                  onPress={() =>
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
              </View>
            </View>
          )}
        </FieldArray>
      </View>

      <FormFooter of={todoForm} onSubmit={submitForm} />
    </View>
  );
}
