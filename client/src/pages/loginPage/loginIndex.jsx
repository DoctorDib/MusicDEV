import React from 'react';
import ReactDom from 'react-dom';

import mainTheme from '../../styles/theme.jsx';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

import Indexer from './content/index';

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
