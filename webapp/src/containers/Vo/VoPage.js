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
import Snackbar from "../../components/UI/Snackbar/Snackbar";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";
import {
  ADD_VILLAGE_ORGANIZATIONS_BREADCRUMBS,
  EDIT_VILLAGE_ORGANIZATIONS_BREADCRUMBS
} from "./config";
import { Link } from "react-router-dom";

class VoPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      validations: {
        addVo: {
          required: {
            value: "true",
            message: " Village Organization Name is required"
          }
        },
        addVoAddress: {},
        addPerson: {}
      },
      errors: {
        addVo: [],
        addVoAddress: [],
        addPerson: []
      },
      serverErrors: {},
      formSubmitted: "",
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
            "village-organizations?id=" +
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
              addVo: res.data[0].name,
              addVoAddress: res.data[0].address,
              addPerson: res.data[0].person_incharge
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
      this.stateIds = this.state.values.addState;
    }
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  };

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
    let voName = this.state.values.addVo;
    let voAddress = this.state.values.addVoAddress;
    let person = this.state.values.addPerson;
    let body = {
      name: voName,
      address: voAddress,
      person_incharge: person
    };
    if (this.state.editPage[0]) {
      // for edit Vo page
      await axios
        .put(
          process.env.REACT_APP_SERVER_URL +
            "village-organizations/" +
            this.state.editPage[1],
          {
            name: voName,
            address: voAddress,
            person_incharge: person
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/village-organizations",
            editVoData: true
          });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
        });
    } else {
      //for add Vo page
      await axios
        .post(
          process.env.REACT_APP_SERVER_URL + "village-organizations",

          {
            name: voName,
            address: voAddress,
            person_incharge: person
          },
          {
            headers: {
              Authorization: "Bearer " + auth.getToken() + ""
            }
          }
        )
        .then(res => {
          this.setState({ formSubmitted: true });
          this.props.history.push({
            pathname: "/village-organizations",
            addVoData: true
          });
        })
        .catch(error => {
          this.setState({ formSubmitted: false });
          console.log(error.response);
        });
    }
  };

  cancelForm = () => {
    this.setState({
      values: {},
      formSubmitted: "",
      stateSelected: false
    });
  };

  render() {
    return (
      <Layout
        breadcrumbs={
          this.state.editPage[0]
            ? EDIT_VILLAGE_ORGANIZATIONS_BREADCRUMBS
            : ADD_VILLAGE_ORGANIZATIONS_BREADCRUMBS
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
                  ? "Edit Village Organization"
                  : "Add Village Organization"
              }
              subheader={
                this.state.editPage[0]
                  ? "You can edit village organization here!"
                  : "You can add new village organization here!"
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item md={12} xs={12}>
                  {this.state.formSubmitted === false ? (
                    <Snackbar severity="error" Showbutton={false}>
                      Network Error - Please try again!
                    </Snackbar>
                  ) : null}
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Village Organization Name*"
                    name="addVo"
                    error={this.hasError("addVo")}
                    helperText={
                      this.hasError("addVo") ? this.state.errors.addVo[0] : null
                    }
                    value={this.state.values.addVo || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Address"
                    name="addVoAddress"
                    error={this.hasError("addVoAddress")}
                    helperText={
                      this.hasError("addVoAddress")
                        ? this.state.errors.addVoAddress[0]
                        : null
                    }
                    value={this.state.values.addVoAddress || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Point of Contact"
                    name="addPerson"
                    error={this.hasError("addPerson")}
                    helperText={
                      this.hasError("addPerson")
                        ? this.state.errors.addPerson[0]
                        : null
                    }
                    value={this.state.values.addPerson || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                {/* <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select FPO"
                    margin="dense"
                    name="addFpo"n
                    onChange={this.handleStateChange}
                    select
                    value={this.state.values.addFpo || ""}
                    variant="outlined"
                  >
                    ))}
                  </Input>
                </Grid> */}
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button
                color="secondary"
                clicked={this.cancelForm}
                component={Link}
                to="/village-organizations"
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
export default VoPage;
