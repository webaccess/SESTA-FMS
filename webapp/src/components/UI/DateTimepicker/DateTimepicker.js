import "date-fns";
import React from "react";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, DateTimePicker } from "@material-ui/pickers";

const DateTimepicker = ({ ...props }) => {
  const [clearedDate, handleClearedDateChange] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState();

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <DateTimePicker
        clearable
        label={props.label}
        error={props.error ? props.error : false}
        helperText={props.helperText ? props.helperText : null}
        inputVariant="outlined"
        value={props.value ? props.value : clearedDate}
        onChange={props.onChange}
      />
    </MuiPickersUtilsProvider>
  );
};
DateTimepicker.propTypes = {
  classes: PropTypes.object.isRequired,
  labelText: PropTypes.node,
  labelProps: PropTypes.object,
  id: PropTypes.string.isRequired,
  control: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["standard", "outlined", "filled"]),
};

export default DateTimepicker;
