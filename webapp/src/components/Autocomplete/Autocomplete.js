/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Input from "../UI/Input/Input.js";

const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
    '& > * + *': {
      marginTop: theme.spacing(3),
    },
  },
}));

export default function Tags(props) {
  console.log("testttt",props.value)
  const classes = useStyles();
  return (
      <Autocomplete
        multiple={props.multiple}
        id={props.id}
        options={props.options}
        getOptionLabel={props.getOptionLabel}
        onChange={props.onChange}
        // defaultValue={[top100Films[13]]}
        filterSelectedOptions
        renderInput={params => (
          <Input
            {...params}
            variant={props.variant}
            label={props.label}
            placeholder={props.placeholder}
            name={props.name}
            error={props.error}
            helperText={props.helperText}
          />
        )}
      />
  );
}