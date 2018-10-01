import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withStyles } from '@material-ui/core/styles';

import styles from '../../../styles/mainStyle'

var currentPage, initialSetUp = false;

class Template extends React.Component {
    state = { value: 0 };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render(){
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <section>
                <Typography> <a className={classes.backHome} href="welcome"> &#x3c; </a> </Typography>
                <section className={classes.header}>

                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <form className={classes.loginContainer} action="/login" method="post">
                        <Typography variant="title" className={classes.loginLabel}> Username </Typography>
                        <input id="username" name="username" className={classes.loginInput}/>
                        <Typography variant="title" className={classes.loginLabel}> Password </Typography>
                        <input type="password" id="password" name="password" className={classes.loginInput}/>

                        <section className={classes.buttonContainer}>
                            <Typography> <button type="submit" className={classes.mainButton}> Login </button> </Typography>
                            <Typography> <a href='register' className={classes.mainButton}> Register </a> </Typography>
                        </section>
                    </form>
                </section>
            </section>
        );
    }
};

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
