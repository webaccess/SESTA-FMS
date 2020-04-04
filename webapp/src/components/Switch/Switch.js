import React, { useState } from "react";
import PropTypes from "prop-types";

/*
Toggle Switch Component
Note: id is required for ToggleSwitch component to function. Name, currentValue, defaultChecked, Small and onChange're optional.
Usage: <ToggleSwitch id="id" onChange={function (e) { console.log("Checkbox Current State: " + e.target.checked); }} />
*/

function Switch(props){
  const [state, setState] = useState(false)
  state = {
    checked: this.props.defaultChecked
  };
 const onChange = e => {
    this.setState({
      checked: e.target.checked
    });
    console.log("ddd",e.target)
    if (typeof this.props.onChange === "function") this.props.onChange();
  };
    return (
      <div
        className={"toggle-switch" + (this.props.Small ? " small-switch" : "")}
      >
        <input
          type="checkbox"
          name={this.props.Name}
          className="toggle-switch-checkbox"
          id={this.props.id}
          checked={this.props.currentValue}
          defaultChecked={this.props.defaultChecked}
          onChange={this.onChange}
          disabled={this.props.disabled}
        />
        {this.props.id ? (
          <label className="toggle-switch-label" htmlFor={this.props.id}>
            <span
              className={
                this.props.disabled
                  ? "toggle-switch-inner toggle-switch-disabled"
                  : "toggle-switch-inner"
              }
              data-yes={this.props.Text[0]}
              data-no={this.props.Text[1]}
            />
            <span
              className={
                this.props.disabled
                  ? "toggle-switch-switch toggle-switch-disabled"
                  : "toggle-switch-switch"
              }
            />
          </label>
        ) : null}
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
