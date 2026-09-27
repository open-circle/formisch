import { createRoute } from 'honox/factory';
import NestedForm from '../../islands/NestedForm';

export default createRoute((c) =>
  c.render(<NestedForm />, { title: 'Nested | HonoX Playground | Formisch' })
);
