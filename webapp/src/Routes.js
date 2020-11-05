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
import LoansApplyPage from "./containers/Loans/LoansApplyPage";
import LoanApprovalPage from "./containers/Loans/LoanApprovalPage";
import Loanpurposes from "./containers/Loanpurpose/Loanpurposes";
import LoanpurposePage from "./containers/Loanpurpose/LoanpurposePage";
import LoanTasksPage from "./containers/Loans/LoanTasksPage";
import LoanEditTask from "./containers/Loans/LoanEditTask";
import AddLoanTask from "./containers/Loans/AddLoanTask";
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
import LoanReport from "./containers/Reports/LoanReport.js";

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
              exact
            />
            <PrivateRoute
              path="/fpo/loans/view/more"
              component={DashboardFPOViewMoreDetails}
              exact
            />
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
            <PrivateRoute
              path="/activitytypes"
              component={Activitytypes}
              exact
            />
            <PrivateRoute
              path="/activitytypes/add"
              component={ActivitytypePage}
              exact
            />
            <PrivateRoute
              path="/activitytypes/edit/:id"
              component={ActivitytypePage}
              exact
            />
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
            <PrivateRoute
              path="/loans/apply/:id"
              component={LoansApplyPage}
              exact
            />
            <PrivateRoute
              path="/loan/update/:id"
              component={LoanTasksPage}
              exact
            />
            <PrivateRoute path="/loan/task/add" component={AddLoanTask} exact />
            <PrivateRoute
              path="/loan/task/edit/:id"
              component={LoanEditTask}
              exact
            />
            <PrivateRoute path="/loans/emi/:id" component={LoanEmiPage} exact />
            <PrivateRoute
              path="/loan/emi/edit/:id"
              component={LoanEditEmiPage}
              exact
            />
            <PrivateRoute
              path="/loan/emi/view/:id"
              component={LoanEmiViewPage}
              exact
            />
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
            <PrivateRoute path="/users" component={Users} exact />
            <PrivateRoute path="/users/add" component={UsersPage} exact />
            <PrivateRoute path="/users/edit/:id" component={UsersPage} exact />
            <PrivateRoute path="/reports" component={Reports} exact />
            <PrivateRoute
              path="/summary-report"
              component={CSPSummaryReport}
              exact
            />
            <PrivateRoute
              path="/activity-report"
              component={CSPActivityReport}
              exact
            />
            <PrivateRoute path="/loan-report" component={LoanReport} exact />
            <Route path="/404" component={NotFoundPage} />
            <AuthRoute path="/:authType/:id?" component={AuthPage} />
          </Switch>
        </div>
      </Router>
    </Aux>
  );
}

export default Routes;
