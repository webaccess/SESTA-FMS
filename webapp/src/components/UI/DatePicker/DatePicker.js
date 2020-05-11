import 'date-fns';
import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import style from "./DatePicker.module.css";

const DatePicker = ({...props}) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  return (
    
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container>
          <KeyboardDatePicker
            id="date-picker-dialog"
            label="Date"
            format={props.format ? props.format : "MM/dd/yyyy"}
            value={props.value ? props.value : selectedDate }
            inputVariant="outlined"
            onChange={props.onChange}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
       </Grid>
    </MuiPickersUtilsProvider>
  );
}
     DatePicker.propTypes = {
      classes: PropTypes.object.isRequired,
      labelText: PropTypes.node,
      labelProps: PropTypes.object,
      id: PropTypes.string.isRequired,
      control: PropTypes.object,
      onChange: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['standard', 'outlined', 'filled']),
};
export default DatePicker;