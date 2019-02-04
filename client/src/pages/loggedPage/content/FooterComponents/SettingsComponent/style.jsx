import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    settingsCanvas: {
        paddingLeft: theme.spacing.unit * 10,
        paddingRight: theme.spacing.unit * 10,
    },
    settingsBody: {
        overflowY: 'auto',
        padding: '2em'
    },
});