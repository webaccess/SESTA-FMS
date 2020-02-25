import React from "react";

import Logo from "../../Logo/Logo";
import NavigationItems from "../NavigationItems/NavigationItems";
import styles from "./SideDrawer.module.css";
import Drawer from "@material-ui/core/Drawer";
import Divider from "@material-ui/core/Divider";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import PropTypes from "prop-types";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 240,
    [theme.breakpoints.up("lg")]: {
      marginTop: 64,
      height: "calc(100% - 64px)"
    }
  },
  root: {
    backgroundColor: theme.palette.white,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: theme.spacing(2)
  },
  divider: {
    margin: theme.spacing(2, 0)
  },
  nav: {
    marginBottom: theme.spacing(2)
  }
}));

const SideDrawer = props => {
  const { className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });

  return (
    <Drawer
      anchor="left"
      classes={{ paper: classes.drawer }}
      onClose={props.closed}
      open={props.open}
      variant={props.variant}
    >
      <div className={clsx(classes.root, className)}>
        {!isDesktop ? (
          <div className={styles.Logo}>
            <Logo />
          </div>
        ) : (
          ""
        )}
        {!isDesktop ? <Divider className={classes.divider} /> : ""}
        <nav>
          <NavigationItems className={classes.nav} />
        </nav>
      </div>
    </Drawer>
  );
};

SideDrawer.propTypes = {
  className: PropTypes.string,
  open: PropTypes.bool.isRequired,
  variant: PropTypes.string.isRequired
};

export default SideDrawer;
