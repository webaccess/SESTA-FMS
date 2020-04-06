/*
Toggle Switch Component
Note: id is required for ToggleSwitch component to function. Name, currentValue, defaultChecked, Small and onChange're optional.
Usage: <Switch id=id onChange={e=>{function(e)}}/>
*/

import React, { useState } from "react";
import PropTypes from "prop-types";
import style from "./Switch.module.css"

function Switch(props) {
  const [state, setState] = useState(false)
  state = {
    checked: this.props.defaultChecked
  };
  const onChange = e => {
    this.setState({
      checked: e.target.checked
    });
    console.log("ddd", e.target)
    if (typeof this.props.onChange === "function") this.props.onChange();
  };
  return (
    <div>
      <input
        type="checkbox"
        name={props.name}
        className="toggle-switch-checkbox"
        id={props.id}
        checked={props.currentValue}
        defaultChecked={props.defaultChecked}
        onChange={onChange}
        disabled={props.disabled}
      />
    </div>
  );
}

Switch.propTypes = {
  id: PropTypes.string.isRequired,
  Text: PropTypes.string.isRequired,
  Name: PropTypes.string,
  onChange: PropTypes.func,
  defaultChecked: PropTypes.bool,
  Small: PropTypes.bool,
  currentValue: PropTypes.bool,
  disabled: PropTypes.bool
};

export default Switch;
