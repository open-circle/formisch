import { createRoute } from 'honox/factory';
import SpecialForm from '../../islands/SpecialForm';

export default createRoute((c) =>
  c.render(<SpecialForm />, { title: 'Special | HonoX Playground | Formisch' })
);
