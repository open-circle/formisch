import { createRoute } from 'honox/factory';
import TodosForm from '../../islands/TodosForm';

export default createRoute((c) =>
  c.render(<TodosForm />, { title: 'Todos | HonoX Playground | Formisch' })
);
