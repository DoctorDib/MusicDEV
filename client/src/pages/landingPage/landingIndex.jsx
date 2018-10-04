import React from 'react';
import ReactDom from 'react-dom';

import Indexer from './content/index';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

import mainTheme from '../../styles/theme.jsx';

class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider theme={mainTheme}>
                <Indexer />
            </MuiThemeProvider>
        );
    };
}


ReactDom.render(<App />, document.getElementById('importContent'));
