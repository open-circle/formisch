import { type FormStore, reset } from '@formisch/react';
import { ActionButton } from './ActionButton';

type FormHeaderProps = {
  of: FormStore;
  heading: string;
};

/**
 * Form header with heading and buttons to reset and submit the form.
 */
export function FormHeader({ of: form, heading }: FormHeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 lg:px-10">
      <h1 className="text-2xl text-slate-900 md:text-3xl lg:text-4xl dark:text-slate-200">
        {heading}
      </h1>
      <div className="hidden lg:flex lg:space-x-8">
        <ActionButton
          variant="secondary"
          label="Reset"
          type="button"
          onClick={() => reset(form)}
        />
        <ActionButton variant="primary" label="Submit" type="submit" />
      </div>
    </header>
  );
}
