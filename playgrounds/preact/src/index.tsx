import { render } from 'preact';
import { LocationProvider, Route, Router, useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';
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
    <LocationProvider>
      <Redirect />
      <Tabs items={['Login', 'Payment', 'Todos', 'Special', 'Nested']} />
      <main>
        <Router>
          <Route path="/login" component={Login} />
          <Route path="/payment" component={Payment} />
          <Route path="/todos" component={Todos} />
          <Route path="/special" component={Special} />
          <Route path="/nested" component={Nested} />
        </Router>
      </main>
    </LocationProvider>
  );
}

function Redirect() {
  const location = useLocation();
  useEffect(() => {
    if (location.path === '/') {
      location.route('/login');
    }
  }, [location]);
  return null;
}

render(<App />, document.getElementById('app')!);
