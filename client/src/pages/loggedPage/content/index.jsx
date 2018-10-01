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

var currentPage, initialSetUp = false;

import styles from '../../../styles/mainStyle';

class Template extends React.Component {
    state = { value: 0 };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    componentWillMount() {
    }

    render(){
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <section className={classes.body}>

                <section id="accountHolder" className={classes.accountHolder}>
                    <img id="profilePic" className={classes.profilePic}/>
                    <section id="profileArea" className={classes.profileArea}>
                        <Typography id="profileUserName" className={classes.profileUserName}> </Typography>
                        <Typography id="profileName" className={classes.profileName}> Not Logged In </Typography>
                    </section>
                    <Typography> <a href="logout" id="profileLogout" className={classes.prolfileLogout}> <i class="fas fa-sign-out-alt"></i> Logout </a> </Typography>
                </section>

                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>
                </section>
            </section>
        );
    }
};

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
