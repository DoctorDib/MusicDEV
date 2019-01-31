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
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CircularProgress from '@material-ui/core/CircularProgress';

import LogoIcon from '../../../img/icon.png';

import theme from '../../../styles/theme'

// Settings
import Settings from './SettingsComponent';
import Help from './HelpComponent';
import GenreButtons from './FooterComponents/RecommendationComponent/index';
import FooterComponent from './FooterComponents';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';
import Paper from "@material-ui/core/Paper/Paper";


class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,
            settingsOpen: false,
            helperOpen: false,
            activeSettings: false, // Deciding if first time set up or if user has opened the settings

            // Profile information
            profileName: 'Loading...',
            profileUsername: '',
            profilePic: '',
            profilePicLoading: 'block',
            profilePicActive: 'none',
            profileLink: 'https://www.spotify.com/uk/',
            profileAccessToken: '',
            profilePlaylists: [],
            playlistNames: {},
            newUser: false,
            privatePlaylist: false,

            // Current playing
            currentPlayingSong: '',
            currentPlayingAuthor: '',
            currentPlayingImage: '',

            // Notifications
            warningNotification: '',
            errorNotification: '',
            learningNotification: '',
            warningSnack: false,

            tableRecommendation: []
        };
    }

    grabCurrentSong = () => {
        Axios.get('currentSong', {
            params: {
                username: this.state.profileUsername
            }
        })
            .then(resp => {
                console.log(resp)
                if(resp.data.isPlaying){
                    this.setState({
                        warningNotification: '', // Clearing the warnings
                        currentPlayingSong: resp.data.song,
                        currentPlayingAuthor: resp.data.artist,
                        currentPlayingImage: resp.data.image,
                        warningSnack: false,
                    });
                } else {
                    this.setState({
                        warningNotification: 'Warning: Spotify paused',
                        currentPlayingSong: '',
                        currentPlayingAuthor: '',
                        currentPlayingImage: 'https://visualpharm.com/assets/129/Question%20Mark-595b40b85ba036ed117dc3b0.svg',
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
        });
    };

    initialLoad = () => {
        Axios.get('initial')
            .then((resp) => {
                if(resp.data.success){
                    this.setState({
                        settingsOpen: resp.data.new_user,
                        profilePlaylists: resp.data.playlists,
                        newUser: resp.data.new_user,
                        profileName: resp.data.userAccount.displayName,
                        profileUsername: resp.data.userAccount.id,
                        profilePic: resp.data.userAccount.photos[0],
                        profileLink: resp.data.userAccount.profileUrl,
                        profilePicLoading: 'none',
                        profilePicActive: 'block',
                        privatePlaylist: resp.data.privatePlaylist,
                        playlistName: resp.data.playlistName
                    });
                } else {
                    this.setState({
                        errorNotification: 'Error: Session timeout, please logout and then back in...',
                        warningSnack: true
                    });
                }
            })
            .catch((err) => {
                console.log("Initial load error: ", err);
            });
    };

    refreshToken = () => {
        console.log("Refreshed")
        Axios.post('refreshToken',  {
            params: {
                username: this.state.profileUsername
            }
        });
    };

    componentDidMount() {
        this.initialLoad();

        window.setInterval(() => {
            if (this.state.listening){
                this.grabCurrentSong();
            }
        }, 1000);
    };

    handleRedirect = url => () => {
        window.location.href=url;
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

    updateState = params => {
        this.setState({[params.title]: params.value});
    };


    handleListen = () => {
        this.setState({
            listening: !this.state.listening
        });
    };

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <Paper square className={classes.topBar}>
                    <div>
                        <img src={LogoIcon} style={{backgroundColor: '#bcbdbc', height: '100%', width: '50px'}}/>
                        {this.state.currentPlayingImage ? <img src={this.state.currentPlayingImage} style={{height: '100%', width: '50px'}}/> : null}
                        <div className={classes.listenText}>
                            <Typography noWrap={true} >{this.state.currentPlayingSong}</Typography>
                            <Typography noWrap={true} variant="caption">{this.state.currentPlayingAuthor}</Typography>
                        </div>
                    </div>

                    <div className={classes.topButtonOptions}>
                        <Tooltip disableFocusListener disableTouchListener title="Toggle Listen">
                            <FormControlLabel control={<Switch checked={this.state.listening} onClick={this.handleListen} />} label="Toggle Listening" />
                        </Tooltip>
                        <Tooltip disableFocusListener disableTouchListener title="Help">
                            <Button onClick={this.handleClickOpen('helperOpen', true)}><HelpIcon style={{fontSize: '20'}}/></Button>
                        </Tooltip>
                        <Tooltip disableFocusListener disableTouchListener title="Settings">
                            <Button onClick={this.handleClickOpen('settingsOpen', true)}><SettingsIcon style={{fontSize: '20'}}/></Button>
                        </Tooltip>
                        <Tooltip disableFocusListener disableTouchListener title="Logout">
                            <Button onClick={this.handleRedirect('/logout')} ><LogoutIcon /> </Button>
                        </Tooltip>
                    </div>
                </Paper>

                <section className={classes.header} style={{zIndex: '1'}}>
                    <section className={classes.titleContainer} style={{position: 'fixed', zIndex: '0', top: '100px'}}>
                        <Typography variant='display4' className={classes.title} style={{color: 'rgba(0, 0, 0, 0.46)', fontSize: '4.5em'}}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild} style={{color: 'rgba(0, 0, 0, 0.46)', fontSize: '1em'}}> Finding the right music </Typography>
                    </section>

                    <Typography id={"Error"}>{this.state.errorNotification}</Typography>

                    <Settings
                        open={this.state.settingsOpen}
                        newUser={this.state.newUser}
                        close={(params) => this.handleClose(params)}
                        playlistNames={this.state.playlistNames}
                        profilePlaylists={this.state.profilePlaylists}
                        username={this.state.profileUsername}
                        accessToken={this.state.profileAccessToken}
                        privatePlaylist={this.state.privatePlaylist}
                    />

                    <Help
                        open={this.state.helperOpen}
                        close={(params) => this.handleClose(params)}
                    />

                    <h1> {this.state.learning} </h1>
                </section>

                <FooterComponent
                    tableContent={this.state.tableRecommendation}
                    currentPlayingSong={this.state.currentPlayingSong}
                    currentPlayingAuthor={this.state.currentPlayingAuthor}
                    currentPlayingImage={this.state.currentPlayingImage}
                    username={this.state.profileUsername}
                    updateTable={(params) => this.updateState(params)}

                    profileName={this.state.profileName}
                    profileUsername={this.state.profileUsername}
                    profilePic={this.state.profilePic}
                    profilePicLoading={this.state.profilePicLoading}
                    profilePicActive={this.state.profilePicActive}
                    profileLink={this.state.profileLink}
                />

                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    open={this.state.warningSnack}
                    variant="warning"
                    action={[
                        this.state.warningNotification === 'Warning: New update from server, please refresh...' ?
                            <Button key="undo" color="secondary" size="small" onClick={this.handleRedirect('/')}>
                                Refresh
                            </Button> :
                            this.state.errorNotification === 'Error: Session timeout, please logout and then back in...' ?
                                <Button key="undo" size="small" onClick={this.refreshToken()}>
                                    ReLog
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
