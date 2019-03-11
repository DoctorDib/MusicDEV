import styles from 'styles/mainStyle';
import theme from "../../../styles/theme";

export default theme => ({
    ...styles,
    mainButton: {
        border: 'none',
        borderRadius: '0.15em',
        textDecoration: 'none',
        outline: 'none',
        margin: '2em',
        userSelect: 'none',
        width: '16em',
        display: 'flex',
        backgroundColor: '#1DB954',
        color: '#FFFFFF',
        [theme.breakpoints.down('sm')]: {
            margin: '0.5em',
        },
    },
    chip: {
        margin: theme.spacing.unit,
    },
    buttonContainer: {
        display:'flex',
        marginRight: 'auto',
        marginLeft: 'auto',
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            marginTop: '2em',
        },
    },
});
