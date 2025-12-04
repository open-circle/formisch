import clsx from 'clsx';

type InputLabelProps = {
  component?: 'label' | 'legend' | 'div';
  name?: string;
  label?: string;
  required?: boolean;
  margin?: 'none';
};

/**
 * Input label for a form field.
 */
export function InputLabel({
  component,
  name,
  label,
  required,
  margin,
}: InputLabelProps) {
  const Element = component ?? (name ? 'label' : 'div');
  return (
    <>
      {label && (
        <Element
          className={clsx(
            'inline-block font-medium md:text-lg lg:text-xl',
            !margin && 'mb-4 lg:mb-5'
          )}
          htmlFor={name}
        >
          {label}{' '}
          {required && (
            <span className="ml-1 text-red-600 dark:text-red-400">*</span>
          )}
        </Element>
      )}
    </>
  );
}
