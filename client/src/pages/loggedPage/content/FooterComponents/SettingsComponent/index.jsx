import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Paper from '@material-ui/core/Paper';

import slugify from 'slugify';

import Axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';
import InputLabel from "@material-ui/core/InputLabel/InputLabel";

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
                activeList[activePlaylists[uri]] = true;
            }
        }
        return activeList;
    };

    componentDidMount(props) {
        this.setState({
            playlistNames: this.props.playlistNames,
            profilePlaylists: this.props.profilePlaylists,
            newUser: this.props.newUser,
            username: this.props.username,
            activePlaylists: this.props.activePlaylists,
        });

        if (this.props.activePlaylists) {
            console.log(">>>>", this.props.activePlaylists)
            this.setState({playlistNames: this.tickIt(this.props.activePlaylists)});
        }

        console.log("BOOP: ", this.props.playlistNames)
    };

    componentWillReceiveProps(props){
        this.setState(this.manageProps(props));

        if (props.activePlaylists !== this.props.activePlaylists) {
            console.log("Scanning: ", props.activePlaylists)
            this.setState({playlistNames: this.tickIt(props.activePlaylists)});
        }

        if (props.newUser !== this.props.newUser) {
            if (!props.newUser) {
                Axios.get('grabActivePlaylist', {
                    params: {
                        username: props.username,
                    }
                })
                    .then((resp) => {
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
        }
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
                            this.props.close('settingsOpen')
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

        if(!tmp.hasOwnProperty(playlist.id)){
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
                            checked={this.state.playlistNames.hasOwnProperty(tile.id) ? this.state.playlistNames[tile.id] : false}
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
            <Paper square>
                <Card className={classes.settingsBody}>
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

                                <Divider />

                                <Button color="primary" disabled={true} onClick={this.managePlaylist('delete')}>Delete Account</Button>
                            </div>}
                        </FormGroup>

                        <Button color="primary" onClick={this.learn} disabled={this.state.loading === 'block' || !(this.state.playlistChanges || this.state.playlistNameChanges || this.state.playlistPrivateChanges)}>{this.state.newUser ? 'Learn' : 'Save'}</Button>
                        <LinearProgress style={{display: this.state.loading}} />
                    </section>
                </Card>
            </Paper >
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);

