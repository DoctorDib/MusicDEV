import theme from './theme';

const styles = {
    header: {
        height: '75vh',
        [theme.breakpoints.down('sm')]: {
            height: '100vh',
        },
        backgroundColor: '#292929',
        color: '#eeeeee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'column',
        boxShadow: '0px 4px 3px 0px #b9b9b9',
        userSelect: 'none',
        backgroundImage: 'radial-gradient(#5f5f5f, #292929)'
    },
    titleContainer:{
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
    },
    title: {
        color: '#eeeeee',
        userSelect: 'none',
    },
    titleChild: {
        color: '#eeeeee',
        marginLeft: 'auto',
        userSelect: 'none'
    },
    loginContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none'
    },

    inputField: {
        width: '100%',
        marginBottom: '2em',
        color: 'white'
    },
    mainButton: {
        border: 'none',
        borderRadius: '0.15em',
        textDecoration: 'none',
        outline: 'none',
        margin: '2em',
        userSelect: 'none',
    },

    backHome: {
        position: 'fixed',
        fontSize: '3em',
        color: '#eeeeee',
        textDecoration: 'none',
        border: 'solid 0.05em white',
        marginLeft: '1em',
        marginTop: '1em',
        userSelect: 'none',
        borderRadius: '100px',
        height: '65px',
        width: '65px'
    },

    accountHolder: {
        backgroundColor: 'white',
        width: '22em',
        right: '0',
        position:'fixed',
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
        '&:hover':{
            cursor: 'pointer'
        }
    }
};

export default styles;