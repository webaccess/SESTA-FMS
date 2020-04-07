import React from "react";
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
    "& > * + *": {
      marginTop: theme.spacing(3)
    }
  }
}));

export default function Tags(props) {
  const classes = useStyles();

  return (
    <Autocomplete
      multiple={props.multiple}
      id={props.id}
      options={props.options}
      getOptionLabel={props.getOptionLabel}
      onChange={props.onChange}
      defaultValue={props.defaultValue ? props.defaultValue : []}
      value={props.value ? props.value : []}
      filterSelectedOptions
      renderInput={props.renderInput}
    />
  );
}
