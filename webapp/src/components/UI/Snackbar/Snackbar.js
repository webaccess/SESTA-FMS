/**
 * SnackBar
 * Snackbars provide brief messages about app processes.
 * The component is also known as a toast.
severity="error"
severity="warning"
severity="info"
severity="success"

**Sample code for using Snackbar**
  <Snackbar severity="error"> 
    This is a success message!
  </Snackbar>
**/

import React, { useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import style from "./Snackbar.module.css";
import MuiAlert from "@material-ui/lab/Alert";
import { useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import Aux from "../../../hoc/Auxiliary/Auxiliary.js";
import CloseIcon from '@material-ui/icons/Close';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';

export default function CustomizedSnackbars(props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });
  const [showMobileSnackbar, setshowMobileSnackbar] = useState(true);

  const closeMobileSnackbar = () => {
    setshowMobileSnackbar(false);
  };

  const [open, setOpen] = React.useState(true);

  const openDesktopSnackbar = isDesktop ? false : showMobileSnackbar;

  function Alert(props) {
    return <MuiAlert elevation={6} {...props} />;
  }
  const [state, setState] = React.useState({

    vertical: 'top',
    horizontal: 'center',
  });

  const { vertical, horizontal } = state;

  return (
    <Aux>
      <div>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={openDesktopSnackbar}
          autoHideDuration={6000}
          onClose={closeMobileSnackbar}
        >
          <Alert severity={props.severity}>{props.children}</Alert>
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
    </Aux>
  );
}
