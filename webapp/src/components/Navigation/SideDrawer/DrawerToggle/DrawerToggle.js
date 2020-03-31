import React from "react";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/styles";
const useStyles = makeStyles(theme => ({
  hamBtn: {
    backgroundColor: "#028941",
    "&:hover": {
      backgroundColor: "#026430"
    },
    "&:active": {
      backgroundColor: "#03b053"
    }
  }
}));
function DrawerToggle(props) {
  const classes = useStyles();
  return (
    <IconButton
      className={classes.hamBtn}
      edge="start"
      color="inherit"
      aria-label="open drawer"
      onClick={props.clicked}
    >
      <MenuIcon />
    </IconButton>
  );
}

export default DrawerToggle;
