import React from 'react';
import PropTypes from 'prop-types';

import RecommendationComponent  from './RecommendationComponent';

import { withStyles } from '@material-ui/core/styles';

import styles from './style';
import AppBar from '@material-ui/core/AppBar';
import classNames from 'classnames';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';

import RecentIcon from 'mdi-react/RecentIcon';
import BrainIcon from 'mdi-react/BrainIcon';
import ManagerIcon from 'mdi-react/ContentSaveEditIcon';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';

const buttonContent = [
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

            selectedIndex: 1,

            buttonList: buttonContent,

            profileName: 'Loading...',
            profileUsername: '',
            profilePic: '',
            profilePicLoading: 'block',
            profilePicActive: 'none',
            profileLink: 'https://www.spotify.com/uk/',
        }
    }

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    handleListItemClick = (event, index) => {
        this.setState({ selectedIndex: index, open: false});
    };

    listCreator = (list)  => {
        return list.map(val =>
            <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title={val.name} placement="right">
                <ListItem
                    button
                    selected={this.state.selectedIndex === val.id}
                    onClick={event => this.handleListItemClick(event, val.id)}
                >
                    <ListItemIcon>{val.icon}</ListItemIcon>
                    <ListItemText primary={val.name} />
                </ListItem>
            </Tooltip>
        );
    };

    visitProfile = () => {
        window.open(this.state.profileLink, '_blank');
        this.setState({open: false});
    };

    componentDidMount(props) {
        this.setState({
            tableRecommendation: this.props.tableContent,
            currentPlayingSong: this.props.currentPlayingSong,
            username: this.props.username,
            updateTable: this.props.updateTable,
            currentPlayingAuthor: this.props.currentPlayingAuthor,
            currentPlayingImage: this.props.currentPlayingImage,

            profileName: this.props.profileName,
            profileUsername: this.props.profileUsername,
            profilePic: this.props.profilePic,
            profilePicLoading: this.props.profilePicLoading,
            profilePicActive: this.props.profilePicActive,
            profileLink: this.props.profileLink,
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

            profileName: nextProps.profileName,
            profileUsername: nextProps.profileUsername,
            profilePic: nextProps.profilePic,
            profilePicLoading: nextProps.profilePicLoading,
            profilePicActive: nextProps.profilePicActive,
            profileLink: nextProps.profileLink,
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
                            <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title="Visit profile" placement="right">
                                <ListItem
                                    button
                                    onClick={this.visitProfile}
                                    style={{paddingLeft: '10px'}}
                                >
                                    <ListItemIcon>
                                        <CircularProgress color="secondary" style={{display: this.state.profilePicLoading, width: '35px', height: '35px'}} />
                                        <img src={this.state.profilePic} className={classes.profilePic} style={{display: this.state.profilePicActive}}/>
                                    </ListItemIcon>
                                    <ListItemText primary={this.state.profileUsername} />
                                </ListItem>
                            </Tooltip>
                            <Divider />
                            {this.listCreator(this.state.buttonList)}
                        </List>
                    </Drawer>

                    {/* CONTENT */}
                    <main className={classes.content}>
                        <div className={classes.toolbar} />

                        {this.state.selectedIndex === 1 && <RecommendationComponent
                            updateTable={this.state.updateTable}
                            username={this.state.username}
                        />}

                        {this.state.selectedIndex === 2 && <div>Item Two</div>}
                        {this.state.selectedIndex === 3 && <div>Item Three</div>}
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
