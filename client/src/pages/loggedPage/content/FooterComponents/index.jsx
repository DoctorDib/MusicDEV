import React from 'react';
import PropTypes from 'prop-types';

import RecommendationComponent  from './RecommendationComponent';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';
import Typography from "@material-ui/core/Typography/Typography";
import AppBar from '@material-ui/core/AppBar';
import classNames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import RecentIcon from 'mdi-react/RecentIcon';
import BrainIcon from 'mdi-react/BrainIcon';
import ManagerIcon from 'mdi-react/ContentSaveEditIcon';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';

const buttonContent = [
    {
        id: 0,
        name: 'Recommendation',
        icon: <BrainIcon />
    },
    {
        id: 1,
        name: 'Music Manager',
        icon: <ManagerIcon />
    },
    {
        id: 2,
        name: 'All History',
        icon: <RecentIcon />
    }
];

class Template extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tableRecommendation: [],

            // Current playing
            currentPlayingSong: '',
            currentPlayingAuthor: '',
            currentPlayingImage: 'https://visualpharm.com/assets/129/Question%20Mark-595b40b85ba036ed117dc3b0.svg',

            open: false,
            menuKey: 0,
            value: 0,

            selectedIndex: 0,

            buttonList: buttonContent
        }
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    handleListItemClick = (event, index) => {
        this.setState({ selectedIndex: index });
    };

    listCreator = (list)  => {
        return list.map(val =>
            <Tooltip disableFocusListener disableTouchListener title={val.name} placement="right">
                <ListItem
                    button
                    selected={this.state.selectedIndex === val.id}
                    onClick={event => this.handleListItemClick(event, val.id)}
                >
                    <ListItemIcon>
                        {val.icon}
                    </ListItemIcon>
                    <ListItemText primary={val.name} />
                </ListItem>
            </Tooltip>
        );
    };

    componentDidMount(props) {
        this.setState({
            tableRecommendation: this.props.tableContent,
            currentPlayingSong: this.props.currentPlayingSong,
            username: this.props.username,
            updateTable: this.props.updateTable,
            currentPlayingAuthor: this.props.currentPlayingAuthor,
            currentPlayingImage: this.props.currentPlayingImage,
        });
    };

    componentWillReceiveProps(nextProps){
        this.setState({
            tableRecommendation: nextProps.tableContent,
            currentPlayingSong: nextProps.currentPlayingSong,
            username: nextProps.username,
            updateTable: nextProps.updateTable,
            currentPlayingAuthor: nextProps.currentPlayingAuthor,
            currentPlayingImage: nextProps.currentPlayingImage,
        });
    }

    render(){
        const { classes } = this.props;

        return (
            <section className={classes.main}>
                <div className={classes.root}>
                    <CssBaseline />
                    <AppBar
                        position="absolute"
                        className={classNames(classes.appBar, {
                            [classes.appBarShift]: this.state.open,
                        })}
                    >
                        <Toolbar disableGutters={!this.state.open}>
                            <IconButton
                                color="inherit"
                                aria-label="Open drawer"
                                onClick={this.handleDrawerOpen}
                                className={classNames(classes.menuButton, {
                                    [classes.hide]: this.state.open,
                                })}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        variant="permanent"
                        style={{position: 'relative'}}
                        className={classNames(classes.drawer, {
                            [classes.drawerOpen]: this.state.open,
                            [classes.drawerClose]: !this.state.open,
                        })}
                        classes={{
                            paper: classNames({
                                [classes.drawerOpen]: this.state.open,
                                [classes.drawerClose]: !this.state.open,
                            }),
                        }}
                        open={this.state.open}
                    >
                        <div className={classes.toolbar} >
                            <IconButton onClick={this.handleDrawerClose}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </div>
                        <Divider />

                        <List component="nav">
                            {this.listCreator(this.state.buttonList)}
                        </List>
                    </Drawer>

                    {/* CONTENT */}
                    <main className={classes.content}>
                        <div className={classes.toolbar} />

                        {this.state.selectedIndex === 0 && <RecommendationComponent
                            updateTable={this.state.updateTable}
                            username={this.state.username}
                        />}

                        {this.state.selectedIndex === 1 && <div>Item Two</div>}
                        {this.state.selectedIndex === 2 && <div>Item Three</div>}
                    </main>
                </div>
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
