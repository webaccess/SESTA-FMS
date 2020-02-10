import React from "react";

import siteLogo from "../../assets/images/logo.png";
import styles from "./Logo.module.css";

const logo = props => {
  return (
    <div className={styles.Logo}>
      <img src={siteLogo} alt="UPSTC-Logo" />
    </div>
  );
};

export default logo;
