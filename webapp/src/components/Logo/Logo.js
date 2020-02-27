import React from "react";

import siteLogo from "../../assets/images/logo.png";
import styles from "./Logo.module.css";

const logo = props => {
  return (
    <div className={styles.Logo}>
      <a href="/">
        <img src={siteLogo} alt="SESTA-Logo" />
      </a>
    </div>
  );
};

export default logo;
