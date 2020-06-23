import React from "react";
import Autocomplete from "@material-ui/lab/Autocomplete";

export default function Tags(props) {
  return (
    <Autocomplete
      multiple={props.multiple}
      id={props.id}
      name={props.name}
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
