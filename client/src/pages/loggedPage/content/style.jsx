import styles from '../../../styles/mainStyle';

export default theme => ({
    ...styles,
    // Profile information card
    accountHolder: {
        backgroundColor: 'white',
        width: '22em',
        right: '0',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'row',
        borderTopLeftRadius: '25% 100%',
        borderBottomLeftRadius: '25% 100%',
        marginTop: '0.5em',
        border: 'solid 0.2em white',
        borderRight: '0',
        userSelect: 'none',
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
    },
    profileUserName: {
        fontSize: '1.1em',
        marginLeft: '1em',
        fontWeight: 'bold',
        color: 'black'
    },
    profileName: {
        fontSize: '1em',
        marginLeft: '1em',
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
        backgroundColor: 'pink',
        marginTop: 'auto',
        width: '100%',
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