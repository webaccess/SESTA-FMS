// /*
// Toggle Switch Component
// Note: id is required for ToggleSwitch component to function. Name, currentValue, defaultChecked, Small and onChange're optional.
// Usage: <Switch id=id onChange={e=>{function(e)}}/>
// */

import React, { useState } from "react";
import PropTypes from "prop-types";
import styles from "./Switch.module.css";

function ToggleSwitch(props) {
  const [state, setState] = useState({
    checked: props.defaultChecked,
  });

  const onChange = (e) => {
    setState({
      checked: e.target.checked,
    });
    if (typeof props.onChange === "function") props.onChange();
  };

  return (
    <div className={styles.toggleSwitch + (props.Small ? " small-switch" : "")}>
      <input
        type="checkbox"
        name={props.Name}
        className={styles.toggleSwitchCheckbox}
        id={props.id}
        checked={props.currentValue}
        defaultChecked={props.defaultChecked}
        onChange={props.onChange}
        disabled={props.disabled}
      />
      {props.id ? (
        <label className={styles.toggleSwitchLabel} htmlFor={props.id}>
          <span className={styles.toggleSwitchInner} />
          <span className={styles.toggleSwitchSwitch} />
        </label>
      ) : null}
    </div>
  );
}

ToggleSwitch.propTypes = {
  id: PropTypes.any.isRequired,
  Text: PropTypes.string,
  Name: PropTypes.string,
  onChange: PropTypes.func,
  defaultChecked: PropTypes.bool,
  Small: PropTypes.bool,
  currentValue: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default ToggleSwitch;
