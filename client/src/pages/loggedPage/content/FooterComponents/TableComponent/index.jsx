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
        this.state = {tableContent: []};
    }

    componentDidMount(props) {
        this.setState({
            tableContent: this.props.tableContent,
        });
    };

    componentWillReceiveProps(nextProps){
        console.log(`Table: ${nextProps.tableContent}`)
        this.setState({
            tableContent: nextProps.tableContent || [],
        });
    }


    render(){
        const { classes } = this.props;

        let newTable = this.state.tableContent.map(recommended =>
            <TableRow>
                <Tooltip disableFocusListener disableTouchListener title={recommended.activity}>
                    <TableCell align="center" style={{width: "2%"}}> {iconList[recommended.activity]} </TableCell>
                </Tooltip>
                <TableCell> {recommended.name} </TableCell>
                <TableCell> {recommended.genre} </TableCell>
                <TableCell asign="center" style={{width: '2%'}}>
                    <Button href={"https://open.spotify.com/track/" + recommended.id}> <PlayButtonIcon /> </Button>
                </TableCell>
            </TableRow>
        );

        return (
            <Paper className={classes.main} square>
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
