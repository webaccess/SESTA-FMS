// /*
// Toggle Switch Component
// Note: id is required for ToggleSwitch component to function. Name, currentValue, defaultChecked, Small and onChange're optional.
// Usage: <Switch id=id onChange={e=>{function(e)}}/>
// */

import React, { Component ,useState} from "react";
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import PropTypes from "prop-types";
import '../../App.css';

function ToggleSwitch(props){
const [state, setState] = useState({
checked: props.defaultChecked
});

  const onChange = e => {
    setState({
      checked: e.target.checked
    });
    if (typeof props.onChange === "function") props.onChange();
  };

    return (
      <div
        className={"toggle-switch" + (props.Small ? " small-switch" : "")}
      >
        <input
          type="checkbox"
          name={props.Name}
          className="toggle-switch-checkbox"
          id={props.id}
          checked={props.currentValue}
          defaultChecked={props.defaultChecked}
          onChange={props.onChange}
          disabled={props.disabled}
        />
        {props.id ? (
          <label className="toggle-switch-label" htmlFor={props.id}>
            <span
              className={
                props.disabled
                  ? "toggle-switch-inner toggle-switch-disabled"
                  : "toggle-switch-inner"
              }
              // data-yes={props.Text[0]}
              // data-no={props.Text[1]}
            />
            <span
              className={
                props.disabled
                  ? "toggle-switch-switch toggle-switch-disabled"
                  : "toggle-switch-switch"
              }
            />
          </label>
        ) : null}
      </div>
    );
  }
  // Set text for rendering.
  // static defaultProps = {
  //   Text: ["Yes", "No"]
  // };


ToggleSwitch.propTypes = {
  id: PropTypes.string.isRequired,
  Text: PropTypes.string.isRequired,
  Name: PropTypes.string,
  onChange: PropTypes.func,
  defaultChecked: PropTypes.bool,
  Small: PropTypes.bool,
  currentValue: PropTypes.bool,
  disabled: PropTypes.bool
};

export default ToggleSwitch;
