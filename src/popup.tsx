import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, MemoryRouter, Switch, Route } from "react-router-dom";
import { PopupRoutes } from './routes';

const Router = DEV ? HashRouter : MemoryRouter;

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        {PopupRoutes.map((route, i) => {
          return (
            <Route
              key={i}
              path={route.path}
              exact={route.exact}
            >
              <route.component />
            </Route>
          );
        })}
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
