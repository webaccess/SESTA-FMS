import React, { PureComponent } from 'react';
import { findIndex, get, map, mapKeys, replace, set, isEmpty } from 'lodash';
import { Link } from 'react-router-dom';
import form from './forms.json';
import styles from './AuthPage.module.css';
// Utils
import validateInput from '../../components/Validation/ValidateInput/ValidateInput';
import auth from '../../components/Auth/Auth';
import {Container} from '@material-ui/core';
import Button from "../../components/UI/Button/Button";
import Input from "../../components/UI/Input/Input";
import axios from "axios";

class AuthPage extends PureComponent {

    constructor(props){
        super(props);
        this.state = { value: {}, errors: {}, fieldErrors: {}, formErrors: {} , formSubmitted: false , showSuccessMsg:false };
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ value: {}, errors: {}, fieldErrors: {}, formErrors: [] , formSubmitted: false , showSuccessMsg:false });
        if (nextProps.match.params.authType !== this.props.match.params.authType) {
          this.generateForm(nextProps);
        }
      }

    componentDidMount() {
        this.generateForm(this.props);
    }


    generateForm = props => {
        const params = props.location.search ? replace(props.location.search, '?code=', '') : props.match.params.id;
        this.setForm(props.match.params.authType, params);
    };

    /**
     * Function that allows to set the value to be modified
     * @param {String} formType the auth view type ex: login
     * @param {String} email    Optionnal
     */
    setForm = (formType, email) => {
        const value = get(form, ['data', formType], {});

        if (formType === 'reset-password') {
            set(value, 'code', email);
        }
        this.setState({ value });
        
    };

    
    getRequestURL = () => {
        let requestURL;

        switch (this.props.match.params.authType) {
            case 'login':
            requestURL = process.env.REACT_APP_SERVER_URL+'auth/local';
            break;
            case 'reset-password':
            requestURL = process.env.REACT_APP_SERVER_URL+'auth/reset-password';
            break;
            case 'forgot-password':
            requestURL = process.env.REACT_APP_SERVER_URL+'auth/forgot-password';
            break;
            default:
        }

        return requestURL;
    };

      
    handleChange = ({ target }) =>{
        this.setState({
        value: { ...this.state.value, [target.name]: target.value },
        });
    }

    validate = () => {
        const body = this.state.value;
        const inputs = get(form, ['views', this.props.match.params.authType], []);
        map(inputs, (input, key) => {
            let nameval= get(input, 'name')
            let fieldValue = (nameval in body)?body[nameval]:"";
            const errors = validateInput(fieldValue, JSON.parse(JSON.stringify(get(input, 'validations'))));
            
            let errorset = this.state.errors
            if(errors.length>0)
                errorset[nameval] = errors
            else
                delete errorset[nameval]
            this.setState({ errors : errorset });
        })
    };

    handleSubmit = e => {
        e.preventDefault();
        const body = this.state.value;
        
        this.validate()
        
        const requestURL = this.getRequestURL();
        this.setState({formSubmitted:true})
        this.setState({fieldErrors: {...this.state.errors}})
        this.setState({formErrors: []})
        // This line is required for the callback url to redirect your user to app
        if (this.props.match.params.authType === 'forgot-password') {
          set(body, 'url', 'http://localhost:3000/reset-password');
        }
        
        if(Object.keys(this.state.errors).length>0)
            return;

        axios({
            method: 'post',
            url: requestURL,
            headers: {
                'Content-Type': 'application/json'
            },
            data:this.state.value,
            withCredentials:true,
            responseType: 'json'
        })
        .then(response => { 
            if(this.props.match.params.authType === 'login'){
                auth.setToken(response.data.jwt);
                auth.setUserInfo(response.data.user);
            }
            
            this.redirectUser();
                
                    
          })
          .catch(error => {
            if(error.response){
                let errors = ( this.props.match.params.authType === 'login' && error.response.data.message[0]["messages"][0]["id"] === "Auth.form.error.invalid"?["Username or password invalid."]:[error.response.data.message[0]["messages"][0]["message"]]);
                let erroset = {}
                if( this.props.match.params.authType === 'login' && error.response.data.message[0]["messages"][0]["id"] === "Auth.form.error.invalid")
                    erroset = {"identifier":errors}
                else if( this.props.match.params.authType === 'forgot-password'){
                    if(error.response.data.message[0]["messages"][0]["id"] === "Auth.form.error.email.invalid")
                        errors = ["This email does not exist."]
                    erroset = {"email":errors}
                }
                else if( this.props.match.params.authType === 'reset-password')
                    erroset = {"password":errors}
                this.setState({formErrors:  erroset})
                
            }             
            else{
                if(this.props.match.params.authType === 'login')
                    this.setState({formErrors:  {"identifier":[error.message]}})
                else if(this.props.match.params.authType === 'forgot-password')
                    this.setState({formErrors:  {"email":[error.message]}})
                else if(this.props.match.params.authType === 'reset-password')
                    this.setState({formErrors:  {"password":[error.message]}})
            }              
            
          });
      };
    
    redirectUser = () => {
        if(this.props.match.params.authType === 'login')
            this.props.history.push('/');
        else{
            this.setState({showSuccessMsg:true})
        }
    };

    /**
   * Check the URL's params to render the appropriate links
   * @return {Element} Returns navigation links
   */
    renderLink = () => {
        if (this.props.match.params.authType === 'login') {
            return (
            <div>
                <Link to="/forgot-password">Forgot Password</Link>
            </div>
            );
        }

        return (
            <div>
            <Link to="/login">Ready to signin</Link>
            </div>
        );
    };

    renderFieldErrorBlock = (inputs) => {
        map(inputs, (input, key) => {
            let renderFormErrors = (map(this.state.formErrors, (error, keyval) => {                               
                let nameval= get(input, 'name')
                if(nameval == keyval && error.length>0)
                {
                    return (<div className={`form-control-feedback invalid-feedback ${styles.errorContainer} d-block`} key={keyval}>{error[0]}</div>);
                }
                else{
                    return ;
                }
            }))
            return renderFormErrors
        })

        return;
    };

    renderSuccessMsg = () => {
        let message='';
        if (this.props.match.params.authType === 'forgot-password') 
            message='Reset password link is sent to your mail.'
        else if (this.props.match.params.authType === 'reset-password') 
            message='Password reset successfully.'

        return (
            <div style={{color:'green'}}>
                {message}
            </div>
        );
    };

    render() {
        const inputs = get(form, ['views', this.props.match.params.authType], []);
        const errorArr = Object.keys(this.state.errors).map(i => this.state.errors[i])
        
        return (
            <div className={styles.authPage} >
            <div className={styles.wrapper}>
                <div className={styles.formContainer} style={{ marginTop: '.9rem' }}>
                
                <Container >
                    <form onSubmit={this.handleSubmit} method="post">
                    <div className="row" style={{ textAlign: 'start' }}>
                        { map(inputs, (input, key) => {
                        
                        let fieldErrorVal='';
                        let formSubmitted = this.state.formSubmitted
                        if(formSubmitted) {
                            let nameval=get(input, 'name')
                            if(Object.keys(this.state.fieldErrors).indexOf(nameval)>-1){
                                fieldErrorVal=this.state.fieldErrors[nameval][0]
                            }
                            
                        }
                        let validationData=JSON.parse(JSON.stringify(get(input, 'validations')))
                        return (<div key={'field' + key} style={{ margin: "8px"}}>
                                             
                        <Input
                        autoFocus={key === 0}
                        className={`${ (get(input, 'name') in this.state.fieldErrors)? 'is-invalid' : ''}`}
                        id={get(input, 'name')}
                        label={(Object.keys(validationData).indexOf("required") > -1 &&  validationData["required"]["value"] == "true")?(get(input, 'label')+'*'):get(input, 'label') }
                        name={get(input, 'name')}
                        onChange={this.handleChange}
                        value={ (Object.keys(this.state.value).indexOf(get(input, 'name')) > -1)?this.state.value[get(input, 'name')]:''}
                        error={ ((get(input, 'name') in this.state.fieldErrors) || (get(input, 'name') in this.state.formErrors))? true : false}
                        placeholder={get(input, 'placeholder')}
                        type={get(input, 'type')}
                        helperText={fieldErrorVal}
                        inputProps={{"validations":`${JSON.stringify(get(input, 'validations'))}`}}
                    />
                        </div>);
                            
                })} 
                {
                    map(inputs, (input, key) => {
                        let renderFormErrors = (map(this.state.formErrors, (error, keyval) => {                               
                            let nameval= get(input, 'name')
                            if(nameval == keyval && error.length>0)
                            {
                                return (<div className={`form-control-feedback invalid-feedback ${styles.errorContainer} d-block`} key={keyval}>{error[0]}</div>);
                            }
                            else{
                                return ;
                            }
                        }))
                        return renderFormErrors
                    })
                }
                    { (this.state.showSuccessMsg)?this.renderSuccessMsg():'' }
                        <div className={`col-md-12 ${styles.buttonContainer}`} >
                        <Button type="submit">
                            Submit
                            </Button>
                        </div>
                    </div>
                    </form>
                    </Container>
               
                </div>
                <div className={styles.linkContainer}>{this.renderLink()}</div>
            </div>
            </div>
        );
    }

    

}

export default AuthPage;

