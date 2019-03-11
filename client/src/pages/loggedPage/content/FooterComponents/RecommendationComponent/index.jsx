import React from 'react';
import PropTypes from 'prop-types';
import slugify from 'slugify';
import Axios from "axios";

import { withStyles } from '@material-ui/core/styles';

import styles from './style';

import GridListTile from "@material-ui/core/GridListTile/GridListTile";
import GridList from "@material-ui/core/GridList/GridList";
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

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

import TableComponent from '../../../../../Components/TableComponent';
import RecommendWarning from './RecommendWarningComponent';
import WarningComponent from '../../../../../Components/warningComponent';

const iconList = {
    Workout: <WorkoutIcon style={{backgroundColor: '#ffffff00'}} />,
    Relax:  <ChillIcon style={{backgroundColor: '#ffffff00'}} />,
    Focus:  <FocusIcon style={{backgroundColor: '#ffffff00'}} />,
    Party:  <PartyIcon style={{backgroundColor: '#ffffff00'}} />,
    Sleep: <SleepIcon style={{backgroundColor: '#ffffff00'}} />,
    Romance: <RomanceIcon style={{backgroundColor: '#ffffff00'}} />,
    Gaming: <GamingIcon style={{backgroundColor: '#ffffff00'}} />,
    Dinner: <DinnerIcon style={{backgroundColor: '#ffffff00'}} />,
    Travel: <TravelIcon style={{backgroundColor: '#ffffff00'}} />,
    Electronic_and_Dance: <EAndDIcon style={{backgroundColor: '#ffffff00'}} />,
};

const genres = [
    {
        title: 'Workout',
        Icon: iconList['Workout']
    }, {
        title: 'Relax',
        Icon: iconList['Relax']
    }, {
        title: 'Focus',
        Icon: iconList['Focus']
    }, {
        title: 'Party',
        Icon: iconList['Party']
    }, {
        title: 'Sleep',
        Icon: iconList['Sleep']
    }, {
        title: 'Romance',
        Icon: iconList['Romance']
    }, {
        title: 'Gaming',
        Icon: iconList['Gaming']
    }, {
        title: 'Dinner',
        Icon: iconList['Dinner']
    }, {
        title: 'Travel',
        Icon: iconList['Travel']
    }, {
        title: 'Electronic and Dance',
        Icon: iconList["Electronic_and_Dance"]
    }
];

const Randomised = <Chip
    avatar={<RandomisedIcon style={{backgroundColor: '#ffffff00'}} />}
    label="Randomised"
    style={{margin: '.5em', padding: '1em'}}
/>;

const defaultStates = {
    genreSelection: Randomised,
    genreStates: {},
    buttonColors: {},
    musicQuantity: 1,
    savePlaylist: false,
    table: {},
    recommendWarningOpen: false,
    failedSongs: [],
    successSongs: [],

    buttonOptions: {
        active: false,
        title: ''
    },
    warningOpen: false,
    warningError: false,
    warningMessage: '',
    desktopMode: true,
};

