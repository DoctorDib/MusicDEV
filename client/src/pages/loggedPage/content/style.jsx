import styles from '../../../styles/mainStyle';

export default theme => ({
    ...styles,
    // Profile information card
    accountHolder: {
        backgroundColor: '#d7d7d7',
        width: '22em',
        right: '0',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'row',
        transform: 'translateX(-50%)',
        left: '50%',
        top: '0.25vh',
        borderBottomLeftRadius: '11% 50%',
        borderBottomRightRadius: '11% 50%',
        border: 'solid 0.2em #d7d7d7',
        borderRight: '0',
        userSelect: 'none',
    },
    topBar: {
        display: 'flex',
        flexGrow: '2',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: '#d7d7d7',
        height: '4vh'
    },
    profilePic: {
        width: '75px',
        height: '75px',
        borderRadius: '100%',
        userSelect: 'none',
    },
    profileArea: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        userSelect: 'none',
        width: '100%'
    },
    profileUserName: {
        fontSize: '1.1em',
        fontWeight: 'bold',
        color: 'black'
    },
    profileName: {
        fontSize: '1em',
        color: 'black'
    },
    profileLogout: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: 'auto',
        marginRight: '1em',
        color: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        '&:hover': {
            cursor: 'pointer'
        }
    },

    // Current music
    currentContainer: {
        backgroundColor: '#d5d1d1',
        textAlign: 'center',
        position: 'fixed',
        bottom: '0',
        width: '100%',
        height: '3vh',
        justifyContent: 'center',
    },
    currentPlaying: {
        height: '2vh',
        width: '75%',
        display: 'flex',
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
        fontWeight: 'bold'
    },
    currentInfo: {
        color: 'blue'
    },

    // Snackbars
    warningSnackbar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.1em',
        paddingRight: '0.5em',
    }
});