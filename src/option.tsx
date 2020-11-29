import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router, Switch, Route } from "react-router-dom";
import { OptionRoutes } from './routes';

ReactDOM.render(
  <Router>
    <Switch>
      {OptionRoutes.map((route, i) => {
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
  </Router>,
  document.getElementById('root')
);
