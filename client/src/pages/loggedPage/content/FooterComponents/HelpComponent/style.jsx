import styles from 'styles/mainStyle';

export default theme => ({
    ...styles,
    dialogWidth: {
        maxWidth: '90%',
        zIndex: 50
    },
    helperBody: {
        display: 'flex',
        flexDirection: 'column',
        height: '50vh'
    },

    expansionBody: {
        margin: theme.spacing.unit *2,
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },

    menuHeader: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'relative'
    }
});