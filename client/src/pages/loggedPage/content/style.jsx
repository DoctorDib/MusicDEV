import styles from '../../../styles/mainStyle';

export default theme => ({
    ...styles,
    // Profile information card
    accountHolder: {
        backgroundColor: '#d7d7d7',
        width: '22em',
        minHeight: '5vh',
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
        textDecoration: 'none'
    },
    topBar: {
        display: 'flex',
        flexGrow: '2',
        flexDirection: 'row',
        height: '4vh',
        position: 'fixed',
        width: '100%'
    },
    topButtonOptions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginLeft: 'auto'
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
        width: '80%'
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

    // Snackbars
    warningSnackbar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.1em',
        paddingRight: '0.5em',
    },

    listenDetails: {
        display: 'flex',
        flexDirection: 'row',
        paddingRight: theme.spacing.unit * 4,
        height: '100%',
    },
    listenText: {
        marginLeft: theme.spacing.unit * 4,
        display: 'flex',
        flexDirection: 'column'
    },
});