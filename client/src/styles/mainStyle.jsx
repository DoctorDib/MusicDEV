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
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/binding-dark.png")'

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
    }
};

export default styles;