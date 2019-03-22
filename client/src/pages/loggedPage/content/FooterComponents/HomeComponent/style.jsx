import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
        padding: theme.spacing.unit * 4,
    },
    iconButtons: {
        width: '12em',
        height: '12em',
        margin: '.5em',
        background: '#6ed786'
    },
    buttonContainer: {
        paddingTop: "1em",
        paddingBottom: "1em",
        paddingLeft: '3em',
        paddingRight: '3em',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    }
});