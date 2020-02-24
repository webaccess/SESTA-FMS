import React from "react";

import styles from "./Toolbar.module.css";
import Logo from "../../Logo/Logo";
import NavigationItems from "../NavigationItems/NavigationItems";
import DrawerToggle from "../SideDrawer/DrawerToggle/DrawerToggle";
import { fade, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import ToolbarItem from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputBase from "@material-ui/core/InputBase";
import Badge from "@material-ui/core/Badge";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import AccountCircle from "@material-ui/icons/AccountCircle";
import MailIcon from "@material-ui/icons/Mail";
import NotificationsIcon from "@material-ui/icons/Notifications";
import MoreIcon from "@material-ui/icons/MoreVert";
import Grid from "@material-ui/core/Grid";
import auth from "../../Auth/Auth";
import { withRouter } from "react-router-dom";

function Toolbar(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  // const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  // const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget);
    console.log("anchorEl==" + anchorEl);
  };

  // handleMobileMenuClose = () => {
  //   setMobileMoreAnchorEl(null);
  // };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // handleMobileMenuClose();
  };

  // handleMobileMenuOpen = event => {
  //   setMobileMoreAnchorEl(event.currentTarget);
  // };

  const menuId = "primary-search-account-menu";

  // render() {
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem
        onClick={() => {
          props.history.push("/my-account");
        }}
      >
        My account
      </MenuItem>
      <MenuItem
        onClick={() => {
          auth.clearAppStorage();
          props.history.push("/login");
        }}
      >
        Logout
      </MenuItem>
    </Menu>
  );
  return (
    <div className={styles.grow}>
      <AppBar
        position="fixed"
        style={{ height: "56px", justifyContent: "center" }}
      >
        <ToolbarItem>
          <DrawerToggle clicked={props.drawerToggleClicked} />
          <div className={styles.Logo} style={{ display: "flex" }}>
            <Logo />
          </div>
          <div className={styles.grow} style={{ flexGrow: 1 }} />
          <div className={styles.DesktopOnly}>
            <NavigationItems />
            {/* <IconButton aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="secondary">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton aria-label="show 17 new notifications" color="inherit">
              <Badge badgeContent={17} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <AccountCircle />
            </IconButton>
          </div>
        </ToolbarItem>
      </AppBar>
      {renderMenu}
    </div>
  );
}

export default withRouter(Toolbar);
