import React from "react";
import { TextField } from "@material-ui/core";

const input = props => {
  const { autoFocus, variant, error, ...rest } = props;

  return (
    <TextField
      autoFocus={autoFocus ? autoFocus : false}
      variant={variant ? variant : "standard"}
      error={error ? error : false}
      {...rest}
    />
  );
};

export default input;
