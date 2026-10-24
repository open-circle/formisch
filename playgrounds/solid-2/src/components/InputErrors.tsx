import { Expandable } from './Expandable';

type InputErrorProps = {
  name: string;
  errors: [string, ...string[]] | null;
};

/**
 * Input error that tells the user what to do to fix the problem.
 */
export function InputErrors(props: InputErrorProps) {
  return (
    <Expandable expanded={!!props.errors}>
      <div
        class="pt-4 text-sm text-red-500 md:text-base lg:pt-5 lg:text-lg dark:text-red-400"
        id={`${props.name}-error`}
      >
        {props.errors?.[0]}
      </div>
    </Expandable>
  );
}
