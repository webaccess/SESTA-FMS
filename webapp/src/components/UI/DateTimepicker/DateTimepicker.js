import 'date-fns';
import React from 'react';
import PropTypes from "prop-types";
import Grid from '@material-ui/core/Grid';
import { withStyles } from "@material-ui/core/styles";
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
  DateTimePicker
} from '@material-ui/pickers';
import style from "./DateTimepicker.module.css";

const DateTimepicker = ({...props}) => {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  
  return (
    
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container>
        <DateTimePicker
          label="DateTimePicker"
          inputVariant="outlined"
          value={props.value ? props.value : selectedDate }
          onChange={props.onChange}
        />
       </Grid>
    </MuiPickersUtilsProvider>
  );
}
     DateTimepicker.propTypes = {
      classes: PropTypes.object.isRequired,
      labelText: PropTypes.node,
      labelProps: PropTypes.object,
      id: PropTypes.string.isRequired,
      control: PropTypes.object,
      onChange: PropTypes.func.isRequired,
      variant: PropTypes.oneOf(['standard', 'outlined', 'filled']),
};
export default DateTimepicker;