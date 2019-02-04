import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';

import Waypoint from 'react-waypoint';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

const posts = [
    {
        title: 'Pop-up Errors / Warnings',
        subtitle: 'Know your errors / Warnings',
        contentImg: '',
        content: [
            {type: 'text', content: `
                All of the following message can be found in a small pop up window at the bottom left of your screen,
                with either a warning or error icon. Some of the pop ups contain a button that fixes the issue stated.   
            `},
            {type: 'title', content: `
                Warning: Spotify paused
            `}, {type: 'text', content: `
                This message will occur while having the 'Toggle Listen' feature active and your spotify (either Web 
                application, mobile application or PC application) music has been / or is paused. Message will disappear 
                when music has been resumed. Please give up to 10 seconds max, if warning message does not disappear 
                after said time, then refresh page. 
            `},
            {type: 'newline', content: `\n`},
            {type: 'title', content: `
                Warning: New update from server, please refresh...
            `}, {type: 'text', content: `
                This message will occur when you make any calls to the server, then to receive a 502 response indicating 
                that there has been a server side change. This message will also come with a button, allowing the user 
                to easily refresh by clicking.
            `},
            {type: 'title', content: `
                Error: Disconnected from the server, please refresh...
            `}, {type: 'text', content: `
                This message will occur when trying to many any calls to the server, then to receive a 401 response. User 
                would be recommended to logout and then log back in.  
            `},
            {type: 'title', content: `
                Error: Session timeout, please logout and then back in...
            `}, {type: 'text', content: `
                This message will occur when trying to make any calls to the server, then to receive an error message from 
                the spotify API. This indicates that the users cookie (held within the web browser) has met its expiry 
                date. This error message comes with a relog button that sends the users through the spotify login stage, 
                since the API remembers the last person who logs in, user does not require to type 'username' or 'password'.    
            `},
        ]
    }, {
        title: 'Using the right Access',
        subtitle: 'What access do we need from you',
        contentImg: '',
        content: [
            {type: 'text', content: `
                During your Spotify login, you will be prompt with a list of permissions that we require access to, 
                we require to provide you with the best recommended songs. The following scopes are as follows:
            `},
            {type: 'title', content: `
                Playlist-modify-public
            `}, {type: 'text', content: `
                We require access to your public playlist in order for MusicDEV to learn your taste in music.
            `},
            {type: 'title', content: `
                Playlist-modify-private
            `}, {type: 'text', content: `
                We require access to your private playlist in order for MusicDEV to learn your taste in music.
            `},
            {type: 'title', content: `
                User-read-private
            `}, {type: 'text', content: `
                Giving us the ability to search for tracks on playlists and to also show you your profile when logged in.
            `},
            {type: 'title', content: `
                User-top-read (Top tracks and playlists)
            `}, {type: 'text', content: `
                Giving us the ability to search for tracks on playlists and to also show you your profile when logged in.
            `},
            {type: 'title', content: `
                Playlist-read-collaborative (list of user playlists)
            `}, {type: 'text', content: `
                Gives us the ability to find your most popular tracks/playlists that you listen to on a day-to-day basis. 
                Will help us find the best recommended music when compared with your current favourite music.
            `},
            {type: 'title', content: `
                User-modify-playback-state
            `}, {type: 'text', content: `
                This scope will give you full access to controlling your spotify music from MusicDEV, meaning you don’t 
                have to fuss around trying to find your Spotify application.
            `},
            {type: 'title', content: `
                User-read-currently-playing
            `}, {type: 'text', content: `
                MusicDEV has a constant listening ability, that finds tracks that you may like and then automatically 
                adds the track to your current playlist.
            `},
            {type: 'text', content: `
                If you wish to know more about the scopes and permissions that we will be using, then you can read more 
                here: https://developer.spotify.com/documentation/general/guides/scopes/
            `}
        ]
    }, {
        title: 'More about Music DEV',
        subtitle: 'What access do we need from you',
        contentImg: '',
        content: [
            {type: 'title', content: `
                What is MusicDEV?
            `},{type: 'text', content: `
                MusicDEV is a clever program that learns on the go. From learning while you’re listening to your music, 
                to learning from your playlists, we try our very best to provide the music that best suits you.
            `},
            {type: 'title', content: `
                How do I use MusicDEV?
            `}, {type: 'text', content: `
                MusicDEV has a clean and easy to use interface with limited buttons to press. You simply need to login 
                using your spotify account information. You’ll then be prompt with ‘Scope permissions’, these permissions 
                will allow us access to your spotify music, giving you a full personalised music experience.
            `}, {type: 'text', content: `
                Once logged in, select a playlist that you wish MusicDEV to learn from (WARNING: MusicDEV will add the 
                recommended music to your current playing playlist) - once selected, just click play and ENJOY!
            `}, {type: 'text', content: `
                If you do not like the current recommended music, you can easily click the thumbs down button which 
                will delete that track from your playlist.
            `}
        ]
    }
];

class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            activeStep: 0,
        }
    }

    handleStep = step => () => {
        document.getElementById('helperContent').scroll({
            top: document.getElementById(step).offsetTop - 60, // Has a slight offset for some reason?
            behavior: 'smooth'
        });

        this.setState({
            activeStep: step,
        });
    };

    handleScroll = count => () => {
        console.log(count);
        this.setState({
            activeStep: count,
        });
    };

    componentWillReceiveProps(props) {
        if(props.open !== this.props.open){
            this.setState({
                open: props.open,
            });
        }
    }

    render(){
        const { classes } = this.props;
        const stepper = posts.map((help, index) =>
            <Step key={help.title}>
                <StepButton onClick={this.handleStep(index)}>
                    {help.title}
                </StepButton>
            </Step>
        );

        const content = posts.map((post, index) =>
            <div className={classes.helperHelp} id={index}>
                <Waypoint onEnter={this.handleScroll(index)} />

                <AppBar color="primary" className={classes.helperHeader}>
                    <Typography color="secondary" variant='display1' className={classes.helperTitle}> {post.title} </Typography>
                    <Typography color="secondary" variant='caption' className={classes.helperSubtitle}> {post.subtitle} </Typography>
                </AppBar>
                <Card className={classes.helperCard}>
                    <section className={classes.helperContent}>
                        {post.contentImg ? (<img className={classes.helperImg} src={post.contentImg}/>) : (<img className={classes.disabled}/>)}
                        {post.content.map(paragraph => (
                            paragraph.type !== "text" ?
                                paragraph.type !== "image" ?
                                    <Typography variant="title" gutterBottom style={{marginTop: '.5em'}}> {paragraph.content} </Typography>
                                    : <img src={paragraph.content} className={classes.helperImg}/>
                                : <Typography gutterBottom> {paragraph.content} </Typography>
                        ))}
                    </section>
                </Card>
            </div>
        );

        return (
            <Dialog
                open={this.state.open}
                onClose={this.props.close('helperOpen')}
                aria-labelledby="form-dialog-title"
                title="Helper"
                fullWidth={'lg'}
                maxWidth={'lg'}
            >
                <AppBar className={classes.menuHeader} color="primary">
                    <DialogTitle className={classes.settingsTitle}>Helper</DialogTitle>
                    <Button onClick={this.props.close('helperOpen')}> X </Button>
                </AppBar>

                <section className={classes.helperBody}>
                    <Stepper nonLinear activeStep={this.state.activeStep} orientation="vertical" style={{width: '10%'}}>
                        {stepper}
                    </Stepper>
                    <Card className={classes.helperContent} id={"helperContent"} style={{padding: '1em'}} >
                        {content}
                    </Card>
                </section>
            </Dialog>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);