import React from 'react';
import PropTypes from 'prop-types';

import slugify from 'slugify';

import Button from '@material-ui/core/Button';
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

import Axios from "axios";

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
    avatar={<RandomisedIcon />}
    label="Randomised"
    style={{margin: '.5em', padding: '1em'}}
    color="secondary"
/>;

const defaultStates = {
    genreSelection: Randomised,
    genreStates: {},
    buttonColors: {},
    musicQuantity: 1,
    savePlaylist: false,
    table: {}
};

class Template extends React.Component {
    constructor(props) {
        super(props);
        this.state = defaultStates;
    }

    componentWillReceiveProps(props) {
        this.setState({
            open: props.open,
        });
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
                    color="secondary"
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
    };

    clear = () => {
        this.setState(defaultStates);
    };

    recommendMusic = () => {
        console.log("Clicked")
        Axios.get('recommend', {
            params: {
                genreStates: this.state.genreStates,
                musicQuantity: this.state.musicQuantity,
                savePlaylist: this.state.savePlaylist,
                username: this.props.username
            }
        })
        .then(resp => {
           console.log(resp)
            let newTable = resp.data.data;

           this.props.updateTable({title: "tableRecommendation", value: newTable});
        })
        .catch(err =>{
            console.log("Error: ", err);
        });
    };

    render(){
        const { classes } = this.props;

        const content = genres.map((genre, index) =>
            <GridListTile key={index} style={{width: '5em', height: '5em'}}>
                <Tooltip disableFocusListener disableTouchListener title={genre.title}>
                    <Button style={this.state.buttonColors[slugify(genre.title, '_')] ? {backgroundColor: this.state.buttonColors[slugify(genre.title, '_')]} : {backgroundColor:'rgba(81,81,81,0)'}} onClick={this.handleGenreClick(genre.title)}> {genre.Icon} </Button>
                </Tooltip>
            </GridListTile>
        );

        return (
            <section style={{width: '25%'}}>
                <FormControl className={classes.formControl} style={{width: '75%'}}>
                    <InputLabel>Quantity of Songs</InputLabel>
                    <Select
                        native
                        value={this.state.musicQuantity}
                        onChange={this.handleChange("musicQuantity")}
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </Select>
                </FormControl>

                <GridList>{content}</GridList>

                <Typography>Expected</Typography>
                <section> {this.state.genreSelection} </section>

                <InputLabel>Save Playlist</InputLabel>
                <Checkbox
                    checked={this.state.savePlaylist}
                    onChange={this.handleBooleanChange('savePlaylist')}
                    value="Save Playlist"
                />


                <section style={{display: 'flex', justifyContent: 'space-between'}}>
                    <Button style={{width: '100%'}} onClick={this.recommendMusic}>Grab Music</Button>
                    <Button style={{width: '100%'}} onClick={this.clear}>Clear</Button>
                </section>

            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);