import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, useLocation, Route } from "react-router-dom";
import { useHistory } from "react-router-dom";
import Aux from './hoc/Auxiliary/Auxiliary.js';
import PrivateRoute from "./hoc/PrivateRoute/PrivateRoute";
import AuthRoute from "./hoc/AuthRoute/AuthRoute";
import Dashboard from "./containers/Dashboard/Dashboard";
import NotFoundPage from "./containers/NotFoundPage/NotFoundPage";
import Users from "./containers/Users/users.js"
import AuthPage from "./containers/AuthPage/AuthPage";

function Routes() {
  return (
    <Aux>
      <Router>
        <div>
          <Switch>
            <PrivateRoute path="/" component={Dashboard} exact />
            <PrivateRoute path="/Users/add" component={Users} exact />
            <Route path="/404" component={NotFoundPage} />
            <AuthRoute path="/:authType/:id?" component={AuthPage} />
          </Switch>
        </div>
      </Router>
    </Aux>
  );
}

export default Routes;