import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import CardActions from '@material-ui/core/CardActions';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

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
            userError: false,
            userText: '',
            passwordError: false,
            passwordText: '',
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
            this.setState({userError: true});
            this.setState({userText: 'Please enter a username'});
        } else {
            this.setState({userError: false});
            this.setState({userText: ''});
        }
    };

    validatePassword = () => {
        // Password validation
        if(this.state.password === '') {
            this.setState({passwordError: true});
            this.setState({passwordText: 'Please enter a password'});
        } else {
            this.setState({passwordError: false});
            this.setState({passwordText: ''});
        }
    };

    login = event => {
        event.preventDefault();

        // Username validation
        if(this.state.username === '') {
            this.setState({userError: true});
            this.setState({userText: 'Please enter a username'});
        } else {
            this.setState({userError: false});
            this.setState({userText: ''});
        }

        // Password validation
        if(this.state.password === '') {
            this.setState({passwordError: true});
            this.setState({passwordText: 'Please enter a password'});
        } else {
            this.setState({passwordError: false});
            this.setState({passwordText: ''});
        }

        if(this.state.username !== '' && this.state.password !== '') {
            Axios.post('/login', {
                username: this.state.username,
                password: this.state.password
            }).then(resp => {
                console.log(resp);
                if(resp.data.success){
                    window.location.href = '/';
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
                onClose={this.props.close('loginOpen')}
                aria-labelledby="form-dialog-title"
            >
                    <Card>
                        <form className={classes.loginContainer} onSubmit={this.login} method="post">
                            <CardContent>
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

                                <Typography id="errorMessage" className={classes.errorMessage} color={'error'} style={{fontSize: '1em'}} variant='display1'> </Typography>
                            </CardContent>

                            <CardActions className={classes.buttonContainer}>
                                <Button href='register' color={'secondary'} variant='raised' size="large" className={classes.mainButton}>Register</Button>
                                <Button onClick={this.login} type="submit" color={'secondary'} variant='raised' size="large" className={classes.mainButton}>Login</Button>
                            </CardActions>
                        </form>
                    </Card>
            </Dialog >
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
