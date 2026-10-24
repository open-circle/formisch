import type { FieldElementProps } from '@formisch/solid/v2';
import clsx from 'clsx';
import { omit } from 'solid-js';
import { InputErrors } from './InputErrors';
import { InputLabel } from './InputLabel';

interface SliderProps extends FieldElementProps {
  class?: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  input: string | number | undefined;
  errors: [string, ...string[]] | null;
}

/**
 * Range slider that allows users to select predefined numbers. Various
 * decorations can be displayed in or around the field to communicate the
 * entry requirements.
 */
export function Slider(props: SliderProps) {
  const inputProps = omit(props, 'class', 'input', 'label', 'errors');
  return (
    <div class={clsx('px-8 lg:px-10', props.class)}>
      <InputLabel
        name={props.name}
        label={props.label}
        required={props.required}
      />
      <input
        {...inputProps}
        class="w-full"
        type="range"
        id={props.name}
        value={props.input}
        aria-invalid={props.errors ? 'true' : 'false'}
        aria-errormessage={`${props.name}-error`}
      />
      <InputErrors name={props.name} errors={props.errors} />
    </div>
  );
}
