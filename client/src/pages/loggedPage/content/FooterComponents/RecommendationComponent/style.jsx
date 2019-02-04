import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        width: theme.spacing.unit * 90,
        height: '100%',
        zIndex: '1',
        padding: '2em',
        overflowY: 'auto',
        paddingTop: '1em',
        paddingBottom: '.25em',
    },

    quantityControl: {
        width: '100%'
    },

    mainController: {
        width: '40%',
        zIndex: '1',
        maxHeight: '45vh',
        minHeight: '45vh',
        height: '45vh'
    },

    optionSection: {
        marginTop: '20px',
        marginBottom: '20px',
    },

    selectionContainer: {
        overflowY: 'auto'
    },

    buttonHolder: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: theme.spacing.unit *2
    },

    mainView: {
        display: 'flex',
        flexDirection: 'row'
    }
});