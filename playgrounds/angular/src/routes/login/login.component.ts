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
    <form
      [formischForm]="form"
      [formischSubmit]="handleSubmit"
      class="space-y-12 md:space-y-14 lg:space-y-16"
    >
      <app-form-header [form]="form" heading="Login form" />

      <div class="space-y-8 md:space-y-10 lg:space-y-12">
        <ng-container *formischField="['email'] of form; let field">
          <app-text-input
            [field]="field"
            type="email"
            label="Email"
            placeholder="example@email.com"
            [required]="true"
          />
        </ng-container>

        <ng-container *formischField="['password'] of form; let field">
          <app-text-input
            [field]="field"
            type="password"
            label="Password"
            placeholder="********"
            [required]="true"
          />
        </ng-container>
      </div>

      <app-form-footer [form]="form" />
    </form>
  `,
})
export class LoginComponent {
  readonly form = injectForm({ schema: LoginSchema });

  readonly handleSubmit = (output: v.InferOutput<typeof LoginSchema>): void => {
    console.log(output);
  };
}
