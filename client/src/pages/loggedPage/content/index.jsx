import React from 'react';
import PropTypes from 'prop-types';

import Axios from 'axios';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import WarningIcon from '@material-ui/icons/Warning';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

<<<<<<< HEAD
=======
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile'

// Settings
import Settings from './playlistContainer'

>>>>>>> d6c8f9d... New methods added
import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,
            buttonTitle: 'Activate',
            settingsOpen: false,

            // Profile information
            profileName: 'Not logged in',
            profileUsername: '',
            profilePic: '',
<<<<<<< HEAD
=======
            profileAccessToken: '',
            profilePlaylists: [],
            playlistNames: {},
            newUser: false,
>>>>>>> d6c8f9d... New methods added

            // Current playing
            currentPlayingSong: '',
            currentPlayingAuthor: '',

            // Notifications
            warningNotification: '',
            errorNotification: '',
            learningNotification: '',
            warningSnack: false,
        };
    }

    initialLoad = (cookie) => {
        Axios.get('initialLoad', {
            params: {
                username: cookie.username,
                access_token: cookie.access_token
            }})
        .then(resp => {
            this.setState({
<<<<<<< HEAD
                profileName: resp.data.name,
                profileUsername: resp.data.username,
                profilePic: resp.data.pic
=======
                settingsOpen: resp.data.new_user,
                profilePlaylists: resp.data.playlists,
                newUser: resp.data.new_user,
                profileAccessToken: cookie.access_token
>>>>>>> d6c8f9d... New methods added
            });
        }).catch(error => {
            console.log(error);
        })
    };

    grabCurrentSong = () => {
        Axios.get('currentSong', {
            params: {
                username: this.state.profileUsername
            }
        })
        .then(resp => {
            if(resp.data.isPlaying){
                this.setState({
                    warningNotification: '', // Clearing the warnings
                    currentPlayingSong: resp.data.song,
                    currentPlayingAuthor: resp.data.artist,
                    warningSnack: false,
                });
            } else {
                this.setState({
                    warningNotification: 'Warning: Spotify paused',
                    currentPlayingSong: '',
                    currentPlayingAuthor: '',
                    warningSnack: true,
                });
            }
        }).catch(err =>{
            switch(err.response.status){
                case 502:
                    this.setState({
                        warningNotification: 'Warning: New update from server, please refresh...',
                        warningSnack: true
                    });
                    break;
                case 500:
                    this.setState({
                        errorNotification: 'Error: Disconnected from the server, please refresh...',
                    });
                    break;
            }
            this.setState({listening: false})
        })
    };

    toggleListen = () => {
        this.setState({
            buttonTitle: this.state.listening ? 'Activate' : 'Deactivate',
            listening: !this.state.listening
        });
    };

    learn = () => {
        // Resetting
        this.setState({
            warningNotification: '',
            warningSnack: false,
        });

        let learningPlaylists = this.state.playlistNames;
        let tmpArr = [];
        let count=0;

        for (let index in learningPlaylists){
            count ++;
            if(learningPlaylists[index].active){
                tmpArr.push(learningPlaylists[index].id)
            }
        }

        if(tmpArr.length){
            Axios.get('grabPlaylistGenre', {
                params: {
                    username: this.state.profileUsername,
                    access_token: this.state.profileAccessToken,
                    playlists: tmpArr
                }})
                .then(resp => {

                    console.log(resp)
                }).catch(error => {
                console.log(error);
            });
        } else if (count > 50) {
            this.setState({
                // Setting max of 50 playlists because that's the cap of the spotify music feature grabber.
                warningNotification: 'You can only chose a max of 50 playlists',
                warningSnack: true,
            });
        } else {
            this.setState({
                warningNotification: 'Please select at least one playlist...',
                warningSnack: true,
            });
        }
    }

    componentDidMount() {
        let cookie = JSON.parse(Cookies.get('spotify'));
        console.log(cookie)
        console.log(cookie.username)
        this.setState({
            profileName: cookie.name,
            profileUsername: cookie.username,
            profilePic: cookie.image
        });

        this.initialLoad(cookie);


        window.setInterval(() => {
            if (this.state.listening){
                this.grabCurrentSong();
            }
        }, 1000);
    };

    refresh() {
        window.location.href = '/';
    };

    handleClickOpen = target => () => {
        this.setState({ [target]: true });
    };

    //handleClose = target => () => {
    handleClose = target => () => {
        this.setState({ [target]: false });
    };

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <section id="accountHolder" className={classes.accountHolder}>
                    <img id="profilePic" className={classes.profilePic} src={this.state.profilePic}/>
                    <section id="profileArea" className={classes.profileArea}>
                        <Typography id="profileUserName" className={classes.profileUserName}>{this.state.profileName}</Typography>
                        <Typography id="profileName" className={classes.profileName}>{this.state.profileUsername}</Typography>
                    </section>
                    <Typography> <a href="logout" id="profileLogout" className={classes.profileLogout}><p className="fas fa-sign-out-alt"></p> Logout </a> </Typography>
                </section>

                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <Button onClick={this.toggleListen} color={'secondary'} variant='raised' size="large" className={classes.mainButton}>{this.state.buttonTitle}</Button>
                    <Typography id={"Error"}>{this.state.errorNotification}</Typography>

<<<<<<< HEAD
=======
                    { this.state.newUser == true && <Settings playlist={this.state.playlistNames}/> }
                    <Settings
                        open={this.state.settingsOpen}
                        newUser={this.state.newUser}
                        closeIt={this.handleClose}
                        playlistNames={this.state.playlistNames}
                        profilePlaylists={this.state.profilePlaylists}
                        username={this.state.profileUsername}
                        accessToken={this.state.profileAccessToken}
                    />
                    <h1> {this.state.learning} </h1>


>>>>>>> d6c8f9d... New methods added
                    <section className={classes.currentContainer}>
                        <section className={classes.currentPlaying}>
                            <section className={classes.currentInformation}>
                                <Typography className={classes.currentTitle}>Song:</Typography>
                                <Typography className={classes.currentInfo}>{this.state.currentPlayingSong}</Typography>
                            </section>
                            <section className={classes.currentInformation}>
                                <Typography className={classes.currentTitle}>Author:</Typography>
                                <Typography className={classes.currentInfo}>{this.state.currentPlayingAuthor}</Typography>
                            </section>
                        </section>
                    </section>
                </section>

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.warningSnack}
                    variant="warning"
                    action={[
                        this.state.warningNotification === 'Warning: New update from server, please refresh...' ?
                            <Button key="undo" color="secondary" size="small" onClick={this.refresh}>
                                Refresh
                            </Button> : null
                    ]}
                    message={
                        <section>
                            <span className={classes.warningSnackbar}>
                                <WarningIcon style={{fontSize: '20'}}/>
                                {this.state.warningNotification}
                            </span>
                        </section>
                    }
                />
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
