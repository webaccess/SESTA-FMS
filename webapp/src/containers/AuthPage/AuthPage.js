import React, { PureComponent } from "react";
import { get, map, replace, set } from "lodash";
import { Link } from "@material-ui/core";
import form from "./forms.json";
import styles from "./AuthPage.module.css";
// Utils
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import auth from "../../components/Auth/Auth";
import { Container } from "@material-ui/core";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import axios from "axios";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";

class AuthPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: { showPassword: false },
      errors: {},
      fieldErrors: {},
      formErrors: {},
      formSubmitted: false,
      showSuccessMsg: false,
      buttonView: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: { showPassword: false },
      errors: {},
      fieldErrors: {},
      formErrors: [],
      formSubmitted: false,
      showSuccessMsg: false,
    });
    if (nextProps.match.params.authType !== this.props.match.params.authType) {
      this.generateForm(nextProps);
    }
  }

  componentDidMount() {
    this.generateForm(this.props);
  }

  generateForm = (props) => {
    const params = props.location.search
      ? replace(props.location.search, "?code=", "")
      : props.match.params.id;
    this.setForm(props.match.params.authType, params);
    if (
      props.location.search &&
      props.location.search.includes("?reset=true")
    ) {
      this.setState({ showSuccessMsg: true });
    }
  };

  /**
   * Function that allows to set the value to be modified
   * @param {String} formType the auth view type ex: login
   * @param {String} email    Optionnal
   */
  setForm = (formType, email) => {
    const value = get(form, ["data", formType], {});

    if (formType === "reset-password") {
      set(value, "code", email);
    }
    this.setState({ value });
  };

  getRequestURL = () => {
    let requestURL;

    switch (this.props.match.params.authType) {
      case "login":
        requestURL = process.env.REACT_APP_SERVER_URL + "auth/local";
        break;
      case "verify-otp":
        requestURL = process.env.REACT_APP_SERVER_URL + "otps/validateotp";
        break;
      case "forgot-password":
        requestURL = process.env.REACT_APP_SERVER_URL + "otps/requestotp";
        break;
      case "reset-password":
        requestURL = process.env.REACT_APP_SERVER_URL + "auth/reset-password";
        break;

      default:
    }

    return requestURL;
  };

  handleChange = ({ target }) => {
    this.setState({
      value: { ...this.state.value, [target.name]: target.value },
    });
  };

  validate = () => {
    const body = this.state.value;
    const inputs = get(form, ["views", this.props.match.params.authType], []);
    map(inputs, (input, key) => {
      let nameval = get(input, "name");
      let fieldValue = nameval in body ? body[nameval] : "";
      const errors = validateInput(
        fieldValue,
        JSON.parse(JSON.stringify(get(input, "validations")))
      );

      let errorset = this.state.errors;
      if (errors.length > 0) errorset[nameval] = errors;
      else delete errorset[nameval];
      this.setState({ errors: errorset });
    });
  };

  getOTP = (resend) => {
    console.log("getOTP =>", resend);
    const requestURL = process.env.REACT_APP_SERVER_URL + "otps/requestotp";
    const body = this.state.value;
    this.setState({ fieldErrors: { ...this.state.errors } });
    this.setState({ formErrors: [] });
    if (resend)
      body["contact_number"] = this.props.location.state.contact_number;
    axios({
      method: "post",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: this.state.value,
      // withCredentials: true,
      responseType: "json",
    })
      .then((response) => {
        this.setState({ buttonView: false });
        if (resend == false)
          this.props.history.push({
            pathname: "/verify-otp",
            state: {
              contact_number: this.state.value.contact_number,
            },
          });
        else this.setState({ showSuccessMsg: true });
      })
      .catch((error) => {
        this.setState({ buttonView: false });
      });
  };

  validateOTP = () => {
    const requestURL = this.getRequestURL();
    const contact_number = this.props.location.state.contact_number;
    const body = this.state.value;
    body.contact_number = contact_number;
    this.setState({ fieldErrors: { ...this.state.errors } });
    this.setState({ formErrors: [] });
    axios({
      method: "post",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: this.state.value,
      responseType: "json",
    })
      .then((response) => {
        this.setState({ buttonView: false });
        this.props.history.push("/reset-password?code=" + response.data.result);
      })
      .catch((error) => {
        this.setState({ buttonView: false });
        this.setState({ formErrors: { otp: ["Error verifying otp."] } });
      });
  };

  resendOTP = () => {
    return this.getOTP(true);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const body = this.state.value;
    this.setState({ buttonView: true });
    this.validate();
    const requestURL = this.getRequestURL();
    this.setState({ formSubmitted: true });
    this.setState({ fieldErrors: { ...this.state.errors } });
    this.setState({ formErrors: [] });
    // This line is required for the callback url to redirect your user to app
    if (this.props.match.params.authType === "forgot-password") {
      // set(body, "url", process.env.REACT_APP_CLIENT_URL + "reset-password");
      return this.getOTP(false);
    }
    if (this.props.match.params.authType === "verify-otp") {
      return this.validateOTP();
    }
    if (this.props.match.params.authType === "reset-password") {
      body.passwordConfirmation = body.password;
    }

    if (Object.keys(this.state.errors).length > 0) {
      this.setState({ buttonView: false });
      return;
    }

    axios({
      method: "post",
      url: requestURL,
      headers: {
        "Content-Type": "application/json",
      },
      data: this.state.value,
      // withCredentials: true,
      responseType: "json",
    })
      .then((response) => {
        if (this.props.match.params.authType === "login") {
          auth.setToken(response.data.jwt);
          auth.setUserInfo(response.data.user);
        }
        this.setState({ buttonView: false });
        this.redirectUser();
      })
      .catch((error) => {
        this.setState({ buttonView: false });
        if (error.response) {
          let errors =
            this.props.match.params.authType === "login" &&
            error.response.data.message[0]["messages"][0]["id"] ===
              "Auth.form.error.invalid"
              ? ["Username or password invalid."]
              : [error.response.data.message[0]["messages"][0]["message"]];
          let erroset = {};
          if (
            this.props.match.params.authType === "login" &&
            error.response.data.message[0]["messages"][0]["id"] ===
              "Auth.form.error.invalid"
          )
            erroset = { identifier: errors };
          else if (this.props.match.params.authType === "forgot-password") {
            if (
              error.response.data.message[0]["messages"][0]["id"] ===
              "Auth.form.error.email.invalid"
            )
              errors = ["This email does not exist."];
            erroset = { email: errors };
          } else if (this.props.match.params.authType === "reset-password")
            erroset = { password: errors };
          this.setState({ formErrors: erroset });
        } else {
          if (this.props.match.params.authType === "login")
            this.setState({ formErrors: { identifier: [error.message] } });
          else if (this.props.match.params.authType === "forgot-password")
            this.setState({ formErrors: { email: [error.message] } });
          else if (this.props.match.params.authType === "reset-password")
            this.setState({ formErrors: { password: [error.message] } });
        }
      });
  };

  redirectUser = () => {
    if (this.props.match.params.authType === "login")
      this.props.history.push("/");
    else {
      this.props.history.push("/login?reset=true");
      this.setState({ showSuccessMsg: true });
      this.setState({ value: {} });
    }
  };

  /**
   * Check the URL's params to render the appropriate links
   * @return {Element} Returns navigation links
   */
  renderLink = () => {
    if (this.props.match.params.authType === "login") {
      return (
        <div>
          <Link style={{ textDecoration: "underline" }} href="/forgot-password">
            Forgot Password
          </Link>
        </div>
      );
    }

    return (
      <div>
        <Link style={{ textDecoration: "underline" }} href="/login">
          Click here to login
        </Link>
      </div>
    );
  };

  renderFieldErrorBlock = (inputs) => {
    map(inputs, (input, key) => {
      let renderFormErrors = map(this.state.formErrors, (error, keyval) => {
        let nameval = get(input, "name");
        if (nameval === keyval && error.length > 0) {
          return (
            <div
              className={`form-control-feedback invalid-feedback ${styles.errorContainer} d-block`}
              key={keyval}
            >
              {error[0]}
            </div>
          );
        } else {
          return;
        }
      });
      return renderFormErrors;
    });

    return;
  };

  renderSuccessMsg = () => {
    let message = "";
    if (this.props.match.params.authType === "forgot-password")
      message = "Reset password link is sent to your mail.";
    else if (this.props.match.params.authType === "login")
      message = "Password reset successfully.";
    else if (this.props.match.params.authType === "verify-otp")
      message = "OTP sent successfully.";

    return <div className={styles.successContainer}>{message}</div>;
  };

  handleClickShowPassword = () => {
    this.setState({
      value: {
        ...this.state.value,
        showPassword: !this.state.value.showPassword,
      },
    });
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  render() {
    const inputs = get(form, ["views", this.props.match.params.authType], []);
    const errorArr = Object.keys(this.state.errors).map(
      (i) => this.state.errors[i]
    );

    return (
      <div className={styles.authPage}>
        <div className={styles.wrapper}>
          <div className={styles.formContainer} style={{ marginTop: ".9rem" }}>
            <Container>
              <form onSubmit={this.handleSubmit} method="post" noValidate>
                <div className="row" style={{ textAlign: "start" }}>
                  {map(inputs, (input, key) => {
                    let fieldErrorVal = "";
                    let formSubmitted = this.state.formSubmitted;
                    if (formSubmitted) {
                      let nameval = get(input, "name");
                      if (
                        Object.keys(this.state.fieldErrors).indexOf(nameval) >
                        -1
                      ) {
                        fieldErrorVal = this.state.fieldErrors[nameval][0];
                      }
                    }
                    let validationData = JSON.parse(
                      JSON.stringify(get(input, "validations"))
                    );
                    return (
                      <div key={"field" + key} className={styles.loginKeyWrap}>
                        {get(input, "subheading") ? (
                          <h4>{get(input, "subheading")}</h4>
                        ) : (
                          ""
                        )}
                        <Input
                          autoFocus={key === 0}
                          className={`${
                            get(input, "name") in this.state.fieldErrors
                              ? "is-invalid"
                              : ""
                          }`}
                          id={get(input, "name")}
                          label={
                            Object.keys(validationData).indexOf("required") >
                              -1 &&
                            validationData["required"]["value"] === "true"
                              ? get(input, "label") + "*"
                              : get(input, "label")
                          }
                          name={get(input, "name")}
                          onChange={this.handleChange}
                          value={
                            Object.keys(this.state.value).indexOf(
                              get(input, "name")
                            ) > -1
                              ? this.state.value[get(input, "name")]
                              : ""
                          }
                          error={
                            get(input, "name") in this.state.fieldErrors ||
                            get(input, "name") in this.state.formErrors
                              ? true
                              : false
                          }
                          placeholder={get(input, "placeholder")}
                          type={
                            get(input, "type") == "password"
                              ? this.state.value.showPassword
                                ? "text"
                                : "password"
                              : get(input, "type")
                          }
                          helperText={fieldErrorVal}
                          inputProps={{
                            validations: `${JSON.stringify(
                              get(input, "validations")
                            )}`,
                          }}
                          InputProps={
                            get(input, "type") == "password"
                              ? {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={this.handleClickShowPassword}
                                        onMouseDown={
                                          this.handleMouseDownPassword
                                        }
                                      >
                                        {this.state.value.showPassword ? (
                                          <Visibility />
                                        ) : (
                                          <VisibilityOff />
                                        )}
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }
                              : ""
                          }
                        />
                        {get(input, "name") == "otp" ? (
                          <div style={{ float: "right", marginTop: "5px" }}>
                            <Link
                              href="javascript:void(0)"
                              onClick={this.resendOTP}
                            >
                              Resend OTP
                            </Link>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    );
                  })}
                  {map(inputs, (input, key) => {
                    let renderFormErrors = map(
                      this.state.formErrors,
                      (error, keyval) => {
                        let nameval = get(input, "name");

                        if (nameval === keyval && error.length > 0) {
                          return (
                            <div
                              className={`form-control-feedback invalid-feedback ${styles.errorContainer} d-block`}
                              key={keyval}
                            >
                              {error[0]}
                            </div>
                          );
                        } else {
                          return;
                        }
                      }
                    );
                    return renderFormErrors;
                  })}
                  {this.state.showSuccessMsg ? this.renderSuccessMsg() : ""}
                  {this.props.match.params.authType === "login" ? (
                    <div
                      style={{ paddingLeft: "212px" }}
                      className={styles.linkContainer}
                    >
                      {this.renderLink()}
                    </div>
                  ) : (
                    ""
                  )}
                  <div className={`col-md-12 ${styles.buttonContainer}`}>
                    <Button type="submit" disabled={this.state.buttonView}>
                      {this.props.match.params.authType === "login"
                        ? "Login"
                        : "Submit"}
                    </Button>
                  </div>
                </div>
              </form>
            </Container>
          </div>
          {this.props.match.params.authType !== "login" ? (
            <div className={styles.linkContainer}>{this.renderLink()}</div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}

export default AuthPage;
