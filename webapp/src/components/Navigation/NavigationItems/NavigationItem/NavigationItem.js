import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import styles from "./NavigationItem.module.css";
import Icon from "@material-ui/core/Icon";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { BrowserRouter as Router, Switch, useLocation } from "react-router-dom";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import PropTypes from "prop-types";

function ListItemLink(props) {
  return <ListItem button key={props.text} component="a" {...props} />;
}

class NavigationItem extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  render() {
    const { match, location, history } = this.props;
    var isActive = location.pathname === this.props.link;
    return (
      <ListItemLink
        href={this.props.link}
        onClick={this.props.clicked}
        selected={isActive}
        className={this.props.nested ? styles.nested : ""}
      >
        <ListItemIcon>
          <Icon>{this.props.icon}</Icon>
        </ListItemIcon>

        <ListItemText primary={this.props.text} />
        {this.props.showopen ? (
          this.props.open ? (
            <ExpandLess />
          ) : (
            <ExpandMore />
          )
        ) : (
          ""
        )}
      </ListItemLink>
      // <li className={styles.NavigationItem}>
      //   <a href={props.link} className={props.active ? styles.active : null} onClick={props.clicked}>
      //     {props.children}
      //   </a>
      // </li>
    );
  }
}

export default withRouter(NavigationItem);
