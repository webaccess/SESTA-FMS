import React, { Component, useEffect } from "react";

import styles from "./NavigationItems.module.css";
import NavigationItem from "./NavigationItem/NavigationItem";
import auth from "../../Auth/Auth";
import { withRouter } from "react-router-dom";
import List from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";
import Aux from "../../../hoc/Auxiliary/Auxiliary";
import { withStyles } from "@material-ui/core/styles";
import Button from "../../UI/Button/Button";
import axios from "axios";
import { map } from "lodash";
import Icon from "@material-ui/core/Icon";

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
  console.log(isMobile);

  const handleClick = (event, moduleId) => {
    console.log(Boolean(event.currentTarget));
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
    console.log(moduleStatesArr);
  };

  const renderSideMenu = () => {
    let nav = map(modules, (module, key) => {
      console.log(module);

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
                  console.log("submodule==");
                  console.log(submodule);
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

  const renderTopMenu = () => {
    let nav = map(modules, (module, key) => {
      console.log(module);

      if (module.modules.length <= 0) {
        return (
          <div>
            <Button
              variant="contained"
              startIcon={<Icon>{module.icon_class}</Icon>}
              clicked={() => {
                props.history.push(module.url);
              }}
            >
              {module.name}
            </Button>
          </div>
        );
      } else {
        return (
          <div>
            <Button
              aria-controls={`menu_${module.id}`}
              aria-haspopup="true"
              variant="contained"
              startIcon={
                module.icon_class ? <Icon>{module.icon_class}</Icon> : ""
              }
              clicked={e => {
                handleClick(e, module.id);
              }}
            >
              {module.name}
            </Button>
            <StyledMenu
              id={`menu_${module.id}`}
              anchorEl={anchorEl}
              keepMounted
              open={moduleStates[module["id"]].open && isMobile === false}
              onClose={() => handleClose(module.id)}
            >
              {map(module.modules, (submodule, subkey) => {
                console.log("submodule==");
                console.log(submodule);
                return (
                  <StyledMenuItem>
                    <NavigationItem
                      link={submodule.link}
                      text={submodule.name}
                      icon={submodule.icon_class}
                    />
                  </StyledMenuItem>
                );
              })}
            </StyledMenu>
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
          "modules?module_null=true&user_roles.id_in=" +
          userInfo.user_role.id,
        {
          headers: {
            Authorization: "Bearer " + auth.getToken()
          }
        }
      )
      // .then(res => res.json())
      .then(res => {
        let moduleStatesArr = {};
        map(res.data, (module, key) => {
          console.log(module);
          // if(module.modules.length>0){
          if (module.id in moduleStatesArr === false)
            moduleStatesArr[module.id] = {};
          moduleStatesArr[module.id] = { open: false };
          // }
        });
        console.log("moduleStates==");
        console.log(moduleStatesArr);
        setModuleStates(moduleStatesArr);
        setModules(res.data);
      });
  }, []);

  return (
    <Aux>
      <List component="nav" className={styles.MobileOnly}>
        {renderSideMenu()}
        {/* <NavigationItem link="/" text="Dashboard" icon="dashboard" /> */}
        {/* <NavigationItem
          text="Menu1"
          icon="dashboard"
          showopen="true"
          open={open}
          clicked={handleSubMenuOpen}
        />
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <NavigationItem text="Submenu1" icon="dashboard" nested="true" />
          </List>
        </Collapse> */}
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
      </List>

      <div className={styles.DesktopOnly}>{renderTopMenu()}</div>
    </Aux>
  );
  // }
}

export default withRouter(NavigationItems);
