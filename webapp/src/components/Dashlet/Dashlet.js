import React from "react";
import { makeStyles } from "@material-ui/styles";
import Breadcrumbs from "../Navigation/Breadcrumbs/Breadcrumbs";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#f4f6f8"
  },
  "@global": {
    ".MuiFormControl-root": {
      backgroundColor: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#FFFFFF"
      },
      "&:active": {
        backgroundColor: "#FFFFFF"
      }
    },
    ".MuiInputBase-input": {
      backgroundColor: "#FFFFFF!important"
    }
  },
  pad3: {
    padding: theme.spacing(3)
  },
  pad4: {
    padding: theme.spacing(4)
  }
}));

const Dashlet = props => {
  const classes = useStyles();
  return (
    <div
      className={clsx(
        classes.root,
        props.container === "listing" ? classes.pad3 : classes.pad4
      )}
    >
      {props.breadcrumbs ? (
        <Breadcrumbs modules={props.breadcrumbs}></Breadcrumbs>
      ) : (
        ""
      )}
      {props.children}
    </div>
  );
};

export default Dashlet;
