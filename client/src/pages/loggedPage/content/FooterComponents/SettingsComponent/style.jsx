import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
        padding: theme.spacing.unit * 7,
    },
    settingsCanvas: {
        paddingLeft: theme.spacing.unit * 10,
        paddingRight: theme.spacing.unit * 10,
    },
    settingsBody: {
        overflowY: 'auto',
        padding: '2em'
    },
});