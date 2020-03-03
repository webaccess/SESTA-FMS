import React, { Component, forwardRef } from "react";
import { withRouter, Link } from "react-router-dom";
import styles from "./NavigationItem.module.css";
import Icon from "@material-ui/core/Icon";
import { ListItem, colors, Button } from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import clsx from "clsx";

function ListItemLink(props) {
  return <ListItem button key={props.text} component="a" {...props} />;
}

const useStyles = theme => ({
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
});
const CustomRouterLink = forwardRef((props, ref) => (
  <div ref={ref} style={{ flexGrow: 1 }}>
    <Link {...props} />
  </div>
));
class NavigationItem extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  render() {
    const { match, location, history, classes } = this.props;
    var isActive = location.pathname === this.props.link;

    return (
      <ListItem
        className={clsx(classes.item, this.props.nested ? styles.nested : "")}
        disableGutters
        key={this.props.text}
        onClick={this.props.clicked}
      >
        <Button
          className={
            isActive ? clsx(classes.button, classes.active) : classes.button
          }
          to={this.props.link}
          component={CustomRouterLink}
        >
          <div className={classes.icon}>
            <Icon>{this.props.icon}</Icon>
          </div>
          {this.props.text}
          {this.props.showopen ? (
            this.props.open ? (
              <ExpandLess />
            ) : (
              <ExpandMore />
            )
          ) : (
            ""
          )}
        </Button>
      </ListItem>
    );
  }
}

export default withRouter(withStyles(useStyles)(NavigationItem));
