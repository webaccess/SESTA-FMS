import React, { Component } from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AuthPage from "./containers/AuthPage/AuthPage";
import PrivateRoute from "./hoc/PrivateRoute/PrivateRoute";
import AuthRoute from "./hoc/AuthRoute/AuthRoute";
import Dashboard from "./containers/Dashboard/Dashboard";
import NotFoundPage from "./containers/NotFoundPage/NotFoundPage";
import { ThemeProvider } from "@material-ui/styles";
import theme from "./theme";

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Router>
          <div>
            <Switch>
              <PrivateRoute path="/" component={Dashboard} exact />
              <Route path="/404" component={NotFoundPage} />
              <AuthRoute path="/:authType/:id?" component={AuthPage} />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
