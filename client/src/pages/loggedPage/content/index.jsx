import React from 'react';
import PropTypes from 'prop-types';

import Axios from 'axios';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import WarningIcon from '@material-ui/icons/Warning';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import ListenIcon from '@material-ui/icons/Headset';
import HelpIcon from '@material-ui/icons/Help';

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
import Tooltip from '@material-ui/core/Tooltip';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile'

// Settings
import Settings from './playlistContainer'

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,
            settingsOpen: false,
            activeSettings: false, // Deciding if first time set up or if user has opened the settings
            color: 'rgba(81,81,81,0)',

            // Profile information
            profileName: 'Not logged in',
            profileUsername: '',
            profilePic: '',
            profileAccessToken: '',
            profilePlaylists: [],
            playlistNames: {},
            newUser: false,

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
            console.log(">>", resp.data)
            if(resp.data.success){
                this.setState({
                    settingsOpen: resp.data.new_user,
                    profilePlaylists: resp.data.playlists,
                    newUser: resp.data.new_user,
                    profileAccessToken: cookie.access_token
                });
            } else {
                this.setState({
                    errorNotification: 'Error: Session timeout, please logout and then backin...',
                    warningSnack: true
                })
            }
        }).catch(error => {
            console.log(error);
        });
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
                case 401:
                    this.setState({
                        errorNotification: 'Error: Disconnected from the server, please refresh...',
                    });
                    break;
            }
            this.setState({listening: false})
        })
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
                    this.setState({playlistNames: resp})
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

    relog() {
        window.location.href = '/spotify_login';
    };

    handleClickOpen = (target, settings) => () => {
        if(settings){
            this.setState({activeSettings: true})
        }
        this.setState({ [target]: true });
    };

    //handleClose = target => () => {
    handleClose = target => () => {
        this.setState({ [target]: false });
        //this.setState({ [target]: false });
    };

    handleEventClose = target => {
        this.setState({ [target]: false });
    };

    handleLogout = () => {
        window.location.href="logout";
    }

    handleChange = name => event => {
        this.setState({ [name]: event.target.checked });
    };

    handleListen = event => {
        this.setState({
            listening: !this.state.listening,
            color: this.state.listening ? 'rgba(81,81,81,0)' : 'rgba(81,81,81,0.8)'
        });
    }

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <section className={classes.topBar}>
                    <Tooltip disableFocusListener disableTouchListener title="Toggle Listen">
                        <Button style={{backgroundColor: this.state.color}} onClick={this.handleListen}>
                            <ListenIcon style={{fontSize: '20'}}/>
                        </Button>
                    </Tooltip>
                    <Tooltip disableFocusListener disableTouchListener title="Settings">
                        <Button onClick={this.handleClickOpen('settingsOpen', true)} className={classes.profileSettings}><SettingsIcon style={{fontSize: '20'}}/></Button>
                    </Tooltip>
                    <Tooltip disableFocusListener disableTouchListener title="Help">
                        <Button><HelpIcon style={{fontSize: '20'}}/></Button>
                    </Tooltip>
                    <Tooltip disableFocusListener disableTouchListener title="Logout">
                        <Button onClick={this.handleLogout} ><LogoutIcon /> </Button>
                    </Tooltip>
                </section>

                <section id="accountHolder" className={classes.accountHolder}>
                    <img id="profilePic" className={classes.profilePic} src={this.state.profilePic}/>
                    <section id="profileArea" className={classes.profileArea}>
                        <Typography id="profileUserName" className={classes.profileUserName}>{this.state.profileName}</Typography>
                        <Typography id="profileName" className={classes.profileName}>{this.state.profileUsername}</Typography>
                    </section>
                </section>

                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <Typography id={"Error"}>{this.state.errorNotification}</Typography>

                    <Settings
                        open={this.state.settingsOpen}
                        newUser={this.state.newUser}
                        close={this.handleClose}
                        closeIt={this.handleEventClose}
                        playlistNames={this.state.playlistNames}
                        profilePlaylists={this.state.profilePlaylists}
                        username={this.state.profileUsername}
                        accessToken={this.state.profileAccessToken}
                    />
                    <h1> {this.state.learning} </h1>


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
                            </Button> :
                            this.state.errorNotification === 'Error: Session timeout, please logout and then backin...' ?
                                <Button key="undo" color="secondary" size="small" onClick={this.relog}>
                                    relog
                                </Button> : null
                    ]}
                    message={
                        <section>
                            <span className={classes.warningSnackbar}>
                                <WarningIcon style={{fontSize: '20'}}/>
                                {this.state.warningNotification ? this.state.warningNotification : null}
                                {this.state.errorNotification ? this.state.errorNotification : null}
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
