import React, { Component } from "react";
import { withStyles } from "@material-ui/core/styles";
import Layout from "../../hoc/Layout/Layout";
import { Grid } from "@material-ui/core";
import {
  Card,
  CardContent,
  CardActions,
  CardHeader,
  Avatar,
  Typography,
  Divider,
} from "@material-ui/core";
import auth from "../../components/Auth/Auth";
import Input from "../../components/UI/Input/Input";
import Button from "../../components/UI/Button/Button";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import axios from "axios";
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";

const useStyles = (theme) => ({
  root: {},
  details: {
    display: "flex",
  },
  avatar: {
    marginLeft: "auto",
    height: 110,
    width: 100,
    flexShrink: 0,
    flexGrow: 0,
  },
  progress: {
    marginTop: theme.spacing(2),
  },
  uploadButton: {
    marginRight: theme.spacing(2),
  },
});

export class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        password: "",
        showPassword: false,
      },
      error: "",
      success: "",
      validations: {
        password: {
          required: { value: true, message: "Password required" },
        },
      },
      errors: {
        password: [],
      },
    };
    this.snackbar = React.createRef();
  }

  handleClickShowPassword = () => {
    this.setState({
      values: {
        ...this.state.values,
        showPassword: !this.state.values.showPassword,
      },
    });
  };

  handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value },
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.validate();

    if (Object.keys(this.state.errors).length > 0) return;
    let userInfo = auth.getUserInfo();
    axios
      .put(
        process.env.REACT_APP_SERVER_URL + "users/" + userInfo.id,
        {
          password: this.state.values.password,
        },
        {
          headers: {
            Authorization: "Bearer " + auth.getToken(),
          },
        }
      )
      .then((res) => {
        this.setState({ success: "Password changed successfully!!" });
        if (this.snackbar.current !== null) {
          this.snackbar.current.handleClick();
        }
      })
      .catch((error) => {
        this.setState({ error });
        console.log(error);
      });
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      console.log();
      const errors = validateInput(value, validation);

      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
    console.log(this.state.errors.password);
  };

  hasError = (field) => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  render() {
    let userInfo = auth.getUserInfo();
    console.log(userInfo);
    const { classes } = this.props;
    return (
      <Layout>
        <Grid container spacing={4}>
          <Grid item md={12} xs={12}>
            {this.state.error ? (
              <Snackbar severity="error" Showbutton={false}>
                {this.state.error}
              </Snackbar>
            ) : null}
            {this.state.success ? (
              <Snackbar
                ref={this.snackbar}
                open={true}
                autoHideDuration={4000}
                severity="success"
              >
                {this.state.success}
              </Snackbar>
            ) : null}
          </Grid>
          <Grid item lg={4} md={6} xl={4} xs={12}>
            <Card className={classes.root}>
              <CardContent>
                <div className={classes.details}>
                  <div>
                    <Typography gutterBottom variant="h2">
                      {userInfo.first_name} {userInfo.last_name}
                    </Typography>
                    <Typography
                      className={classes.locationText}
                      color="textSecondary"
                      variant="body1"
                    >
                      {userInfo.email}
                    </Typography>
                    <Typography
                      className={classes.dateText}
                      color="textSecondary"
                      variant="body1"
                    ></Typography>
                  </div>
                  <Avatar className={classes.avatar} src="" />
                </div>
              </CardContent>
              <Divider />
            </Card>
          </Grid>
          <Grid item lg={8} md={6} xl={8} xs={12}>
            <Card className={classes.root}>
              <form
                autoComplete="off"
                noValidate
                onSubmit={this.handleSubmit}
                method="post"
              >
                <CardHeader
                  subheader="You can update password here."
                  title="Change Password"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                      {/* <FormControl> */}
                      {/* <InputLabel htmlFor="standard-adornment-password">
                          Password
                        </InputLabel> */}
                      <Input
                        fullWidth
                        id="standard-adornment-password"
                        name="password"
                        label="Password"
                        error={this.hasError("password")}
                        helperText={
                          this.hasError("password")
                            ? this.state.errors.password[0]
                            : null
                        }
                        type={
                          this.state.values.showPassword ? "text" : "password"
                        }
                        value={this.state.values.password || ""}
                        onChange={this.handleChange}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={this.handleClickShowPassword}
                                onMouseDown={this.handleMouseDownPassword}
                              >
                                {this.state.values.showPassword ? (
                                  <Visibility />
                                ) : (
                                  <VisibilityOff />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {/* </FormControl> */}
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button type="submit">Save details</Button>
                </CardActions>
              </form>
            </Card>
          </Grid>
        </Grid>
      </Layout>
    );
  }
}

export default withStyles(useStyles)(Account);
