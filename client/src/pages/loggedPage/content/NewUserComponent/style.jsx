import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        zIndex: '1',
        overflowY: 'auto',
        padding: theme.spacing.unit * 7,
        background: '#383838',
    },
    header: {
        padding: '1em',
        position: 'relative',
        textAlign: 'center',
    },
    settingsCanvas: {
        paddingLeft: theme.spacing.unit * 10,
        paddingRight: theme.spacing.unit * 10,
    },
    settingsBody: {
        overflowY: 'auto',
        padding: '2em'
    },

    formContainer: {
        marginBottom: theme.spacing.unit*2,
        overflowY: 'auto',
    },

    buttonContainer: {
        width: '80%',
        display:'flex',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: theme.spacing.unit*2,
    },
    learnButton: {
        width: '100%',
    },
});