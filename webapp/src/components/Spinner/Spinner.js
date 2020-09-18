import React from "react";
import { CircularProgress, Typography } from "@material-ui/core";
import styles from "./Spinner.module.css";

const Spinner = (props) => {
  return (
    <div className={styles.CenterItems}>
      <div className={styles.LoadingPadding}>
        <CircularProgress className={styles.progressLoader} />
      </div>
      <Typography variant="h5">Loading...</Typography>
    </div>
  );
};

export default Spinner;
