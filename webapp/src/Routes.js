import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Aux from "./hoc/Auxiliary/Auxiliary.js";
import PrivateRoute from "./hoc/PrivateRoute/PrivateRoute";
import AuthRoute from "./hoc/AuthRoute/AuthRoute";
import Dashboard from "./containers/Dashboard/Dashboard";
import NotFoundPage from "./containers/NotFoundPage/NotFoundPage";
import AuthPage from "./containers/AuthPage/AuthPage";
import Villages from "./containers/Villages/Villages";
import Shgs from "./containers/Shgs/Shgs";
import Pgs from "./containers/Pgs/Pgs";
import PgPage from "./containers/Pgs/PgPage";
import states from "./containers/States/States";
import StatesPage from "./containers/States/StatePage";
import VillagePage from "./containers/Villages/VillagePage";
import VoPage from "./containers/Vo/VoPage";
import Vos from "./containers/Vo/Vos";
import Account from "./containers/Account/Account";
import ShgPage from "./containers/Shgs/ShgPage";
import FpoPage from "./containers/Fpos/FpoPage";
import Fpos from "./containers/Fpos/Fpos";
import countries from "./containers/Countries/Countries";
import CountryPage from "./containers/Countries/CountryPage";
import Activity from "./containers/Activities/Activity";
import ActivityPage from "./containers/Activities/ActivityPage";
import Members from "./containers/Members/Members";
import MembersPage from "./containers/Members/MembersPage";
import Loans from "./containers/Loans/Loans";
import LoansPage from "./containers/Loans/LoansPage";
import LoanApprovalPage from "./containers/Loans/LoanApprovalPage";
import Loanpurposes from "./containers/Loanpurpose/Loanpurposes";
import LoanpurposePage from "./containers/Loanpurpose/LoanpurposePage";

function Routes() {
  return (
    <Aux>
      <Router>
        <div>
          <Switch>
            <PrivateRoute path="/" component={Dashboard} exact />
            <PrivateRoute path="/villages/add" component={VillagePage} exact />
            <PrivateRoute
              path="/villages/edit/:id"
              component={VillagePage}
              exact
            />
            <PrivateRoute
              path="/village-organizations/add"
              component={VoPage}
              exact
            />
            <PrivateRoute
              path="/village-organizations/edit/:id"
              component={VoPage}
              exact
            />
            <PrivateRoute path="/activities" component={Activity} exact />
            <PrivateRoute
              path="/activities/add"
              component={ActivityPage}
              exact
            />
            <PrivateRoute
              path="/activities/edit/:id"
              component={ActivityPage}
              exact
            />
            <PrivateRoute path="/village-organizations" component={Vos} exact />
            <PrivateRoute path="/villages" component={Villages} exact />
            <PrivateRoute path="/shgs/add" component={ShgPage} exact />
            <PrivateRoute path="/shgs/edit/:id" component={ShgPage} exact />
            <PrivateRoute path="/shgs" component={Shgs} exact />
            <PrivateRoute path="/pgs" component={Pgs} exact />
            <PrivateRoute path="/pgs/add" component={PgPage} exact />
            <PrivateRoute path="/pgs/edit/:id" component={PgPage} exact />
            <PrivateRoute path="/states" component={states} exact />
            <PrivateRoute path="/states/add" component={StatesPage} exact />
            <PrivateRoute
              path="/states/edit/:id"
              component={StatesPage}
              exact
            />
            <PrivateRoute path="/fpos" component={Fpos} exact />
            <PrivateRoute path="/fpos/add" component={FpoPage} exact />
            <PrivateRoute path="/fpos/edit/:id" component={FpoPage} exact />
            <PrivateRoute path="/my-account" component={Account} exact />
            <PrivateRoute path="/countries" component={countries} exact />
            <PrivateRoute path="/countries/add" component={CountryPage} exact />
            <PrivateRoute
              path="/countries/edit/:id"
              component={CountryPage}
              exact
            />
            <PrivateRoute path="/members" component={Members} exact />
            <PrivateRoute path="/members/add" component={MembersPage} exact />
            <PrivateRoute
              path="/members/edit/:id"
              component={MembersPage}
              exact
            />
            <PrivateRoute path="/loans" component={Loans} exact />
            <PrivateRoute path="/loans/view/:id" component={LoansPage} exact />
            <PrivateRoute
              path="/loans/approve/:id"
              component={LoanApprovalPage}
              exact
            />
            <PrivateRoute path="/Loanpurposes" component={Loanpurposes} exact />
            <PrivateRoute
              path="/Loanpurpose/add"
              component={LoanpurposePage}
              exact
            />
            <PrivateRoute
              path="/Loanpurpose/edit/:id"
              component={LoanpurposePage}
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
