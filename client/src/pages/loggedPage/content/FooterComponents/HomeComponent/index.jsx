import React from 'react';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import RecentIcon from 'mdi-react/RecentIcon';
import BrainIcon from 'mdi-react/BrainIcon';
import ListenIcon from 'mdi-react/EarHearingIcon';
import ManagerIcon from 'mdi-react/ContentSaveEditIcon';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import HelpIcon from '@material-ui/icons/Help';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";

const buttonContent = [
    {
        id: 0,
        name: 'Music Continuation',
        icon: <ListenIcon />
    },
    {
        id: 1,
        name: 'Recommendation',
        icon: <BrainIcon />
    },
    {
        id: 2,
        name: 'Music Manager',
        icon: <ManagerIcon />
    },
    {
        id: 3,
        name: 'All History',
        icon: <RecentIcon />
    },
    {
        id: 4,
        name: 'Help',
        icon: <HelpIcon />
    },
    {
        id: 5,
        name: 'Settings',
        icon: <SettingsIcon />
    },
    {
        id: 6,
        name: 'Logout',
        icon: <LogoutIcon />
    }
];

class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            updateNavigation: '',
            accuracy: 0,
        }
    }

    componentWillReceiveProps(props) {
        if (props.accuracy !== this.props.accuracy) {
            this.setState({
                accuracy: props.accuracy,
            });
        }
    }

    render () {
        const { classes } = this.props;

        const buttonMapping = buttonContent.map(buttonSettings => (
            <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title={buttonSettings.name} placement="top">
                <Button onClick={() => this.props.updateNavigation(buttonSettings.id)} className={classes.iconButtons}> { buttonSettings.icon } </Button>
            </Tooltip>
        ));

        return (
            <Paper square className={classes.main}>
                <Typography> Genre Classification Accuracy: {this.state.accuracy}% </Typography>
                <div style={{width: this.state.progress, borderBottom: '3px black solid'}}> </div> // TODO - PROGRESS BAR
                <Divider />
                <div className={classes.buttonContainer}> {buttonMapping} </div>
                <Divider />
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);