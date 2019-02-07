import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
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

    topButtonOptions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginLeft: 'auto'
    },
});