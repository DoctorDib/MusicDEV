import styles from 'styles/mainStyle';

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
    },
    chip: {
        margin: theme.spacing.unit,
    },


});
