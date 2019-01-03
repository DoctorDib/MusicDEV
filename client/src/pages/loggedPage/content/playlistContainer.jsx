import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import Axios from 'axios';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlist: {},
            open: this.props.open || false,
            playlistNames: {},

            profilePlaylists: [],
            profileUsername: '',
            profileAccessToken: '',

            newUser: false,
        };
    }

    componentWillReceiveProps(props){
        this.setState({
            open: props.open,
            playlistNames: props.playlistNames,
            profilePlaylists: props.profilePlaylists,
            newUser: props.newUser,
            profileUsername: props.username,
            profileAccessToken: props.accessToken
        });
    }

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
                    if(resp.data.success){
                        this.handleChange.close
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

    slugify = name => {
        name = name.replace(/[$-/:-?{-~!"^_`\[\]]/g, '');
        return name.replace(/\s+/g, '_').toLowerCase();
    };

    handleChange = playlist => event => {
        let tmp = this.state.playlistNames;

        if(!tmp.hasOwnProperty(this.slugify(playlist.name))){
            console
            tmp[this.slugify(playlist.name)] = {
                name: playlist.name,
                id: playlist.id,
                active: false,
            };
        }
        tmp[this.slugify(playlist.name)] = {
            name: playlist.name,
            id: playlist.id,
            active: !tmp[this.slugify(playlist.name)].active,
        };
        this.setState({ playlistNames: tmp});
        console.log(tmp)
    };

    render(){
        const { classes } = this.props;

        return (
            <Dialog
                open={this.state.open}
                onClose={this.props.closeIt('settingsOpen')}
                aria-labelledby="form-dialog-title"
            >
                {this.state.newUser ?
                    <DialogTitle style={{backgroundColor: '#d2d2d2'}}>First time setup</DialogTitle> :
                    <DialogTitle style={{backgroundColor: '#d2d2d2'}}>Settings Page</DialogTitle>}
                <Card style={{backgroundColor: '#fbfbfb'}}>
                    <section className={classes.body}>
                        <FormGroup>
                            <FormLabel component="legend"> Your playlists: </FormLabel>
                            {this.state.profilePlaylists.map(tile => (
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={this.state.playlistNames.hasOwnProperty(this.slugify(tile.name)) ? this.state.playlistNames[this.slugify(tile.name)].active : false}
                                                onChange={this.handleChange(tile)}
                                                value={this.slugify(tile.name)}
                                            />
                                        }
                                        label={tile.name}
                                    />
                                </div>
                            ))}
                            <Button onClick={this.learn}> Learn </Button>
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
