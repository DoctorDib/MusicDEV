import styles from 'styles/mainStyle';

const drawerWidth = 240;

export default theme => ({
    ...styles,

    tabParent: {
        display: 'flex',
        flexDirection: 'column'
    },

    // Current music
    currentContainer: {
        width: '100%',
        height: '2vh',
    },
    currentPlaying: {
        height: '2vh',
        width: '90%',
        justifyContent: 'space-around',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    currentInformation: {
        display: 'flex',
        justifyContent: 'space-around',
        minWidth: '49%'
    },
    currentTitle: {
        width: '2vw'
    },
    currentInfo: {
        color: 'blue',
        width: '6vw'
    },

    closeButton: {
        position: 'absolute',
        marginBottom: 'auto'
    },

    menuButtons: {
        display: 'flex',
        flexDirection:'column',
        justifyContent: 'space-between',
        height: '100%',
        overflow: 'hidden',
        padding: 0,
    },
    title: {
        textAlign: 'center',
        marginTop: 'auto',
        marginBottom: 'auto'
    },

    main: {
        height: '85%',
        backgroundColor: '#6ed786',
        background: '#383838',
    },
    root: {
        width: '100%',
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    overrightMenu: {
        minHeight: '0'
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        position: 'relative'
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        position: 'relative'
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 11 + 3,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 11 + 3,
        },
        position: 'relative'
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
    },
    content: {
        flexGrow: 1,
        position: 'relative',
    },

    contentContent: {
        display: 'flex',
        flexDirection: 'row',
        flexGrow: '2',
        height: '100%',
    },

    profilePic: {
        width: theme.spacing.unit * 7,
        height: theme.spacing.unit * 7,
        borderRadius: '100%',
        userSelect: 'none',
    },
});