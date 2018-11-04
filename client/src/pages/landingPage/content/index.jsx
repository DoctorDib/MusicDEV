import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import LoginDialog from './loginDialog';
import RegisterDialog from './registerDialog';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

// Content
import About from './aboutContent';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loginOpen: false,
            registerOpen: false
        };
    }

    scrollTop = () => {
        window.scroll({
            top: document.querySelector('#aboutContainer').getClientRects()[0].top,
            left  : 0,
            behavior: 'smooth',
        });
    };

    handleClickOpen = target => () => {
        this.setState({ [target]: true });
    };

    handleClose = target => () => {
        this.setState({ [target]: false });
    };

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <section>
                        <Button onClick={this.handleClickOpen('loginOpen')} color={'secondary'} variant='raised' size="large" className={classes.mainButton}>Login</Button>
                        <Button onClick={this.handleClickOpen('registerOpen')} color={'secondary'} variant='raised' size="large" className={classes.mainButton}>Register</Button>
                        <Button color={'secondary'} variant='raised' size="large" className={classes.mainButton} onClick={this.scrollTop}>About</Button>
                    </section>
                </section>

                <LoginDialog open={this.state.loginOpen} close={this.handleClose}/>
                <RegisterDialog open={this.state.registerOpen} close={this.handleClose}/>

                <About />
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
