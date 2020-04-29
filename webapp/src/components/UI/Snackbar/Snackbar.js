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
import { withStyles } from "@material-ui/core/styles";

function Alert(props) {
  return <MuiAlert elevation={6} variant="standard" {...props} />;
}

const isDesktop = window.innerWidth > 500;

export class CustomizedSnackbars extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
  }

  handleClick = () => {
    this.setState({ open: true });
  };
  handleClose = (event) => {
    // if (reason === "clickaway") {
    //   return;
    // }
    this.setState({ open: false });
  };

  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.props.Showbutton ? (
          <Button
            variant="outlined"
            Showbutton={false}
            onClick={this.handleClick}
          >
            {this.props.buttonMessage}
          </Button>
        ) : (
          <p></p>
        )}
        <div className={!isDesktop ? "" : style.Hidden}>
          <Snackbar
            open={this.state.open}
            autoHideDuration={
              this.props.autoHideDuration ? this.props.autoHideDuration : 3000
            }
            onClose={this.handleClose}
          >
            <Alert onClose={this.handleClose} severity={this.props.severity}>
              {this.props.children}
            </Alert>
          </Snackbar>
        </div>
        <div className={isDesktop ? "" : style.Hidden}>
          <Collapse in={this.state.open}>
            <Alert
              severity={this.props.severity}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={this.handleClose}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {this.props.children}
            </Alert>
          </Collapse>
        </div>
      </div>
    );
  }
}

export default CustomizedSnackbars;