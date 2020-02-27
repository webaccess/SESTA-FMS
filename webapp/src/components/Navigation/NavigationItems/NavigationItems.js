import React, { Component, useEffect } from "react";

import styles from "./NavigationItems.module.css";
import NavigationItem from "./NavigationItem/NavigationItem";
import auth from "../../Auth/Auth";
import { withRouter } from "react-router-dom";
import { List, colors } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Aux from "../../../hoc/Auxiliary/Auxiliary";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import { map } from "lodash";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useMediaQuery } from "@material-ui/core";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5"
  }
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center"
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center"
    }}
    {...props}
  />
));

const useStyles = makeStyles(theme => ({
  root: {},
  item: {
    display: "flex",
    paddingTop: 0,
    paddingBottom: 0
  },
  button: {
    color: colors.blueGrey[800],
    padding: "10px 8px",
    justifyContent: "flex-start",
    textTransform: "none",
    letterSpacing: 0,
    width: "100%",
    fontWeight: theme.typography.fontWeightMedium
  },
  icon: {
    color: theme.palette.icon,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(1)
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    "& $icon": {
      color: theme.palette.primary.main
    }
  }
}));

const StyledMenuItem = withStyles(theme => ({
  root: {
    "&:selected": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white
      }
    },
    "& .MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover": {
      background: "none"
    }
  }
}))(MenuItem);

function NavigationItems(props) {
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [moduleStates, setModuleStates] = React.useState({});
  const [modules, setModules] = React.useState([]);
  const isMobile = window.innerWidth < 500;
  const { className, ...rest } = props;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true
  });

  const classes = useStyles();

  const handleClick = (event, moduleId) => {
    setAnchorEl(event.currentTarget);
    updateMenuItemState(moduleId);
  };

  const handleClose = moduleId => {
    setAnchorEl(null);
    updateMenuItemState(moduleId);
  };

  const handleSubMenuOpen = () => {
    setOpen(!open);
  };

  const updateMenuItemState = moduleId => {
    let moduleStatesArr = { ...moduleStates };
    map(modules, (module, key) => {
      if (module.id === moduleId)
        moduleStatesArr[module.id]["open"] = !moduleStates[module.id]["open"];
    });
    setModuleStates(moduleStatesArr);
  };

  const renderSideMenu = () => {
    let nav = map(modules, (module, key) => {
      if (module.modules.length <= 0) {
        return (
          <NavigationItem
            link={module.url}
            text={module.name}
            icon={module.icon_class}
          />
        );
      } else {
        return (
          <div>
            <NavigationItem
              text={module.name}
              icon={module.icon_class}
              showopen="true"
              open={moduleStates[module["id"]].open}
              clicked={() => updateMenuItemState(module.id)}
            />
            <Collapse
              in={moduleStates[module["id"]].open}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding>
                {map(module.modules, (submodule, subkey) => {
                  return (
                    <NavigationItem
                      link={submodule.url}
                      text={submodule.name}
                      icon={submodule.icon_class}
                      nested="true"
                    />
                  );
                })}
              </List>
            </Collapse>
          </div>
        );
      }
    });
    return nav;
  };

  useEffect(() => {
    let userInfo = auth.getUserInfo();
    axios
      .get(
        process.env.REACT_APP_SERVER_URL +
          "modules?module_null=true&is_active=true&user_roles.id_in=" +
          userInfo.user_role.id,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken()
          }
        }
      )
      .then(res => {
        let moduleStatesArr = {};
        map(res.data, (module, key) => {
          if (module.id in moduleStatesArr === false)
            moduleStatesArr[module.id] = {};
          moduleStatesArr[module.id] = { open: false };
        });
        setModuleStates(moduleStatesArr);
        setModules(res.data);
      });
  }, []);

  return (
    <Aux>
      <List component="nav" className={clsx(classes.root, className)}>
        {renderSideMenu()}
        {!isDesktop ? (
          <Aux>
            <NavigationItem
              link="/my-account"
              text="My account"
              icon="account_circle"
            />
            <NavigationItem
              clicked={() => {
                auth.clearAppStorage();
                props.history.push("/login");
              }}
              text="Logout"
              icon="exit_to_app"
            />
          </Aux>
        ) : (
          ""
        )}
      </List>
    </Aux>
  );
}

export default withRouter(NavigationItems);
