import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';
import styles from './style';

class Template extends React.Component {
    render(){
        const { classes } = this.props;

        return (
            <section id="aboutContainer" className={classes.aboutContainer}>
                <Typography variant="display1" gutterBottom> About MusicDEV </Typography>

                <section className={classes.aboutSections}>
                    <Typography className={classes.text} variant="headline">What is MusicDEV?</Typography>
                    <Typography variant="subheading" gutterBottom>
                        MusicDEV is a clever program that learns on the go. From learning
                        while you’re listening to your music, to learning from your playlists,
                        we try our very best to provide the music that best suits you.
                    </Typography>
                </section>

                <section className={classes.aboutSections}>
                    <Typography variant="headline" gutterBottom> How do I use MusicDEV? </Typography>
                    <Typography variant="subheading" gutterBottom>
                        MusicDEV has a clean and easy to use interface with limited buttons to press.
                        You simply need to login using your spotify account information. You’ll then
                        be prompt with ‘Scope permissions’, these permissions will allow us access
                        to your spotify music, giving you a full personalised music experience.
                    </Typography>
                    <Typography variant="subheading" gutterBottom>
                        Once logged in, select a playlist that you wish MusicDEV to learn from
                        (WARNING: MusicDEV will add the recommended music to your current playing
                        playlist) - once selected, just click play and ENJOY!
                    </Typography>
                    <Typography variant="subheading" gutterBottom>
                        If you do not like the current recommended music, you can easily
                        click the thumbs down button which will delete that track from your playlist.
                    </Typography>
                </section>

                <section className={classes.aboutSections}>
                    <Typography variant="headline"> What access do we need? </Typography>
                    <Typography variant="subheading" gutterBottom>
                        During your Spotify login, you will be prompt with a list of permissions
                        that we require access to, we require to provide you with the best recommended
                        songs. The following scopes are as follows:
                    </Typography>

                    <ul>
                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}> Playlist-modify-public </Typography>
                            <Typography variant="subheading" gutterBottom> We require access to your public playlist in order for MusicDEV to learn
                                your taste in music.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}> Playlist-modify-private </Typography>
                            <Typography variant="subheading" gutterBottom> We require access to your private playlist in order for MusicDEV to learn
                                your taste in music.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}>  User-read-private </Typography>
                            <Typography variant="subheading" gutterBottom> Giving us the ability to search for tracks on playlists and to also show
                                you your profile when logged in.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}>  User-top-read (Top tracks and playlists) </Typography>
                            <Typography variant="subheading" gutterBottom> Gives us the ability to find your most popular tracks/playlists that you
                                listen to on a day-to-day basis. Will help us find the best recommended
                                music when compared with your current favourite music.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}>  Playlist-read-collaborative (list of user playlists) </Typography>
                            <Typography variant="subheading" gutterBottom> Gives us a list of your current playlists on your spotify account.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}>  User-modify-playback-state </Typography>
                            <Typography variant="subheading" gutterBottom> This scope will give you full access to controlling your spotify music
                                from MusicDEV, meaning you don’t have to fuss around trying to find your
                                Spotify application.</Typography>
                        </li>

                        <li>
                            <Typography variant="title" gutterBottom style={{fontWeight: 'bold'}}>  User-read-currently-playing </Typography>
                            <Typography variant="subheading" gutterBottom> MusicDEV has a constant listening ability, that finds tracks that you
                                may like and then automatically adds the track to your current playlist.</Typography>
                        </li>
                    </ul>
                </section>

                <section className={classes.aboutSections}>
                    <Typography variant="title" gutterBottom>
                        If you wish to know more about the scopes and permissions that we will be using,
                        then you can <a style={{textDecoration: "none", color: "blue"}} href=" https://developer.spotify.com/documentation/general/guides/scopes/"> read more here </a>
                    </Typography>
                </section>
            </section>
        );
    }
}

Template.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Template);
