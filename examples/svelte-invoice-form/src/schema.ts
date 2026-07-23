import * as v from 'valibot';

/**
 * Input pipe for a monetary amount. The value comes from the input as a string,
 * gets transformed to a number and must not be negative.
 */
const moneyInput = (message: string) =>
  v.pipe(
    v.string(),
    v.nonEmpty(message),
    v.toNumber(),
    v.minValue(0, 'Amount cannot be negative')
  );

/**
 * Input pipe for a positive number (e.g. a quantity). The value comes from the
 * input as a string, gets transformed to a number and must be at least 1.
 */
const positiveNumberInput = (message: string) =>
  v.pipe(
    v.string(),
    v.nonEmpty(message),
    v.toNumber(),
    v.minValue(1, 'Value must be at least 1')
  );

/**
 * The invoice form model. This single schema is the source of truth for the
 * form structure, its validation rules and the typed output produced on submit.
 */
export const InvoiceSchema = v.object({
  invoiceNumber: v.pipe(v.string(), v.nonEmpty('Invoice number is required')),
  issueDate: v.pipe(v.string(), v.nonEmpty('Issue date is required')),
  dueDate: v.pipe(v.string(), v.nonEmpty('Due date is required')),
  client: v.object({
    name: v.pipe(v.string(), v.nonEmpty('Client name is required')),
    email: v.pipe(
      v.string(),
      v.nonEmpty('Client email is required'),
      v.email('Enter a valid email address')
    ),
  }),
  lineItems: v.pipe(
    v.array(
      v.object({
        description: v.pipe(v.string(), v.nonEmpty('Description is required')),
        quantity: positiveNumberInput('Quantity is required'),
        unitPrice: moneyInput('Unit price is required'),
      })
    ),
    v.minLength(1, 'Add at least one invoice item'),
    v.maxLength(10, 'You can only add up to 10 invoice items')
  ),
  taxRate: v.pipe(
    v.string(),
    v.nonEmpty('Tax rate is required'),
    v.toNumber(),
    v.minValue(0, 'Tax cannot be negative'),
    v.maxValue(100, 'Tax cannot be more than 100%')
  ),
  discount: moneyInput('Discount is required'),
  notes: v.optional(v.string()),
});

/**
 * The validated and transformed invoice data produced when the form is
 * submitted. Numeric fields have already been converted from strings to numbers.
 */
export type InvoiceOutput = v.InferOutput<typeof InvoiceSchema>;
