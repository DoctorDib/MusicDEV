import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

import amber from '@material-ui/core/colors/amber';

export default createMuiTheme({
    spacing: {
        unit: 5
    },
    palette: {
        type: 'dark',
        primary: {
            light: '#eeeeee',
            main: '#444444',
        },
        secondary: {
            light: '#444444',
            main: '#eeeeee',
        },
        error: {
            light: '#dc3636',
            main: '#dc3636'
        },
        warning: {
            backgroundColor: amber[700],
        },

        message: {
            display: 'flex',
            alignItems: 'center',
        },
    }
});
