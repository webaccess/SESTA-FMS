/**
 *
 * AuthRoute
 * Higher Order Component that blocks navigation when the user is not logged in
 * and redirect the user to login page
 *
 * Wrap your protected routes to secure your container
 */

import React from "react";
import { Redirect, Route } from "react-router-dom";

import auth from "../../components/Auth/Auth";

const authRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      ["login", "reset-password", "forgot-password", "verify-otp"].indexOf(
        props.match.params.authType
      ) > -1 ? (
        auth.getToken() !== null ? (
          <Redirect
            to={{
              pathname: "/",
              state: { from: props.location },
            }}
          />
        ) : (
          <Component {...props} />
        )
      ) : (
        <Redirect to="/404" />
      )
    }
  />
);

export default authRoute;
