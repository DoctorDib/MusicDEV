import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

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
import RandomisedIcon from 'mdi-react/Die5Icon';
import PlayButtonIcon from 'mdi-react/PlayCircleFilledIcon';


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
    Randomised: <RandomisedIcon />
};

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableRecommendation: []
        };
    }

    componentDidMount(props) {
        this.setState({
            tableRecommendation: this.props.tableContent,
        });
    };

    componentWillReceiveProps(nextProps){
        this.setState({
            tableRecommendation: nextProps.tableContent,
        });
    }


    render(){
        const { classes } = this.props;

        let newTable = this.state.tableRecommendation.map(recom =>
            <TableRow>
                <Tooltip disableFocusListener disableTouchListener title={recom.activity}>
                    <TableCell align="center" style={{width: "2%"}}> {iconList[recom.activity]} </TableCell>
                </Tooltip>
                <TableCell> {recom.name} </TableCell>
                <TableCell> {recom.genre} </TableCell>
                <TableCell asign="center" style={{width: '2%'}}>
                    <Button href={"https://open.spotify.com/track/" + recom.id}> <PlayButtonIcon /> </Button>
                </TableCell>
            </TableRow>
        );

        return (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{width: '1%'}} align="center">Activity</TableCell>
                            <TableCell align="left">Song Name</TableCell>
                            <TableCell align="left">Genre</TableCell>
                            <TableCell align="center">Play</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {newTable}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
