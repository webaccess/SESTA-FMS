/**
 * SnackBar
 * Snackbars provide brief messages about app processes.
 * The component is also known as a toast.
severity="error"
severity="warning"
severity="info"
severity="success"

**Sample code for using Snackbar**
  <Snackbar open={BOOLEAN}  severity="error" autoHideDuration={6000} onClose={EVENT}> 
    This is a success message!
  </Snackbar>
**/

import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import style from './Snackbar.module.css'
import MuiAlert from '@material-ui/lab/Alert';
import { useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";
import Aux from "../../../hoc/Auxiliary/Auxiliary.js";

export default function CustomizedSnackbars(props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });
  const [showMobileSnackbar, setshowMobileSnackbar] = useState(true);

  const closeMobileSnackbar = () => {
    setshowMobileSnackbar(false);
  };


  const openDesktopSnackbar = isDesktop ? false : showMobileSnackbar;

  function Alert(props) {
    return <MuiAlert elevation={6}  {...props} />;
  }

  return (
    <Aux>
      <div >
        <Snackbar open={openDesktopSnackbar} autoHideDuration={6000} onClose={closeMobileSnackbar}>
          <Alert severity={props.severity}>
            {props.children}
          </Alert>
        </Snackbar>
      </div>
      <div className={isDesktop ? "" : style.Hidden}>
        <Alert style={{ width: "500px" }} severity={props.severity}>
          {props.children}
        </Alert>
      </div>
    </Aux>
  );
}