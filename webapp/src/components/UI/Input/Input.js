import React from "react";
import {TextField} from '@material-ui/core';

const input = props => (
    <TextField
    autoFocus={props.autoFocus?props.autoFocus:false}
    className={props.className}
    id={props.id}
    label={props.label}
    name={props.name}
    onChange={props.onChange}
    value={props.value}
    variant={props.variant?props.variant:"standard"}
    error={props.error?props.error:false}
    placeholder={props.placeholder}
    type={props.type}
    helperText={props.helperText}
    inputProps={props.inputProps}
/>
);

export default input;
