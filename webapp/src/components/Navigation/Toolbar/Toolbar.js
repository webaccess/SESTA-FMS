import React from "react";

import styles from "./Toolbar.module.css";
import Logo from "../../Logo/Logo";
import DrawerToggle from "../SideDrawer/DrawerToggle/DrawerToggle";
import { AppBar, Hidden } from "@material-ui/core";
import ToolbarItem from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import AccountCircle from "@material-ui/icons/AccountCircle";
import auth from "../../Auth/Auth";
import { withRouter } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: "none"
  },
  flexGrow: {
    flexGrow: 1
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  }
}));

function Toolbar(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = "primary-search-account-menu";

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
    <div>
      <AppBar className={classes.root}>
        <ToolbarItem>
          <Logo />
          <div className={classes.flexGrow} />
          <Hidden mdDown>
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
          </Hidden>
          <Hidden lgUp>
            <DrawerToggle clicked={props.drawerToggleClicked} />
          </Hidden>
        </ToolbarItem>
      </AppBar>
      {renderMenu}
    </div>
  );
}

export default withRouter(Toolbar);
