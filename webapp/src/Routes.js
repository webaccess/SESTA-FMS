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
import LoanUpdateTaskPage from "./containers/Loans/LoanUpdateTaskPage";
import LoanEditTask from "./containers/Loans/LoanEditTask";
import ActivitytypePage from "./containers/Activitytypes/ActivitytypePage";
import Activitytypes from "./containers/Activitytypes/Activitytypes";
import LoanEmiPage from "./containers/Loans/LoanEmiPage";
import LoanEditEmiPage from "./containers/Loans/LoanEditEmiPage";
import Users from "./containers/Users/Users";
import UsersPage from "./containers/Users/UsersPage";
import LoanEmiViewPage from "./containers/Loans/LoanEmiViewPage";
import DashboardViewMoreDetailsCSP from "./containers/Dashboard/DashboardViewMoreDetailsCSP";
import DashboardCSP from "./containers/Dashboard/DashboardCSP";
import DashboardFPOViewMoreDetails from "./containers/Dashboard/DashboardFPOViewMoreDetails";
import Reports from "./containers/Reports/Reports";
import CSPSummaryReport from "./containers/Reports/CSPSummaryReport";
import CSPActivityReport from "./containers/Reports/CSPActivityReport.js";
import Layout from "./hoc/Layout/Layout";

function Routes() {
  return (
    <Aux>
      <Router>
        <div>
          <Switch>
            <PrivateRoute path="/" component={Dashboard} exact />
            <PrivateRoute path="/" component={DashboardCSP} exact />
            <PrivateRoute
              path="/view/more"
              component={DashboardViewMoreDetailsCSP}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/fpo/loans/view/more"
              component={DashboardFPOViewMoreDetails}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/villages/add"
              component={VillagePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/villages/edit/:id"
              component={VillagePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/village-organizations/add"
              component={VoPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/village-organizations/edit/:id"
              component={VoPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activities"
              component={Activity}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activities/add"
              layout={Layout}
              component={ActivityPage}
              exact
            />
            <PrivateRoute
              path="/activities/edit/:id"
              component={ActivityPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/village-organizations"
              component={Vos}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/villages"
              component={Villages}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/shgs/add"
              component={ShgPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/shgs/edit/:id"
              component={ShgPage}
              layout={Layout}
              exact
            />
            <PrivateRoute path="/shgs" component={Shgs} layout={Layout} exact />
            <PrivateRoute path="/pgs" component={Pgs} layout={Layout} exact />
            <PrivateRoute
              path="/pgs/add"
              component={PgPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/pgs/edit/:id"
              component={PgPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/states"
              component={states}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/states/add"
              component={StatesPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/states/edit/:id"
              component={StatesPage}
              layout={Layout}
              exact
            />
            <PrivateRoute path="/fpos" component={Fpos} layout={Layout} exact />
            <PrivateRoute
              path="/fpos/add"
              component={FpoPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/fpos/edit/:id"
              component={FpoPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activitytypes"
              component={Activitytypes}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activitytypes/add"
              component={ActivitytypePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activitytypes/edit/:id"
              component={ActivitytypePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/my-account"
              component={Account}
              layout={Layout}
              xact
            />
            <PrivateRoute
              path="/countries"
              component={countries}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/countries/add"
              component={CountryPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/countries/edit/:id"
              component={CountryPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/members"
              component={Members}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/members/add"
              component={MembersPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/members/edit/:id"
              component={MembersPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loans"
              component={Loans}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loans/apply/:id"
              component={LoansPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loan/update/:id"
              component={LoanUpdateTaskPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loan/task/edit/:id"
              component={LoanEditTask}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loans/emi/:id"
              component={LoanEmiPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loan/emi/edit/:id"
              component={LoanEditEmiPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loan/emi/view/:id"
              component={LoanEmiViewPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/loans/approve/:id"
              component={LoanApprovalPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/Loanpurposes"
              component={Loanpurposes}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/Loanpurpose/add"
              component={LoanpurposePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/Loanpurpose/edit/:id"
              component={LoanpurposePage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/users"
              component={Users}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/users/add"
              component={UsersPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/users/edit/:id"
              component={UsersPage}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/reports"
              component={Reports}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/summary-report"
              component={CSPSummaryReport}
              layout={Layout}
              exact
            />
            <PrivateRoute
              path="/activity-report"
              component={CSPActivityReport}
              layout={Layout}
              exact
            />
            <Route path="/404" component={NotFoundPage} />
            <AuthRoute
              path="/:authType/:id?"
              component={AuthPage}
              layout={Layout}
            />
          </Switch>
        </div>
      </Router>
    </Aux>
  );
}

export default Routes;
