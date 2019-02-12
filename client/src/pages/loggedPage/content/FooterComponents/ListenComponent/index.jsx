import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';

import styles from './style';

import TableComponent  from '../../../../../Components/TableComponent';
import WarningComponent  from '../../../../../Components/warningComponent';

import { withStyles } from '@material-ui/core/styles';

import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import Switch from "@material-ui/core/Switch/Switch";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography/Typography";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,

            // Current playing
            currentPlayingSong: '',
            oldSong: '',
            currentPlayingAuthor: '',
            currentPlayingImage: '',

            warningOpen: false,
            warningError: false,
            warningMessage: '',
            buttonOptions: {active:false, title: ''},

            searching: false,
            is_playing: false,
        }
    }

    componentDidMount(props) {
        window.setInterval(() => {
            if (this.state.listening){
                this.grabCurrentSong();
            }
        }, 1000);

        Axios('grabSavedPlaylists')
            .then(resp=> {
                console.log(resp)
                if (resp.data.success) {
                    this.setState({
                        playlistOptions: resp.data.playlistOptions,
                        savedTracks: resp.data.playlistOptions.savedTracks
                    });
                }
            }).catch((err)=> {
            console.log(err)
        })
    };

    manageNewProps = (props) => {
        let newProps = {};

        for (let prop in props) {
            if(props.hasOwnProperty(prop)) {
                if (props[prop] !== this.props[prop]) {
                    newProps[prop] = props[prop];
                }
            }
        }

        return newProps;
    };

    componentWillReceiveProps(newProps){
        let props = this.manageNewProps(newProps);

        if (Object.keys(props).length) {
            this.setState(props);
        }
    }

    handleListen = () => {
        this.setState({
            listening: !this.state.listening
        });
    };

    grabCurrentSong = () => {
        if (!this.state.searching) {
            this.setState({searching: true});
            Axios.get('currentSong', {params: { current: this.state.currentPlayingSong, is_playing: this.state.is_playing } } )
                .then(resp => {
                    console.log(resp)
                    if(resp.data.isPlaying){
                        //if (resp.data.different) {
                            // Only set the state when the song is different
                        console.log("Saving new song")
                        this.setState({
                            currentPlayingSong: resp.data.song,
                            currentPlayingAuthor: resp.data.artist,
                            currentPlayingImage: resp.data.image,

                            warningOpen: false,
                            warningError: false,
                            warningMessage: '',
                            buttonOptions: {active:false, title: ''},

                            searching: false,
                            is_playing: resp.data.isPlaying,
                        });

                        if (resp.data.recommendedSong) {
                            this.setState({
                                warningOpen: true,
                                warningError: false,
                                warningMessage: 'New song detected! Skipping while we process the new song.',
                                buttonOptions: {active:false, title: ''},
                            });
                        }

                        if (resp.data.savedTracks.length) {
                           this.setState({savedTracks: resp.data.savedTracks,})
                        }
                        //}
                    } else {
                        this.setState({
                            currentPlayingSong: resp.data.song,
                            currentPlayingAuthor: resp.data.artist,
                            currentPlayingImage: resp.data.image,

                            warningOpen: true,
                            warningError: false,
                            warningMessage: 'Warning: Spotify paused',
                            buttonOptions: {active:false, title: ''},
                            searching: false,
                            is_playing: resp.data.isPlaying,
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
                            searching: false
                        });
                        break;
                    case 500:
                    case 401:
                        this.setState({
                            warningOpen: true,
                            warningError: true,
                            warningMessage: 'Error: Disconnected from the server, please refresh...',
                            buttonOptions: {active:true, title: 'Refresh'},
                            searching: false
                        });
                        break;
                }
                this.setState({listening: false})
            });
        } else {
            console.log("processing")
        }
    };

    render(){
        const { classes } = this.props;

        return (
            <Paper square className={classes.main}>
                <AppBar style={{position: 'relative', display:'flex', flexDirection:'row'}} color={"secondary"}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        {this.state.currentPlayingImage ? <img src={this.state.currentPlayingImage} style={{height: '45px', width: '45px'}}/> : null}
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
                </AppBar>

                {this.state.savedTracks ? <TableComponent
                    tableType={"manager"}
                    tableContent={this.state.savedTracks}
                /> : <LinearProgress />}

                <WarningComponent
                    buttonOptions={this.state.buttonOptions}
                    warningMessage={this.state.warningMessage}
                    warningError= {this.state.warningError} // false (warning)
                    warningOpen={this.state.warningOpen}
                />
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
