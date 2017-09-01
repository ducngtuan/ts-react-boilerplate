import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';

const renderApp = (Component: any) => <Component />;
ReactDOM.render(renderApp(App), document.getElementById('App'));

if ((module as any).hot) {
  (module as any).hot.accept('./components/App', () => {
    const NextApp = require('./components/App').default;
    ReactDOM.render(renderApp(NextApp), document.getElementById('App'));
  });
}
