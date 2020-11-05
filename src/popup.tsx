import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { PopupRoutes } from './routes';

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
