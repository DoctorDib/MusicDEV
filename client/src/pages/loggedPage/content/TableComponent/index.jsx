import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import WarningIcon from '@material-ui/icons/Warning';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import ListenIcon from '@material-ui/icons/Headset';
import HelpIcon from '@material-ui/icons/Help';
import Tooltip from '@material-ui/core/Tooltip';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableRecommendation: ''
        };
    }

    componentDidMount(props) {
        console.log("Changed")
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

        return (
            <Paper className={classes.root}>
                <Table className={classes.table}>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{width: '1%'}} align="center">Activity</TableCell>
                            <TableCell align="left">Song Name</TableCell>
                            <TableCell align="left">Genre</TableCell>
                            <TableCell align="left">Songs</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.tableRecommendation}
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
