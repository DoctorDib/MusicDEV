
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import indigo from '@material-ui/core/colors/indigo';
import green from '@material-ui/core/colors/green';
import blueGrey from '@material-ui/core/colors/blueGrey';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: 'pink',
            main: '#2196F3',
            dark: '#0D47A1',
            contrastText: '#fff',
            text: '#fff',
        },
        secondary: {
            light: '#EF9A9A',
            main: '#EF5350',
            dark: '#C62828',
            contrastText: '#fff',
        },
        whiteText: {
            main: 'white'
        },
    },
    typography: {
        fontFamily: '"Roboto"',
    }
});

export { theme };
