import React, { Component, useState } from "react";

import Aux from "../Auxiliary/Auxiliary";
import styles from "./Layout.module.css";
import Toolbar from "../../components/Navigation/Toolbar/Toolbar";
import SideDrawer from "../../components/Navigation/SideDrawer/SideDrawer";
import Dashlet from "../../components/Dashlet/Dashlet";
import { useMediaQuery } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 56,
    height: "100%",
    [theme.breakpoints.up("sm")]: {
      paddingTop: 64
    }
  },
  shiftContent: {
    paddingLeft: 240
  },
  content: {
    height: "100%"
  }
}));

const Layout = props => {
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });

  const [showSideDrawer, setShowSideDrawer] = useState(false);

  const sideDrawerClosedHandler = () => {
    setShowSideDrawer(false);
  };

  const sideDrawerToggleHandler = () => {
    setShowSideDrawer(!showSideDrawer);
  };

  const shouldOpenSidebar = isDesktop ? true : showSideDrawer;

  return (
    <div
      className={clsx({
        [classes.root]: true,
        [classes.shiftContent]: isDesktop
      })}
    >
      <Toolbar drawerToggleClicked={sideDrawerToggleHandler} />
      <SideDrawer
        open={shouldOpenSidebar}
        variant={isDesktop ? "persistent" : "temporary"}
        closed={sideDrawerClosedHandler}
      />
      <main>
        <Dashlet container={props.container} breadcrumbs={props.breadcrumbs}>
          {props.children}
        </Dashlet>
      </main>
    </div>
  );
};

export default Layout;
