import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';

import LogoIcon from 'img/icon.png';

// Settings
import FooterComponent from './FooterComponents';
import WarningComponent from '../../warningComponent';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

import Paper from "@material-ui/core/Paper/Paper";
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Switch from '@material-ui/core/Switch';
import AppBar from '@material-ui/core/AppBar';
import FormControlLabel from '@material-ui/core/FormControlLabel';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,

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
            activePlaylists: [],
            newUser: false,
            privatePlaylist: false,
            history: [],

            // Current playing
            currentPlayingSong: '',
            currentPlayingAuthor: '',
            currentPlayingImage: '',

            // Notifications
            warningNotification: '',
            errorNotification: '',
            learningNotification: '',
            warningSnack: false,

            tableRecommendation: [],

            buttonOptions: {
                active: false,
                title: ''
            },
            warningOpen: false,
            warningError: false,
            warningMessage: '',
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
                        currentPlayingSong: resp.data.song,
                        currentPlayingAuthor: resp.data.artist,
                        currentPlayingImage: resp.data.image,

                        warningOpen: false,
                        warningError: false,
                        warningMessage: '',
                        buttonOptions: {active:false, title: ''},
                    });
                } else {
                    this.setState({
                        currentPlayingSong: '',
                        currentPlayingAuthor: '',
                        currentPlayingImage: 'https://visualpharm.com/assets/129/Question%20Mark-595b40b85ba036ed117dc3b0.svg',

                        warningOpen: true,
                        warningError: false,
                        warningMessage: 'Warning: Spotify paused',
                        buttonOptions: {active:false, title: ''},
                    });
                }
            }).catch(err =>{
                switch(err.response.status){
                    case 502:
                        this.setState({
                            warningOpen: true,
                            warningError: false,
                            warningMessage: 'Warning: New update from server, please refresh...',
                            buttonOptions: {active:true, title: 'Refresh'},
                        });
                        break;
                    case 500:
                    case 401:
                        this.setState({
                            warningOpen: true,
                            warningError: true,
                            warningMessage: 'Error: Disconnected from the server, please refresh...',
                            buttonOptions: {active:true, title: 'Refresh'},
                        });
                        break;
                }
            this.setState({listening: false})
        });
    };

    initialLoad = () => {
        Axios.get('initial')
            .then((resp) => {
                console.log("initial data: ", resp)
                if(resp.data.success){
                    this.setState({
                        profilePicLoading: 'none',
                        profilePicActive: 'block',
                        profilePic: resp.data.userAccount.photos[0],
                        profilePlaylists: resp.data.playlists,
                        newUser: resp.data.new_user,
                        profileName: resp.data.userAccount.displayName,
                        profileUsername: resp.data.userAccount.id,
                        profileLink: resp.data.userAccount.profileUrl,
                        privatePlaylist: resp.data.privatePlaylist,
                        playlistName: resp.data.playlistName,
                        activePlaylists: resp.data.activePlaylists,
                        history: resp.data.history,
                    });
                } else {
                    this.setState({
                        warningOpen: true,
                        warningError: true,
                        warningMessage: 'Error: Session timeout, please logout and then back in...',
                        buttonOptions: {active:false, title: ''},
                    });
                }
            })
            .catch((err) => {
                console.log("Initial load error: ", err);
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
                        <img src={LogoIcon} style={{marginLeft: '5px', height: '100%', width: '50px'}}/>
                        {this.state.currentPlayingImage ? <img src={this.state.currentPlayingImage} style={{height: '100%', width: '50px'}}/> : null}
                        <div className={classes.listenText}>
                            <Typography noWrap={true} >{this.state.currentPlayingSong}</Typography>
                            <Typography noWrap={true} variant="caption">{this.state.currentPlayingAuthor}</Typography>
                        </div>
                    </div>

                    <div className={classes.topButtonOptions}>
                        <Tooltip disableFocusListener disableTouchListener title="Toggle Listen">
                            <FormControlLabel color="primary" control={<Switch checked={this.state.listening} color="primary" onClick={this.handleListen} />} label="Toggle Listening" />
                        </Tooltip>
                    </div>
                </Paper>

                <AppBar className={classes.header} color="secondary">
                    <section className={classes.titleContainer} >
                        <Typography variant='display4' color="secondary" className={classes.title} style={{fontSize: '4.5em'}}>MusicDEV</Typography>
                        <Typography variant='display1' color="secondary" className={classes.titleChild} style={{fontSize: '1em'}}>Finding the right music</Typography>
                    </section>
                </AppBar>

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

                    newUser={this.state.newUser}
                    playlistNames={this.state.playlistNames}
                    profilePlaylists={this.state.profilePlaylists}
                    accessToken={this.state.profileAccessToken}
                    privatePlaylist={this.state.privatePlaylist}
                    activePlaylists={this.state.activePlaylists}
                    history={this.state.history}
                />

                <WarningComponent
                    buttonOptions={this.state.buttonOptions}
                    warningOpen={this.state.warningOpen}
                    warningError={this.state.warningError}
                    warningMessage={this.state.warningMessage}
                />
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
