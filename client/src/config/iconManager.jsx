import React from 'react';

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

const iconList = {
    // Activities
    Workout: <WorkoutIcon />,
    Relax:  <ChillIcon />,
    Focus:  <FocusIcon />,
    Party:  <PartyIcon />,
    Sleep: <SleepIcon />,
    Romance: <RomanceIcon />,
    Gaming: <GamingIcon />,
    Dinner: <DinnerIcon />,
    Travel: <TravelIcon />,

    // Genre
    ElectronicAndDance: <EAndDIcon />,

    // Other
    Randomised: <RandomisedIcon />
};

const genreMap = {
    Rock: ['Workout', 'Party', 'Gaming'],
    RnB: ['Workout', 'Gaming', 'Travel'],
    ElectronicAndDance: ['Workout', 'Party', 'Gaming'],
    Pop: ['Party', 'Travel'],
    HipHop: ['Party', 'Travel'],
    Jazz: ['Focus', 'Romance', 'Dinner', 'Relax'],
    Classical: ['Focus', 'Sleep', 'Romance', 'Dinner', 'Relax'],
    Blues: ['Focus', 'Sleep', 'Romance'],
    Chill: ['Dinner', 'Relax'],
};

export default (genre) => {
    let icons = [];
    for (let index in genreMap[genre]) {
        if (genreMap[genre].hasOwnProperty(index)) {
            icons.push({icon: iconList[genreMap[genre][index]], name: genreMap[genre][index]});
        }
    }
    return icons;
};