import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Aux from "./hoc/Auxiliary/Auxiliary.js";
import PrivateRoute from "./hoc/PrivateRoute/PrivateRoute";
import AuthRoute from "./hoc/AuthRoute/AuthRoute";
import Dashboard from "./containers/Dashboard/Dashboard";
import NotFoundPage from "./containers/NotFoundPage/NotFoundPage";
import AuthPage from "./containers/AuthPage/AuthPage";
import Villages from "./containers/Villages/Villages";
import villagePage from "./containers/Villages/VillagePage";
import Shgs from "./containers/Shgs/Shgs";
import Account from "./containers/Account/Account";

function Routes() {
  return (
    <Aux>
      <Router>
        <div>
          <Switch>
            <PrivateRoute path="/" component={Dashboard} exact />
            <PrivateRoute path="/villages/add" component={villagePage} exact />
            <PrivateRoute
              path="/villages/edit/:id"
              component={villagePage}
              exact
            />
            <PrivateRoute path="/villages" component={Villages} exact />
            <PrivateRoute path="/Shgs" component={Shgs} exact />

            <PrivateRoute path="/my-account" component={Account} exact />
            <Route path="/404" component={NotFoundPage} />
            <AuthRoute path="/:authType/:id?" component={AuthPage} />
          </Switch>
        </div>
      </Router>
    </Aux>
  );
}

export default Routes;
