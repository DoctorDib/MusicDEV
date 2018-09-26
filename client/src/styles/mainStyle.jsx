const styles = theme => ({
    header: {
        height: '85vh',
        backgroundColor: '#292929',
        color: '#eeeeee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'column',
        boxShadow: '0px 4px 3px 0px #b9b9b9',
        userSelect: 'none'
    },
    titleContainer:{
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
    },
    buttonContainer:{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
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
    loginInput: {
        width: '100%',
        fontSize: '1em',
        padding:'0.25em'
    },
    loginLabel: {
        marginTop: '1em',
        marginBottom: '0.5em',
        color: '#eeeeee',
        userSelect: 'none'
    },
    mainButton: {
        backgroundColor: '#efefef',
        fontSize: '1.5em',
        color: 'black',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '0.25em',
        padding: '0.75em',
        paddingLeft: '2em',
        paddingRight: '2em',
        textDecoration: 'none',
        outline: 'none',
        margin: '2em',
        userSelect: 'none',
        '&:hover': {
            backgroundColor: '#8a8a8a'
        },
        '&:active': {
            backgroundColor: '#383838'
        }
    },
    backHome: {
        position: 'fixed',
        fontSize: '3em',
        color: '#eeeeee',
        textDecoration: 'none',
        border: 'solid 0.1em white',
        borderRadius: '1em',
        padding: '0.5em',
        marginLeft: '1em',
        marginTop: '1em',
        userSelect: 'none',
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
        alignItems: 'center',
        justifyContent: 'center',
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
});

export default styles;