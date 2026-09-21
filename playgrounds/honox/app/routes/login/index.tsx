import { createRoute } from 'honox/factory';
import LoginForm from '../../islands/LoginForm';

export default createRoute((c) =>
  c.render(<LoginForm />, { title: 'Login | HonoX Playground | Formisch' })
);
