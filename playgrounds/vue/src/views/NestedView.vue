<script setup lang="ts">
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
} from '@formisch/vue';
import * as v from 'valibot';
import { ColorButton, FormFooter, FormHeader, TextInput } from '../components';

const NestedFormSchema = v.object({
  items: v.array(
    v.object({
      label: v.optional(v.string()),
      options: v.array(v.optional(v.string())),
    })
  ),
});

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
</script>

<template>
  <Form
    :of="nestedForm"
    class="space-y-12 md:space-y-14 lg:space-y-16"
    @submit="(output) => console.log(output)"
  >
    <FormHeader :of="nestedForm" heading="Nested form" />

    <FieldArray :of="nestedForm" :path="['items']" v-slot="fieldArray">
      <div class="space-y-7 px-10 lg:px-12">
        <div v-auto-animate class="space-y-5">
          <div
            v-for="(item, itemIndex) in fieldArray.items"
            :key="item"
            class="flex-1 space-y-5 rounded-2xl border-2 border-slate-200 bg-slate-100/25 py-6 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/10 dark:hover:border-slate-700"
          >
            <div class="flex space-x-5 px-6">
              <Field
                :of="nestedForm"
                :path="['items', itemIndex, 'label']"
                v-slot="field"
              >
                <TextInput
                  v-model="field.input"
                  :props="field.props"
                  :errors="field.errors"
                  type="text"
                  class="flex-1 p-0!"
                  placeholder="Enter item"
                />
              </Field>

              <ColorButton
                color="red"
                label="Delete"
                width="auto"
                @click="
                  () => remove(nestedForm, { path: ['items'], at: itemIndex })
                "
              />
            </div>

            <div
              class="border-t-2 border-t-slate-200 dark:border-t-slate-800"
              role="separator"
            />

            <FieldArray
              :of="nestedForm"
              :path="['items', itemIndex, 'options']"
              v-slot="optionsFieldArray"
            >
              <div v-auto-animate class="space-y-5 px-6">
                <div
                  v-for="(optionItem, optionIndex) in optionsFieldArray.items"
                  :key="optionItem"
                  class="flex space-x-5"
                >
                  <Field
                    :of="nestedForm"
                    :path="['items', itemIndex, 'options', optionIndex]"
                    v-slot="field"
                  >
                    <TextInput
                      v-model="field.input"
                      :props="field.props"
                      :errors="field.errors"
                      class="flex-1 p-0!"
                      type="text"
                      placeholder="Enter option"
                    />
                  </Field>

                  <ColorButton
                    color="red"
                    label="Delete"
                    width="auto"
                    @click="
                      () =>
                        remove(nestedForm, {
                          path: ['items', itemIndex, 'options'],
                          at: optionIndex,
                        })
                    "
                  />
                </div>

                <div class="flex flex-wrap gap-4">
                  <ColorButton
                    color="green"
                    label="Add option"
                    @click="
                      () =>
                        insert(nestedForm, {
                          path: ['items', itemIndex, 'options'],
                          initialInput: '',
                        })
                    "
                  />
                  <ColorButton
                    color="yellow"
                    label="Move first to end"
                    @click="
                      () =>
                        move(nestedForm, {
                          path: ['items', itemIndex, 'options'],
                          from: 0,
                          to: optionsFieldArray.items.length - 1,
                        })
                    "
                  />
                  <ColorButton
                    color="purple"
                    label="Swap first two"
                    @click="
                      () =>
                        swap(nestedForm, {
                          path: ['items', itemIndex, 'options'],
                          at: 0,
                          and: 1,
                        })
                    "
                  />
                </div>
              </div>
            </FieldArray>
          </div>
        </div>

        <div class="flex flex-wrap gap-4">
          <ColorButton
            color="green"
            label="Add item"
            @click="
              () =>
                insert(nestedForm, {
                  path: ['items'],
                  initialInput: { label: '', options: [''] },
                })
            "
          />
          <ColorButton
            color="yellow"
            label="Move first to end"
            @click="
              () =>
                move(nestedForm, {
                  path: ['items'],
                  from: 0,
                  to: fieldArray.items.length - 1,
                })
            "
          />
          <ColorButton
            color="purple"
            label="Swap first two"
            @click="() => swap(nestedForm, { path: ['items'], at: 0, and: 1 })"
          />
          <ColorButton
            color="blue"
            label="Replace first"
            @click="
              () =>
                replace(nestedForm, {
                  path: ['items'],
                  at: 0,
                  initialInput: {
                    label: '',
                    options: [''],
                  },
                })
            "
          />
        </div>
      </div>
    </FieldArray>

    <FormFooter :of="nestedForm" />
  </Form>
</template>
