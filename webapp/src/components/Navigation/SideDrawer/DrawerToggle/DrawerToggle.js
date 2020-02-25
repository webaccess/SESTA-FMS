import React from "react";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "@material-ui/core/IconButton";

const drawerToggle = props => {
  return (
    <IconButton
      edge="start"
      color="inherit"
      aria-label="open drawer"
      onClick={props.clicked}
    >
      <MenuIcon />
    </IconButton>
  );
};

export default drawerToggle;
