import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

// Content
import About from './aboutContent';

class Template extends React.Component {
    constructor(props) {
        super(props);
    }

    scrollTop = () => {
        window.scroll({
            top: document.querySelector('#aboutContainer').getClientRects()[0].top,
            left  : 0,
            behavior: 'smooth',
        });
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
                        <Button href={'/spotify_login'} color={'secondary'} variant='raised' size="large" className={classes.mainButton}>Spotify Login</Button>
                        <Button color={'secondary'} variant='raised' size="large" className={classes.mainButton} onClick={this.scrollTop}>About</Button>
                    </section>
                </section>

                <About />
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
