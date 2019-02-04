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
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

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

import timeAgo from 'timeago-simple';

const headerMap = {
    recommend: ['Activity', 'Song name', 'Genre', 'Play'],
    history: ['Activity', 'Song name', 'Genre', 'Play', 'Time'],
};

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
            tableContent: [],
            tableType: 'recommend',
        };
    }

    componentDidMount(props) {
        this.setState({
            tableContent: this.props.tableContent,
            tableType: this.props.tableType,
        });
    };

    componentWillReceiveProps(nextProps){
        if(nextProps.tableContent !== this.props.tableContent) {
            this.setState({
                tableContent: nextProps.tableContent,
            });
        }

        if(nextProps.tableType !== this.props.tableType) {
            this.setState({
                tableType: nextProps.tableType,
            })
        }
    };

    formatTime = (miliseconds) => {
        return timeAgo.simple(new Date(miliseconds));
    };


    render(){
        const { classes } = this.props;

        let headers = headerMap[this.state.tableType].map(header =>
            <TableCell style={{textAlign: header==='Play' ? 'center' : 'none'}}>{header}</TableCell>
        );

        let newTable = this.state.tableContent.map(recommended =>
            <TableRow>
                <Tooltip disableFocusListener disableTouchListener title={recommended.activity}>
                    <TableCell align="center" style={{width: "2%"}}> {iconList[recommended.activity]} </TableCell>
                </Tooltip>
                <TableCell>{recommended.name}</TableCell>
                <TableCell>{recommended.genre}</TableCell>
                <TableCell style={{width: '2%'}}>
                    <Button href={"https://open.spotify.com/track/" + recommended.id}> <PlayButtonIcon /> </Button>
                </TableCell>
                {this.state.tableType === 'history' ?
                    <TableCell asign="center">
                        <Typography variant="caption">{this.formatTime(recommended.time)}</Typography>
                    </TableCell>
                    : null}
            </TableRow>
        );

        return (
            <Paper className={classes.main} square>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>{headers}</TableRow>
                    </TableHead>
                    <TableBody>{newTable}</TableBody>
                </Table>
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
