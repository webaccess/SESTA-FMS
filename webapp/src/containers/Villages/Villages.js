// import React, { Component } from "react";
// import Input from "../../components/UI/Input/Input";
// import axios from "axios";
// import Button from "../../components/UI/Button/Button";
// import Select from "@material-ui/core/Select";
// import Layout from "../../hoc/Layout/Layout";
// import auth from "../../components/Auth/Auth";
// import InputLabel from "@material-ui/core/InputLabel";
// import FormControl from "@material-ui/core/FormControl";
// import MenuItem from '@material-ui/core/MenuItem';

// class Village extends Component {
//   constructor() {
//     super();
//     this.state = {
//       getState: [],
//       getDistrict: [],
//       addVillage: "",
//       addState: "",
//       addDistrict: ""
//     };
//   }
//   componentDidMount() {
//     axios
//       .get(process.env.REACT_APP_SERVER_URL + "states/", {
//         headers: {
//           Authorization: "Bearer " + auth.getToken() + ""
//         }
//       })
//       .then(res => {
//         console.log("fulll data", res.data);
//         this.setState({ getState: res.data });
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   }
//   handleChange(event) {}
//   handleStateChange(event) {
//     this.setState({ addState: event.target.value });
//   }
//   handleDistrictChange(event) {
//     this.setState({ addDistrict: event.target.value });
//   }

//   handleSubmit(event) {
//     console.log("hello", this.state.addState, this.state.addDistrict);
//     event.preventDefault();
//   }
//   render() {
//     return (
//       <div>
//         <Layout>
//           <form onSubmit={this.handleSubmit.bind(this)}>
//             <Input
//               name="addVillage"
//               placeholder="Add Village Name"
//               autoFocus={true}
//               className="addVillage"
//               id="addVillage"
//               label="Add Village"
//               value={this.state.addVillage}
//               variant="outlined"
//               type="text"
//               onChange={this.handleChange.bind(this)}
//             />
//             <br></br>
//             <br></br>
//             <FormControl variant="outlined">
//               <InputLabel ref={InputLabel} htmlFor="demo-simple-select-outlined-label">
//                 State
//               </InputLabel>
//               <Select
//                 name="addState"
//                 labelId="demo-simple-select-outlined-label"
//                 id="demo-simple-select-outlined"
//                 value={this.state.addState}
//                 fullWidth
//                 variant = "outlined"
//                 onChange={this.handleStateChange.bind(this)}
//                 // labelWidth={0}
//               >
//                 {this.state.getState.map(states => (
//                   <MenuItem value={states.name} key={states.id}>
//                     {" "}
//                     {states.name}{" "}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//             {/* <Select
//               placeholder="Add State"
//               onChange={this.handleStateChange.bind(this)}
//             >
//               {this.state.getstates.map(states => (
//                 <option value={states.name} key={states.id}>
//                   {" "}
//                   {states.name}{" "}
//                 </option>
//               ))}
//             </Select>
//             <Select
//               placeholder="Add Zone"
//               onChange={this.handleZoneChange.bind(this)}
//             >
//               {this.state.getzone.map(zone => (
//                 <option value={zone.id} key={zone.id}>
//                   {" "}
//                   {zone.name}{" "}
//                 </option>
//               ))}
//             </Select> */}
//             <br></br>
//             <br></br>
//             <Button type="submit" value="submit">
//               Save
//             </Button>
//           </form>
//         </Layout>
//       </div>
//     );
//   }
// }
// export default Village;

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
import { map } from "lodash";
import validateInput from "../../components/Validation/ValidateInput/ValidateInput";


class Villages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: {},
      getState: [],
      getDistrict: [],
      validations: {
        addVillage: {
          required: { value: "true", message: "addVillage field required" }
        },
        addState: {},
        addDistrict: {}
      },
      errors: {
        addVillage: [],
        addState: [],
        addDistrict: []
      },
      serverErrors: {},
      formSubmitted: false
    };
  }

  componentDidMount() {
    axios
      .get(process.env.REACT_APP_SERVER_URL + "states/", {
        headers: {
          Authorization: "Bearer " + auth.getToken() + ""
        }
      })
      .then(res => {
        console.log("state data", res.data);
        this.setState({ getState: res.data });
      })
      .catch(error => {
        console.log(error);
      });

   
  }

  handleChange = ({ target }) => {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
  }
  

  handleStateChange(target) {
    this.setState({
      values: { ...this.state.values, [target.name]: target.value }
    });
        axios
        .get(process.env.REACT_APP_SERVER_URL + "districts/", {
          headers: {
            Authorization: "Bearer " + auth.getToken() + ""
          }
        })
        .then(res => {
          console.log("district data", res.data);
          this.setState({ getDistrict: res.data });
        })
        .catch(error => {
          console.log(error);
        });
      }

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
    console.log("valkues",this.state.values)
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
              title="add/edit village"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Village Name"
                    margin="dense"
                    name="addVillage"
                    error={this.hasError("addVillage")}
                    helperText={
                      this.hasError("addVillage")
                        ? this.state.errors.addVillage[0]
                        : null
                    }
                    value={this.state.values.addVillage || ""}
                    onChange={this.handleChange}
                    variant="outlined"
                  />
                </Grid>

                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select State"
                    helperText="Please select the state first"
                    margin="dense"
                    name="addState"
                    onChange={this.handleStateChange}
                    required
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    value={this.state.values.addState || ""}
                    variant="outlined"
                  >
                    {this.state.getState.map(states => (
                      <option value={states.name} key={states.id}>
                        {" "}
                        {states.name}{" "}
                      </option>
                    ))}
                  </Input>
                </Grid>
                <Grid item md={6} xs={12}>
                  <Input
                    fullWidth
                    label="Select District"
                    helperText="Please select the state first"
                    margin="dense"
                    name="addDistrict"
                    onChange={this.handleDistrictChange}
                    required
                    select
                    // eslint-disable-next-line react/jsx-sort-props
                    value={this.state.values.addDistrict|| ""}
                    variant="outlined"
                  >
                    {this.state.getDistrict.map(district => (
                      <option value={district.name} key={district.id}>
                        {" "}
                        {district.name}{" "}
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
export default Villages;
