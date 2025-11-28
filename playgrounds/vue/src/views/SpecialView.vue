<script setup lang="ts">
import { Field, Form, useForm } from '@formisch/vue';
import * as v from 'valibot';
import {
  Checkbox,
  FileInput,
  FormFooter,
  FormHeader,
  Radio,
  Select,
  Slider,
  TextInput,
} from '../components';

const SpecialFormSchema = v.object({
  number: v.optional(v.number()),
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
    list: v.array(v.file()),
    item: v.optional(v.file()),
  }),
});

const specialForm = useForm({
  schema: SpecialFormSchema,
});
</script>

<template>
  <Form
    :of="specialForm"
    class="space-y-12 md:space-y-14 lg:space-y-16"
    @submit="(output) => console.log(output)"
  >
    <FormHeader :of="specialForm" heading="Special form" />
    <div class="space-y-8 md:space-y-10 lg:space-y-12">
      <Field :of="specialForm" :path="['number']" v-slot="field">
        <TextInput
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          type="number"
          label="Number"
        />
      </Field>

      <Field :of="specialForm" :path="['range']" v-slot="field">
        <Slider
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          label="Range"
        />
      </Field>

      <label
        class="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl"
      >
        Checkbox array
      </label>

      <div
        class="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
      >
        <Field
          v-for="{ label, value } in [
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
            { label: 'Option 3', value: 'option_3' },
          ]"
          :key="value"
          :of="specialForm"
          :path="['checkbox', 'array']"
          v-slot="field"
        >
          <Checkbox
            class="!p-0"
            v-model="field.input"
            :props="field.props"
            :label="label"
            :value="value"
            :input="field.input?.includes(value) ?? false"
            :errors="field.errors"
          />
        </Field>
      </div>

      <Field :of="specialForm" :path="['checkbox', 'boolean']" v-slot="field">
        <Checkbox
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          label="Checkbox boolean"
        />
      </Field>

      <label
        class="block px-8 font-medium md:text-lg lg:mb-5 lg:px-10 lg:text-xl"
      >
        Radio group
      </label>

      <div
        class="mx-8 flex flex-wrap gap-6 rounded-2xl border-2 border-slate-200 p-6 lg:gap-10 lg:p-10 dark:border-slate-800"
      >
        <Field
          v-for="{ label, value } in [
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
            { label: 'Option 3', value: 'option_3' },
          ]"
          :key="value"
          :of="specialForm"
          :path="['radio']"
          v-slot="field"
        >
          <Radio
            class="!p-0"
            v-model="field.input"
            :props="field.props"
            :label="label"
            :value="value"
            :errors="field.errors"
          />
        </Field>
      </div>

      <Field :of="specialForm" :path="['select', 'array']" v-slot="field">
        <Select
          v-model="field.input"
          :props="field.props"
          :options="[
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
            { label: 'Option 3', value: 'option_3' },
          ]"
          :errors="field.errors"
          label="Select array"
          multiple
        />
      </Field>

      <Field :of="specialForm" :path="['select', 'string']" v-slot="field">
        <Select
          v-model="field.input"
          :props="field.props"
          :options="[
            { label: 'Option 1', value: 'option_1' },
            { label: 'Option 2', value: 'option_2' },
            { label: 'Option 3', value: 'option_3' },
          ]"
          :errors="field.errors"
          label="Select string"
        />
      </Field>

      <Field :of="specialForm" :path="['file', 'list']" v-slot="field">
        <FileInput
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          label="File list"
          multiple
        />
      </Field>

      <Field :of="specialForm" :path="['file', 'item']" v-slot="field">
        <FileInput
          v-model="field.input"
          :props="field.props"
          :errors="field.errors"
          label="File item"
        />
      </Field>
    </div>
    <FormFooter :of="specialForm" />
  </Form>
</template>
