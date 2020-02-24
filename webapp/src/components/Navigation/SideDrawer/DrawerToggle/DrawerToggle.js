import React from "react";

import styles from "./DrawerToggle.module.css";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "@material-ui/core/IconButton";

const drawerToggle = props => {
  return (
    // <div onClick={props.clicked} className={styles.DrawerToggle}>
    //   <div></div>
    //   <div></div>
    //   <div></div>
    // </div>
    <IconButton
      edge="start"
      className={styles.DrawerToggle}
      color="inherit"
      aria-label="open drawer"
      onClick={props.clicked}
    >
      <MenuIcon />
    </IconButton>
  );
};

export default drawerToggle;
