import React from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import Axios from 'axios';

import styles from './style';

import Button from '@material-ui/core/Button';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import InputLabel from "@material-ui/core/InputLabel/InputLabel";

import { withStyles } from '@material-ui/core/styles';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlist: {},
            open: this.props.open || false,
            activePlaylist: [],
            playlistNames: {},
            activePlaylists: [],

            profilePlaylists: [],
            profileUsername: '',

            newUser: false,
            learnDisabled: false,
            loading: 'none',

            playlistName: '',
            playlist_privacy: true,

            playlistChanges: false,
            playlistNameChanges: false,
            playlistPrivateChanges: false,

            settingChanges: [],
        };
    }

    sortActiveButtons = () =>{
        let tmpActivePlaylist = this.state.activePlaylist;
        let tmpPlaylistNames = this.state.playlistNames;

        for(let index in tmpActivePlaylist){
            if(tmpActivePlaylist.hasOwnProperty(index)){
                if(!tmpPlaylistNames.hasOwnProperty(tmpActivePlaylist[index])){
                    tmpPlaylistNames[tmpActivePlaylist[index]] = {}
                }

                tmpPlaylistNames[tmpActivePlaylist[index]].id = tmpActivePlaylist[index];
                tmpPlaylistNames[tmpActivePlaylist[index]].active = true;
            }
        }

        this.setState({
            playlistNames: tmpPlaylistNames
        });
    };

    manageProps = (newProps) => {
        let newSelection = {};

        for (let prop in newProps) {
            if(newProps.hasOwnProperty(prop)) {
                if (newProps[prop] !== this.props[prop]) {
                    newSelection[prop] = newProps[prop];
                }
            }
        }

        return newSelection;
    };

    tickIt = (activePlaylists) => {
        let activeList = {};
        for (let uri in activePlaylists) {
            if (activePlaylists.hasOwnProperty(uri)) {
                activeList[activePlaylists[uri]] = activeList[activePlaylists[uri]] || {};
                activeList[activePlaylists[uri]].id = activePlaylists[uri];
                activeList[activePlaylists[uri]].active = true;
            }
        }
        return activeList;
    };

    componentDidMount(props) {
        this.setState({
            profilePlaylists: this.props.profilePlaylists,
            newUser: this.props.newUser,
            username: this.props.username,
            activePlaylists: this.props.activePlaylists,
        });

        if (this.props.activePlaylists) {
            this.setState({playlistNames: this.tickIt(this.props.activePlaylists)});
        }
    };

    componentWillReceiveProps(props){
        if (props.activePlaylists !== this.props.activePlaylists) {
            console.log("Scanning: ", props.activePlaylists)
            this.setState({playlistNames: this.tickIt(props.activePlaylists)});
        }

        console.log("New user? ", props.newUser)

        if (!props.newUser) {
            Axios.get('grabActivePlaylist', {
                params: {
                    username: props.username,
                }
            })
                .then((resp) => {
                    console.log("RESP: ", resp)
                    console.log("hi")
                    if(resp.data.hasOwnProperty('playlists')){
                        this.setState({
                            activePlaylist: resp.data.playlists
                        });
                        this.sortActiveButtons();
                    }
                })
                .catch((err) => {
                    console.log("Issue:", err)
                });
        }

        this.setState(this.manageProps(props));
    }

    learn = () => {
        // Resetting
        this.setState({
            warningNotification: '',
            warningSnack: false,
            learnDisabled: false,
            loading: 'none'
        });

        if (this.state.playlistChanges) {
            let learningPlaylists = this.state.playlistNames;
            let tmpArr = [];
            let count=0;

            for (let index in learningPlaylists) {
                if (learningPlaylists.hasOwnProperty(index)) {
                    count ++;
                    if (learningPlaylists[index].active) {
                        tmpArr.push(learningPlaylists[index].id)
                    }
                }
            }

            console.log(tmpArr)

            if(tmpArr.length){
                this.setState({
                    learnDisabled: true,
                    warningNotification: 'Learning',
                    warningSnack: true,
                    loading: 'block'
                });

                Axios.get('grabPlaylistGenre', {
                    params: {
                        username: this.state.profileUsername,
                        playlists: tmpArr
                    }})
                    .then(resp => {
                        if(resp.data.success){
                            console.log("Closing window")
                            this.setState({
                                learnDisabled: false,
                                warningSnack: false,
                                loading: 'none'
                            });
                        } else {
                            console.log("Please try again");
                        }
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

        if (this.state.playlistNameChanges || this.state.playlistPrivateChanges) {
            Axios.get('managePlaylist', {
                params: {
                    task: 'change_option',
                    data: {new_name: this.state.playlistName || 'default', privatePlaylist: this.state.privatePlaylist}
                }
            }).then(function (resp) {
                if (resp.success) {
                    // Notify user
                    console.log("Manage playlist complete")
                }
            }).catch(function(err) {
                console.error("Manage playlist: ", err)
            });
        }
    };

    handleChange = playlist => () => {
        let tmp = this.state.playlistNames;

        console.log("Playlist selection: ", playlist)
        console.log(tmp)

        if(!tmp.hasOwnProperty(playlist.id)){
            console.log("iniitalised")
            // Initialising it
            tmp[playlist.id] = {
                name: playlist.name,
                id: playlist.id,
                active: false,
            };
        }
        tmp[playlist.id] = {
            name: playlist.name,
            id: playlist.id,
            active: !tmp[playlist.id].active,
        };

        this.setState({
            playlistNames: tmp,
            playlistChanges: true,
        });
    };

    handleTextChange = name => event => {
        this.setState({
            playlistNameChanges: true,
            [name]: event.target.value,
        });
    };

    handleBooleanChange = name => () => {
        this.setState({
            playlistPrivateChanges: true,
            [name]: !this.state[name]
        });
    };

    clearHistory = () => {
        Axios.get('clearHistory')
            .then(resp => {
                if (resp.data.success) {
                    this.props.updateHistory([]);
                }
            }).catch(function(err) {
                console.error("Manage playlist: ", err)
            });
    };

    managePlaylist = task => () => {

        Axios.get('managePlaylist', {
            params: {
                task: task,
                data: {new_name: this.state.playlistName || 'default', privatePlaylist: this.state.privatePlaylist}
            }
        }).then(function (resp) {
            if (resp.success) {
                // Notify user
                console.log("Delete or clear COMPLETE")
            }
        }).catch(function(err) {
            console.error("Manage playlist: ", err)
        });
    };

    render(){
        const { classes } = this.props;

        let playlistSelection = this.state.profilePlaylists.map(tile => (
            <div>
                <FormControlLabel
                    control={
                        <Switch
                            checked={this.state.playlistNames.hasOwnProperty(tile.id) ? this.state.playlistNames[tile.id].active : false}
                            onChange={this.handleChange(tile)}
                            value={slugify(tile.name, '_')}
                            color="primary"
                        />
                    }
                    label={tile.name}
                />
            </div>
        ));

        return (
            <Paper square className={classes.main}>
                <section>
                    <FormGroup>
                        <FormLabel component="legend">Select your favourite playlists: (50 max)</FormLabel>

                        {console.log(playlistSelection)}
                        {playlistSelection ? playlistSelection : <Typography> No playlists detected </Typography>}

                        {this.state.newUser ? null :
                        <div>
                            <Divider />
                            <FormLabel component="legend">Saved playlist</FormLabel>
                            <TextField
                                color="primary"
                                label="New playlist name"
                                placeholder="Playlist name"
                                margin="normal"
                                value={this.state.playlistName}
                                onChange={this.handleTextChange('playlistName')}
                            />

                            <InputLabel>Make playlist private</InputLabel>
                            <Checkbox
                                checked={this.state.privatePlaylist}
                                onChange={this.handleBooleanChange('privatePlaylist')}
                                value="privatePlaylist"
                                color="primary"
                            />

                            <Divider />

                            <Button color="primary" onClick={this.managePlaylist('clear')}>Clear Playlist</Button>
                            <Button color="primary" onClick={this.managePlaylist('delete')}>Delete Playlist</Button>
                            <Button color="primary" onClick={this.clearHistory}>Clear History</Button>

                            <Divider />

                            <Button color="primary" disabled={true} onClick={this.managePlaylist('delete')}>Delete Account</Button>
                        </div>}
                    </FormGroup>

                    <Button color="primary" onClick={this.learn} disabled={this.state.loading === 'block' || !(this.state.playlistChanges || this.state.playlistNameChanges || this.state.playlistPrivateChanges)}>{this.state.newUser ? 'Learn' : 'Save'}</Button>
                    <LinearProgress style={{display: this.state.loading}} />
                </section>
            </Paper >
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);

