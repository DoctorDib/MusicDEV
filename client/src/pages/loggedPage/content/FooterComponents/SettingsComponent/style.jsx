import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
        padding: theme.spacing.unit * 4,
    },
    settingsCanvas: {
        paddingLeft: theme.spacing.unit * 10,
        paddingRight: theme.spacing.unit * 10,
    },
    settingsBody: {
        overflowY: 'auto',
        padding: theme.spacing.unit - 3 + 'em',
    },
    rootContainer: {
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: '20px',
    },
    textInput: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400,
    },
    textField: {
        marginLeft: 8,
        flex: 1,
    },
    formStyle: {
        display: 'flex'
    },
    gridItem: {
        display: 'flex',
        flex: '0 0 49.7%',
        border: '1px solid #292929',
        margin: '1px',
    },
    playlistIcon: {
        margin: theme.spacing.unit * 2,
        width: theme.spacing.unit * 9,
        height: theme.spacing.unit * 9,
    },
    item: {
        marginTop: theme.spacing.unit * 3,
        marginBottom: theme.spacing.unit * 3,
        padding: theme.spacing.unit * 3,
        width: '100%',
    },
});