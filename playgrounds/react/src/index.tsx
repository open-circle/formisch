import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Tabs } from './components';
import './global.css';
import { useEventListener } from './hooks';
import Login from './routes/login';
import Nested from './routes/nested';
import Payment from './routes/payment';
import Special from './routes/special';
import Todos from './routes/todos';
import { disableTransitions } from './utils';

export function App() {
  useEventListener('resize', disableTransitions);

  return (
    <BrowserRouter>
      <Tabs items={['Login', 'Payment', 'Todos', 'Special', 'Nested']} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/special" element={<Special />} />
          <Route path="/nested" element={<Nested />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
