import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import SpotifyIcon from 'mdi-react/SpotifyIcon';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

// Content
import About from './AboutComponent/index';

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

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <Paper className={classes.header} square style={{height: '40%', backgroundColor: '#252525'}}>
                    <section className={classes.titleContainer} style={{marginTop: '1em', marginBottom: '1em'}}>
                        <Typography variant='display4' className={classes.title} style={{font: '150px'}}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>
                    
                </Paper>
                <section style={{display: 'flex', flexDirection: 'row'}}>
                    <Button href={'/auth/spotify'} color={'secondary'} variant='raised' size="large" className={classes.mainButton}><SpotifyIcon style={{marginRight: '0.5em'}}/>Login</Button>
                    <Button color={'secondary'} variant='raised' size="large" className={classes.mainButton} onClick={this.scrollTop}>About</Button>
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
