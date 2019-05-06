import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        height: '100%',
        zIndex: '1',
        overflowY: 'auto',
        background: '#383838',
    },
    tabParent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    }
});