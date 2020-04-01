// /**
//  * SnackBar
//  * Snackbars provide brief messages about app processes.
//  * The component is also known as a toast.
// severity="error"
// severity="warning"
// severity="info"
// severity="success"

// **Sample code for using Snackbar**
// <Snackbar severity="error">
//   This is a success message!
// </Snackbar>
// **/

import React from "react";
import Button from "@material-ui/core/Button";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import style from "./Snackbar.module.css";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Collapse from "@material-ui/core/Collapse";

function Alert(props) {
  return <MuiAlert elevation={6} variant="standard" {...props} />;
}

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2)
    }
  }
}));

export default function CustomizedSnackbars(props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [showMobileSnackbar, setshowMobileSnackbar] = React.useState(true);
  const openMobileSnackbar = isDesktop ? false : showMobileSnackbar;
  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <div className={classes.root}>
      {props.Showbutton ? (
        <Button variant="outlined" Showbutton={false} onClick={handleClick}>
          {props.buttonMessage}
        </Button>
      ) : (
        <p></p>
      )}
      <div className={!isDesktop ? "" : style.Hidden}>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={props.severity}>
            {props.children}
          </Alert>
        </Snackbar>
      </div>
      <div className={isDesktop ? "" : style.Hidden}>
        <Collapse in={open}>
          <Alert
            severity={props.severity}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {props.children}
          </Alert>
        </Collapse>
      </div>
    </div>
  );
}
