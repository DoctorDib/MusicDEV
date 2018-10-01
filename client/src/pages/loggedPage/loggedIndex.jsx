import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';

import { mainTheme } from '../../styles/theme.jsx';
import Indexer from './content/index';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';

import styles from '../../styles/mainStyle';

class App extends React.Component {
    render() {
        return (
            <MuiThemeProvider theme={mainTheme}>
                <Indexer />
            </MuiThemeProvider>
        );
    };
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

ReactDom.render(<App />, document.getElementById('importContent'));
