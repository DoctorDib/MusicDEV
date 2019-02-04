import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

import amber from '@material-ui/core/colors/amber';

export default createMuiTheme({
    spacing: {
        unit: 5
    },
    zIndex: {
        drawer: 5
    },
    palette: {
        type: 'dark',
        primary: {
            light: '#eeeeee',
            main: '#6ed786',
        },
        secondary: {
            light: '#eeeeee',
            main: '#232323',
        },
        tertiary: {
            light: '#efefef',
            main: '#efefef',
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
