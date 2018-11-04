import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

export default createMuiTheme({
    palette: {
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
