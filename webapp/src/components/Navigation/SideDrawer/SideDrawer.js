import React from "react";

import Logo from "../../Logo/Logo";
import NavigationItems from "../NavigationItems/NavigationItems";
import styles from "./SideDrawer.module.css";
import Backdrop from "../../../components/UI/Backdrop/Backdrop";
import Aux from "../../../hoc/Auxiliary/Auxiliary";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";
import IconButton from "@material-ui/core/IconButton";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Divider from "@material-ui/core/Divider";

const sideDrawer = props => {
  let attachedClasses = [styles.SideDrawer, styles.Close];

  if (props.open) {
    attachedClasses = [styles.SideDrawer, styles.Open];
  }

  return (
    <Drawer
      className={attachedClasses.join(" ")}
      open={props.open}
      ModalProps={{ onBackdropClick: props.closed }}
    >
      <div className={attachedClasses.join(" ")}>
        <div className={styles.Logo}>
          <Logo />
        </div>
        <Divider />
        <nav>
          <NavigationItems />
        </nav>
      </div>
    </Drawer>
  );
};

export default sideDrawer;
