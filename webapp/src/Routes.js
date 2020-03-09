import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  useLocation,
  Route
} from "react-router-dom";
import { useHistory } from "react-router-dom";
import Aux from "./hoc/Auxiliary/Auxiliary.js";
import PrivateRoute from "./hoc/PrivateRoute/PrivateRoute";
import AuthRoute from "./hoc/AuthRoute/AuthRoute";
import Dashboard from "./containers/Dashboard/Dashboard";
import NotFoundPage from "./containers/NotFoundPage/NotFoundPage";
import AuthPage from "./containers/AuthPage/AuthPage";
import Villages from "./containers/Villages/VillagePage";
import VillageList from "./containers/Villages/VillageList";
import villagePage from "./containers/Villages/VillagePage";
import Vopage from "./containers/Vo/Vopage";
import Vos from "./containers/Vo/Vos";

function Routes() {
  return (
    <Aux>
      <Router>
        <div>
          <Switch>
            <PrivateRoute path="/" component={Dashboard} exact />
            <PrivateRoute path="/villages/add" component={villagePage} exact />
            <PrivateRoute path="/villages" component={VillageList} exact />
            <PrivateRoute
              path="/villages/edit/:id"
              component={villagePage}
              exact
            />
            <PrivateRoute
              path="/village-organizations/add"
              component={Vopage}
              exact
            />
            <PrivateRoute path="/village-organizations" component={Vos} exact />
            <PrivateRoute
              path="/village-organizations/edit/:id"
              component={Vopage}
              exact
            />
            <Route path="/404" component={NotFoundPage} />
            <AuthRoute path="/:authType/:id?" component={AuthPage} />
          </Switch>
        </div>
      </Router>
    </Aux>
  );
}

export default Routes;
