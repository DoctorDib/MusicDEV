import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';

import styles from './style';
import LogoIcon from 'img/icon.png';

// Settings
import FooterComponent from './FooterComponents';
import WarningComponent from '../../../Components/warningComponent';
import NewUserComponent from './NewUserComponent';

import Paper from "@material-ui/core/Paper/Paper";
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';

import { withStyles } from '@material-ui/core/styles';

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
            playlistActive: false,
            history: [],

            // Notifications
            warningNotification: '',
            errorNotification: '',
            learningNotification: '',
            warningSnack: false,

            tableRecommendation: [],
            accuracy: 0,

            buttonOptions: {
                active: false,
                title: ''
            },
            warningOpen: false,
            warningError: false,
            warningMessage: '',

            newUserOpen: false,

            desktopMode: window.innerWidth >= 500
        };
    }

    initialLoad = () => {
        Axios.get('initial')
            .then((resp) => {
                if (resp.data.success) {
                    console.log(resp.data.accuracy)
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
                        playlistActive: resp.data.playlistActive,
                        playlistName: resp.data.playlistName, // TODO - MAY NOT BE NEEDED
                        activePlaylists: resp.data.activePlaylists,
                        history: resp.data.history,
                        newUserOpen: resp.data.new_user,
                        accuracy: resp.data.accuracy,
                    });
                } else {
                    this.setState({
                        warningOpen: true,
                        warningError: true,
                        warningMessage: 'Error: Session timeout, please logout and then back in...',
                        buttonOptions: { active:false, title: '' },
                    });
                }
            })
            .catch((err) => {
                console.log("Initial load error: ", err);
            });
    };

    handleClose = (params) => {
        this.setState({[params]: false})
    };

    componentDidMount() {
        this.initialLoad();
    };

    updateState = params => {
        this.setState({[params.title]: params.value});
    };

    newUserActivePlaylist = params => {
        this.setState({activePlaylists: params});
    };

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body} style={{background: "pink"}}>
                {this.state.desktopMode ?
                    <AppBar className={classes.header} style={{height: '15%'}} color="secondary">
                        <section className={classes.titleContainer}>
                            <Typography variant='display4' color="secondary" className={classes.title}
                                        style={{fontSize: '4.5em'}}>MusicDEV</Typography>
                            <Typography variant='display1' color="secondary" className={classes.titleChild}
                                        style={{fontSize: '1em'}}>Finding the right music</Typography>
                        </section>
                    </AppBar>
                : null}

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
                    accuracy={this.state.accuracy}

                    newUser={this.state.newUser}
                    profilePlaylists={this.state.profilePlaylists}
                    accessToken={this.state.profileAccessToken}
                    privatePlaylist={this.state.privatePlaylist}
                    playlistActive={this.state.playlistActive} // To determine is user has a musicDEV playlist
                    activePlaylists={this.state.activePlaylists}
                    history={this.state.history}
                    desktopMode={this.state.desktopMode}
                />

                <NewUserComponent
                    open={this.state.newUserOpen}
                    profilePlaylists={this.state.profilePlaylists}
                    newUser={this.state.newUser}
                    username={this.state.profileUsername}
                    activePlaylists={this.state.activePlaylists}
                    close={params => this.handleClose(params)}
                    newUserActivePlaylist={params => this.newUserActivePlaylist(params)}
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
