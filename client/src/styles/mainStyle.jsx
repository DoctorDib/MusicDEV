import theme from './theme';

const styles = {
    header: {
        height: '85%',
        backgroundColor: '#252525',
        color: '#eeeeee',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        flexDirection: 'column',
        userSelect: 'none',
        backgroundImage: `url(${require('img/background.png')})`,
        zIndex: '4',
        position: 'relative',
        [theme.breakpoints.down('sm')]: {
            height: '20%',
        },
    },
    titleContainer:{
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        marginTop: 'auto',
        height: theme.spacing.unit*13,
        marginBottom: 'auto'
    },
    title: {
        color: '#eeeeee',
        userSelect: 'none',
        fontSize: '100px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '60px',
        },
    },
    titleChild: {
        color: '#eeeeee',
        marginLeft: 'auto',
        userSelect: 'none',
        fontSize: '25px',
        [theme.breakpoints.down('sm')]: {
            fontSize: '20px',
        },

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