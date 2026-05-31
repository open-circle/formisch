import { Component } from '@angular/core';
import { FormischField, FormischForm, injectForm } from '@formisch/angular';
import * as v from 'valibot';
import { FormFooterComponent } from '../../components/form-footer.component.ts';
import { FormHeaderComponent } from '../../components/form-header.component.ts';
import { TextInputComponent } from '../../components/text-input.component.ts';

const LoginSchema = v.object({
  email: v.pipe(
    v.string('Please enter your email.'),
    v.nonEmpty('Please enter your email.'),
    v.email('The email address is badly formatted.')
  ),
  password: v.pipe(
    v.string('Please enter your password.'),
    v.nonEmpty('Please enter your password.'),
    v.minLength(8, 'Your password must have 8 characters or more.')
  ),
});

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormischForm,
    FormischField,
    FormHeaderComponent,
    FormFooterComponent,
    TextInputComponent,
  ],
  template: `
    <formisch-form
      [of]="form"
      [submitFn]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [of]="form" heading="Login form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <formisch-field [of]="form" [path]="['email']">
          <ng-template let-field>
            <app-text-input
              [name]="field.props.name"
              [value]="field.input()"
              [errors]="field.errors()"
              type="email"
              label="Email"
              placeholder="example@email.com"
              [required]="true"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>

        <formisch-field [of]="form" [path]="['password']">
          <ng-template let-field>
            <app-text-input
              [name]="field.props.name"
              [value]="field.input()"
              [errors]="field.errors()"
              type="password"
              label="Password"
              placeholder="********"
              [required]="true"
              (fieldFocus)="field.props.onFocus($event)"
              (fieldChange)="field.props.onChange($event)"
              (fieldBlur)="field.props.onBlur($event)"
            />
          </ng-template>
        </formisch-field>
      </div>

      <app-form-footer [of]="form" />
    </formisch-form>
  `,
})
export class LoginComponent {
  readonly form = injectForm({ schema: LoginSchema });

  readonly handleSubmit = (output: v.InferOutput<typeof LoginSchema>) => {
    console.log(output);
  };
}
