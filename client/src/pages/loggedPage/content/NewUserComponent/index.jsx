import React from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import Axios from 'axios';

import styles from './style';

import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';

import { withStyles } from '@material-ui/core/styles';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlist: {},
            open: this.props.open || false,
            close: '',
            newUserActivePlaylist: '',
            activePlaylist: [],
            playlistNames: {},
            activePlaylists: [],

            profilePlaylists: [],
            username: '',

            newUserOpen: false,
            newUser: false,
            learnDisabled: false,
            loading: 'none',

            playlistName: '',

            playlistChanges: false,
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
            open: this.props.newUserOpen,
            newUser: this.props.newUser,
            username: this.props.username,
            activePlaylists: this.props.activePlaylists,
            close: this.props.close,
            newUserActivePlaylist: this.props.newUserActivePlaylist,
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
            this.props.newUserActivePlaylist(tmpArr);

            if(tmpArr.length){
                this.setState({
                    learnDisabled: true,
                    warningNotification: 'Learning',
                    warningSnack: true,
                    loading: 'block'
                });

                Axios.get('grabPlaylistGenre', {
                    params: {
                        playlists: tmpArr
                    }})
                    .then(resp => {
                        if(resp.data.success){
                            this.setState({
                                learnDisabled: false,
                                warningSnack: false,
                                loading: 'none'
                            });

                            console.log(this.state.activePlaylists)
                            this.props.close('newUserOpen');
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
            <Dialog open={this.state.open}>
                <AppBar className={classes.header} color="primary">
                    <Typography component="h2" variant="headline" gutterBottom>Welcome, {this.state.username}!</Typography>
                    <Typography variant="subheading" gutterBottom align="center">Please select your favourite playlists to continue</Typography>
                </AppBar>
                <LinearProgress style={{display: this.state.loading}} />
                <Paper className={classes.main} square>
                    <section>
                        <FormGroup className={classes.formContainer}>
                            <FormLabel component="legend">Select your favourite playlists: (50 max)</FormLabel>
                            {playlistSelection ? playlistSelection : <Typography> No playlists detected </Typography>}
                        </FormGroup>

                        <Divider />

                        <div className={classes.buttonContainer}>
                            <Button
                                className={classes.learnButton}
                                color="primary"
                                onClick={this.learn}
                                disabled={this.state.loading === 'block' || !this.state.playlistChanges}
                            >
                                Learn
                            </Button>
                        </div>
                    </section>
                </Paper>
            </Dialog >
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);

