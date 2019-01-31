import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stepActive: 0,
        };
    }

    componentDidMount(props) {
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render(){
        const { classes } = this.props;

        return (
            <Paper square className={classes.main}>
                <Tabs
                    value={this.state.value}
                    indicatorColor="secondary"
                    onChange={this.handleChange}
                >
                    <div className={classes.tabParent}>
                        <Tab label="Saved Songs" style={{width: '100%'}} />
                        <Divider/>
                        <Tab label="All" />
                        <Divider/>
                    </div>
                </Tabs>
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
