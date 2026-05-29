import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./routes/login/login.component.ts').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./routes/payment/payment.component.ts').then(
        (m) => m.PaymentComponent
      ),
  },
  {
    path: 'todos',
    loadComponent: () =>
      import('./routes/todos/todos.component.ts').then(
        (m) => m.TodosComponent
      ),
  },
  {
    path: 'special',
    loadComponent: () =>
      import('./routes/special/special.component.ts').then(
        (m) => m.SpecialComponent
      ),
  },
  {
    path: 'nested',
    loadComponent: () =>
      import('./routes/nested/nested.component.ts').then(
        (m) => m.NestedComponent
      ),
  },
];
