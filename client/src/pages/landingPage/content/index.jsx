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

// Content
import About from './aboutContent';

function scrollIntoView (target) {
    jQuery('html, body').animate({scrollTop: target.offset().top}, 1000, function() {
        location.hash = target;
        target.focus();
        if (!target.is(":focus")) {
            target.attr('tabindex', '-1');
            target.focus()
        }
    });
}

class Template extends React.Component {
    state = { value: 0 };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render(){
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <section className={classes.body}>
                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <section className={classes.buttonContainer}>
                        <Typography> <a href="login" className={classes.mainButton}> Login </a> </Typography>
                        <Typography> <a className={classes.mainButton}> About </a> </Typography>
                    </section>
                </section>

                <About />
            </section>
        );
    }
};

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
