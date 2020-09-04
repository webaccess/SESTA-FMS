import React, { useEffect } from "react";

import NavigationItem from "./NavigationItem/NavigationItem";
import auth from "../../Auth/Auth";
import { withRouter } from "react-router-dom";
import { List, colors, ListSubheader, ListItem } from "@material-ui/core";
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
import QueuePlayNextIcon from "@material-ui/icons/QueuePlayNext";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

const StyledMenu = withStyles({
  paper: {
    border: "1px solid #d3d4d5",
  },
})((props) => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
));

const useStyles = makeStyles((theme) => ({
  root: {},
  item: {
    display: "flex",
    paddingTop: 0,
    paddingBottom: 0,
  },
  button: {
    color: colors.blueGrey[800],
    padding: "10px 8px",
    justifyContent: "flex-start",
    textTransform: "none",
    letterSpacing: 0,
    width: "100%",
    fontWeight: theme.typography.fontWeightMedium,
  },
  icon: {
    color: theme.palette.icon,
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    marginRight: theme.spacing(1),
  },
  active: {
    color: theme.palette.primary.main,
    fontWeight: theme.typography.fontWeightMedium,
    "& $icon": {
      color: theme.palette.primary.main,
    },
  },
  masterMenuSubHeader: {
    color: "#37474f",
    width: "100%",
    padding: "0px 8px",
    fontWeight: "500",
    letterSpacing: "0",
    textTransform: "none",
    justifyContent: "flex-start",
    marginBottom: "0px !important",
  },
  masterMenuSpan: {
    display: "inline-block",
    verticalAlign: "middle",
    padding: "0px 8px",
    marginBottom: "0px !important",
  },
  masterMenuIcon: {
    display: "inline-block",
    verticalAlign: "middle",
    marginBottom: "0px !important",
  },
  masterMenuExtendIcon: {
    display: "inline-block",
    verticalAlign: "middle",
    marginBottom: "0px !important",
  },
}));

const StyledMenuItem = withStyles((theme) => ({
  root: {
    "&:selected": {
      backgroundColor: theme.palette.primary.main,
      "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
        color: theme.palette.common.white,
      },
    },
    "& .MuiListItem-root.Mui-selected, .MuiListItem-root.Mui-selected:hover": {
      background: "none",
    },
  },
}))(MenuItem);

function NavigationItems(props) {
  var mount = false;
  const [open, setOpen] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [moduleStates, setModuleStates] = React.useState({});
  const [modules, setModules] = React.useState([]);
  const isMobile = window.innerWidth < 500;
  const { className, ...rest } = props;
  const theme = useTheme();
  const [openMenu, setOpenMenu] = React.useState(true);
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"), {
    defaultMatches: true,
  });

  const classes = useStyles();

  useEffect(() => {
    if (
      !props.location.pathname.includes("/members") ||
      !props.location.pathname.includes("/activities") ||
      !props.location.pathname.includes("/loans") ||
      !props.location.pathname.includes("/users") ||
      !props.location.pathname.includes("/reports") ||
      !props.location.pathname.includes("/summary-report") ||
      !props.location.pathname.includes("/activity-report") ||
      props.location.pathname !== "/"
    ) {
      if (openMenu !== true) {
        setOpenMenu(true);
      }
    } else {
      setOpenMenu(false);
    }
    if (
      props.location.pathname.includes("/members") ||
      props.location.pathname.includes("/activities") ||
      props.location.pathname.includes("/loans") ||
      props.location.pathname.includes("/users") ||
      props.location.pathname.includes("/reports") ||
      props.location.pathname.includes("/summary-report") ||
      props.location.pathname.includes("/activity-report") ||
      props.location.pathname === "/"
    ) {
      if (openMenu == true) {
        setOpenMenu(false);
      }
    } else {
      setOpenMenu(true);
    }
  }, []);

  const updateMenuItemState = (moduleId) => {
    let moduleStatesArr = { ...moduleStates };
    map(modules, (module, key) => {
      if (module.id === moduleId)
        moduleStatesArr[module.id]["open"] = !moduleStates[module.id]["open"];
    });
    setModuleStates(moduleStatesArr);
  };

  const handleClick = () => {
    setOpenMenu(!openMenu);
  };

  const masterMenu = () => {
    return renderSideMenu1();
    return masterMenu;
  };

  const renderSideMenu1 = () => {
    let masterMenu = [];
    let otherMenu = [];
    let moduleArray = [
      "Fpos",
      "SHGs",
      "Villages",
      "Village Organizations",
      "States",
      "Pgs",
      "Countries",
      "Loan Purpose",
      "Activity Types",
    ];
    let nav1 = map(modules, (module, key) => {
      if (module.modules.length <= 0) {
        if (moduleArray.includes(module.name)) {
          masterMenu.push(
            <Collapse in={openMenu} timeout="auto" unmountOnExit>
              <ListItem>
                <NavigationItem link={module.url} text={module.name} />
              </ListItem>
            </Collapse>
          );
        } else {
          otherMenu.push(
            <NavigationItem
              link={module.url}
              text={module.name}
              icon={module.icon_class}
            />
          );
        }
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
    return (
      <React.Fragment>
        {otherMenu}
        {auth.getUserInfo().role.name !== "CSP (Community Service Provider)" ? (
          <List
            subheader={
              <ListSubheader
                component="div"
                id="nested-list-subheader"
                button
                onClick={handleClick}
                className={clsx(classes.masterMenuSubHeader, className)}
              >
                <QueuePlayNextIcon
                  className={clsx(classes.masterMenuIcon, className)}
                ></QueuePlayNextIcon>
                <span
                  id="master-menu-label"
                  className={clsx(classes.masterMenuSpan, className)}
                >
                  Masters{" "}
                </span>
                {openMenu ? (
                  <ExpandLess
                    className={clsx(classes.masterMenuExtendIcon, className)}
                  />
                ) : (
                  <ExpandMore
                    className={clsx(classes.masterMenuExtendIcon, className)}
                  />
                )}
              </ListSubheader>
            }
          >
            {masterMenu}
          </List>
        ) : (
          ""
        )}
      </React.Fragment>
    );
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
    mount = true;
    const fetchData = async () => {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "modules?_sort=order:ASC&module_null=true&displayNavigation=true&is_active=true&roles.id_in=" +
            userInfo.role.id,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken(),
            },
          }
        )
        .then((res) => {
          let moduleStatesArr = {};
          map(res.data, (module, key) => {
            if (module.id in moduleStatesArr === false)
              moduleStatesArr[module.id] = {};
            moduleStatesArr[module.id] = { open: false };
          });
          if (mount) setModuleStates(moduleStatesArr);
          if (mount) setModules(res.data);
        });
    };
    fetchData();
    return () => {
      mount = false;
    };
  }, []);

  return (
    <Aux>
      <List component="nav" className={clsx(classes.root, className)}>
        {masterMenu()}
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
              link="javascript:void(0);"
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
