import { render } from 'preact'
import App from '@/app'
import build from '@/core/builder';

console.log({build});

render(<App/>, document.body)
