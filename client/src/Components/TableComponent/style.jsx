import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        overflowY: 'auto',
        width: '100%',
        height: '100%',
    },

    icon: {
        margin: theme.spacing.unit + 2,
    }
});