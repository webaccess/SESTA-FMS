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

class Users extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        country: ""
      }
    };
  }

  handleChange = ({ target }) => {
    this.setState({
      value: { ...this.state.value, [target.name]: target.value }
    });
  };

  render() {
    return (
      <Layout>
        <Card>
          <form autoComplete="off" noValidate>
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
                    helperText="Please specify the first name"
                    label="First name"
                    margin="dense"
                    name="firstName"
                    onChange={this.handleChange}
                    required
                    value={this.state.values.firstName}
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
                    value={this.state.values.lastName}
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
                    value={this.state.values.username}
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
                    value={this.state.values.email}
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
                    value={this.state.values.phone}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        defaultChecked //
                      />
                    }
                    label="Email"
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Button>Save details</Button>
            </CardActions>
          </form>
        </Card>
      </Layout>
    );
  }
}
export default Users;
