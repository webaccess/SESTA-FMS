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
import style from "./Account.module.css";

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
      users: [],
      contacts: [],
      values: {
        addPhone: "",
        password: "",
        showPassword: false,
      },
      error: "",
      success: "",
      userExists: "",
      validations: {
        addPhone: {
          required: {
            value: true,
            message: "Phone number required",
          },
          phone: {
            value: true,
            message: "Please enter valid phone number",
          },
        },
      },
      errors: {},
    };
    this.snackbar = React.createRef();
  }

  async componentDidMount() {
    let userInfo = auth.getUserInfo();
    this.setState({
      values: {
        addPhone: userInfo.username
      }
    });

    axios
      .get(
        process.env.REACT_APP_SERVER_URL + "users")
      .then(res => {
        this.setState({ users: res.data });
      })

    await axios
      .get(
        process.env.REACT_APP_SERVER_URL + "crm-plugin/contact")
      .then(res => {
        this.setState({ contacts: res.data });
      })
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
    let userAlreadyExist = false;
    let users = this.state.users;
    e.preventDefault();
    this.validate();
    let userInfo;
    if (Object.keys(this.state.errors).length > 0) return;

    this.state.users.map(uid => {
      if (uid.id === auth.getUserInfo().id) {
        userInfo = uid;
      }
    })

    let emailAddr, postdata;
    emailAddr = this.state.values.addPhone + "@example.com";

    if (userInfo.username == this.state.values.addPhone) {
      // only update password of current loggedin user
      if (this.state.values.password) {
        postdata = {
          password: this.state.values.password
        }
      } else {
        postdata = {
          email: emailAddr
        }
      }
    } else {
      // check if user already exists
      if (users.length > 0 && users.find(user => user.username === this.state.values.addPhone)) {
        userAlreadyExist = true;
        this.setState({ userExists: "User with this phone number already exists, please use other phone number" });
      }
      if (this.state.values.password) {
        // update user details if username/phone no. and password is changed
        postdata = {
          username: this.state.values.addPhone,
          password: this.state.values.password,
          email: emailAddr,
        }
      } else {
        postdata = {
          username: this.state.values.addPhone,
          email: emailAddr
        }
      }
    }
    if (!userAlreadyExist) {
      axios
        .put(
          process.env.REACT_APP_SERVER_URL + "users/" + userInfo.id,
          postdata,
          {
            headers: {
              Authorization: "Bearer " + auth.getToken(),
            },
          }
        )
        .then((res) => {

          //update phone and email of contact
          let contactdata = {
            phone: this.state.values.addPhone,
            email: emailAddr,
            contact_type: userInfo.contact.contact_type,
          }
          axios
            .put(
              process.env.REACT_APP_SERVER_URL + "crm-plugin/contact/" + userInfo.contact.id,
              contactdata,
              {
                headers: {
                  Authorization: "Bearer " + auth.getToken(),
                },
              }
            )
            .then((res) => { })

          this.setState({
            values: {
              addPhone: res.data.username
            }
          })
          this.setState({ success: "User details updated successfully!!" });
          if (this.snackbar.current !== null) {
            this.snackbar.current.handleClick();
          }
        })
        .catch((error) => {
          this.setState({ error });
          console.log(error);
        });
    }
  };

  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      let errors = validateInput(value, validation);
      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
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
            {this.state.userExists ? (
              <Snackbar severity="error" Showbutton={false}>
                {this.state.userExists}
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
          {/* <Grid item lg={8} md={6} xl={8} xs={12}> */}
          <Grid item md={12} xs={12}>
            <Card className={classes.root}>
              <form
                autoComplete="off"
                noValidate
                onSubmit={this.handleSubmit}
                method="post"
              >
                <CardHeader
                  subheader="You can update your details here."
                  title="Update User Details"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={12} xs={12}>
                      <Input
                        fullWidth
                        id="standard-adornment-password"
                        name="addPhone"
                        label="Phone Number*"
                        type="number"
                        error={this.hasError("addPhone")}
                        helperText={
                          this.hasError("addPhone")
                            ? this.state.errors.addPhone[0]
                            : null
                        }
                        value={this.state.values.addPhone || ""}
                        onChange={this.handleChange}
                      />
                      {/* </FormControl> */}
                    </Grid>
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
                        // error={this.hasError("password")}
                        // helperText={
                        //   this.hasError("password")
                        //     ? this.state.errors.password[0]
                        //     : null
                        // }
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
                  <Button type="submit">Save</Button>
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
