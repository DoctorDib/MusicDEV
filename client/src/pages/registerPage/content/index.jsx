import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import Dialog from '@material-ui/core/Dialog';

import Axios from 'axios';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            retypePassword: '',

            userError: false,
            userText: '',

            passwordError: false,
            passwordText: '',

            retypePasswordError: false,
            retypePasswordText: '',
            open: this.props.open || false,
        };
    }

    updateValue = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    validateUser = () => {
        // Username validation
        if(this.state.username === '') {
            this.setState({userError: true, userText: 'Please enter a username'});
        } else {
            this.setState({userError: false, userText: ''});
        }
    };

    validatePassword = () => {
        // Password validation
        if(this.state.password === '') {
            this.setState({passwordError: true, passwordText: 'Please enter a password'});
        } else {
            this.setState({passwordError: false, passwordText: ''});
        }
    };

    validateRetypePassword = () => {
        // Password validation
        if(this.state.retypePassword === '') {
            this.setState({retypePasswordError: true, retypePasswordText: 'Please retype password'});
        } else if(this.state.password !== this.state.retypePassword) {
            this.setState({retypePasswordError: true, retypePasswordText: 'Does not match'});
        } else {
            this.setState({retypePasswordError: false, retypePasswordText: ''});
        }
    };

    register = event => {
        event.preventDefault();
        if(!this.state.userError && !this.state.passwordError && !this.state.retypePasswordError){
            Axios.post('/register', {
                username: this.state.username,
                password: this.state.password
            }).then(resp => {
                if(resp.data.success){
                    window.location.href = '/';
                } else {
                    this.setState({userError: true, userText: resp.data.msg});
                }
            }).catch(err => {
                console.log(err);
            });
        }
    };

    componentWillReceiveProps(props){
        this.setState({open: props.open});
    }

    render(){
        const { classes } = this.props;

        return (
            <Dialog
                open={this.state.open}
                onClose={this.props.close('registerOpen')}
                aria-labelledby="form-dialog-title"
            >
                <form className={classes.loginContainer} onSubmit={this.register} method="post">
                    <TextField
                        margin="normal"
                        placeholder="Username"
                        id="username"
                        label="Username"
                        name="username"
                        helperText={this.state.userText}
                        onChange={this.updateValue}
                        className={classes.inputField}
                        error={this.state.userError}
                        onBlur={this.validateUser}
                    />
                    <TextField
                        margin="normal"
                        placeholder="Password"
                        type="password"
                        label="Password"
                        id="password"
                        name="password"
                        helperText={this.state.passwordText}
                        onChange={this.updateValue}
                        className={classes.inputField}
                        error={this.state.passwordError}
                        onBlur={this.validatePassword}
                    />
                    <TextField
                        margin="normal"
                        placeholder="Re-type Password"
                        type="password"
                        label="Retype Password"
                        id="retypePassword"
                        name="retypePassword"
                        helperText={this.state.retypePasswordText}
                        onChange={this.updateValue}
                        className={classes.inputField}
                        error={this.state.retypePasswordError}
                        onBlur={this.validateRetypePassword}
                    />

                    <Typography id="errorMessage" className={classes.errorMessage} color={'error'} style={{fontSize: '1em'}} variant='display1'> </Typography>

                    <Button type="submit" color={'secondary'} variant='raised' size="large" className={classes.mainButton} onClick={this.register}>Create</Button>
                </form>
            </Dialog>
        );
    }
};

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);