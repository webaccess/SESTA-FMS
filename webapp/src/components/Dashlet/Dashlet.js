import React from "react";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
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
    <div className={props.container == "listing" ? classes.pad4 : classes.pad3}>
      {props.children}
    </div>
  );
};

export default Dashlet;
