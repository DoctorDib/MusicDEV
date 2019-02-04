import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    main: {
        overflowY: 'auto',
        width: '20vw'
    },
    tabParent: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%'
    }
});