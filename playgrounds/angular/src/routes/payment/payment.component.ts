import { Component, computed } from '@angular/core';
import {
  FormischField,
  FormischForm,
  getInput,
  injectForm,
} from '@formisch/angular';
import * as v from 'valibot';
import { FormFooterComponent } from '../../components/form-footer.component.ts';
import { FormHeaderComponent } from '../../components/form-header.component.ts';
import { SelectComponent } from '../../components/select.component.ts';
import { TextInputComponent } from '../../components/text-input.component.ts';

const PaymentSchema = v.intersect([
  v.object({
    owner: v.pipe(
      v.string('Please enter your name.'),
      v.nonEmpty('Please enter your name.')
    ),
  }),
  v.variant(
    'type',
    [
      v.object({
        type: v.literal('card'),
        card: v.object({
          number: v.pipe(
            v.string('Please enter your card number.'),
            v.nonEmpty('Please enter your card number.'),
            v.creditCard('The card number is badly formatted.')
          ),
          expiration: v.pipe(
            v.string('Please enter the expiration date.'),
            v.nonEmpty('Please enter the expiration date.'),
            v.regex(
              /^(?:0[1-9]|1[0-2])\/(?:2[5-9]|3[0-9])$/,
              'The expiration date is badly formatted.'
            )
          ),
        }),
      }),
      v.object({
        type: v.literal('paypal'),
        paypal: v.object({
          email: v.pipe(
            v.string('Please enter your PayPal email.'),
            v.nonEmpty('Please enter your PayPal email.'),
            v.email('The email address is badly formatted.')
          ),
        }),
      }),
    ],
    'Please select the payment type.'
  ),
]);

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    FormischForm,
    FormischField,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
    SelectComponent,
  ],
  template: `
    <formisch-form
      [of]="form"
      [submitFn]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [of]="form" heading="Payment form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <formisch-field [of]="form" [path]="['owner']">
          <ng-template let-field>
            <app-text-input
              [name]="field.props.name"
              [value]="field.input()"
              [errors]="field.errors()"
              type="text"
              label="Owner"
              placeholder="John Doe"
              [required]="true"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['type']">
          <ng-template let-field>
            <app-select
              [name]="field.props.name"
              [input]="field.input()"
              [options]="paymentTypes"
              [errors]="field.errors()"
              label="Type"
              placeholder="Card or PayPal?"
              [required]="true"
              [fieldRef]="field.props.ref"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldInput)="field.props.onInput($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        @if (paymentType() === 'card') {
          <formisch-field [of]="form" [path]="['card', 'number']">
            <ng-template let-field>
              <app-text-input
                [name]="field.props.name"
                [value]="field.input()"
                [errors]="field.errors()"
                type="text"
                label="Number"
                placeholder="1234 1234 1234 1234"
                [required]="true"
                [fieldRef]="field.props.ref"
                (fieldFocus)="field.props.onFocus($event)"
                (fieldInput)="field.props.onInput($event)"
                (fieldChange)="field.props.onChange($event)"
                (fieldBlur)="field.props.onBlur($event)"
              />
            </ng-template>
          </formisch-field>

          <formisch-field [of]="form" [path]="['card', 'expiration']">
            <ng-template let-field>
              <app-text-input
                [name]="field.props.name"
                [value]="field.input()"
                [errors]="field.errors()"
                type="text"
                label="Expiration"
                placeholder="MM/YY"
                [required]="true"
                [fieldRef]="field.props.ref"
                (fieldFocus)="field.props.onFocus($event)"
                (fieldInput)="field.props.onInput($event)"
                (fieldChange)="field.props.onChange($event)"
                (fieldBlur)="field.props.onBlur($event)"
              />
            </ng-template>
          </formisch-field>
        }

        @if (paymentType() === 'paypal') {
          <formisch-field [of]="form" [path]="['paypal', 'email']">
            <ng-template let-field>
              <app-text-input
                [name]="field.props.name"
                [value]="field.input()"
                [errors]="field.errors()"
                type="email"
                label="Email"
                placeholder="example@email.com"
                [required]="true"
                [fieldRef]="field.props.ref"
                (fieldFocus)="field.props.onFocus($event)"
                (fieldInput)="field.props.onInput($event)"
                (fieldChange)="field.props.onChange($event)"
                (fieldBlur)="field.props.onBlur($event)"
              />
            </ng-template>
          </formisch-field>
        }
      </div>

      <app-form-footer [of]="form" />
    </formisch-form>
  `,
})
export class PaymentComponent {
  readonly form = injectForm({ schema: PaymentSchema });

  readonly paymentTypes = [
    { value: 'card', label: 'Card' },
    { value: 'paypal', label: 'PayPal' },
  ];

  readonly paymentType = computed(() =>
    getInput(this.form, { path: ['type'] })
  );

  readonly handleSubmit = (output: v.InferOutput<typeof PaymentSchema>) => {
    console.log(output);
  };
}
