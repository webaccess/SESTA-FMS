import React from "react";
import {Button} from '@material-ui/core';
import styles from "./Button.module.css";

const button = props => (
  <Button variant={props.variant?props.variant:'contained'} color={props.color?props.color:'primary'} type={props.type?props.type:'button'} size={props.size?props.size:'medium'} onClick={props.clicked}>
  {props.children}
  </Button>
);

export default button;
