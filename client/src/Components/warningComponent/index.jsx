import React from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core";
import styles from "../../pages/loggedPage/content/style";

import Button from "@material-ui/core/Button/Button";
import Typography from "@material-ui/core/Typography";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";

import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';

/** - INPUT
    {
        buttonOptions: {
            active: true
            title: 'relog
        },
        message: 'Message goes here',
        error: true, // false (warning)
        open: false
    }
 * **/

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            buttonOptions: {},
            warningMessage: '',
            warningError: false, // defaults to warning
            warningOpen: false
        };
    }

    componentDidMount(props) {
        this.setState({
            buttonOptions: this.props.buttonOptions,
            warningMessage: this.props.message,
            warningError: this.props.error,
            warningOpen: this.props.open,
        });
    };

    refresh = () => {
        window.location.href='/';
    };

    manageProps = (newProps) => {
        let newSelection = {};

        for (let prop in newProps) {
            if(newProps.hasOwnProperty(prop)) {
                if (newProps[prop] !== this.props[prop]) {
                    newSelection[prop] = newProps[prop];
                }
            }
        }

        return newSelection;
    };

    componentWillReceiveProps(props) {
        let newProps = this.manageProps(props);
        if(Object.keys(newProps).length){
            this.setState(newProps);
        }
    }

    render(){
        const { classes } = this.props;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.warningOpen}
                variant={this.state.warningError ? 'error' : 'warning'}
                action={[
                    this.state.buttonOptions.active ?
                        <Button
                            onClick={this.state.buttonOptions.title === "Refresh" ? this.refresh : null}
                        >{this.state.buttonOptions.title}</Button>
                        : null
                ]}
                message={
                    <section>
                        <span className={classes.warningSnackbar}>
                            {this.state.warningError ? <ErrorIcon style={{fontSize: '20'}}/> : <WarningIcon style={{fontSize: '20'}}/>}
                            <Typography style={{marginLeft: '10px'}} color="secondary">{this.state.warningMessage}</Typography>
                        </span>
                    </section>
                }
                style={{zIndex: 1000}}
            />
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);