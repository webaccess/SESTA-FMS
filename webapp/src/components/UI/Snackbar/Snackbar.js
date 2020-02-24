/**
 * SnackBar
 * Snackbars provide brief messages about app processes.
 * The component is also known as a toast.


**Sample code for using Snackbar**


  function Alert(props) {
    return <MuiAlert elevation={6}  {...props} />;
  }
  const [open, setOpen] = React.useState(true);

  {OPTIONAL}  const handleClick = () => {
                setOpen(true);
              };

  const handleClose = () => {
    setOpen(false);
  };
  
  <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
    <Alert severity="error" >
      This is a success message!
    </Alert>
  </Snackbar>

  <div className={styles.Snackbardesktop}>
    <Alert style={{ width: '600px' }} severity="error" >
      This is a success message!
    </Alert>


 CSS for Desktop mode Snackbar !!!IMPORTANT
@media (max-width: 500px) {
  .Snackbardesktop {
    display: none;
    width: 500px;
  }
}

**/

import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import style from './Snackbar.module.css'

export default function CustomizedSnackbars(props) {

  return (
    <div className={style.Snackbar}>
      <Snackbar open={props.open} autoHideDuration={6000} onClose={props.onClose}>
        {props.children}
      </Snackbar>
    </div>
  );
}
