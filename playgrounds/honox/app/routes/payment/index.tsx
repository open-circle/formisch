import { createRoute } from 'honox/factory';
import PaymentForm from '../../islands/PaymentForm';

export default createRoute((c) =>
  c.render(<PaymentForm />, { title: 'Payment | HonoX Playground | Formisch' })
);
