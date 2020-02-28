import React, { Component } from "react";
import InputText from "../../components/InputText/InputText";
import axios from "axios";
import Button from '../../components/UI/Button/Button';
import Select from '@material-ui/core/Select';
import Layout from "../../hoc/Layout/Layout.js";
import ViewRpc from "./ViewRpc";
class AddRpc extends Component {
  statename =[];
  zoneid="";
  collegeid="";
  constructor() {
    super();
    this.state = {
      addrpc:"",
      getstates:[],
      getzone:[],
      statename:"",
      zoneid:"",
      getcollege:[],
    };
  }
  componentDidMount() {
    axios.get('http://192.168.2.87:1337/states').then(res => {
    this.setState({ getstates: res.data });
  });
  axios.get('http://192.168.2.87:1337/colleges').then(res => {
    console.log("college",res.data);
    this.setState({ getcollege: res.data });
  });
}
  handleChange(event){
    console.log("changed",event.target.value);
    this.setState({ addrpc : event.target.value }); 
  }
  handleStateChange(event){
    console.log("changedstate",event.target.value);
    // this.setState({ statename : event.target.value });
    this.statename = event.target.value;
    axios.get('http://192.168.2.87:1337/zones?state.name='+this.statename).then(res => {
      console.log("this.state.statename",this.state.statename);
      console.log("res",res.data);
      this.setState({ getzone: res.data });
    }); 
  }
  handleZoneChange(event){
    this.zoneid = event.target.value;
    console.log("zoneid",this.zoneid);
  }
  handleCollegeChange(event){
    console.log("changecollege",event.target.value);
    this.collegeid = event.target.value;
  }
  handleSubmit(event){
    // alert("submit");
    event.preventDefault();
    var name =this.state.addrpc;
    var ID = this.zoneid;
    var clgid = this.collegeid;
    console.log("bogjhgajfcvhw",name,ID);
    axios.post('http://192.168.2.87:1337/rpcs', {
      "name": name,
      "zone": {
        "id": ID
    },
    "main_college":{
      "id": clgid
    }
  })
    .then(res =>  {
    console.log("result",res);
    // window.location.reload();
    })
    .catch(error => {
    console.log(error.response);
    });
  }
  render() {
    return (
      <div>
        <Layout>
        <h1>RPCs</h1>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <span>RPC Name </span><InputText  name="addrpc" placeholder="Add RPC"  onChange={this.handleChange.bind(this)} />
        <span>State Name</span><Select placeholder="Add State"  onChange={this.handleStateChange.bind(this)} >
      {this.state.getstates.map(states => 
      <option value={states.name} key={states.id}  > {states.name} </option>
      )}
      </Select>
      <span>Zone Name</span><Select placeholder="Add Zone" onChange={this.handleZoneChange.bind(this)} >
      {this.state.getzone.map(zone => 
      <option value={zone.id} key={zone.id}  > {zone.name} </option>
      )}
      </Select>
      <span>College Name</span><Select placeholder="Add Zone" onChange={this.handleCollegeChange.bind(this)} >
      {this.state.getcollege.map(college => 
      <option value={college.id} key={college.id}  > {college.name} </option>
      )}
      </Select>
      <br></br><Button buttonType="submit" value="submit" >ADD</Button> <Button>Cancel</Button>
      </form>
      <ViewRpc />
      </Layout>
      </div>
      );
    }
}
export default AddRpc;