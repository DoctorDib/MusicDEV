import React from 'react';
import PropTypes from 'prop-types';
import timeAgo from 'timeago-simple';
import classNames from 'classnames';

import styles from './style';

import HomeComponent  from './HomeComponent';
import RecommendationComponent  from './RecommendationComponent';
import SettingsComponent  from './SettingsComponent';
import HelpComponent  from './HelpComponent';
import TableComponent  from '../../../../Components/TableComponent';
import MusicManagerComponent  from './MusicManagerComponent';
import ListenComponent  from './ListenComponent';

import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import RecentIcon from 'mdi-react/RecentIcon';
import BrainIcon from 'mdi-react/BrainIcon';
import ListenIcon from 'mdi-react/EarHearingIcon';
import ManagerIcon from 'mdi-react/ContentSaveEditIcon';
import HouseIcon from 'mdi-react/HouseIcon';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import HelpIcon from '@material-ui/icons/Help';

import { withStyles } from '@material-ui/core/styles';

const buttonContent = [
    {
        id: 0,
        name: 'Home',
        icon: <HouseIcon />
    },
    {
        id: 1,
        name: 'Music Continuation',
        icon: <ListenIcon />
    },
    {
        id: 2,
        name: 'Recommendation',
        icon: <BrainIcon />
    },
    {
        id: 3,
        name: 'Music Manager',
        icon: <ManagerIcon />
    },
    {
        id: 4,
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

            menuKey: 0,
            value: 0,

            selectedIndex: 0,

            buttonList: buttonContent,

            profileName: 'Loading...',
            profileUsername: '',
            profilePic: '',
            profilePicLoading: 'block',
            profilePicActive: 'none',
            profileLink: 'https://www.spotify.com/uk/',

            hideButton: 'none',
            accuracy: 0,

            profileAccessToken: '',
            profilePlaylists: [],
            activePlaylists: [],
            playlistNames: {},
            newUser: false,
            privatePlaylist: false,
            playlistActive: false,
            history: [],

            helperOpen: false,
            menuTitle: 'Home',
            desktopMode: true
        }
    }

    handleDrawerOpen = () => {
        this.setState({
            open: true,
            hideButton: 'block'
        });
    };

    handleDrawerClose = () => {
        this.setState({
            open: false,
            hideButton: 'none'
        });
    };

    handleListItemClick = (event, index, name) => {
        this.setState({
            selectedIndex: index,
            open: false,
            menuTitle: name
        });
    };

    handleClose = target => () => {
        this.setState( { [target]: false } );
    };

    visitProfile = () => {
        window.open("https://open.spotify.com/user/" + this.state.username);
        this.setState({ open: false });
    };

    openHelper = () => {
        this.setState({helperOpen: !this.state.helperOpen})
    };

    componentDidMount (props) {
        this.setState({
            tableRecommendation: this.props.tableContent,
            currentPlayingSong: this.props.currentPlayingSong,
            updateTable: this.props.updateTable,
            currentPlayingAuthor: this.props.currentPlayingAuthor,
            currentPlayingImage: this.props.currentPlayingImage,

            profileName: this.props.profileName,
            profileUsername: this.props.profileUsername,
            profilePic: this.props.profilePic,
            profilePicLoading: this.props.profilePicLoading,
            profilePicActive: this.props.profilePicActive,
            profileLink: this.props.profileLink,

            open: this.props.open,
            newUser: this.props.newUser,
            close: this.props.close,
            profilePlaylists: this.props.profilePlaylists,
            username: this.props.username,
            accessToken: this.props.accessToken,
            privatePlaylist: this.props.privatePlaylist,
            playlistActive: this.props.playlistActive,
            activePlaylists: this.props.activePlaylists,
            history: this.props.history,
            desktopMode: this.props.desktopMode,
            accuracy: this.props.accuracy,
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

    logout = () => {
        window.location.href='/logout'
    };

    updateHistory = newHistory => {
        this.setState({history: newHistory})
    };

    updateNavigation = indexID => {
        /*{id: 0, name: 'Music Continuation' }, 1
          {id: 1, name: 'Recommendation' }, 2
          {id: 2, name: 'Music Manager' }, 3
          {id: 3, name: 'All History' }, 4
          {id: 4, name: 'Help' },
          {id: 5, name: 'Settings' },
          {id: 6, name: 'Logout' } * */
        switch (indexID) {
            case 0:
                this.handleListItemClick(null, 1, 'Music Continuation');
                break;
            case 1:
                this.handleListItemClick(null, 2, 'Recommendation');
                break;
            case 2:
                this.handleListItemClick(null, 3, 'Music Manager');
                break;
            case 3:
                this.handleListItemClick(null, 4, 'All History');
                break;
            case 4:
                this.openHelper();
                break;
            case 5:
                this.handleListItemClick(null, 5, 'Settings');
                break;
            case 6:
                this.logout();
                break;
        }
    };

    getAllHistorySongs = () => {
        let collectedSongs = [];

        for (let historyIndex in this.state.history) {
            console.log("History:", this.state.history)
            if (this.state.history.hasOwnProperty(historyIndex)) {

                for (let song in this.state.history[historyIndex].songs) {
                    if (this.state.history[historyIndex].songs.hasOwnProperty(song)) {
                        console.log("BEFORE, ", song)
                        let tmpSong = this.state.history[historyIndex].songs[song];
                        console.log(">>>", tmpSong)
                        tmpSong.time = this.state.history[historyIndex].time;
                        collectedSongs.push(tmpSong);
                    }
                }
            }
        }

        console.log("final", collectedSongs);

        return collectedSongs;
    };

    componentWillReceiveProps(newProps){
        let props = this.manageNewProps(newProps);

        if (Object.keys(props).length) {
            this.setState(props);
        }
    }

    listCreator = list  => {
        return list.map(val =>
            <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title={val.name} placement="right">
                <ListItem
                    button
                    selected={this.state.selectedIndex === val.id}
                    onClick={event => this.handleListItemClick(event, val.id, val.name)}
                >
                    <ListItemIcon> {val.icon} </ListItemIcon>
                    <Typography style={{color: '#cacaca', marginLeft: '10px', fontSize: '0.95rem'}} > {val.name} </Typography>
                </ListItem>
            </Tooltip>
        );
    };

    formatDate = milliseconds => {
        return timeAgo.simple(new Date(milliseconds));
    };

    render(){
        const { classes } = this.props;

        {console.log(this.state.history)}

        let historyGenerator = this.state.history.length ? this.state.history.map((val, index) =>
            <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title={this.formatDate(val.time)} placement="right">
                <ListItem
                    button
                    selected={this.state.selectedIndex === index+100}
                    onClick={event => this.handleListItemClick(event, index+100, new Date(val.time).toUTCString())}
                >
                    <ListItemIcon><RecentIcon /></ListItemIcon>
                    <Typography style={{color: '#cacaca', marginLeft: '25px', fontSize: '0.95rem'}}> {this.formatDate(val.time)} </Typography>
                </ListItem>
            </Tooltip>
        ) : null;

        let historyGeneratorContent = this.state.history.length ? this.state.history.map((val, index) =>
            this.state.selectedIndex === index+100 ? <TableComponent
                tableType='recommend'
                tableContent={val.songs}
                currentSong={''}
                desktopMode={this.state.desktopMode}
            /> : null
        ) : null;

        return (
            <section className={classes.main} style={{height: this.state.desktopMode ? '85%' : '100%'}}>
                <div className={classes.root}>
                    <CssBaseline />

                    <div style={{height: this.state.desktopMode ? '5%' : '7%', display: 'flex', flexDirection: 'row'}}>
                        <IconButton
                            onClick={this.handleDrawerClose}
                            className={classNames(classes.closeButton, {
                                [classes.hide]: !this.state.open,
                            })}>
                            <ChevronLeftIcon />
                        </IconButton>

                        <AppBar
                            color="primary"
                            position="relative"
                            className={classNames(classes.appBar, {
                                [classes.appBarShift]: this.state.open,
                            })}
                        >
                            <div style={{display: 'flex', height:'100%'}}>
                                <Toolbar disableGutters={!this.state.open} className={classes.overrightMenu}>
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
                                <Typography variant="body1" gutterBottom className={classes.title}> {this.state.menuTitle} </Typography>
                            </div>
                        </AppBar>
                    </div>

                    <div style={{height: this.state.desktopMode ? '95%' : '93%', display: 'flex', flexDirection: 'row'}}>
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

                            <Divider />

                            <List component="nav" className={classes.menuButtons}>
                                <div>
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
                                            <Typography style={{color: '#cacaca', marginLeft: '10px', fontSize: '0.95rem'}}> {this.state.profileUsername} </Typography>
                                        </ListItem>
                                    </Tooltip>
                                    <Divider />
                                    {this.listCreator(this.state.buttonList)}
                                    <Divider />
                                    {historyGenerator}
                                </div>

                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                    <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title="Help" placement="right">
                                        <ListItem
                                            button
                                            onClick={this.openHelper}
                                        >
                                            <ListItemIcon><HelpIcon /></ListItemIcon>
                                            <Typography style={{color: '#cacaca', marginLeft: '10px', fontSize: '0.95rem'}}>Help</Typography>
                                        </ListItem>
                                    </Tooltip>
                                    <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title="Settings" placement="right">
                                        <ListItem
                                            button
                                            selected={this.state.selectedIndex === 5}
                                            onClick={event => this.handleListItemClick(event, 5, "Settings")}
                                        >
                                            <ListItemIcon><SettingsIcon /></ListItemIcon>
                                            <Typography style={{color: '#cacaca', marginLeft: '10px', fontSize: '0.95rem'}}>Settings</Typography>
                                        </ListItem>
                                    </Tooltip>
                                    <Tooltip disableHoverListener={this.state.open} disableFocusListener disableTouchListener title="Logout" placement="right">
                                        <ListItem
                                            button
                                            onClick={this.logout}
                                        >
                                            <ListItemIcon><LogoutIcon /></ListItemIcon>
                                            <Typography style={{color: '#cacaca', marginLeft: '10px', fontSize: '0.95rem'}}>Logout</Typography>
                                        </ListItem>
                                    </Tooltip>
                                </div>
                            </List>
                        </Drawer>

                        {/* CONTENT */}
                        <main className={classes.content} style={{overflowY: 'auto'}}>
                            <div className={classes.toolbar} />

                            <div style={{height: '100%', overflow:'auto'}}>
                                {this.state.selectedIndex === 0 && <HomeComponent accuracy={this.state.accuracy} updateNavigation={params => this.updateNavigation(params)} username={this.state.username}/>}
                                {this.state.selectedIndex === 1 && <ListenComponent playlistActive={this.state.playlistActive} desktopMode={this.state.desktopMode}/>}

                                {this.state.selectedIndex === 2 && <RecommendationComponent
                                    updateTable={this.state.updateTable}
                                    username={this.state.username}
                                    updateHistory={params => this.updateHistory(params)}
                                    desktopMode={this.state.desktopMode}
                                />}

                                {this.state.selectedIndex === 3 && <MusicManagerComponent desktopMode={this.state.desktopMode} />}
                                {this.state.selectedIndex === 4 && <TableComponent tableType='history' tableContent={this.getAllHistorySongs()} currentSong={''} desktopMode={this.state.desktopMode}/>}
                                {this.state.selectedIndex === 5 && <SettingsComponent
                                    playlistNames={this.state.playlistNames}
                                    profilePlaylists={this.state.profilePlaylists}
                                    activePlaylists={this.state.activePlaylists}
                                    newUser={this.state.newUser}
                                    username={this.state.username}
                                    playlistActive={this.state.playlistActive}
                                    updateHistory={params => this.updateHistory(params)}
                                />}

                                {historyGeneratorContent}
                            </div>
                        </main>
                    </div>
                </div>

                <HelpComponent
                    open={this.state.helperOpen}
                    close={(params) => this.handleClose(params)}
                />
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
