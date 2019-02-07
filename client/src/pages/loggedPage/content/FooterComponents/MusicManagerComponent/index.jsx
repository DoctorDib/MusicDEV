import React from 'react';
import PropTypes from 'prop-types';
import Axios from 'axios';

import TableComponent  from '../TableComponent';

import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            playlistOptions: {},
            savedTracks: [],
        }
    }

    componentDidMount(props) {
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
            });
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

    render(){
        const { classes } = this.props;

        return (
            <Paper className={classes.main}>
                {this.state.savedTracks ? <TableComponent
                    tableType={"manager"}
                    tableContent={this.state.savedTracks}
                /> : <LinearProgress />}
            </Paper>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
