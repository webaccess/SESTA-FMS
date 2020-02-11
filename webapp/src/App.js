import React, {Component} from "react";

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AuthPage from './containers/AuthPage/AuthPage';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AuthRoute from './components/AuthRoute/AuthRoute';
import Dashboard from './containers/Dashboard/Dashboard';
import NotFoundPage from './containers/NotFoundPage/NotFoundPage';

class App extends Component {

    render() {
      return (
        <Router>
          <div>
            <Switch>           
              <PrivateRoute path="/" component={Dashboard} exact />
              <Route path="/404" component={NotFoundPage} />
              <AuthRoute path="/:authType/:id?" component={AuthPage} />
            </Switch>
          </div>
        </Router>
      );
    }
  }

export default App;
