import React from 'react';
import PropTypes from 'prop-types';

import Axios from 'axios';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import WarningIcon from '@material-ui/icons/Warning';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            listening: false,
            buttonTitle: 'Activate',

            // Profile information
            profileName: 'Not logged in',
            profileUsername: '',
            profilePic: '',

            // Current playing
            currentPlayingSong: '',
            currentPlayingAuthor: '',

            // Notifications
            warningNotification: '',
            errorNotification: '',
            warningSnack: false,
        };
    }

    initialLoad = () => {
        Axios.get('initialLoad')
        .then(resp => {
            this.setState({
                profileName: resp.data.name,
                profileUsername: resp.data.username,
                profilePic: resp.data.pic
            });
        }).catch(error => {
            console.log(error);
        })
    };

    grabCurrentSong = () => {
        Axios.get('currentSong')
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
                    this.setState({
                        errorNotification: 'Error: Disconnected from the server, please refresh...',
                    });
                    break;
            }
            this.setState({listening: false})
        })
    };

    toggleListen = () => {
        this.setState({
            buttonTitle: this.state.listening ? 'Activate' : 'Deactivate',
            listening: !this.state.listening
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

    refresh() {
        window.location.href = '/';
    };

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.body}>
                <section id="accountHolder" className={classes.accountHolder}>
                    <img id="profilePic" className={classes.profilePic} src={this.state.profilePic}/>
                    <section id="profileArea" className={classes.profileArea}>
                        <Typography id="profileUserName" className={classes.profileUserName}>{this.state.profileUsername}</Typography>
                        <Typography id="profileName" className={classes.profileName}>{this.state.profileName}</Typography>
                    </section>
                    <Typography> <a href="logout" id="profileLogout" className={classes.profileLogout}><p className="fas fa-sign-out-alt"></p> Logout </a> </Typography>
                </section>

                <section className={classes.header}>
                    <section className={classes.titleContainer}>
                        <Typography variant='display4' className={classes.title}> MusicDEV </Typography>
                        <Typography variant='display1' className={classes.titleChild}> Finding the right music </Typography>
                    </section>

                    <Button onClick={this.toggleListen} color={'secondary'} variant='raised' size="large" className={classes.mainButton}>{this.state.buttonTitle}</Button>
                    <Typography id={"Error"}>{this.state.errorNotification}</Typography>

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
                        this.state.warningNotification === 'Warning: Spotify paused' ? null :
                            <Button key="undo" color="secondary" size="small" onClick={this.refresh}>
                                Refresh
                            </Button>
                    ]}
                    message={
                        <section>
                            <span className={classes.warningSnackbar}>
                                <WarningIcon style={{fontSize: '20'}}/>
                                {this.state.warningNotification}
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
