import 'date-fns';
import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import style from "./DatePicker.module.css";

const TimnPicker = ({...props}) => {
  
  return (

    <MuiPickersUtilsProvider utils={DateFnsUtils}>
       <Grid container>
          <KeyboardTimePicker
            id="time-picker"
            label="Time"
            inputVariant="outlined"
            value={props.value}
            onChange={props.onChange}
            KeyboardButtonProps={{
              'aria-label': 'change time',
            }}
          />
        </Grid>
    </MuiPickersUtilsProvider>
  );
}
     TimnPicker.propTypes = {
      classes: PropTypes.object.isRequired,
      labelText: PropTypes.node,
      labelProps: PropTypes.object,
      id: PropTypes.string.isRequired,
      control: PropTypes.object,
      onChange: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['standard', 'outlined', 'filled']),
};
export default TimnPicker;