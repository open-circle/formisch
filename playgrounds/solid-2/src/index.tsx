import { render } from '@solidjs/web';
import App from './app';
import './global.css';

render(() => <App />, document.getElementById('app')!);
