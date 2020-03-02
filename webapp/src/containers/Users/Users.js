import React, { Component } from "react";
import Layout from "../../hoc/Layout/Layout";
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";

const states = [
  {
    value: "alabama",
    label: "Alabama"
  },
  {
    value: "new-york",
    label: "New York"
  },
  {
    value: "san-francisco",
    label: "San Francisco"
  }
];

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      validations: {
        firstName: {
          required: { value: "true", message: "firstname field required" }
        },
        lastName: {},
        username: {},
        email: {},
        phone: {},
        state: {}
      },
      errors: {
        firstName: [],
        lastName: [],
        username: [],
        email: [],
        phone: [],
        state: []
      },
      serverErrors: {}
    };
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
    return Object.keys(this.state.errors).length > 0 &&
      this.state.errors[field].length > 0
      ? true
      : false;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.validate();

    if (Object.keys(this.state.errors).length > 0) return;
    //ajax call
  };

  resetForm = () => {
    this.setState({
      values: {}
    });
  };

  render() {
    return (
      <Layout>
        <Card>
          <form
            autoComplete="off"
            noValidate
            onSubmit={this.handleSubmit}
            method="post"
          >
            <CardHeader
              subheader="The information can be edited"
              title="Profile"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="First name"
                    margin="dense"
                    name="firstName"
                    error={this.hasError("firstName")}
                    helperText={
                      this.hasError("firstName")
                        ? this.state.errors.firstName[0]
                        : null
                    }
                    value={this.state.values.firstName || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Last name"
                    margin="dense"
                    name="lastName"
                    onChange={this.handleChange}
                    required
                    value={this.state.values.lastName || ""}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Username"
                    margin="dense"
                    name="username"
                    onChange={this.handleChange}
                    required
                    value={this.state.values.username || ""}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Email Address"
                    margin="dense"
                    name="email"
                    onChange={this.handleChange}
                    required
                    value={this.state.values.email || ""}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Phone Number"
                    margin="dense"
                    name="phone"
                    onChange={this.handleChange}
                    type="number"
                    value={this.state.values.phone || ""}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <FormControlLabel
                    control={<Checkbox color="primary" defaultChecked />}
                    label="Email"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select State"
                    helperText="Please select the state first"
                    margin="dense"
                    name="state"
                    onChange={this.handleChange}
                    required
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    value={this.state.values.state || ""}
                    variant="outlined"
                  >
                    {states.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Input>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button type="submit">Save</Button>
              <Button color="default" clicked={this.resetForm}>
                Reset
              </Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}
export default Users;
