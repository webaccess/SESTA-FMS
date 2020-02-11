import React from "react";

import styles from "./NavigationItems.module.css";
import NavigationItem from "./NavigationItem/NavigationItem";
import auth from '../../Auth/Auth';
import { withRouter} from 'react-router-dom';

const navigationItems = props => {
  return (
    <ul className={styles.NavigationItems}>
      <NavigationItem link="/" active>
        Dashboard
      </NavigationItem>
      <NavigationItem clicked={() => {
                        auth.clearAppStorage();
                        props.history.push('/login');
                    }}>Logout</NavigationItem>
    </ul>
  );
};

export default withRouter(navigationItems);
