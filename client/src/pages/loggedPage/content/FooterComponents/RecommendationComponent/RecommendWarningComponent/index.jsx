import React from 'react';
import PropTypes from 'prop-types';

import slugify from 'slugify';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import styles from './style';

import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';

import WorkoutIcon from 'mdi-react/WeightsIcon';
import ChillIcon from 'mdi-react/CouchIcon';
import FocusIcon from 'mdi-react/DeskLampIcon';
import PartyIcon from 'mdi-react/BalloonIcon';
import SleepIcon from 'mdi-react/BedIcon';
import RomanceIcon from 'mdi-react/UserHeartIcon';
import GamingIcon from 'mdi-react/ControllerClassicIcon';
import DinnerIcon from 'mdi-react/RestaurantIcon';
import TravelIcon from 'mdi-react/DirectionsCarIcon';
import EAndDIcon from 'mdi-react/GuitarElectricIcon';

import Axios from "axios";

const iconList = {
    Workout: <WorkoutIcon />,
    Relax:  <ChillIcon />,
    Focus:  <FocusIcon />,
    Party:  <PartyIcon />,
    Sleep: <SleepIcon />,
    Romance: <RomanceIcon />,
    Gaming: <GamingIcon />,
    Dinner: <DinnerIcon />,
    Travel: <TravelIcon />,
    Electronic_and_Dance: <EAndDIcon />,
};

class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            failedSongs: [],
            open: false
        };
    }

    componentWillReceiveProps(props) {
        this.setState({
            open: props.open,
            failedSongs: props.failedSongs
        });

        console.log("Warning dialog open: ", this.state.open)
    }

    consentLearn = () => {
        console.log("Started learning")
        Axios('consentLearn', {
            params: {
                songs: this.state.failedSongs
            }
        }).then((data) => {
            if(data.data.success){
                this.props.close('recommendWarningOpen');
            } else {
                console.log("Something went wrong during the consent learning...")
            }
        }).catch(function(err){
            console.log(err);
        });
    };

    render(){
        const { classes } = this.props;

        let failedSongsContent = this.state.failedSongs.map((song) =>
            <Card style={{backgroundColor: 'grey', margin: '10px'}}>
                <CardContent>
                    <Typography>
                        Name: {song.name}
                    </Typography>
                    <Divider />
                    <Typography>
                        Genre: {song.genre}
                    </Typography>
                </CardContent>
            </Card>
        );

        return (
            <Dialog open={this.state.open} onClose={this.props.close('recommendWarningOpen')} >
                <DialogTitle>Oops, I have not learnt that yet!</DialogTitle>
                <section style={{padding: '20px'}}>
                    <Typography>
                        Sorry, it seems like we don't have the follow song(s) on record. Please help up by clicking accept
                        so our program can expand to more songs. The average wait time is between 5-10 minutes per song.
                    </Typography>
                    <Typography>
                        If you do not wish to wait, then that's no problem at all! Just click 'Skip' or try again. Sorry for
                        any inconvenience.
                    </Typography>
                    <Divider />
                    {failedSongsContent}
                </section>
                <section>
                    <Button onClick={this.consentLearn}> I accept </Button>
                    <Button onClick={this.props.close('recommendWarningOpen')}> I do not accept </Button>
                </section>
            </Dialog>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);