class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = defaultStates;
    }

    manageNewProps = (props) => {
        let newProps = {};

        for (let prop in props) {
            console.log(prop)
            if(props.hasOwnProperty(prop)) {
                if (props[prop] !== this.props[prop]) {
                    newProps[prop] = props[prop];
                }
            }
        }

        return newProps;
    };

    componentDidMount(props) {
        this.setState({
            updateHistory: this.props.updateHistory,
            desktopMode: this.props.desktopMode
        });
    };

    componentWillReceiveProps(newProps){
        let props = this.manageNewProps(newProps);

        if (Object.keys(props).length) {
            this.setState(props);
        }
    }

    componentWillUnmount(){
        this.clear();
    }

    handleGenreClick = genreTitle => () => {
        let genreStates = this.state.genreStates;
        let buttonColors = this.state.buttonColors;

        if (genreStates.hasOwnProperty(slugify(genreTitle, '_')) && genreStates[slugify(genreTitle, '_')]) {
            genreStates[slugify(genreTitle, '_')] = false;
            buttonColors[slugify(genreTitle, '_')] = 'rgba(81,81,81,0)'
        } else {
            genreStates[slugify(genreTitle, '_')] = true;
            buttonColors[slugify(genreTitle, '_')] = 'rgba(81,81,81,0.8)'
        }

        let tmp = [];
        for (let index in genreStates) {
            if (genreStates.hasOwnProperty(index)) {
                if (genreStates[index]) {
                    tmp.push({
                        title: index,
                        icon: iconList[slugify(index, '_')]
                    });
                }
            }
        }

        let tags;
        if(!tmp.length) {
            tags = Randomised;
        } else {
            tags = tmp.map(tag =>
                <Chip
                    avatar={tag.icon}
                    label={tag.title}
                    style={{margin: '.5em', padding: '1em'}}
                />
            );
        }

        this.setState({
            genreSelection: tags,
            buttonColors: buttonColors
        });
    };

    handleChange = stateName => event => {
        this.setState({ [stateName]: event.target.value });
    };

    handleBooleanChange = stateName => () => {
        this.setState({ [stateName]: !this.state[stateName]});
        console.log(this.state[stateName])
    };

    clear = () => {
        let { buttonColors, genreStates }= this.state;
        for (let color in buttonColors) {
            if (buttonColors.hasOwnProperty(color)) {
                buttonColors[color] = 'rgba(81,81,81,0)';
                genreStates[color] = false;
            }
        }

        let newChanges = {
            buttonColors: buttonColors,
            genreStates: genreStates
        };

        this.setState({...defaultStates, ...newChanges});
    };

    handleClose = target => () => {
        console.log("CLOSINGGGG")
        this.setState({ [target]: false });
    };

    recommendMusic = () => {
        Axios.get('recommend', {
            params: {
                genreStates: this.state.genreStates,
                musicQuantity: this.state.musicQuantity,
                savePlaylist: this.state.savePlaylist
            }
        })
        .then(resp => {
           console.log("<<<<><><><><", resp)

            if(resp.data.resp.successSongs.length){
                this.setState({successSongs: resp.data.resp.successSongs});
            }
            if (resp.data.resp.error) {
                console.log("opening new error")
                this.setState({
                    buttonOptions: {
                        active: false,
                        title: ''
                    },
                    warningOpen: true,
                    warningError: false,
                    warningMessage: resp.data.resp.error,
                });
            }

            if (resp.data.history.length) {
                console.log("Changing: ", resp.data.history)
                this.props.updateHistory(resp.data.history);
            }

            if (!resp.data.resp.success) {
                console.log(resp.data.resp)
                console.log(">>>>>>>", this.state.recommendWarningOpen)

                this.setState({
                    recommendWarningOpen: true,
                    failedSongs: resp.data.resp.failedSongs
                });
                console.log(this.state.recommendWarningOpen)
            }
        })
        .catch(err =>{
            console.log("Error: ", err);
        });
    };

    toggleColour = (genre) => {
        return this.state.buttonColors[slugify(genre, '_')] ? {backgroundColor: this.state.buttonColors[slugify(genre, '_')]} : {backgroundColor:'rgba(81,81,81,0)'}
    };

    clickCloseRecommend = () => {
        this.setState({recommendWarningOpen: false});
    };

    render(){
        const { classes } = this.props;

        const content = genres.map((genre, index) =>
            <GridListTile key={index} style={{width: '3.5em', height: '3.5em', textAlign: 'center'}}>
                <Tooltip disableFocusListener disableTouchListener title={genre.title}>
                    <IconButton color="primary" style={this.toggleColour(genre.title)} onClick={this.handleGenreClick(genre.title)}> {genre.Icon} </IconButton>
                </Tooltip>
            </GridListTile>
        );

        const options = <Paper square className={classes.main}>
            <Typography>Control Panel</Typography>
            <div className={classes.optionSection}>
                <FormControl className={classes.quantityControl}>
                    <InputLabel>Quantity of Songs</InputLabel>
                    <Select
                        value={this.state.musicQuantity}
                        onChange={this.handleChange("musicQuantity")}
                        color="primary"
                    >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <Divider/>
            <div className={classes.optionSection}>
                <Typography>Select your current activity</Typography>
                <GridList style={{marginTop: '10px'}}> {content} </GridList>
            </div>
            <Divider/>
            <div className={classes.optionSection}>
                <div className={classes.selectionContainer}>
                    <Typography style={{paddingBottom: '10px'}}>Expected</Typography>
                    <section> {this.state.genreSelection} </section>
                </div>
            </div>
            <Divider/>
            <div className={classes.optionSection}>
                <InputLabel>Save Playlist</InputLabel>
                <Checkbox
                    checked={this.state.savePlaylist}
                    onChange={this.handleBooleanChange('savePlaylist')}
                    value="Save Playlist"
                    color="primary"
                />
                <section className={classes.buttonHolder}>
                    <Button variant="contained" style={{width: this.state.desktopMode ? '10vw' : '30vw'}} color="primary" onClick={this.recommendMusic}>Recommend</Button>
                    <Button variant="contained" style={{width: this.state.desktopMode ? '10vw' : '30vw'}} color="primary" onClick={this.clear}>Clear</Button>
                </section>
            </div>

            <RecommendWarning
                open={this.state.recommendWarningOpen}
                close={(params) => this.handleClose(params)}
                clickClose={this.clickCloseRecommend}
                failedSongs={this.state.failedSongs}
            />

            <WarningComponent
                buttonOptions={this.state.buttonOptions}
                warningMessage={this.state.warningMessage}
                warningError= {this.state.warningError} // false (warning)
                warningOpen={this.state.warningOpen}
            />

        </Paper>

        return (
            <div className={classes.mainView}>
                {console.log("Desktop mode?", this.state.desktopMode)}
                {this.state.desktopMode ? options :
                    <ExpansionPanel square>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography >Settings</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{padding: 0}}>
                            {options}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                }

                <TableComponent
                    tableType='recommend'
                    tableContent={this.state.successSongs}
                    currentSong={''}
                    desktopMode={this.state.desktopMode}
                />
            </div>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);