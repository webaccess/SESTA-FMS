import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import axios from "axios";
import auth from "../../components/Auth/Auth";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid
} from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import { ADD_PG_BREADCRUMBS, EDIT_PG_BREADCRUMBS } from "./config";
import { Link } from "react-router-dom";
import Snackbar from "../../components/UI/Snackbar/Snackbar";

class PgPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      addIsActive:false,
      validations: {
        addPg: {
          required: { value: "true", message: "Producer Group field required" }
        }
        // addState: {
        //   required: { value: "true", message: "State field required" }
        // },
        // addDistrict: {
        //   required: { value: "true", message: "District field required" }
        // }
      },
      errors: {
      
      },
      serverErrors: {},
      formSubmitted: "",
      errorCode: "",
      stateSelected: false,
      editPage: [
        this.props.match.params.id !== undefined ? true : false,
        this.props.match.params.id
      ]
    };
  }

  async componentDidMount() {
    if (this.state.editPage[0]) {
      await axios
        .get(
          process.env.REACT_APP_SERVER_URL +
            "tags?id=" +
            this.state.editPage[1],
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({
            values: {
              addPg: res.data[0].name,
              addDiscription: res.data[0].discription
            }
          });
          this.setState({addIsActive:res.data[0].is_active})
        })
        .catch(error => {
          console.log(error);
        });
      // this.stateIds = this.state.values.addState;
      // await axios
      //   .get(
      //     process.env.REACT_APP_SERVER_URL +
      //       "districts?master_state.id=" +
      //       this.state.values.addState,
      //     {
      //       headers: {
      //         Authorization: "Bearer " + auth.getToken() + ""
      //       }
      //     }
      //   )
      //   .then(res => {
      //     this.setState({ getDistrict: res.data });
      //   })
      //   .catch(error => {
      //     console.log(error);
      //   });
    }
    // await axios
    //   .get(process.env.REACT_APP_SERVER_URL + "states/", {
    //     headers: {
    //       Authorization: "Bearer " + auth.getToken() + ""
    //     }
    //   })
    //   .then(res => {
    //     this.setState({ getState: res.data });
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });
    // if (this.state.values.addState) {
    //   this.setState({ stateSelected: true });
    // }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

   handleCheckBox = (event) => {
    this.setState({  [event.target.name]: event.target.checked });
  };

  //
  validate = () => {
    const values = this.state.values;
    const validations = this.state.validations;
    map(validations, (validation, key) => {
      let value = values[key] ? values[key] : "";
      const errors = validateInput(value, validation);

      let errorset = this.state.errors;
      if (errors.length > 0) errorset[key] = errors;
      else delete errorset[key];
      this.setState({ errors: errorset });
    });
  };

  hasError = field => {
    if (this.state.errors[field] !== undefined) {
      return Object.keys(this.state.errors).length > 0 &&
        this.state.errors[field].length > 0
        ? true
        : false;
    }
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.validate();
    this.setState({ formSubmitted: "" });

    if (Object.keys(this.state.errors).length > 0) return;
    let pgName = this.state.values.addPg;
    let isActive = this.state.addIsActive;
    let pgDiscription = this.state.values.addDiscription;

    if (this.state.editPage[0]) {
      // for edit data page
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL + "tags/" + this.state.editPage[1],
          {
            name: pgName,
            is_active: isActive,
            discription: pgDiscription
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          console.log("res", res);
          this.setState({ formSubmitted: true });
          this.props.history.push({ pathname: "/Pgs", editData: true });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          if (error.response !== undefined) {
            this.setState({
              errorCode:
                error.response.data.statusCode +
                " Error- " +
                error.response.data.error +
                " Message- " +
                error.response.data.message +
                " Please try again!"
            });
          } else {
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
          console.log(error);
        });
    } else {
      //for add data page
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "tags",

          {
            name: pgName,
            is_active: isActive,
            discription: pgDiscription
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ formSubmitted: true });

          this.props.history.push({ pathname: "/pgs", addData: true });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          if (error.response !== undefined) {
            this.setState({
              errorCode:
                error.response.data.statusCode +
                " Error- " +
                error.response.data.error +
                " Message- " +
                error.response.data.message +
                " Please try again!"
            });
          } else {
            this.setState({ errorCode: "Network Error - Please try again!" });
          }
          console.log("formsubmitted", this.state.formSubmitted);
        });
    }
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false
    });
    //routing code #route to village_list page
  };

  render() {
    console.log("values",this.state.values)

    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0] ? EDIT_PG_BREADCRUMBS : ADD_PG_BREADCRUMBS
        }
      >
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post"
          >
            <CardHeader
              title={
                this.state.editPage[0]
                  ? "Edit Producer Group"
                  : "Add Producer Group"
              }
              subheader={
                this.state.editPage[0]
                  ? "You can edit Producer Group data here!"
                  : "You can add new Producer Group data here!"
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      {this.state.errorCode}
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Producer Group Name"
                    name="addPg"
                    error={this.hasError("addPg")}
                    helperText={
                      this.hasError("addPg") ? this.state.errors.addPg[0] : null
                    }
                    value={this.state.values.addPg || ""}
                    onChange={this.handleChange.bind(this)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.addIsActive}
                        onChange={this.handleCheckBox}
                        name="addIsActive"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>

                <Grid item md={12} xs={12}>
                  <Input
                    fullWidth
                    label="Discription"
                    name="addDiscription"
                    value={this.state.values.addDiscription || ""}
                    onChange={this.handleChange.bind(this)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/Pgs"
              >
                cancel
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}
export default PgPage;
