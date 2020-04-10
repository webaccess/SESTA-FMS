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

const Autotext = props => {
  const { autoFocus, variant, error, ...rest } = props;
  const classes = useStyles();
  return (
    <Autocomplete
      multiple={props.multiple}
      id={props.id}
      options={props.options}
      getOptionLabel={props.getOptionLabel}
      onChange={props.onChange}
      filterSelectedOptions
      value={props.value}
      {...rest}
      renderInput={params => (
        <Input
          {...params}
          helperText={props.error === true ? props.helperText : null}
          error={props.error ? props.error : false}
          variant={props.variant}
          label={props.label}
          placeholder={props.placeholder}
          name={props.name}
        />
      )}
    />
  );
}
export default Autotext;