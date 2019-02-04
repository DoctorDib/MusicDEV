import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    aboutContainer: {
        maxWidth: '85vw',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingTop: '2em',
        paddingBottom: '2em',
    },
    aboutSections: {
        paddingTop: '1em',
        paddingBottom: '0.5em',
    }
});
