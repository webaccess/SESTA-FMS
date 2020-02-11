/**
 *
 * AuthRoute
 * Higher Order Component that blocks navigation when the user is not logged in
 * and redirect the user to login page
 *
 * Wrap your protected routes to secure your container
 */

import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import auth from '../Auth/Auth';

const authRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      
      // console.log(props.match.params.authType+"==="+(props.match.params.authType in ["login","reset-password","forgot-password"]))
      (["login","reset-password","forgot-password"].indexOf(props.match.params.authType) > -1)?
      ((auth.getToken() !== null) ? (
        <Redirect
          to={{
            pathname: '/',
            state: { from: props.location },
          }}
        />
        
      ) : (
        <Component {...props} />
      )):<Redirect to="/404" />
    }
  />
);

export default authRoute;