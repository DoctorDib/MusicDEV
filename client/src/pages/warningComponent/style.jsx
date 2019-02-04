import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,

    warningSnackbar: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0.1em',
        paddingRight: '0.5em',
    },
});