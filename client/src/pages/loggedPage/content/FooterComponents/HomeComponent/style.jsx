import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
        padding: theme.spacing.unit * 4,
        background: '#383838',
    },
    iconButtons: {
        width: '8em',
        height: '8em',
        margin: '.5em',
        background: '#6ed786',
        color: 'black',
    },
    buttonContainer: {
        paddingTop: "1em",
        paddingBottom: "1em",
        paddingLeft: '3em',
        paddingRight: '3em',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        height: '30%',
    },
    wrapper: {
        position: 'relative',
    },
    accuracyCircle: {
        position: 'absolute',
        margin: 'auto',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
    },
    avatar: {
        margin: 10,
        width: 200,
        height: 200,
    },
});