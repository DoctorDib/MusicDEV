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

import slugify from 'slugify';

import Axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlist: {},
            open: this.props.open || false,
            activePlaylist: [],
            playlistNames: {},

            profilePlaylists: [],
            profileUsername: '',
            profileAccessToken: '',

            newUser: false,
            learnDisabled: false,
            loading: 'none'
        };
    }

    sortActiveButtons = () =>{
        let tmpActivePlaylist = this.state.activePlaylist;
        let tmpPlaylistNames = this.state.playlistNames;

        for(let index in tmpActivePlaylist){
            if(!tmpPlaylistNames.hasOwnProperty(tmpActivePlaylist[index])){
                tmpPlaylistNames[tmpActivePlaylist[index]] = {}
            }
            tmpPlaylistNames[tmpActivePlaylist[index]].id = tmpActivePlaylist[index];
            tmpPlaylistNames[tmpActivePlaylist[index]].active = true;
        }

        this.setState({
            playlistNames: tmpPlaylistNames
        })
    };

    componentWillReceiveProps(props){
        this.setState({
            open: props.open,
            playlistNames: props.playlistNames,
            profilePlaylists: props.profilePlaylists,
            newUser: props.newUser,
            profileUsername: props.username,
            profileAccessToken: props.accessToken
        });

        if(!props.newUser){
            Axios.get('grabActivePlaylist', {
                params: {
                    username: props.username,
                }
            })
            .then((resp) => {
                if(resp.data.playlists.length){
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

    learn = () => {
        // Resetting
        this.setState({
            warningNotification: '',
            warningSnack: false,
            learnDisabled: false,
            loading: 'none'
        });

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
    };

    handleChange = playlist => () => {
        let tmp = this.state.playlistNames;

        if(!tmp.hasOwnProperty(playlist.id)){
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
        this.setState({ playlistNames: tmp});
    };

    render(){
        const { classes } = this.props;

        return (
            <Dialog
                open={this.state.open}
                onClose={this.props.close('settingsOpen')}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle className={classes.settingsTitle}>{this.state.newUser ? "First time setup" : "Settings Page"}</DialogTitle>

                <Card className={classes.settingsBody}>
                    <section>
                        <FormGroup>
                            <FormLabel component="legend">Select your favourite playlists: (50 max)</FormLabel>
                            {this.state.profilePlaylists && this.state.profilePlaylists.map(tile => (
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.playlistNames.hasOwnProperty(tile.id) ? this.state.playlistNames[tile.id].active : false}
                                                onChange={this.handleChange(tile)}
                                                value={slugify(tile.name, '_')}
                                            />
                                        }
                                        label={tile.name}
                                    />
                                </div>
                            ))}
                            {this.state.newUser ? null : <Button onClick={this.props.close('settingsOpen')}> X </Button>}
                            <Button onClick={this.learn} disabled={this.state.learnDisabled}> {this.state.newUser ? "Learn" : "Save"}</Button>
                        </FormGroup>

                    </section>
                </Card>
            </Dialog >
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);

