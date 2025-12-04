import { Expandable } from './Expandable';

type InputErrorProps = {
  name: string;
  errors: [string, ...string[]] | null;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
export function InputErrors({ name, errors }: InputErrorProps) {
  return (
    <Expandable expanded={!!errors}>
      <div
        className="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
        id={`${name}-error`}
      >
        {errors?.[0]}
      </div>
    </Expandable>
  );
}
